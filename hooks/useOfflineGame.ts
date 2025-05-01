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

  const possibleMoves = useMemo(
    () => (selectedPiece ? getPossibleMoves(selectedPiece) : []),
    [selectedPiece, getPossibleMoves]
  );

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    checkSquares.forEach((square) => {
      styles[square] = { backgroundColor: "rgba(255, 0, 0, 0.4)" };
    });

    possibleMoves.forEach(({ to, isCapture }) => {
      styles[to] = {
        backgroundColor: isCapture
          ? "rgba(255, 0, 0, 0.4)"
          : "rgba(0, 255, 0, 0.4)",
      };
    });

    if (isSinglePlayer && isThinking) {
      styles["thinking_indicator"] = { boxShadow: "0 0 15px #ffcc00" };
    }

    return styles;
  }, [checkSquares, possibleMoves, isSinglePlayer, isThinking]);

  const gameStateRef = useRef({ fen, turn: game.turn() });

  useEffect(() => {
    gameStateRef.current = { fen, turn: game.turn() };
  }, [fen, game]);

  const updateCapturedPieces = useCallback(
    (move: Move | null, action: "add" | "remove") => {
      if (!move || !move.captured) return;
      const piece = `${move.color === "w" ? "b" : "w"}${move.captured.toUpperCase()}`;
      const setCaptured = move.color === "w" ? setCapturedBlack : setCapturedWhite;
      setCaptured((prev) =>
        action === "add" ? [...prev, piece] : prev.slice(0, -1)
      );
    },
    []
  );

  const updateMoveTimings = useCallback(
    (action: "add" | "remove") => {
      if (action === "add") {
        const now = Date.now();
        setMoveTimings((prev) => [
          ...prev,
          `${((now - lastMoveTime) / 1000).toFixed(1)}s`,
        ]);
        setLastMoveTime(now);
      } else {
        setMoveTimings((prev) => prev.slice(0, -1));
      }
    },
    [lastMoveTime]
  );

  const executeAiMove = useCallback(
    (bestMove: string) => {
      try {
        const from = bestMove.substring(0, 2) as Square;
        const to = bestMove.substring(2, 4) as Square;
        const promotion =
          bestMove.length > 4
            ? (bestMove.charAt(4) as "q" | "r" | "b" | "n")
            : undefined;

        const aiMoveResult = makeLocalMove({ from, to, promotion });

        if (aiMoveResult) {
          updateCapturedPieces(aiMoveResult, "add");
          updateMoveTimings("add");
        } else {
          console.error("AI move failed to apply to the board state.");
        }
      } catch (error) {
        console.error("Error executing AI move:", error);
      }
    },
    [makeLocalMove, updateCapturedPieces, updateMoveTimings]
  );

  const triggerAiMove = useCallback(() => {
    const currentFen = gameStateRef.current.fen;
    findBestMove(currentFen, (bestMove) => {
      if (bestMove) {
        setTimeout(() => executeAiMove(bestMove), 0);
      } else {
        console.error("Stockfish failed to return a best move.");
      }
    });
  }, [findBestMove, executeAiMove]);

  const makeMove = useCallback(
    (
      sourceSquare: Square,
      targetSquare: Square,
      promotionPiece?: "q" | "r" | "b" | "n"
    ) => {
      try {
        const moveResult = makeLocalMove({
          from: sourceSquare,
          to: targetSquare,
          promotion: promotionPiece,
        });

        if (moveResult) {
          updateCapturedPieces(moveResult, "add");
          updateMoveTimings("add");
          setSelectedPiece(null);

          if (
            isSinglePlayer &&
            !gameState.isGameOver &&
            game.turn() !== playerColor &&
            isAiReady
          ) {
            setTimeout(triggerAiMove, 100);
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error("Move error:", error);
        return false;
      }
    },
    [
      makeLocalMove,
      gameState.isGameOver,
      isSinglePlayer,
      playerColor,
      isAiReady,
      game,
      updateCapturedPieces,
      updateMoveTimings,
      triggerAiMove,
    ]
  );

  useEffect(() => {
    if (
      isSinglePlayer &&
      playerColor === "b" &&
      game.turn() === "w" &&
      isAiReady &&
      history.length === 0 &&
      !isThinking
    ) {
      triggerAiMove();
    }
  }, [
    isSinglePlayer,
    playerColor,
    game,
    isAiReady,
    history.length,
    isThinking,
    triggerAiMove,
  ]);

  const undoMove = useCallback(() => {
    const movesToUndo =
      isSinglePlayer &&
      history.length > 0 &&
      history[history.length - 1].color !== playerColor
        ? 2
        : 1;

    let undoneMove: Move | null = null;
    for (let i = 0; i < movesToUndo; i++) {
      const move = undoLocalMove();
      if (move) {
        undoneMove = move;
        updateCapturedPieces(move, "remove");
        updateMoveTimings("remove");
      } else {
        break;
      }
    }

    setSelectedPiece(null);
    return !!undoneMove;
  }, [
    undoLocalMove,
    isSinglePlayer,
    playerColor,
    history,
    updateCapturedPieces,
    updateMoveTimings,
  ]);

  const resetGame = useCallback(() => {
    resetLocalGame();
    setMoveTimings([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setSelectedPiece(null);
    setLastMoveTime(Date.now());
  }, [resetLocalGame]);

  const startSinglePlayerGame = useCallback(
    (color: "w" | "b", level: StockfishLevel = 5) => {
      resetGame();
      setIsSinglePlayer(true);
      setPlayerColor(color);
      setAiLevel(level);
      setLevel(level);
    },
    [resetGame, setLevel]
  );

  const startTwoPlayerGame = useCallback(() => {
    resetGame();
    setIsSinglePlayer(false);
  }, [resetGame]);

  return {
    fen,
    game,
    history,
    moveTimings,
    capturedWhite,
    capturedBlack,
    selectedPiece,
    setSelectedPiece,
    customSquareStyles,
    gameState,
    makeMove,
    undoMove,
    resetGame,
    currentTurn,
    isSinglePlayer,
    playerColor,
    isThinking,
    startSinglePlayerGame,
    startTwoPlayerGame,
    aiLevel,
    isAiReady,
  };
}