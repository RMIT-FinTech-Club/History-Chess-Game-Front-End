import { useState, useCallback, useEffect } from "react";
import { Square } from "chess.js";
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
    currentTurn
  } = useChessLogic();

  const [moveTimings, setMoveTimings] = useState<string[]>([]);
  const [lastMoveTime, setLastMoveTime] = useState<number>(Date.now());
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  
  // Add AI game mode state
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [aiLevel, setAiLevel] = useState<StockfishLevel>(5);
  
  // Initialize Stockfish
  const { isReady, isThinking, findBestMove, setLevel } = useStockfish({
    level: aiLevel,
    timeForMove: 1000,
  });

  // Compute possible moves for selected piece
  const possibleMoves = useCallback(() => {
    if (!selectedPiece) return [];

    return getPossibleMoves(selectedPiece);
  }, [selectedPiece, getPossibleMoves]);

  // Square styles for highlighting
  const customSquareStyles = useCallback(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Highlight check squares (red)
    checkSquares.forEach((square) => {
      styles[square] = {
        backgroundColor: "rgba(255, 0, 0, 0.4)",
      };
    });

    // Highlight possible moves for the selected piece
    possibleMoves().forEach(({ to, isCapture }) => {
      styles[to] = {
        backgroundColor: isCapture
          ? "rgba(255, 0, 0, 0.4)"
          : "rgba(0, 255, 0, 0.4)",
      };
    });

    // Add AI thinking indication
    if (isSinglePlayer && isThinking) {
      styles["thinking"] = {
        boxShadow: "0 0 15px #ffcc00",
      };
    }

    return styles;
  }, [checkSquares, possibleMoves, isSinglePlayer, isThinking]);

  // Handle piece movement
  const makeMove = useCallback((sourceSquare: string, targetSquare: string, promotionPiece?: string) => {
    try {
      const moveResult = makeLocalMove({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: promotionPiece as 'q' | 'r' | 'b' | 'n' | undefined
      });

      if (moveResult) {
        // Update move timings
        setMoveTimings(prevTimings => [...prevTimings, `${(Date.now() - lastMoveTime) / 1000}s`]);
        setLastMoveTime(Date.now());
        
        // Update captured pieces
        if (moveResult.captured) {
          const capturedColor = moveResult.color === "w" ? "b" : "w";
          const capturedPieceKey = `${capturedColor}${moveResult.captured.toUpperCase()}`;
          if (capturedColor === "w") {
            setCapturedWhite(prev => [...prev, capturedPieceKey]);
          } else {
            setCapturedBlack(prev => [...prev, capturedPieceKey]);
          }
        }
        
        // If it's single player mode, not game over, and AI's turn, make AI move
        if (isSinglePlayer && !gameState.isGameOver && game.turn() !== playerColor && isReady) {
          requestAnimationFrame(() => {
            findBestMove(fen, (bestMove) => {
              if (bestMove) {
                const from = bestMove.substring(0, 2) as Square;
                const to = bestMove.substring(2, 4) as Square;
                // Check for promotion in AI move (5th char if present)
                const promotion = bestMove.length > 4 ? bestMove.charAt(4) : undefined;
                makeMove(from, to, promotion);
              }
            });
          });
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Move error:", error);
      return false;
    }
  }, [game, makeLocalMove, fen, isSinglePlayer, playerColor, isReady, findBestMove, gameState.isGameOver, lastMoveTime]);

  // Effect to make AI's first move if AI plays as white
  useEffect(() => {
    if (isSinglePlayer && playerColor === "b" && game.turn() === "w" && isReady && history.length === 0) {
      findBestMove(fen, (bestMove) => {
        if (bestMove) {
          const from = bestMove.substring(0, 2) as Square;
          const to = bestMove.substring(2, 4) as Square;
          makeMove(from, to);
        }
      });
    }
  }, [isSinglePlayer, playerColor, isReady, game, fen, history.length, findBestMove, makeMove]);
  
  // Undo the last move
  const undoMove = useCallback(() => {
    // In single player mode, undo both player's and AI's moves
    if (isSinglePlayer) {
      // Undo AI's move first if it's player's turn
      if (game.turn() === playerColor) {
        const aiUndone = undoLocalMove();
        if (aiUndone) {
          setMoveTimings(prevTimings => prevTimings.slice(0, -1));
          if (aiUndone.captured) {
            if (aiUndone.color === "w") {
              setCapturedBlack(prev => prev.slice(0, -1));
            } else {
              setCapturedWhite(prev => prev.slice(0, -1));
            }
          }
          setSelectedPiece(null);
        }
      }
    }
    
    // Undo player's move
    const undoneMove = undoLocalMove();
    if (undoneMove) {
      setMoveTimings(prevTimings => prevTimings.slice(0, -1));
      if (undoneMove.captured) {
        if (undoneMove.color === "w") {
          setCapturedBlack(prev => prev.slice(0, -1));
        } else {
          setCapturedWhite(prev => prev.slice(0, -1));
        }
      }
      setSelectedPiece(null);
    }
    
    return !!undoneMove;
  }, [game, undoLocalMove, isSinglePlayer, playerColor]);

  // Reset the game
  const resetGame = useCallback(() => {
    resetLocalGame();
    setMoveTimings([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setSelectedPiece(null);
    setLastMoveTime(Date.now());
  }, [resetLocalGame]);
  
  // Start a new game against AI
  const startSinglePlayerGame = useCallback((color: "w" | "b", level: StockfishLevel = 5) => {
    resetGame();
    setIsSinglePlayer(true);
    setPlayerColor(color);
    setAiLevel(level);
    setLevel(level);
    
    // If AI plays as white, make the first move
    if (color === "b" && isReady) {
      findBestMove(fen, (bestMove) => {
        if (bestMove) {
          const from = bestMove.substring(0, 2) as Square;
          const to = bestMove.substring(2, 4) as Square;
          makeMove(from, to);
        }
      });
    }
  }, [fen, isReady, findBestMove, makeMove, resetGame, setLevel]);
  
  // Start two player game
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
    customSquareStyles: customSquareStyles(),
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
    isAiReady: isReady
  };
}