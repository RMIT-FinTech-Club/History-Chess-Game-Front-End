"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { defaultPieces } from "@/src/components/Pieces";
import "../css/chessboard.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PieceProps {
  squareWidth: number;
  isDragging: boolean;
}


const ChessboardComponent = () => {
  const [mounted, setMounted] = useState(false);
  const [game] = useState(new Chess());
  const [history, setHistory] = useState<string[]>([]);
  const [fen, setFen] = useState(game.fen());
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationDescription, setNotificationDescription] = useState("");

  // Helper function to calculate the path between two squares for sliding pieces.
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

  // Compute the squares that are in check.
  const checkSquares = useMemo(() => {
    console.log("FEN:", game.fen(), "Is check?", game.isCheck(), "Turn:", game.turn());
    if (!game.isCheck()) return [];
  
    const kingSquare = (() => {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const p = game.board()[i][j];
          if (p && p.type === "k" && p.color === game.turn()) {
            const square = `${String.fromCharCode(97 + j)}${8 - i}` as Square;
            console.log("King found at:", square);
            return square;
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
    console.log("Temp FEN (opponent's turn):", tempGame.fen());
  
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
    return [...new Set(checkingSquares)];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

  // Compute custom styles for squares based on checkSquares.
  const customSquareStyles = useMemo(() => {;
    return checkSquares.reduce((styles, square) => {
      styles[square] = {
        backgroundColor: "rgba(255, 0, 0, 0.4)" 
      };
      return styles;
    }, {} as { [square: string]: React.CSSProperties });
  }, [checkSquares]);

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

  // Check the game state after each move.
  const checkGameState = () => {

    // Check if the game is over
    if (game.isCheckmate()) {
      setDialogOpen(true);
      setNotification("Checkmate!");
      setNotificationDescription(
        `${game.turn() === "w" ? "Black" : "White"} wins!`
      );
    }

    // Check if the game is a draw 
    else if (game.isDraw()) {
      setDialogOpen(true);
      setNotification("Draw!");
      setNotificationDescription("The game is a draw.");
    } 

    // Check if the game is in stalemate
    else if (game.isStalemate()) {
      setDialogOpen(true);
      setNotification("Stalemate!");
      setNotificationDescription("The game is a stalemate.");
    } 
    
    // Check if the game is drawn due to threefold repetition
    else if (game.isThreefoldRepetition()) {
      setDialogOpen(true);
      setNotification("Draw!");
      setNotificationDescription("The game is a draw due to threefold repetition.");
    }
  };

  // Undo the last move.
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

  // Reset the game to the initial state.
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

      {/* Checkmate Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{notification}</DialogTitle>
          </DialogHeader>
          <p className="text-center">
            {notificationDescription}
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={resetGame}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              New Game
            </button>
            <button
              onClick={() => setDialogOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChessboardComponent;
