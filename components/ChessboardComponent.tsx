"use client";

import React, { useEffect, useState, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Square } from "chess.js";
import "../css/chessboard.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useChessGame } from "../hooks/useChessGame";
import { CapturedPieces } from "./CapturedPieces";
import type { StockfishLevel } from "../hooks/useStockfish";
import { TimeCounter, TimeCounterHandle } from "./TimeCounter";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PieceProps {
  squareWidth: number;
  isDragging: boolean;
}

const ChessboardComponent = () => {
  const [mounted, setMounted] = useState(false);
  const [showGameModeDialog, setShowGameModeDialog] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<StockfishLevel>(5);
  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
  const [gameActive, setGameActive] = useState(false);
  const timerRef = useRef<TimeCounterHandle>(null);
  
  const { 
    fen, 
    history, 
    moveTimings,
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

  // Update current turn when the fen changes
  useEffect(() => {
    // Extract turn from FEN string (FEN format has turn as the 2nd field)
    const turnPart = fen.split(' ')[1];
    if (turnPart === 'w' || turnPart === 'b') {
      setCurrentTurn(turnPart);
    }
  }, [fen]);

  useEffect(() => {
    setMounted(true);
    // Show game mode selection on initial load
    setShowGameModeDialog(true);
  }, []);

  // Update game active state
  useEffect(() => {
    setGameActive(!gameState.isGameOver && history.length > 0);
  }, [gameState.isGameOver, history.length]);

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
    // Reset the timer when starting a new game
    timerRef.current?.reset();
  };

  const handleStartTwoPlayer = () => {
    startTwoPlayerGame();
    setShowGameModeDialog(false);
    // Reset the timer when starting a new game
    timerRef.current?.reset();
  };
  
  const difficultyLevels: StockfishLevel[] = [1, 2, 3, 5, 8, 10, 15, 20];

  // Function to format move history into pairs (white move, black move)
  const formatMoveHistory = () => {
    // Maximum time per move for scaling the progress bars (seconds)
    const maxTimePerMove = 60; 
    
    // Function to format time in seconds with one decimal place
    const formatTimeInSeconds = (time: string) => {
      if (!time || time === "-") return "-";
      const timeNum = parseFloat(time);
      return timeNum.toFixed(1);
    };
    
    const formattedHistory = [];
    for (let i = 0; i < history.length; i += 2) {
      formattedHistory.push({
        turn: Math.floor(i / 2) + 1,
        whiteMove: history[i] || "",
        blackMove: history[i + 1] || "",
        whiteTime: moveTimings[i] ? formatTimeInSeconds(moveTimings[i]) : "-", 
        blackTime: moveTimings[i + 1] ? formatTimeInSeconds(moveTimings[i + 1]) : "",
        whiteTimeRaw: moveTimings[i] ? parseFloat(moveTimings[i]) : 0,
        blackTimeRaw: moveTimings[i + 1] ? parseFloat(moveTimings[i + 1]) : 0,
        maxTime: maxTimePerMove
      });
    }
    return formattedHistory;
  };

  const moveHistoryPairs = formatMoveHistory();
  
  return (
    <div className="flex flex-col items-center max-h-screen overflow-hidden py-1 justify-between">
      <h1 className="text-2xl mb-2">History Chess Game</h1>
      
      {/* Game Mode Indicator - improved styling */}
      <div className="mb-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-medium text-white">
            {isSinglePlayer 
              ? `Single Player (You: ${playerColor === 'w' ? 'White' : 'Black'}, AI Level: ${aiDifficulty})` 
              : 'Two Players'}
          </span>
          <div className="flex items-center gap-3">
            {isThinking && (
              <span className="animate-pulse text-[#F7D27F] font-medium">AI thinking...</span>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowGameModeDialog(true)}
              className="text-white border-white hover:text-[#F7D27F]"
            >
              Change
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content area with side-by-side layout */}
      <div className="flex flex-row gap-3 flex-1 max-h-[calc(100vh - 150px)]">
        {/* Left side: Chessboard and captured pieces */}
        <div className="flex flex-col justify-between">
          {/* Captured Pieces for Black */}
          <div className="mb-0.5 flex justify-start">
            <CapturedPieces color="Black" pieces={capturedBlack} />
          </div>

          <div className="flex">
            {/* Main Chessboard with slightly reduced size */}
            <div>
              <Chessboard
                id="historyChessBoard"
                position={fen}
                onPieceDrop={handleDrop}
                onPieceClick={onPieceClick}
                onSquareClick={onSquareClick}
                onPieceDragBegin={onPieceDragBegin}
                boardWidth={580}
                animationDuration={300}
                customSquareStyles={{
                  ...customSquareStyles,
                }}
              />
            </div>
            
            <div className="w-[406px] text-black flex flex-col justify-between ml-3">
              {/* Time Counter */}
              <div className="rounded-lg overflow-hidden shadow-md bg-[#3B3433]">
                <TimeCounter 
                  ref={timerRef}
                  initialTimeInSeconds={600} 
                  currentTurn={currentTurn} 
                  gameActive={gameActive}
                  isGameOver={gameState.isGameOver}
                  history={history}
                />
              </div>
            
              {/* Move History - with flex-grow to fill available space */}
              <div className="flex flex-col flex-grow my-3 overflow-hidden">
                <div className=" rounded-lg shadow-md bg-[#3B3433] overflow-auto flex-1">
                  <table className="w-full -collapse text-white">
                    <thead className="sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-5 text-left text-sm font-semibold">Turn</th>
                        <th className="py-2 px-5 text-left text-sm font-semibold">White</th>
                        <th className="py-2 px-5 text-left text-sm font-semibold">Black</th>
                        <th className="py-2 px-5 text-right text-sm font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moveHistoryPairs.map((pair) => (
                        <tr key={pair.turn} className="hover:bg-[#4A4443] transition-colors duration-200">
                          <td className=" py-2 px-5 text-sm">{pair.turn}.</td>
                          <td className=" py-2 px-5 text-sm">{pair.whiteMove}</td>
                          <td className=" py-2 px-5 text-sm">{pair.blackMove}</td>
                          <td className=" py-2 px-5 text-xs">
                            {pair.whiteTime !== "-" && (
                              <div className="mb-1.5 flex items-center justify-between gap-2">
                                <div className="flex justify-end w-16 h-1.5 overflow-hidden">
                                  <div 
                                    className="h-full bg-white"
                                    style={{ 
                                      width: `${Math.min(100, (pair.whiteTimeRaw / pair.maxTime) * 100)}%` 
                                    }}
                                  />
                                </div>
                                <span className="min-w-[30px]">{pair.whiteTime}s</span>
                              </div>
                            )}
                            {pair.blackTime && (
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex justify-end w-16 h-1.5 overflow-hidden">
                                  <div 
                                    className="h-full bg-black"
                                    style={{ 
                                      width: `${Math.min(100, (pair.blackTimeRaw / pair.maxTime) * 100)}%` 
                                    }}
                                  />
                                </div>
                                <span className="min-w-[30px]">{pair.blackTime}s</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Control Buttons - at the bottom */}
              <div className="flex flex-col gap-2 justify-between">
                  <Button
                    onClick={() => {
                      // Determine the last player's turn before undoing
                      const lastTurn = fen.split(' ')[1] === 'w' ? 'b' : 'w';
                      undoMove();
                      // Adjust timer when undoing a move, pass isSinglePlayer to handle AI moves
                      timerRef.current?.undoTime(lastTurn, isSinglePlayer);
                    }}
                    disabled={history.length === 0}
                    variant="default"
                    size="sm"
                    className="px-4 py-6 text-lg"
                  >
                    Undo Move
                  </Button>
                  <Button
                    onClick={() => {
                      setShowGameModeDialog(true);
                      // Also reset timer when showing the new game dialog
                      timerRef.current?.reset();
                    }}
                    size="sm"
                    className="px-4 py-6 bg-[#DBB968] text-lg text-black hover:bg-[#C7A95D]" 
                  >
                    New Game
                  </Button>
              </div>
            </div>
          </div>

          {/* Captured Pieces for White */}
          <div className="mt-0.5 flex justify-start">
            <CapturedPieces color="White" pieces={capturedWhite} />
          </div>
        </div>
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