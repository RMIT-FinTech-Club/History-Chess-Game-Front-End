import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GameState, UseOnlineSocketProps } from "../types";

export const useOnlineSocket = ({
  gameId,
  autoRotateBoard,
  setGameState,
  setBoardOrientation,
  setMoveHistory,
  setCapturedWhite,
  setCapturedBlack,
}: UseOnlineSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [disconnectionMessage, setDisconnectionMessage] = useState("");
  const router = useRouter();
  
  // Track if current user is leaving the game
  const isLeavingGame = useRef(false);
  
  // Track previous time states to calculate move duration
  const prevTimesRef = useRef<{
    whiteTimeLeft?: number;
    blackTimeLeft?: number;
  }>({});

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
      
      // Get game data and rejoin if disconnected
      const gameData = localStorage.getItem("gameData");
      if (gameData) {
        const { userId } = JSON.parse(gameData);
        if (userId && gameId) {
          console.log("Rejoining game:", gameId);
          newSocket.emit("rejoinGame", { gameId, userId });
        }
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    // Initial game join
    const gameData = localStorage.getItem("gameData");
    if (!gameData) {
      toast.error("No game data found");
      router.push("/game/find");
      return;
    }

    const { gameId: storedGameId, userId } = JSON.parse(gameData);

    // Join the game
    newSocket.emit("joinGame", { gameId: storedGameId, userId });

    // Handle game state updates from backend
    newSocket.on("gameState", (state) => {
      console.log("Received gameState:", state);
      
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
      
      // Only show disconnection warning if current user is not leaving the game
      if (!isLeavingGame.current) {
        setOpponentDisconnected(true);
        setDisconnectionMessage(message);
      }
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
  }, [gameId, router, autoRotateBoard, setGameState, setBoardOrientation, setMoveHistory, setCapturedWhite, setCapturedBlack]);

  // Function to send moves (not used directly in move handler anymore)
  const sendMove = (move: string) => {
    if (!socket || !isConnected) {
      toast.error("Not connected to server");
      return false;
    }

    const gameData = localStorage.getItem("gameData");
    if (!gameData) {
      toast.error("No game data found");
      return false;
    }

    const { userId } = JSON.parse(gameData);
    console.log("Sending move:", { gameId, move, userId });
    
    socket.emit("move", { gameId, move, userId });
    return true;
  };

  // Function to leave game
  const leaveGame = () => {
    if (socket && isConnected) {
      const gameData = localStorage.getItem("gameData");
      if (gameData) {
        const { userId } = JSON.parse(gameData);
        // Note: You may need to implement leaveGame event in your backend
        socket.emit("leaveGame", { gameId, userId });
      }
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