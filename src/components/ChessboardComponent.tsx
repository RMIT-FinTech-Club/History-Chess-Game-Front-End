"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { defaultPieces } from "./Pieces";
import Image from "next/image";
import "../css/chessboard.css";

interface PieceProps {
  squareWidth: number;
  isDragging: boolean;
}

// Custom piece rendering (example for kings)
const customPieces = {
  wK: (props: PieceProps) => (
    <Image
      src="/img/Skibidi Toilet.jpg"
      alt="Skibidi Toilet"
      width={props.isDragging ? props.squareWidth * 1.75 : props.squareWidth}
      height={props.isDragging ? props.squareWidth * 1.75 : props.squareWidth}
    />
  ),
  bK: (props: PieceProps) => (
    <Image
      src="/img/Skibidi Toilet.jpg"
      alt="Skibidi Toilet"
      width={props.isDragging ? props.squareWidth * 1.75 : props.squareWidth}
      height={props.isDragging ? props.squareWidth * 1.75 : props.squareWidth}
    />
  ),
};

const ChessboardComponent = () => {
  const [mounted, setMounted] = useState(false);
  const [game] = useState(new Chess());
  const [history, setHistory] = useState<string[]>([]);
  const [fen, setFen] = useState(game.fen());
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);

  // Helper function to calculate the path between two squares for sliding pieces.
  // Converts from algebraic notation based on board indices.
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

  // Compute the squares to highlight when in check.
  // This includes the checking piece and the path between it and the king.
  const checkSquares = useMemo(() => {
    if (!game.isCheck()) return [];

    // Locate the king under attack (for the side whose turn it is).
    const kingSquare =
      game
        .board()
        .flat()
        .find(piece => piece && piece.type === "k" && piece.color === game.turn()) &&
      // Compute king square using the board indices
      (() => {
        // Find indices manually since chess.js pieces do not have a square property.
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            const p = game.board()[i][j];
            if (p && p.type === "k" && p.color === game.turn()) {
              return `${String.fromCharCode(97 + j)}${8 - i}` as Square;
            }
          }
        }
        return "";
      })();

    if (!kingSquare) return [];

    const checkingSquares: Square[] = [];
    const opponentColor = game.turn() === "w" ? "b" : "w";

    // Create a temporary game instance from the current FEN.
    const tempGame = new Chess(game.fen());
    const board = tempGame.board();

    // Loop through each square of the board.
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece.color === opponentColor) {
          // Compute the square coordinate (e.g. "e4") for this piece.
          const pieceSquare = `${String.fromCharCode(97 + j)}${8 - i}` as Square;
          // Temporarily remove the king to test if this piece can reach its square.
          const removedKing = tempGame.remove(kingSquare);
          const moves = tempGame.moves({ square: pieceSquare, verbose: true });
          tempGame.put(removedKing!, kingSquare); // Restore king

          // If the moves include the king's square, then this piece is giving check.
          if (moves.some(m => m.to === kingSquare)) {
            checkingSquares.push(pieceSquare);
            // For sliding pieces (rook, bishop, queen), add the path between the piece and king.
            if (["r", "b", "q"].includes(piece.type)) {
              const path = getPathBetween(pieceSquare, kingSquare);
              checkingSquares.push(...path);
            }
          }
        }
      }
    }
    // Always include the king's square to highlight it.
    checkingSquares.push(kingSquare);
    console.log(checkingSquares);

    // Remove any duplicates and return.
    return [...new Set(checkingSquares)];
  }, [game, fen]);

  // Compute custom styles for squares based on checkSquares.
  const customSquareStyles = useMemo(() => {
    // Recompute the king square to compare.
    const kingSquare =
      (() => {
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            const piece = game.board()[i][j];
            if (piece && piece.type === "k" && piece.color === game.turn()) {
              return `${String.fromCharCode(97 + j)}${8 - i}` as Square;
            }
          }
        }
        return "";
      })();
    return checkSquares.reduce((styles, square) => {
      styles[square] = {
        backgroundColor:
          square === kingSquare
            ? "rgba(255, 0, 0, 0.4)" // Red for king's square
            : "rgba(255, 165, 0, 0.4)", // Orange for checking piece/path
      };
      return styles;
    }, {} as { [square: string]: React.CSSProperties });
  }, [checkSquares, game]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <p>Loading Chessboard...</p>;

  const handleDrop = (sourceSquare: string, targetSquare: string) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move) {
      setHistory(prevHistory => [...prevHistory, move.san]);
      if (move.captured) {
        // Since the turn flips after a move, the captured piece color is opposite.
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
  };

  const checkGameState = () => {
    if (game.isCheckmate()) {
      alert("Checkmate! Game over.");
    } else if (game.isDraw()) {
      alert("Stalemate! The game is a draw.");
    } else if (game.isCheck()) {
      alert("Check!");
    }
  };

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

  const resetGame = () => {
    game.reset();
    setHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setFen(game.fen());
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl flex justify-center mb-4">History Chess Game</h1>
      <div className="flex space-x-6">
        {/* Captured Pieces for Black */}
        <div className="w-30 max-h-[100%] p-2 rounded-md bg-white">
          <h2 className="text-center text-lg text-black font-bold">
            Black Captured
          </h2>
          <div className="flex flex-col flex-wrap items-center justify-center">
            {capturedBlack.map((piece, index) => (
              <div key={index} className="w-10 h-10 flex items-center justify-center">
                {defaultPieces[piece] || <span>?</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Chessboard */}
        <div>
          <Chessboard
            id="historyChessBoard"
            position={fen}
            onPieceDrop={handleDrop}
            customPieces={customPieces}
            boardWidth={600}
            animationDuration={300}
            customSquareStyles={customSquareStyles}
          />
        </div>

        {/* Captured Pieces for White */}
        <div className="w-30 max-h-[100%] p-2 rounded-md bg-white">
          <h2 className="text-center text-lg text-black font-bold">
            White Captured
          </h2>
          <div className="flex flex-col flex-wrap items-center justify-center">
            {capturedWhite.map((piece, index) => (
              <div key={index} className="w-10 h-10 flex items-center justify-center">
                {defaultPieces[piece] || <span>?</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-4 mt-4">
        <button
          onClick={undoMove}
          disabled={history.length === 0}
          className="bg-red-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          Undo Move
        </button>
        <button
          onClick={resetGame}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Restart Game
        </button>
      </div>

      {/* Move History */}
      <div className="mt-6">
        <h2 className="text-2xl mb-2">Move History</h2>
        <ol className="border p-4 rounded-md bg-gray-100">
          {history.map((move, index) => (
            <li key={index} className="text-lg text-black">
              {index + 1}. {move}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default ChessboardComponent;
