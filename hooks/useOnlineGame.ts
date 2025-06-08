import { useState, useEffect, useCallback, useRef } from "react";
import io, { Socket } from "socket.io-client";

const BACKEND_URL = "http://localhost:8000";

export interface OnlineGameState {
  eloUpdate: number;
  fen: string;
  players: string[];
  status: string;
  moves: { moveNumber: number; move: string }[];
  playMode: string;
  timeLimit: number;
  turn?: string;
  inCheck?: boolean;
  gameOver?: boolean;
  moveNumber?: number;
  move?: string;
  whiteTimeLeft?: number;
  blackTimeLeft?: number;
  result?: string;
}

interface UseOnlineGameOptions {
  userId: string;
}

export function useOnlineGame({ userId }: UseOnlineGameOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameId, setGameId] = useState<string>("");
  const [gameState, setGameState] = useState<OnlineGameState | null>(null);
  const [message, setMessage] = useState<string>("");
  const [opponentId, setOpponentId] = useState<string>("");
  const [gameLink, setGameLink] = useState<string>("");
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [wasInGame, setWasInGame] = useState(false);

  // Keep userId ref up-to-date for event handlers
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Enhanced socket connection and event listeners
  useEffect(() => {
    if (!userId) return;
    const newSocket = io(BACKEND_URL, { 
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      
      // Enhanced rejoin logic
      if (gameId && userIdRef.current) {
        console.log("Attempting to rejoin game:", gameId);
        newSocket.emit("rejoinGame", { 
          gameId, 
          userId: userIdRef.current,
          timestamp: Date.now() // Help server track rejoin timing
        });
        setWasInGame(true);
      }
    });

    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      console.log("Disconnected:", reason);
      
      // Track that we were in a game when disconnected
      if (gameId) {
        setWasInGame(true);
      }
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      setReconnectAttempts(attemptNumber);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Reconnection attempt", attemptNumber);
      setReconnectAttempts(attemptNumber);
    });

    // Handle rejoin response
    newSocket.on("rejoinSuccess", (data) => {
      console.log("Successfully rejoined game");
      setGameState(data.gameState);
      setMessage("Reconnected to game!");
      setWasInGame(false);
    });

    newSocket.on("rejoinFailed", (error) => {
      console.log("Failed to rejoin game:", error);
      setMessage(`Failed to rejoin: ${error.message}`);
      // Optionally redirect to game lobby
      setTimeout(() => {
        setGameId("");
        setGameState(null);
      }, 3000);
    });

    newSocket.on("gameState", (state: OnlineGameState) => setGameState(state));
    newSocket.on("timeUpdate", ({ whiteTimeLeft, blackTimeLeft }) => {
      setGameState((prev) =>
        prev ? { ...prev, whiteTimeLeft, blackTimeLeft } : null
      );
    });
    newSocket.on("opponentDisconnected", ({ message }) => setMessage(message));
    newSocket.on("gameResumed", () => setMessage("Game resumed!"));
    newSocket.on("gameOver", ({ result }) => {
      setGameState((prev) => prev ? { ...prev, gameOver: true, result } : null);
      setMessage(result);
    });
    newSocket.on("invalidMove", (error) =>
      setMessage(`Invalid Move: ${error.error}`)
    );
    newSocket.on("error", (error) =>
      setMessage(`Error: ${error.message}`)
    );

    return () => {
      newSocket.disconnect();
    };
  }, [userId, gameId]); // Add gameId to dependencies

  // Join a game by ID
  const joinGame = useCallback(
    (id: string) => {
      if (!socket) {
        setMessage("Socket not initialized.");
        return;
      }
      if (!userIdRef.current) {
        setMessage("User not logged in.");
        return;
      }
      
      setGameId(id);
      
      // Check if socket is connected before emitting
      if (socket.connected) {
        socket.emit("joinGame", { gameId: id, userId: userIdRef.current });
      } else {
        // Wait for connection before joining
        socket.once("connect", () => {
          socket.emit("joinGame", { gameId: id, userId: userIdRef.current });
        });
      }
    },
    [socket]
  );

  // Send a move (in UCI or SAN format)
  const sendMove = useCallback(
    (move: string) => {
      if (!socket || !gameId) {
        setMessage("No active game or socket not initialized.");
        return;
      }
      socket.emit("move", { gameId, move, userId: userIdRef.current });
    },
    [socket, gameId]
  );

  // Challenge a user
  const challengeUser = useCallback(
    async (opponentId: string, playMode: string, colorPreference: string) => {
      if (!userIdRef.current || !opponentId) {
        setMessage("Please provide User ID and Opponent ID.");
        return;
      }
      try {
        const res = await fetch(`${BACKEND_URL}/game/challenge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userIdRef.current,
            opponentId,
            playMode,
            colorPreference,
          }),
        });
        const data = await res.json();
        setGameId(data.gameId);
        setGameLink(data.gameLink);
        setMessage(`Challenge sent! Game ID: ${data.gameId}`);
        joinGame(data.gameId);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setMessage(`Challenge failed: ${err.message}`);
        } else {
          setMessage("Challenge failed: An unknown error occurred.");
        }
      }
    },
    [joinGame]
  );

  // Find a match
  const findMatch = useCallback(
    async (playMode: string, colorPreference: string) => {
      if (!userIdRef.current) {
        setMessage("Please provide a User ID.");
        return;
      }
      
      // Ensure socket is connected before proceeding
      if (!socket || !socket.connected) {
        setMessage("Connection not ready. Please try again.");
        return;
      }
      
      try {
        const res = await fetch(`${BACKEND_URL}/game/find`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userIdRef.current,
            playMode,
            colorPreference,
          }),
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.gameId) {
          joinGame(data.gameId);
        } else {
          setMessage("No game ID received from server.");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setMessage(`Find match failed: ${err.message}`);
        } else {
          setMessage("Find match failed: An unknown error occurred.");
        }
      }
    },
    [joinGame, socket]
  );

  // Create a new game
  const createGame = useCallback(
    async (playMode: string, colorPreference: string) => {
      if (!userIdRef.current) {
        setMessage("Please log in or register first.");
        return;
      }
      try {
        const res = await fetch(`${BACKEND_URL}/game/new`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userIdRef.current,
            playMode,
            colorPreference,
          }),
        });
        const data = await res.json();
        setGameId(data.gameId);
        setGameLink(data.gameLink);
        setMessage(`Game created! ID: ${data.gameId}`);
        joinGame(data.gameId);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setMessage(`Create game failed: ${err.message}`);
        } else {
          setMessage("Create game failed: An unknown error occurred.");
        }
      }
    },
    [joinGame]
  );

  // Manual rejoin function
  const rejoinGame = useCallback((gameIdToRejoin?: string) => {
    const targetGameId = gameIdToRejoin || gameId;
    
    if (!socket || !targetGameId || !userIdRef.current) {
      setMessage("Cannot rejoin: missing socket, game ID, or user ID");
      return;
    }

    if (!socket.connected) {
      setMessage("Cannot rejoin: not connected to server");
      return;
    }

    console.log("Manual rejoin attempt for game:", targetGameId);
    socket.emit("rejoinGame", { 
      gameId: targetGameId, 
      userId: userIdRef.current,
      manual: true,
      timestamp: Date.now()
    });
  }, [socket, gameId]);

  // Leave/end game function
  const leaveGame = useCallback(() => {
    if (!socket || !gameId || !userIdRef.current) {
      setMessage("Cannot leave: missing socket, game ID, or user ID");
      return;
    }

    // Emit leave game event to server
    socket.emit("leaveGame", { 
      gameId, 
      userId: userIdRef.current
    });

    // Don't clear local state immediately - let the server response handle it
    setMessage("Leaving game...");
  }, [socket, gameId]);

  // Persist game state to localStorage for recovery
  useEffect(() => {
    if (gameId && gameState) {
      localStorage.setItem("chess_active_game", JSON.stringify({
        gameId,
        gameState,
        userId: userIdRef.current,
        timestamp: Date.now()
      }));
    }
  }, [gameId, gameState]);

  // Recovery logic on hook initialization
  useEffect(() => {
    const savedGame = localStorage.getItem("chess_active_game");
    if (savedGame && !gameId) {
      try {
        const { gameId: savedGameId, timestamp } = JSON.parse(savedGame);
        
        // Only recover if saved within last 10 minutes
        if (Date.now() - timestamp < 10 * 60 * 1000) {
          console.log("Recovering saved game:", savedGameId);
          setGameId(savedGameId);
          setWasInGame(true);
        } else {
          localStorage.removeItem("chess_active_game");
        }
      } catch (error) {
        console.error("Failed to recover saved game:", error);
        localStorage.removeItem("chess_active_game");
      }
    }
  }, []);

  // Enhanced gameOver handler
  useEffect(() => {
    if (!socket) return;

    socket.on("gameOver", ({ result, eloUpdate }) => {
      console.log("Game ended:", result);
      
      setGameState((prev) => prev ? { 
        ...prev, 
        gameOver: true, 
        result,
        eloUpdate 
      } : null);
      
      setMessage(result);
      
      // Clear localStorage after game ends
      localStorage.removeItem("chess_active_game");
      
      // Clear game ID after a delay to show the result
      setTimeout(() => {
        setGameId("");
      }, 5000);
    });

    return () => {
      socket.off("gameOver");
    };
  }, [socket]);

  return {
    socket,
    isConnected,
    gameId,
    setGameId,
    gameState,
    message,
    setMessage,
    opponentId,
    setOpponentId,
    gameLink,
    joinGame,
    sendMove,
    createGame,
    findMatch,
    challengeUser,
    rejoinGame, // Expose manual rejoin function
    reconnectAttempts,
    wasInGame,
    leaveGame,
  };
}