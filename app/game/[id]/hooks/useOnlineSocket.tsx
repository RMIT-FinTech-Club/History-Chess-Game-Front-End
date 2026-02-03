import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GameState, UseOnlineSocketProps } from "../types";
import { Chess } from 'chess.js';
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import basePath from "@/config/pathConfig";

// Connection status type for UI feedback
export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

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
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [disconnectionMessage, setDisconnectionMessage] = useState("");
  const router = useRouter();

  // Toast ID ref for managing persistent reconnecting toast
  const reconnectToastId = useRef<string | number | null>(null);
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 10;


  // Track previous time states to calculate move duration
  const prevTimesRef = useRef<{
    whiteTimeLeft?: number;
    blackTimeLeft?: number;
  }>({});

  // Dismiss reconnecting toast helper
  const dismissReconnectToast = useCallback(() => {
    if (reconnectToastId.current) {
      toast.dismiss(reconnectToastId.current);
      reconnectToastId.current = null;
    }
  }, []);

  // Show reconnecting toast helper
  const showReconnectToast = useCallback((attempt: number) => {
    // Dismiss any existing toast first
    dismissReconnectToast();

    reconnectToastId.current = toast.loading(
      `Reconnecting to server... (Attempt ${attempt}/${maxReconnectAttempts})`,
      {
        duration: Infinity, // Keep showing until dismissed
        description: "Please wait while we restore your connection",
      }
    );
  }, [dismissReconnectToast]);

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
    setConnectionStatus('connecting');

    const newSocket = io(`${basePath}`, {
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000, // Max 5 second delay between attempts
      randomizationFactor: 0.5, // Add some randomization to prevent thundering herd
      timeout: 20000, // 20 second connection timeout
      withCredentials: true,
    });
    setSocket(newSocket);

    // Handle successful connection
    newSocket.on("connect", () => {
      console.log("Connected to server with socket ID:", newSocket.id);
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttemptRef.current = 0;

      // Dismiss reconnecting toast and show success
      dismissReconnectToast();

      // Only show reconnected message if we were previously reconnecting
      if (reconnectToastId.current !== null || reconnectAttemptRef.current > 0) {
        toast.success("Connection restored!", {
          duration: 2000,
          description: "Your game session has been recovered",
        });
      }

      // Use userId from GlobalStorage instead of localStorage
      if (userId && gameId) {
        console.log("Rejoining game:", gameId);
        newSocket.emit("rejoinGame", { gameId, userId });
      }
    });

    // Handle disconnection - DON'T show error, just log and wait for reconnect
    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      console.log("Disconnected from server. Reason:", reason);

      // Only show reconnecting status if it wasn't a clean disconnect
      if (reason !== "io client disconnect") {
        setConnectionStatus('reconnecting');
        // Toast will be shown by reconnect_attempt event
      }
    });

    // Track reconnection attempts
    newSocket.io.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnection attempt ${attempt}...`);
      reconnectAttemptRef.current = attempt;
      setConnectionStatus('reconnecting');
      showReconnectToast(attempt);
    });

    // Handle reconnection failure
    newSocket.io.on("reconnect_failed", () => {
      console.error("Failed to reconnect after all attempts");
      setConnectionStatus('error');
      dismissReconnectToast();
      toast.error("Unable to connect to server", {
        duration: 10000,
        description: "Please check your connection and refresh the page",
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        },
      });
    });

    // Handle connection error - suppress during reconnection
    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      // Only show error if we've exhausted reconnection attempts
      if (reconnectAttemptRef.current >= maxReconnectAttempts) {
        setConnectionStatus('error');
      }
    });

    // Get gameId from localStorage but userId from GlobalStorage
    const gameData = localStorage.getItem("gameData");
    if (!gameData) {
      // Don't show error during initial load - just redirect
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
        // Use the duration sent by backend if available, otherwise calculate or default
        const moveTime = state.time || calculateMoveTime(state);

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
        const storedUserId = storedGameData.userId || userId;
        playerColor = storedUserId === data.whitePlayerId ? "white" : "black";

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
        gameOver: false,
        players: data.players || [data.whitePlayerId, data.blackPlayerId]
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

    // Handle time updates - CRITICAL for countdown
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

    // Handle game over with coin rewards
    newSocket.on("gameOver", (data) => {
      console.log("Game over:", data);

      setGameState((prev: any) => ({
        ...prev,
        gameOver: true,
        result: data.result,
        eloUpdate: data.eloUpdate,
        // Add coin reward data from backend
        coinReward: data.coinReward ? {
          amount: data.coinReward.amount || 0,
          breakdown: data.coinReward.breakdown,
          transactionHash: data.coinReward.transactionHash,
          status: data.coinReward.status || 'pending'
        } : undefined
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
      console.error("Socket reserved error event:", error);
      // Try to extract msg if it's an object with message
      const msg = typeof error === 'string' ? error : (error && error.message) ? error.message : JSON.stringify(error);
      toast.error(msg || "An error occurred");
    });

    // Handle custom server-side errors
    newSocket.on("socketError", (data: { message: string, details?: any }) => {
      console.error("Server Socket Error:", data);
      toast.error(data.message || "Server socket error");
    });

    newSocket.on("gameError", (data: { message: string, details?: any }) => {
      console.error("Game Logic Error:", data);
      toast.error(data.message || "Game logic error");
    });

    // Add this event handler after the existing event handlers
    newSocket.on("moveHistory", (data) => {
      console.log("Received move history:", data.moves);
      if (data.moves && Array.isArray(data.moves)) {
        const formattedMoves = data.moves.map((move: any) => ({
          moveNumber: move.moveNumber,
          move: move.move,
          color: move.color || (move.playerColor === 'w' ? 'white' : 'black'),
          // DB duration is in seconds, convert to MS. Fallback to 3000 if not present
          time: (move.duration || 3) * 1000
        }));
        setMoveHistory(formattedMoves);
        console.log("Move history restored:", formattedMoves);
      }
    });

    // Helper function to calculate move time (Fallback only)
    const calculateMoveTime = (state: any): number => {
      if (!state.whiteTimeLeft || !state.blackTimeLeft ||
        !prevTimesRef.current.whiteTimeLeft || !prevTimesRef.current.blackTimeLeft) {
        return 3000; // Default 3 seconds
      }

      let moveTime = 0;
      if (state.color === "white") {
        moveTime = prevTimesRef.current.whiteTimeLeft - state.whiteTimeLeft;
      } else if (state.color === "black") {
        moveTime = prevTimesRef.current.blackTimeLeft - state.blackTimeLeft;
      }

      // Ensure reasonable time bounds
      return Math.max(100, Math.min(moveTime, 60000));
    };

    return () => {
      // Dismiss any pending reconnection toasts
      dismissReconnectToast();

      if (newSocket) {
        console.log("Cleaning up socket connection");
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("connect_error");
        newSocket.off("gameState");
        newSocket.off("gameStart");
        newSocket.off("timeUpdate");
        newSocket.off("gameOver");
        newSocket.off("opponentDisconnected");
        newSocket.off("gameResumed");
        newSocket.off("error");
        newSocket.off("socketError");
        newSocket.off("gameError");
        newSocket.off("moveHistory");
        newSocket.io.off("reconnect_attempt");
        newSocket.io.off("reconnect_failed");
        newSocket.close();
      }
    };
  }, [gameId, router, autoRotateBoard, setGameState, setBoardOrientation, setMoveHistory, setCapturedWhite, setCapturedBlack, userId, dismissReconnectToast, showReconnectToast]); // Add toast helpers to dependencies

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

  // Function to surrender (forfeit) the game - stays on page to show result
  const surrender = () => {
    if (socket && isConnected && userId) {
      socket.emit("leaveGame", { gameId, userId });
      // Don't redirect - let the gameOver event handle the dialog
    }
  };

  // Function to leave game (used after game over to navigate away)
  const leaveGame = () => {
    // Clear local data and redirect to challenge page
    localStorage.removeItem("gameData");
    router.push("/challenge");
  };

  return {
    socket,
    isConnected,
    connectionStatus,
    opponentDisconnected,
    disconnectionMessage,
    sendMove,
    surrender,
    leaveGame
  };
};