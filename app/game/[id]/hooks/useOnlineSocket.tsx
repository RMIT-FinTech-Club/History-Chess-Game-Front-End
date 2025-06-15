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
  // Add opponent connection state
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [disconnectionMessage, setDisconnectionMessage] = useState("");
  const router = useRouter();
  
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
      toast.success("Connected to server");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      toast.error("Disconnected from server");
    });

    // Get game data from localStorage
    const gameData = localStorage.getItem("gameData");
    if (!gameData) {
      toast.error("No game data found");
      router.push("/game/find");
      return;
    }

    const { gameId: storedGameId, userId } = JSON.parse(gameData);

    // Join the game with verification
    newSocket.emit("joinGame", { gameId: storedGameId, userId });

    newSocket.on("gameState", (state) => {
      console.log("Full gameState received:", JSON.stringify(state, null, 2));
      
      const storedGameData = JSON.parse(localStorage.getItem("gameData") || "{}");
      
      if (state.playerColor && storedGameData.playerColor && state.playerColor !== storedGameData.playerColor) {
        toast.error("Player color verification failed");
        router.push("/game/find");
        return;
      }
      
      // Set board orientation based on player color and auto-rotate setting
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
      
      // Calculate move time based on time difference
      let moveTime = 0;
      if (state.move && prevTimesRef.current.whiteTimeLeft !== undefined && prevTimesRef.current.blackTimeLeft !== undefined) {
        if (state.color === "white") {
          // White player made the move, calculate time spent
          moveTime = prevTimesRef.current.whiteTimeLeft - (state.whiteTimeLeft || 0);
        } else if (state.color === "black") {
          // Black player made the move, calculate time spent
          moveTime = prevTimesRef.current.blackTimeLeft - (state.blackTimeLeft || 0);
        }
        
        // Ensure positive time and convert to reasonable values
        moveTime = Math.max(moveTime, 100); // Minimum 100ms
        moveTime = Math.min(moveTime, 60000); // Maximum 60 seconds
      } else {
        // Default time for first moves or when calculation fails
        moveTime = 3000; // 3 seconds default
      }

      // Handle move history - check multiple possible formats
      if (state.history && Array.isArray(state.history)) {
        console.log("Found state.history:", state.history);
        const formattedHistory = state.history.map((move: any, index: number) => ({
          moveNumber: index + 1,
          move: typeof move === 'string' ? move : move.san || move.move || move.notation,
          color: index % 2 === 0 ? "white" : "black",
          time: move.time || move.duration || moveTime
        }));
        setMoveHistory(formattedHistory);
      } else if (state.moves && Array.isArray(state.moves)) {
        console.log("Found state.moves:", state.moves);
        const formattedHistory = state.moves.map((move: any, index: number) => ({
          moveNumber: index + 1,
          move: typeof move === 'string' ? move : move.san || move.move || move.notation,
          color: index % 2 === 0 ? "white" : "black",
          time: move.time || move.duration || moveTime
        }));
        setMoveHistory(formattedHistory);
      } else if (state.moveHistory && Array.isArray(state.moveHistory)) {
        console.log("Found state.moveHistory:", state.moveHistory);
        setMoveHistory(state.moveHistory);
      } else if (state.completeHistory && Array.isArray(state.completeHistory)) {
        console.log("Found state.completeHistory:", state.completeHistory);
        setMoveHistory(state.completeHistory);
      } else if (state.move) {
        // Handle individual move updates
        console.log("Adding individual move with calculated time:", {
          move: state.move,
          calculatedTime: moveTime,
          color: state.color,
          previousWhiteTime: prevTimesRef.current.whiteTimeLeft,
          previousBlackTime: prevTimesRef.current.blackTimeLeft,
          currentWhiteTime: state.whiteTimeLeft,
          currentBlackTime: state.blackTimeLeft
        });
        
        setMoveHistory(prev => {
          const newMove = {
            moveNumber: prev.length + 1,
            move: state.move,
            color: state.color || (state.turn === "w" ? "black" : "white"),
            time: moveTime
          };
          
          console.log("Adding move to history:", newMove);
          return [...prev, newMove];
        });
      }

      // Update previous times for next calculation
      if (state.whiteTimeLeft !== undefined && state.blackTimeLeft !== undefined) {
        prevTimesRef.current = {
          whiteTimeLeft: state.whiteTimeLeft,
          blackTimeLeft: state.blackTimeLeft
        };
      }

      // Update captured pieces
      if (state.capturedPieces) {
        setCapturedWhite(state.capturedPieces.white || []);
        setCapturedBlack(state.capturedPieces.black || []);
      } else if (state.captured) {
        setCapturedWhite(state.captured.white || []);
        setCapturedBlack(state.captured.black || []);
      }
    });

    // Listen for individual move events
    newSocket.on("move", (moveData) => {
      console.log("Received move event:", moveData);
      
      // Calculate time for standalone move events
      let moveTime = 3000; // Default 3 seconds
      if (moveData.timeSpent !== undefined) {
        moveTime = moveData.timeSpent;
      } else if (moveData.duration !== undefined) {
        moveTime = moveData.duration;
      }
      
      setMoveHistory(prev => {
        const newMove = {
          moveNumber: prev.length + 1,
          move: moveData.move || moveData.san || moveData.notation,
          color: moveData.color || (moveData.turn === "w" ? "white" : "black"),
          time: moveTime
        };
        
        console.log("Adding move from move event:", newMove);
        return [...prev, newMove];
      });
    });

    newSocket.on("timeUpdate", (data) => {
      setGameState((prev: any) => ({
        ...prev,
        whiteTimeLeft: data.whiteTimeLeft,
        blackTimeLeft: data.blackTimeLeft
      }));
    });

    newSocket.on("error", (error) => {
      toast.error(error.message);
    });

    newSocket.on("gameStart", (data) => {
      console.log("Game started:", data);
      
      const storedGameData = JSON.parse(localStorage.getItem("gameData") || "{}");
      
      if (storedGameData.playerColor) {
        setBoardOrientation(storedGameData.playerColor);
      }
      
      setGameState({
        fen: data.initialGameState || data.fen,
        turn: "w",
        playerColor: storedGameData.playerColor,
        gameId: data.gameId,
        whiteTimeLeft: data.whiteTimeLeft,
        blackTimeLeft: data.blackTimeLeft
      });
      
      // Reset move history and time tracking for new game
      setMoveHistory([]);
      setCapturedWhite([]);
      setCapturedBlack([]);
      prevTimesRef.current = {
        whiteTimeLeft: data.whiteTimeLeft,
        blackTimeLeft: data.blackTimeLeft
      };
    });

    // Add opponent connection handlers
    const handleOpponentDisconnected = ({ message }: { message: string }) => {
      console.log("Opponent disconnected:", message);
      setOpponentDisconnected(true);
      setDisconnectionMessage(message);
    };

    const handleOpponentReconnected = () => {
      console.log("Opponent reconnected");
      setOpponentDisconnected(false);
      setDisconnectionMessage("");
    };

    newSocket.on('opponentDisconnected', handleOpponentDisconnected);
    newSocket.on('gameResumed', handleOpponentReconnected);

    return () => {
      if (newSocket) {
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("gameState");
        newSocket.off("move");
        newSocket.off("timeUpdate");
        newSocket.off("error");
        newSocket.off("gameStart");
        newSocket.off('opponentDisconnected', handleOpponentDisconnected);
        newSocket.off('gameResumed', handleOpponentReconnected);
        newSocket.close();
      }
    };
  }, [gameId, router, autoRotateBoard]);

  return { 
    socket, 
    isConnected,
    opponentDisconnected,
    disconnectionMessage,
  };
};