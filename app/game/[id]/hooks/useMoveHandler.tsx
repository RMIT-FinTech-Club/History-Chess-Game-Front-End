import { useCallback } from "react";
import { Square } from "chess.js";
import { GameState } from "../types";

interface UseMoveHandlerProps {
  gameState: GameState | null;
  timeoutGameOver: boolean;
  setSelectedPiece: (piece: Square | null) => void;
  sendMove: (move: string) => boolean; // Use the socket's sendMove function
}

export const useMoveHandler = ({
  gameState,
  timeoutGameOver,
  setSelectedPiece,
  sendMove, // Passed from useOnlineSocket
}: UseMoveHandlerProps) => {
  const makeMove = useCallback((sourceSquare: Square, targetSquare: Square, promotionPiece?: "q" | "r" | "b" | "n") => {
    if (!gameState || timeoutGameOver) {
      console.log("Cannot make move: gameState missing or game timed out");
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

    // Use the socket's sendMove function
    const success = sendMove(moveString);
    
    if (success) {
      setSelectedPiece(null);
    }
    
    return success;
  }, [gameState, timeoutGameOver, setSelectedPiece, sendMove]);

  return { makeMove };
};