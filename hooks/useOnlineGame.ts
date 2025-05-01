import { useState, useEffect, useCallback, useRef } from "react";
import io, { Socket } from "socket.io-client";

const BACKEND_URL = "http://localhost:8000";

export interface OnlineGameState {
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

  // Keep userId ref up-to-date for event handlers
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Socket connection and event listeners
  useEffect(() => {
    if (!userId) return;
    const newSocket = io(BACKEND_URL, { reconnection: true });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      if (gameId && userIdRef.current) {
        newSocket.emit("rejoinGame", { gameId, userId: userIdRef.current });
      }
    });

    newSocket.on("disconnect", () => setIsConnected(false));
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
  }, [userId, gameId]);

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
      socket.emit("joinGame", { gameId: id, userId: userIdRef.current });
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
        const data = await res.json();
        joinGame(data.gameId);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setMessage(`Find match failed: ${err.message}`);
        } else {
          setMessage("Find match failed: An unknown error occurred.");
        }
      }
    },
    [joinGame]
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
  };
}