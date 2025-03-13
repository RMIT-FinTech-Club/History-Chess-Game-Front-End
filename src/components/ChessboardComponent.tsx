"use client";

import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { defaultPieces } from "./Pieces"; 
import Image from "next/image";
import "../css/chessboard.css";

interface PieceProps {
  squareWidth: number;
  isDragging: boolean;
}

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

export const ChessboardComponent = () => {
  const [mounted, setMounted] = useState(false);
  const [game] = useState(new Chess());
  const [history, setHistory] = useState<string[]>([]);
  const [fen, setFen] = useState(game.fen());
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <p>Loading Chessboard...</p>;

    // Function to check game state (checkmate, stalemate, check)
    const checkGameState = () => {
      if (game.isCheckmate()) {
        alert("Checkmate! Game over.");
      } else if (game.isDraw()) {
        alert("Stalemate! The game is a draw.");
      } else if (game.isCheck()) {
        alert("Check!");
      }
    };

  // Function to handle piece movement
  const handleDrop = (sourceSquare: string, targetSquare: string) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // Promotion choices, prompt later
    });
  
    if (move) {
      setHistory((prevHistory) => [...prevHistory, move.san]); // Update history
  
      // Ensure captured pieces have the correct color
      if (move.captured) {
        const capturedColor = game.turn() === "w" ? "w" : "b"; // The turn AFTER move tells us the captured color
        const capturedPieceKey = `${capturedColor}${move.captured.toUpperCase()}`; 
  
        if (capturedColor === "w") {
          setCapturedWhite((prev) => [...prev, capturedPieceKey]); // Add to White's captured pieces
        } else {
          setCapturedBlack((prev) => [...prev, capturedPieceKey]); // Add to Black's captured pieces
        }
      }
  
      setFen(game.fen()); // Update board FEN for re-render
      checkGameState();
      return true;
    }
    return false;
  };
  

  // Undo last move
  const undoMove = () => {
    const undoneMove = game.undo();

    if (undoneMove) {
      setHistory((prevHistory) => prevHistory.slice(0, -1)); // Remove last move from history

      // Remove last captured piece from state
      if (undoneMove.captured) {
        if (undoneMove.color === "w") {
          setCapturedBlack((prev) => prev.slice(0, -1)); // Remove last black captured piece
        } else {
          setCapturedWhite((prev) => prev.slice(0, -1)); // Remove last white captured piece
        }
      }

      setFen(game.fen()); // Update board FEN 
    }
  };

  // Restart game and reset captured pieces
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
        {/* Captured Black Pieces */}
        <div className="w-30 max-h-[100%] p-2 rounded-md bg-white">
          <h2 className="text-center text-lg text-black font-bold">Black Captured</h2>
          <div className="flex flex-col flex-wrap items-center justify-center">
            {capturedBlack.map((piece, index) => (
              <div key={index} className="w-10 h-10 flex items-center justify-center">
                {defaultPieces[piece] || <span>?</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Chessboard */}
        <div>
          <Chessboard
            id="historyChessBoard"
            position={fen}
            onPieceDrop={handleDrop}
            customPieces={customPieces}
            boardWidth={600}
            animationDuration={300}
          />
        </div>

        {/* Captured White Pieces */}
        <div className="w-30 max-h-[100%] p-2 rounded-md bg-white">
          <h2 className="text-center text-lg text-black font-bold">White Captured</h2>
          <div className="flex flex-col flex-wrap items-center justify-center">
            {capturedWhite.map((piece, index) => (
              <div key={index} className="w-10 h-10 flex items-center justify-center">
                {defaultPieces[piece] || <span>?</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons for Undo and Reset */}
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
