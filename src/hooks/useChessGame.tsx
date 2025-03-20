import { useState, useMemo } from "react";
import { Chess, Square } from "chess.js";

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

    return styles;
  }, [checkSquares, possibleMoves]);

  // Check game state after move
  const checkGameState = () => {
    if (game.isCheckmate()) {
      setGameState({
        isGameOver: true,
        title: "Checkmate!",
        message: `${game.turn() === "w" ? "Black" : "White"} wins!`
      });
    } else if (game.isDraw()) {
      setGameState({
        isGameOver: true,
        title: "Draw!",
        message: "The game is a draw."
      });
    } else if (game.isStalemate()) {
      setGameState({
        isGameOver: true,
        title: "Stalemate!",
        message: "The game is a stalemate."
      });
    } else if (game.isThreefoldRepetition()) {
      setGameState({
        isGameOver: true,
        title: "Draw!",
        message: "The game is a draw due to threefold repetition."
      });
    }
  };

  // Handle piece movement
  const makeMove = (sourceSquare: string, targetSquare: string) => {
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
        checkGameState();
        return true;
      }
      return false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  };

  // Undo the last move
  const undoMove = () => {
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
  };

  // Reset the game
  const resetGame = () => {
    game.reset();
    setHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setGameState({ isGameOver: false, title: "", message: "" });
    setFen(game.fen());
  };

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
    resetGame
  };
}