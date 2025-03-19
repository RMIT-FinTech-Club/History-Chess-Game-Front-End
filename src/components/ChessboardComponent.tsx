"use client";

import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Square } from "chess.js";
import "../css/chessboard.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useChessGame } from "../hooks/useChessGame";
import { CapturedPieces } from "./CapturedPieces";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PieceProps {
  squareWidth: number;
  isDragging: boolean;
}

const ChessboardComponent = () => {
  const [mounted, setMounted] = useState(false);
  const { 
    fen, 
    history, 
    capturedWhite, 
    capturedBlack,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedPiece,
    setSelectedPiece,
    customSquareStyles,
    gameState,
    setGameState,
    makeMove,
    undoMove,
    resetGame
  } = useChessGame();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <p>Loading Chessboard...</p>;

  // Handle piece drop (when a piece is dropped on a square)
  const handleDrop = (sourceSquare: string, targetSquare: string) => {
    const success = makeMove(sourceSquare, targetSquare);
    if (!success) {
      // Display error toast for invalid move
      toast.error("Invalid Move", {
        description: "That move is not allowed.",
        duration: 1000,
      });
    }
    return success;
  };

  // Handle piece drag begin
  const onPieceDragBegin = (piece: string, sourceSquare: Square) => {
    setSelectedPiece(sourceSquare);
  };

  // Handle piece click
  const onPieceClick = (piece: string, sourceSquare: Square) => {
    setSelectedPiece(sourceSquare);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl flex justify-center mb-4">History Chess Game</h1>
      <div className="flex space-x-6">
        {/* Captured Pieces for Black */}
        <CapturedPieces color="Black" pieces={capturedBlack} />

        {/* Main Chessboard */}
        <div>
          <Chessboard
            id="historyChessBoard"
            position={fen}
            onPieceDrop={handleDrop}
            onPieceClick={onPieceClick}
            onPieceDragBegin={onPieceDragBegin}
            boardWidth={600}
            animationDuration={300}
            customSquareStyles={customSquareStyles}
          />
        </div>

        {/* Captured Pieces for White */}
        <CapturedPieces color="White" pieces={capturedWhite} />
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-4 mt-4">
        <Button
          onClick={undoMove}
          disabled={history.length === 0}
          variant="default"
        >
          Undo Move
        </Button>
        <Button
          onClick={resetGame}
          variant="destructive"
        >
          Restart Game
        </Button>
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

      {/* Game State Dialog */}
      <Dialog 
        open={gameState.isGameOver} 
        onOpenChange={(open) => !open && setGameState({...gameState, isGameOver: false})}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex justify-center text-3xl">{gameState.title}</DialogTitle>
          </DialogHeader>
          <p className="text-center text-lg">
            {gameState.message}
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <Button
              onClick={resetGame}
              variant="destructive"
            >
              New Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChessboardComponent;