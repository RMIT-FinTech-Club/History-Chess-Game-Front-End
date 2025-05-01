import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Square, Move } from "chess.js";
import { useStockfish, type StockfishLevel } from "./useStockfish";
import { useChessLogic } from "./useChessLogic";

export function useOfflineGame() {
  const {
    game,
    fen,
    history,
    gameState,
    checkSquares,
    makeLocalMove,
    undoLocalMove,
    resetLocalGame,
    getPossibleMoves,
    currentTurn,
  } = useChessLogic();

  const [moveTimings, setMoveTimings] = useState<string[]>([]);
  const [lastMoveTime, setLastMoveTime] = useState<number>(Date.now());
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [aiLevel, setAiLevel] = useState<StockfishLevel>(5);

  const { isReady: isAiReady, isThinking, findBestMove, setLevel } = useStockfish({
    level: aiLevel,
    timeForMove: 1000,
  });

  // Memoize possible moves calculation
  const possibleMoves = useMemo(() => {
    if (!selectedPiece) return [];
    return getPossibleMoves(selectedPiece);
  }, [selectedPiece, getPossibleMoves]);

  // Memoize square styles calculation
  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    checkSquares.forEach((square) => {
      styles[square] = {
        backgroundColor: "rgba(255, 0, 0, 0.4)",
      };
    });

    possibleMoves.forEach(({ to, isCapture }) => {
      styles[to] = {
        backgroundColor: isCapture
          ? "rgba(255, 0, 0, 0.4)"
          : "rgba(0, 255, 0, 0.4)",
      };
    });

    if (isSinglePlayer && isThinking) {
      // Apply a style to indicate AI is thinking, perhaps on the board container?
      // Using a specific square like "thinking" is unconventional.
      // Consider applying a class or style to the board wrapper instead.
      // For now, keeping the logic but noting the potential improvement.
      styles["thinking_indicator"] = { // Renamed key for clarity
        boxShadow: "0 0 15px #ffcc00", // Example style
      };
    }

    return styles;
  }, [checkSquares, possibleMoves, isSinglePlayer, isThinking]);

  // Ref to track the latest game state for AI move scheduling
  const gameStateRef = useRef({ fen, turn: game.turn() });

  useEffect(() => {
    gameStateRef.current = { fen, turn: game.turn() };
  }, [fen, game]);

  // Helper function to update captured pieces state
  const updateCapturedPieces = useCallback((move: Move | null, action: 'add' | 'remove') => {
    if (!move || !move.captured) return;

    const piece = `${move.color === "w" ? "b" : "w"}${move.captured.toUpperCase()}`;
    const setCaptured = move.color === "w" ? setCapturedBlack : setCapturedWhite;

    if (action === 'add') {
      setCaptured(prev => [...prev, piece]);
    } else {
      setCaptured(prev => prev.slice(0, -1)); // Assumes last added was the one to remove
    }
  }, []);

   // Helper function to update move timings
   const updateMoveTimings = useCallback((action: 'add' | 'remove') => {
    if (action === 'add') {
        const now = Date.now();
        setMoveTimings(prev => [...prev, `${((now - lastMoveTime) / 1000).toFixed(1)}s`]);
        setLastMoveTime(now);
    } else {
        setMoveTimings(prev => prev.slice(0, -1));
        // Note: Restoring lastMoveTime accurately on undo is complex and might not be necessary
    }
   }, [lastMoveTime]);

  // Function to handle AI's move execution
  const executeAiMove = useCallback((bestMove: string) => {
    try {
      const from = bestMove.substring(0, 2) as Square;
      const to = bestMove.substring(2, 4) as Square;
      const promotion = bestMove.length > 4 ? bestMove.charAt(4) as 'q' | 'r' | 'b' | 'n' : undefined;

      const aiMoveResult = makeLocalMove({ from, to, promotion });

      if (aiMoveResult) {
        updateCapturedPieces(aiMoveResult, 'add');
        updateMoveTimings('add');
      } else {
        console.error("AI move failed to apply to the board state.");
      }
    } catch (error) {
      console.error("Error executing AI move:", error);
    }
  }, [makeLocalMove, updateCapturedPieces, updateMoveTimings]);

  // Function to trigger AI move calculation and execution
  const triggerAiMove = useCallback(() => {
    // Use the latest game state from ref to avoid stale closures
    const currentFen = gameStateRef.current.fen;
    findBestMove(currentFen, (bestMove) => {
      if (bestMove) {
        console.log("AI selected move:", bestMove);
        // Ensure AI move execution happens after state updates settle
        setTimeout(() => executeAiMove(bestMove), 0);
      } else {
         console.error("Stockfish failed to return a best move.");
      }
    });
  }, [findBestMove, executeAiMove]);


  // Handle piece movement (player or initial AI move)
  const makeMove = useCallback((sourceSquare: Square, targetSquare: Square, promotionPiece?: 'q' | 'r' | 'b' | 'n') => {
    try {
      const moveResult = makeLocalMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: promotionPiece,
      });

      if (moveResult) {
        updateCapturedPieces(moveResult, 'add');
        updateMoveTimings('add');
        setSelectedPiece(null); // Deselect piece after successful move

        // If single player and it's now AI's turn, trigger AI move
        if (isSinglePlayer && !gameState.isGameOver && game.turn() !== playerColor && isAiReady) {
           // Use timeout to allow React state updates before AI calculates
           setTimeout(triggerAiMove, 100); // Small delay might still be needed
        }
        return true;
      }
      return false;
    } catch (error) {
      // Catch errors from makeLocalMove (e.g., illegal move attempt)
      console.error("Move error:", error);
      return false;
    }
  }, [
    makeLocalMove,
    gameState.isGameOver,
    isSinglePlayer,
    playerColor,
    isAiReady,
    game, // Added game dependency as game.turn() is used
    updateCapturedPieces,
    updateMoveTimings,
    triggerAiMove // Added triggerAiMove dependency
  ]);

  // Effect to make AI's first move if AI plays as white
  useEffect(() => {
    if (isSinglePlayer && playerColor === "b" && game.turn() === "w" && isAiReady && history.length === 0 && !isThinking) {
       console.log("AI making first move as White.");
       triggerAiMove();
    }
    // Ensure dependencies cover all conditions for the effect to run correctly.
  }, [isSinglePlayer, playerColor, game, isAiReady, history.length, isThinking, triggerAiMove]);

  // Undo the last move
  const undoMove = useCallback(() => {
    // Determine how many moves to undo (1 for player, 2 for player + AI response)
    const movesToUndo = (isSinglePlayer && history.length > 0 && history[history.length - 1].color !== playerColor) ? 2 : 1;

    let undoneMove: Move | null = null;
    for (let i = 0; i < movesToUndo; i++) {
        const move = undoLocalMove();
        if (move) {
            undoneMove = move; // Keep track of the last undone move (player's move)
            updateCapturedPieces(move, 'remove');
            updateMoveTimings('remove');
        } else {
            break; // Stop if undo fails (e.g., no more moves)
        }
    }

    setSelectedPiece(null); // Clear selection after undo
    return !!undoneMove; // Return true if at least the player's move was undone
  }, [undoLocalMove, isSinglePlayer, playerColor, history, updateCapturedPieces, updateMoveTimings]);


  // Reset the game
  const resetGame = useCallback(() => {
    resetLocalGame();
    setMoveTimings([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setSelectedPiece(null);
    setLastMoveTime(Date.now());
    // No need to explicitly set isSinglePlayer or playerColor here,
    // that's handled by the functions starting specific game modes.
  }, [resetLocalGame]);

  // Start a new game against AI
  const startSinglePlayerGame = useCallback((color: "w" | "b", level: StockfishLevel = 5) => {
    resetGame();
    setIsSinglePlayer(true);
    setPlayerColor(color);
    setAiLevel(level);
    setLevel(level);
    // The useEffect for AI's first move will handle the case where AI is white.
  }, [resetGame, setLevel]);

  // Start two player game
  const startTwoPlayerGame = useCallback(() => {
    resetGame();
    setIsSinglePlayer(false);
    // Player color doesn't matter in two-player mode from the hook's perspective
  }, [resetGame]);

  return {
    fen,
    game, // Exposing the raw game object might be risky if mutated elsewhere
    history,
    moveTimings,
    capturedWhite,
    capturedBlack,
    selectedPiece,
    setSelectedPiece,
    customSquareStyles, // Return the memoized styles object directly
    gameState,
    makeMove,
    undoMove,
    resetGame,
    currentTurn,
    // AI-related features
    isSinglePlayer,
    playerColor,
    isThinking,
    startSinglePlayerGame,
    startTwoPlayerGame,
    aiLevel,
    isAiReady,
  };
}