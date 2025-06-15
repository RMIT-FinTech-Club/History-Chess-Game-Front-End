import { useCallback } from "react";
import { Square } from "chess.js";
import { Socket } from "socket.io-client";
import { GameState } from "../types";

interface UseMoveHandlerProps {
  socket: Socket | null;
  gameState: GameState | null;
  gameId: string;
  userId: string | null;
  timeoutGameOver: boolean;
  setSelectedPiece: (piece: Square | null) => void;
}

export const useMoveHandler = ({
  socket,
  gameState,
  gameId,
  userId,
  timeoutGameOver,
  setSelectedPiece,
}: UseMoveHandlerProps) => {
  const makeMove = useCallback((sourceSquare: Square, targetSquare: Square, promotionPiece?: "q" | "r" | "b" | "n") => {
    if (!socket || !gameState || timeoutGameOver) {
      console.log("Cannot make move: socket, gameState missing, or game timed out");
      return false;
    }

    if (!userId) {
      console.log("Cannot make move: no userId available");
      return false;
    }

    // Turn validation
    const isWhiteTurn = gameState.turn === "w";
    const isPlayerWhite = gameState.playerColor === "white";

    if (isWhiteTurn !== isPlayerWhite) {
      console.log("Cannot make move: not player's turn");
      return false;
    }

    // Create move string with promotion if needed
    let moveString = `${sourceSquare}${targetSquare}`;
    if (promotionPiece) {
      moveString += promotionPiece;
    }

    console.log("Emitting move:", {
      gameId: gameId,
      move: moveString,
      userId,
    });

    socket.emit("move", {
      gameId: gameId,
      move: moveString,
      userId,
    });

    setSelectedPiece(null);
    return true;
  }, [socket, gameState, gameId, timeoutGameOver, userId, setSelectedPiece]);

  return { makeMove };
};