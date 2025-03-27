import { useState, useMemo, useCallback, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { useStockfish, type StockfishLevel } from "./useStockfish";

export function useChessGame() {
  const [game] = useState(new Chess());
  const [history, setHistory] = useState<string[]>([]);
  const [fen, setFen] = useState(game.fen());
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [gameState, setGameState] = useState({
    isGameOver: false,
    title: "",
    message: ""
  });
  
  // Add AI game mode state
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [aiLevel, setAiLevel] = useState<StockfishLevel>(5);
  
  // Initialize Stockfish
  const { isReady, isThinking, findBestMove, setLevel } = useStockfish({
    level: aiLevel,
    timeForMove: 1000,
  });

  // Helper function to calculate the path between two squares for sliding pieces
  function getPathBetween(from: Square, to: Square): Square[] {
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
  }

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
          const moves = tempGame.moves({ square: pieceSquare, verbose: true });
          if (moves.some(m => m.to === kingSquare)) {
            checkingSquares.push(pieceSquare);
            if (["r", "b", "q"].includes(piece.type)) {
              const path = getPathBetween(pieceSquare, kingSquare);
              checkingSquares.push(...path);
            }
          }
        }
      }
    }
  
    checkingSquares.push(kingSquare);
    console.log(checkingSquares);
    return [...new Set(checkingSquares)];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

  // Compute possible moves for selected piece
  const possibleMoves = useMemo(() => {
    if (!selectedPiece) return [];

    const moves = game.moves({ square: selectedPiece, verbose: true });
    return moves.map((move) => ({
      to: move.to,
      isCapture: !!move.captured,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPiece, fen]);

  // Square styles for highlighting
  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Highlight check squares (red)
    checkSquares.forEach((square) => {
      styles[square] = {
        backgroundColor: "rgba(255, 0, 0, 0.4)",
      };
    });

    // Highlight possible moves for the selected piece
    possibleMoves.forEach(({ to, isCapture }) => {
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

  // Check game state after move
  const checkGameState = useCallback(() => {
    if (game.isCheckmate()) {
      setGameState({
        isGameOver: true,
        title: "Checkmate!",
        message: `${game.turn() === "w" ? "Black" : "White"} wins!`
      });
      return true;
    } else if (game.isDraw()) {
      setGameState({
        isGameOver: true,
        title: "Draw!",
        message: "The game is a draw."
      });
      return true;
    } else if (game.isStalemate()) {
      setGameState({
        isGameOver: true,
        title: "Stalemate!",
        message: "The game is a stalemate."
      });
      return true;
    } else if (game.isThreefoldRepetition()) {
      setGameState({
        isGameOver: true,
        title: "Draw!",
        message: "The game is a draw due to threefold repetition."
      });
      return true;
    }
    return false;
  }, [game]);

  // Handle piece movement
  const makeMove = useCallback((sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
      });

      if (move) {
        setHistory(prevHistory => [...prevHistory, move.san]);
        if (move.captured) {
          const capturedColor = move.color === "w" ? "b" : "w";
          const capturedPieceKey = `${capturedColor}${move.captured.toUpperCase()}`;
          if (capturedColor === "w") {
            setCapturedWhite(prev => [...prev, capturedPieceKey]);
          } else {
            setCapturedBlack(prev => [...prev, capturedPieceKey]);
          }
        }
        setFen(game.fen());
        
        const isGameOver = checkGameState();
        
        // If it's single player mode, not game over, and AI's turn, make AI move
        if (isSinglePlayer && !isGameOver && game.turn() !== playerColor && isReady) {
          requestAnimationFrame(() => {
            findBestMove(game.fen(), (bestMove) => {
              if (bestMove) {
                const from = bestMove.substring(0, 2) as Square;
                const to = bestMove.substring(2, 4) as Square;
                makeMove(from, to);
              }
            });
          });
        }
        
        return true;
      }
      return false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }, [game, isSinglePlayer, playerColor, isReady, findBestMove, checkGameState]);

  // Effect to make AI's first move if AI plays as white
  useEffect(() => {
    if (isSinglePlayer && playerColor === "b" && game.turn() === "w" && isReady && history.length === 0) {
      findBestMove(game.fen(), (bestMove) => {
        if (bestMove) {
          const from = bestMove.substring(0, 2) as Square;
          const to = bestMove.substring(2, 4) as Square;
          makeMove(from, to);
        }
      });
    }
  }, [isSinglePlayer, playerColor, isReady, game, history.length, findBestMove, makeMove]);
  
  // Undo the last move
  const undoMove = useCallback(() => {
    // In single player mode, undo both player's and AI's moves
    if (isSinglePlayer) {
      // Undo AI's move first if it's player's turn
      if (game.turn() === playerColor) {
        const aiUndone = game.undo();
        if (aiUndone) {
          setHistory(prevHistory => prevHistory.slice(0, -1));
          if (aiUndone.captured) {
            if (aiUndone.color === "w") {
              setCapturedBlack(prev => prev.slice(0, -1));
            } else {
              setCapturedWhite(prev => prev.slice(0, -1));
            }
          }
        }
      }
    }
    
    // Undo player's move
    const undoneMove = game.undo();
    if (undoneMove) {
      setHistory(prevHistory => prevHistory.slice(0, -1));
      if (undoneMove.captured) {
        if (undoneMove.color === "w") {
          setCapturedBlack(prev => prev.slice(0, -1));
        } else {
          setCapturedWhite(prev => prev.slice(0, -1));
        }
      }
      setFen(game.fen());
    }
  }, [game, isSinglePlayer, playerColor]);

  // Reset the game
  const resetGame = useCallback(() => {
    game.reset();
    setHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setGameState({ isGameOver: false, title: "", message: "" });
    setFen(game.fen());
  }, [game]);
  
  // Start a new game against AI
  const startSinglePlayerGame = useCallback((color: "w" | "b", level: StockfishLevel = 5) => {
    resetGame();
    setIsSinglePlayer(true);
    setPlayerColor(color);
    setAiLevel(level);
    setLevel(level);
    
    // If AI plays as white, make the first move
    if (color === "b" && isReady) {
      findBestMove(game.fen(), (bestMove) => {
        if (bestMove) {
          const from = bestMove.substring(0, 2) as Square;
          const to = bestMove.substring(2, 4) as Square;
          makeMove(from, to);
        }
      });
    }
  }, [game, isReady, findBestMove, makeMove, resetGame, setLevel]);
  
  // Start two player game
  const startTwoPlayerGame = useCallback(() => {
    resetGame();
    setIsSinglePlayer(false);
  }, [resetGame]);

  return {
    fen,
    game,
    history,
    capturedWhite,
    capturedBlack,
    selectedPiece,
    setSelectedPiece,
    customSquareStyles,
    gameState,
    setGameState,
    makeMove,
    undoMove,
    resetGame,
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