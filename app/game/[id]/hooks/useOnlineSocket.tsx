import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GameState, UseOnlineSocketProps } from "../types";
import { Chess } from 'chess.js';
import { useGlobalStorage } from "@/hooks/GlobalStorage";

export const useOnlineSocket = ({
  gameId,
  autoRotateBoard,
  setGameState,
  setBoardOrientation,
  setMoveHistory,
  setCapturedWhite,
  setCapturedBlack,
}: UseOnlineSocketProps) => {
  // Get userId from GlobalStorage instead of localStorage
  const { userId } = useGlobalStorage();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [disconnectionMessage, setDisconnectionMessage] = useState("");
  const router = useRouter();
  
  
  // Track previous time states to calculate move duration
  const prevTimesRef = useRef<{
    whiteTimeLeft?: number;
    blackTimeLeft?: number;
  }>({});

  // Recalculate all captured pieces from current position
  const recalculateAllCapturedPieces = (fen: string) => {
    try {
      const chess = new Chess(fen);
      const board = chess.board();
      
      // Count remaining pieces
      const remainingPieces: Record<string, number> = {};
      board.flat().forEach(piece => {
        if (piece) {
          const key = `${piece.color}${piece.type.toUpperCase()}`;
          remainingPieces[key] = (remainingPieces[key] || 0) + 1;
        }
      });
      
      // Starting pieces count
      const startingPieces = {
        wP: 8, wR: 2, wN: 2, wB: 2, wQ: 1, wK: 1,
        bP: 8, bR: 2, bN: 2, bB: 2, bQ: 1, bK: 1
      };
      
      // Calculate captured
      const capturedWhite: string[] = [];
      const capturedBlack: string[] = [];
      
      Object.entries(startingPieces).forEach(([piece, startCount]) => {
        const remaining = remainingPieces[piece] || 0;
        const captured = startCount - remaining;
        
        for (let i = 0; i < captured; i++) {
          if (piece.startsWith('w')) {
            capturedWhite.push(piece);
          } else {
            capturedBlack.push(piece);
          }
        }
      });
      
      setCapturedWhite(capturedWhite);
      setCapturedBlack(capturedBlack);
    } catch (error) {
      console.error("Error recalculating captured pieces:", error);
    }
  };

  useEffect(() => {
    const newSocket = io("http://localhost:8080", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server with socket ID:", newSocket.id);
      
      // Use userId from GlobalStorage instead of localStorage
      if (userId && gameId) {
        console.log("Rejoining game:", gameId);
        newSocket.emit("rejoinGame", { gameId, userId });
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    // Get gameId from localStorage but userId from GlobalStorage
    const gameData = localStorage.getItem("gameData");
    if (!gameData) {
      toast.error("No game data found");
      router.push("/game/find");
      return;
    }

    const { gameId: storedGameId } = JSON.parse(gameData); // Remove userId from here

    // Join the game using GlobalStorage userId
    newSocket.emit("joinGame", { gameId: storedGameId, userId });

    // Handle game state updates from backend
    newSocket.on("gameState", (state) => {
      console.log("Received gameState:", state);
      
      // Recalculate captured pieces from current position
      if (state.fen) {
        recalculateAllCapturedPieces(state.fen);
      }
      
      const storedGameData = JSON.parse(localStorage.getItem("gameData") || "{}");
      
      // Set board orientation based on player color
      const playerColor = state.playerColor || storedGameData.playerColor;
      if (playerColor) {
        if (autoRotateBoard) {
          setBoardOrientation(state.turn === "w" ? "white" : "black");
        } else {
          setBoardOrientation(playerColor);
        }
      }
      
      // Update game state
      setGameState(prev => ({
        ...state,
        playerColor: prev?.playerColor || state.playerColor || storedGameData.playerColor
      }));

      // Handle move history from individual moves
      if (state.move && state.moveNumber) {
        const moveTime = calculateMoveTime(state);
        
        setMoveHistory(prev => {
          // Check if this move already exists
          const existingMove = prev.find(m => m.moveNumber === state.moveNumber);
          if (existingMove) {
            return prev; // Don't duplicate moves
          }

          const newMove = {
            moveNumber: state.moveNumber,
            move: state.move,
            color: state.color || (state.turn === "w" ? "black" : "white"), // Previous player's color
            time: moveTime
          };
          
          return [...prev, newMove];
        });
      }

      // Update time tracking
      if (state.whiteTimeLeft !== undefined && state.blackTimeLeft !== undefined) {
        prevTimesRef.current = {
          whiteTimeLeft: state.whiteTimeLeft,
          blackTimeLeft: state.blackTimeLeft
        };
      }
    });

    // Handle game start event
    newSocket.on("gameStart", (data) => {
      console.log("Game started:", data);
      
      const storedGameData = JSON.parse(localStorage.getItem("gameData") || "{}");
      
      // Determine player color based on player IDs
      let playerColor = storedGameData.playerColor;
      if (!playerColor && data.whitePlayerId && data.blackPlayerId) {
        const { userId } = storedGameData;
        playerColor = userId === data.whitePlayerId ? "white" : "black";
        
        // Update stored game data
        localStorage.setItem("gameData", JSON.stringify({
          ...storedGameData,
          playerColor
        }));
      }
      
      setBoardOrientation(playerColor || "white");
      
      setGameState({
        fen: data.initialGameState,
        turn: "w",
        playerColor,
        gameId: data.gameId,
        whiteTimeLeft: data.whiteTimeLeft,
        blackTimeLeft: data.blackTimeLeft,
        gameOver: false
      });
      
      // Only reset move history for truly new games
      if (data.isNewGame) {
        setMoveHistory([]);
        setCapturedWhite([]);
        setCapturedBlack([]);
        toast.success("Game started!");
      } else {
        toast.success("Game resumed!");
      }
      
      prevTimesRef.current = {
        whiteTimeLeft: data.whiteTimeLeft,
        blackTimeLeft: data.blackTimeLeft
      };
    });

    // Handle time updates
    newSocket.on("timeUpdate", (data) => {
      console.log("Time update:", data);
      setGameState((prev: any) => ({
        ...prev,
        whiteTimeLeft: data.whiteTimeLeft,
        blackTimeLeft: data.blackTimeLeft
      }));
      
      // Update time tracking for move calculation
      prevTimesRef.current = {
        whiteTimeLeft: data.whiteTimeLeft,
        blackTimeLeft: data.blackTimeLeft
      };
    });

    // Handle game over
    newSocket.on("gameOver", (data) => {
      console.log("Game over:", data);
      
      setGameState((prev: any) => ({
        ...prev,
        gameOver: true,
        result: data.result,
        eloUpdate: data.eloUpdate
      }));
            
      // Clear game data after a delay
      setTimeout(() => {
        localStorage.removeItem("gameData");
      }, 5000);
    });

    // Handle opponent disconnection
    newSocket.on("opponentDisconnected", ({ message }: { message: string }) => {
      console.log("Opponent disconnected:", message);
      setOpponentDisconnected(true);
      setDisconnectionMessage(message);
    });

    // Handle opponent reconnection
    newSocket.on("gameResumed", ({ message }: { message: string }) => {
      console.log("Game resumed:", message);
      setOpponentDisconnected(false);
      setDisconnectionMessage("");
      toast.success(message || "Opponent reconnected");
    });

    // Handle errors
    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      toast.error(error.message || "An error occurred");
    });

    // Add this event handler after the existing event handlers
    newSocket.on("moveHistory", (data) => {
      console.log("Received move history:", data.moves);
      if (data.moves && Array.isArray(data.moves)) {
        const formattedMoves = data.moves.map((move: { moveNumber: number; move: string; color: 'white' | 'black'; }) => ({
          moveNumber: move.moveNumber,
          move: move.move,
          color: move.color,
          time: 3000 // Default time since we don't store move times in DB yet
        }));
        setMoveHistory(formattedMoves);
        console.log("Move history restored:", formattedMoves);
      }
    });

    // Helper function to calculate move time
    const calculateMoveTime = (state: any): number => {
      if (!state.move || !prevTimesRef.current.whiteTimeLeft || !prevTimesRef.current.blackTimeLeft) {
        return 3000; // Default 3 seconds
      }

      let moveTime = 0;
      if (state.color === "white") {
        moveTime = prevTimesRef.current.whiteTimeLeft - (state.whiteTimeLeft || 0);
      } else if (state.color === "black") {
        moveTime = prevTimesRef.current.blackTimeLeft - (state.blackTimeLeft || 0);
      }
      
      // Ensure reasonable time bounds
      return Math.max(100, Math.min(moveTime, 60000));
    };

    return () => {
      if (newSocket) {
        console.log("Cleaning up socket connection");
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("gameState");
        newSocket.off("gameStart");
        newSocket.off("timeUpdate");
        newSocket.off("gameOver");
        newSocket.off("opponentDisconnected");
        newSocket.off("gameResumed");
        newSocket.off("error");
        newSocket.close();
      }
    };
  }, [gameId, router, autoRotateBoard, setGameState, setBoardOrientation, setMoveHistory, setCapturedWhite, setCapturedBlack, userId]); // Add userId to dependencies

  // Function to send moves 
  const sendMove = (move: string) => {
    if (!socket || !isConnected) {
      toast.error("Not connected to server");
      return false;
    }

    if (!userId) {
      toast.error("User not authenticated");
      return false;
    }

    console.log("Sending move:", { gameId, move, userId });
    
    socket.emit("move", { gameId, move, userId });
    return true;
  };

  // Function to leave game
  const leaveGame = () => {
    if (socket && isConnected && userId) {
      socket.emit("leaveGame", { gameId, userId });
    }
    
    // Clear local data and redirect
    localStorage.removeItem("gameData");
    router.push("/game/find");
  };

  return { 
    socket, 
    isConnected,
    opponentDisconnected,
    disconnectionMessage,
    sendMove,
    leaveGame
  };
};