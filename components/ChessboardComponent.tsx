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
import type { StockfishLevel } from "../hooks/useStockfish";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PieceProps {
  squareWidth: number;
  isDragging: boolean;
}

const ChessboardComponent = () => {
  const [mounted, setMounted] = useState(false);
  const [showGameModeDialog, setShowGameModeDialog] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<StockfishLevel>(5);
  
  const { 
    fen, 
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
    
    // AI features
    isSinglePlayer,
    playerColor,
    isThinking,
    startSinglePlayerGame,
    startTwoPlayerGame,
    isAiReady
  } = useChessGame();

  useEffect(() => {
    setMounted(true);
    // Show game mode selection on initial load
    setShowGameModeDialog(true);
  }, []);

  if (!mounted) return <p>Loading Chessboard...</p>;

  // Handle piece drop (when a piece is dropped on a square)
  const handleDrop = (sourceSquare: string, targetSquare: string) => {
    // In single player mode, only allow moves for the player's color
    if (isSinglePlayer && 
        ((playerColor === 'w' && fen.includes(' b ')) || 
         (playerColor === 'b' && fen.includes(' w ')))) {
      toast.error("Not your turn", {
        description: "Wait for the AI to make its move.",
        duration: 1000,
      });
      return false;
    }
    
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
    // In single player mode, only allow dragging pieces of player's color
    if (isSinglePlayer) {
      const pieceColor = piece.charAt(0).toLowerCase();
      if ((playerColor === 'w' && pieceColor !== 'w') || 
          (playerColor === 'b' && pieceColor !== 'b')) {
        return;
      }
    }
    
    setSelectedPiece(sourceSquare);
  };

  // Handle piece click with toggle functionality
  const onPieceClick = (piece: string, sourceSquare: Square) => {
    // In single player mode, only allow selecting pieces of player's color
    if (isSinglePlayer) {
      const pieceColor = piece.charAt(0).toLowerCase();
      if ((playerColor === 'w' && pieceColor !== 'w') || 
          (playerColor === 'b' && pieceColor !== 'b')) {
        return;
      }
    }
    
    if (selectedPiece === sourceSquare) {
      // Deselect if clicking the same piece
      setSelectedPiece(null);
    } else {
      // Select new piece
      setSelectedPiece(sourceSquare);
    }
  };

  // Add handler for square clicks to deselect pieces when clicking empty squares
  const onSquareClick = (square: Square) => {
    // If we have a piece selected and click on a different square
    if (selectedPiece && square !== selectedPiece) {
      // Try to move if it's a valid move
      const success = makeMove(selectedPiece, square);
      if (!success) {
        // If not a valid move, just deselect the piece
        setSelectedPiece(null);
      }
    }
  };
  
  // Game mode selection handlers
  const handleStartSinglePlayer = (color: 'w' | 'b') => {
    startSinglePlayerGame(color, aiDifficulty);
    setShowGameModeDialog(false);
  };

  const handleStartTwoPlayer = () => {
    startTwoPlayerGame();
    setShowGameModeDialog(false);
  };
  
  const difficultyLevels: StockfishLevel[] = [1, 2, 3, 5, 8, 10, 15, 20];
  
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl flex justify-center mb-4">History Chess Game</h1>
      
      {/* Game Mode Indicator */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium">
            {isSinglePlayer 
              ? `Single Player (You: ${playerColor === 'w' ? 'White' : 'Black'}, AI Level: ${aiDifficulty})` 
              : 'Two Players'}
          </span>
          {isThinking && (
            <span className="animate-pulse text-yellow-500 font-medium">AI is thinking...</span>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowGameModeDialog(true)}
          >
            Change Mode
          </Button>
        </div>
      </div>
      
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
            onSquareClick={onSquareClick}
            onPieceDragBegin={onPieceDragBegin}
            boardWidth={600}
            animationDuration={300}
            customSquareStyles={{
              ...customSquareStyles,
              ...(isThinking ? { a1: { boxShadow: '0 0 15px #ffcc00' } } : {})
            }}
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
          onClick={() => setShowGameModeDialog(true)}
          variant="secondary"
        >
          New Game
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
              onClick={() => setShowGameModeDialog(true)}
              variant="destructive"
            >
              New Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Game Mode Selection Dialog */}
      <Dialog 
        open={showGameModeDialog}
        onOpenChange={(open) => !open && setShowGameModeDialog(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex justify-center text-3xl">Choose Game Mode</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-medium">Play against Computer</h3>
              
              <div className="flex flex-col space-y-4">
                <div>
                  <p className="text-muted-foreground mb-2">Select AI difficulty:</p>
                  <div className="flex flex-wrap gap-2">
                    {difficultyLevels.map((level) => (
                      <Button 
                        key={level}
                        variant={aiDifficulty === level ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setAiDifficulty(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => handleStartSinglePlayer('w')}
                    className="flex-1"
                    disabled={!isAiReady}
                  >
                    Play as White
                  </Button>
                  <Button 
                    onClick={() => handleStartSinglePlayer('b')}
                    className="flex-1"
                    disabled={!isAiReady}
                  >
                    Play as Black
                  </Button>
                </div>
                
                {!isAiReady && (
                  <p className="text-yellow-500">Loading AI engine...</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-medium">Two Player Mode</h3>
              <Button onClick={handleStartTwoPlayer}>
                Start Two Player Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChessboardComponent;