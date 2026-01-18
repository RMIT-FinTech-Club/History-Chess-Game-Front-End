// hooks/useChessLogic.ts
import { useState, useMemo, useCallback } from "react";
import { Chess, Square, Move } from "chess.js";

export function useChessLogic() {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [history, setHistory] = useState<Move[]>([]); // Store full move objects
  const [gameState, setGameState] = useState({
    isGameOver: false,
    title: "",
    message: ""
  });

  // Helper function to calculate the path between two squares for sliding pieces
  // (Needed for check highlighting)
  const getPathBetween = useCallback((from: Square, to: Square): Square[] => {
    const path: Square[] = [];
    const fromFile = from.charCodeAt(0) - 97;
    const fromRank = 8 - parseInt(from[1]);
    const toFile = to.charCodeAt(0) - 97;
    const toRank = 8 - parseInt(to[1]);

    const fileDiff = toFile - fromFile;
    const rankDiff = toRank - fromRank;

    // Vertical movement
    if (fileDiff === 0) {
      const step = rankDiff > 0 ? 1 : -1;
      for (let i = 1; i < Math.abs(rankDiff); i++) {
        path.push(`${from[0]}${8 - (fromRank + i * step)}` as Square);
      }
    }
    // Horizontal movement
    else if (rankDiff === 0) {
      const step = fileDiff > 0 ? 1 : -1;
      for (let i = 1; i < Math.abs(fileDiff); i++) {
        path.push(
          `${String.fromCharCode(97 + fromFile + i * step)}${from[1]}` as Square
        );
      }
    }
    // Diagonal movement
    else if (Math.abs(fileDiff) === Math.abs(rankDiff)) {
      const steps = Math.abs(fileDiff);
      const fileStep = fileDiff > 0 ? 1 : -1;
      const rankStep = rankDiff > 0 ? 1 : -1;
      for (let i = 1; i < steps; i++) {
        path.push(
          `${String.fromCharCode(97 + fromFile + i * fileStep)}${8 - (fromRank + i * rankStep)}` as Square
        );
      }
    }
    return path;
  }, []);

  // Compute squares that are in check
  const checkSquares = useMemo(() => {
    if (!game.isCheck()) return [];

    const kingSquare = (() => {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const p = game.board()[i][j];
          if (p && p.type === "k" && p.color === game.turn()) {
            return `${String.fromCharCode(97 + j)}${8 - i}` as Square;
          }
        }
      }
      return "" as Square;
    })();

    if (!kingSquare) return [];

    const checkingSquares: Square[] = [];
    const opponentColor = game.turn() === "w" ? "b" : "w";
    const board = game.board();

    // Clone the game and flip the turn to simulate opponent's moves
    const tempGame = new Chess();
    const fenParts = game.fen().split(" ");
    fenParts[1] = opponentColor; // Opponent's turn
    tempGame.load(fenParts.join(" "));

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece.color === opponentColor) {
          const pieceSquare = `${String.fromCharCode(97 + j)}${8 - i}` as Square;
          // Use the temp game to check moves from the opponent's perspective
          const moves = tempGame.moves({ square: pieceSquare, verbose: true });
          if (moves.some(m => m.to === kingSquare)) {
            checkingSquares.push(pieceSquare);
            // If the checking piece is a slider, add the path squares
            if (["r", "b", "q"].includes(piece.type)) {
              const path = getPathBetween(pieceSquare, kingSquare);
              checkingSquares.push(...path);
            }
          }
        }
      }
    }

    checkingSquares.push(kingSquare); // Highlight the king too
    return [...new Set(checkingSquares)];
  }, [game, fen, getPathBetween]); // Depend on game instance and fen

  // Check game state
  const checkGameState = useCallback(() => {
    let isOver = false;
    let title = "";
    let message = "";

    if (game.isCheckmate()) {
      isOver = true;
      title = "Checkmate!";
      message = `${game.turn() === "w" ? "Black" : "White"} wins!`;
    } else if (game.isDraw()) {
      isOver = true;
      title = "Draw!";
      message = "The game is a draw.";
    } else if (game.isStalemate()) {
      isOver = true;
      title = "Stalemate!";
      message = "The game is a stalemate.";
    } else if (game.isThreefoldRepetition()) {
      isOver = true;
      title = "Draw!";
      message = "The game is a draw due to threefold repetition.";
    } else if (game.isInsufficientMaterial()) {
        isOver = true;
        title = "Draw!";
        message = "Draw due to insufficient material.";
    }

    setGameState({ isGameOver: isOver, title, message });
    return isOver; // Return whether the game ended
  }, [game]);

  // Make a move locally
  const makeLocalMove = useCallback((moveData: { from: Square; to: Square; promotion?: string }) => {
    try {
      const moveResult = game.move({
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion as 'q' | 'r' | 'b' | 'n' | undefined
      });

      if (moveResult) {
        setHistory(game.history({ verbose: true })); // Update history with full move objects
        setFen(game.fen());
        checkGameState(); // Check state after the move
        return moveResult; // Return the move object
      }
      return null; // Indicate failure
    } catch (error) {
      // chess.js throws errors for illegal moves
      console.error("Illegal move attempt:", error);
      return null; // Indicate failure
    }
  }, [game, checkGameState]);

  // Undo the last move locally
  const undoLocalMove = useCallback(() => {
    const undoneMove = game.undo();
    if (undoneMove) {
      setHistory(game.history({ verbose: true }));
      setFen(game.fen());
      setGameState({ isGameOver: false, title: "", message: "" }); // Reset game over state
      return undoneMove;
    }
    return null;
  }, [game]);

  // Reset the game locally
  const resetLocalGame = useCallback(() => {
    game.reset();
    setHistory([]);
    setFen(game.fen());
    setGameState({ isGameOver: false, title: "", message: "" });
  }, [game]);

  // Get possible moves for a square
  const getPossibleMoves = useCallback((square: Square) => {
    const moves = game.moves({ square: square, verbose: true });
    return moves.map((move) => ({
      to: move.to,
      isCapture: !!move.captured,
    }));
  }, [game]); // Depends only on the game instance (which changes state internally)

  return {
    game, // Expose the raw chess.js instance if needed elsewhere
    fen,
    history, // Array of Move objects
    gameState,
    setGameState, // Add this line to expose the setter
    checkSquares,
    makeLocalMove,
    undoLocalMove,
    resetLocalGame,
    getPossibleMoves,
    currentTurn: game.turn(), // Directly expose current turn
  };
}