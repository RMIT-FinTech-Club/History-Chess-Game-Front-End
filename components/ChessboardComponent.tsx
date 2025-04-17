"use client";

import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
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
import { ScrollArea } from "./ui/scroll-area";

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
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [autoRotateBoard, setAutoRotateBoard] = useState(false);
  const [boardWidth, setBoardWidth] = useState(580);
  
  // Function to calculate responsive board size
  const calculateBoardSize = () => {
    if (typeof window === 'undefined') return 580;
    
    const width = window.innerWidth;
    if (width < 480) {
      return Math.min(width - 32, 480); // Smaller margin on very small screens
    } else if (width < 768) {
      return Math.min(width - 48, 580);
    } else {
      return 580; // Default size for desktop
    }
  };
  
  // Update board size on mount and window resize
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setBoardWidth(calculateBoardSize());
      };
      
      // Set initial size
      handleResize();
      
      // Add resize listener
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);
  
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
      
      // Update board orientation in two-player mode with auto-rotate enabled
      if (!isSinglePlayer && autoRotateBoard) {
        setBoardOrientation(turnPart === 'w' ? 'white' : 'black');
      }
    }
  }, [fen, isSinglePlayer, autoRotateBoard]);

  useEffect(() => {
    setMounted(true);
    // Show game mode selection on initial load
    setShowGameModeDialog(true);
  }, []);

  // Update game active state
  useEffect(() => {
    setGameActive(!gameState.isGameOver && history.length > 0);
  }, [gameState.isGameOver, history.length]);

  // Set board orientation for single player mode
  useEffect(() => {
    if (isSinglePlayer) {
      setBoardOrientation(playerColor === 'w' ? 'white' : 'black');
      setAutoRotateBoard(false);
    }
  }, [isSinglePlayer, playerColor]);

  if (!mounted) return <p>Loading Chessboard...</p>;

  // Handle piece drop (when a piece is dropped on a square)
  const handleDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
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
    
    // Check if this is a potential pawn promotion move
    const sourcePiece = piece.charAt(1).toLowerCase();
    const sourceColor = piece.charAt(0);
    const isPawnPromotion = 
      sourcePiece === 'p' && 
      ((sourceColor === 'w' && targetSquare[1] === '8') || 
       (sourceColor === 'b' && targetSquare[1] === '1'));
    
    // For pawn promotion, default to queen if not specified
    let promotionPiece: string | undefined = undefined;
    
    // If this is a promotion move and the piece is NOT a pawn, it means 
    // react-chessboard is calling us with the selected promotion piece
    if (piece.length === 2 && isPawnPromotion) {
      // Just return true for the initial call with the pawn
      // react-chessboard will show the promotion dialog
      return true;
    } else if (piece.length === 2 && 
              piece.charAt(1).toLowerCase() !== 'p' && 
              ((sourceColor === 'w' && targetSquare[1] === '8') || 
               (sourceColor === 'b' && targetSquare[1] === '1'))) {
      // This is the callback with the selected promotion piece
      promotionPiece = piece.charAt(1).toLowerCase();
    }
    
    const success = makeMove(sourceSquare, targetSquare, promotionPiece);
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
      // Get piece information for promotion detection
      const pieceOnSquare = fen.split(' ')[0]
        .split('/')
        .map((row, i) => {
          let colIndex = 0;
          const result: {[key: string]: string} = {};
          for (let j = 0; j < row.length; j++) {
            const char = row[j];
            if (/\d/.test(char)) {
              colIndex += parseInt(char);
            } else {
              const squareNotation = `${String.fromCharCode(97 + colIndex)}${8 - i}`;
              result[squareNotation] = char;
              colIndex++;
            }
          }
          return result;
        })
        .reduce((acc, row) => ({...acc, ...row}), {});
      
      const piece = pieceOnSquare[selectedPiece];
      
      // Check if this is a potential pawn promotion move
      const isPawnPromotion = 
        piece && piece.toLowerCase() === 'p' && 
        ((piece === 'P' && square[1] === '8') || 
         (piece === 'p' && square[1] === '1'));
      
      // For pawn promotion, default to queen
      const promotionPiece = isPawnPromotion ? 'q' : undefined;
      
      // Try to move if it's a valid move
      const success = makeMove(selectedPiece, square, promotionPiece);
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
    // Set fixed board orientation for single player
    setBoardOrientation(color === 'w' ? 'white' : 'black');
    setAutoRotateBoard(false);
  };

  const handleStartTwoPlayer = () => {
    startTwoPlayerGame();
    setShowGameModeDialog(false);
    // Reset the timer when starting a new game
    timerRef.current?.reset();
    // Start with white's perspective in two player mode
    setBoardOrientation('white');
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
  
  // Toggle auto-rotate board feature
  const toggleAutoRotate = () => {
    // Only allow toggling in two player mode
    if (!isSinglePlayer) {
      const newAutoRotate = !autoRotateBoard;
      setAutoRotateBoard(newAutoRotate);
      
      // If enabling, immediately set orientation based on current turn
      if (newAutoRotate) {
        setBoardOrientation(currentTurn === 'w' ? 'white' : 'black');
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full overflow-hidden py-1 px-2 md:px-4 justify-between">
      <h1 className="text-xl sm:text-2xl mb-2">History Chess Game</h1>
      
      {/* Game Mode Indicator - improved styling */}
      <div className="w-full max-w-7xl mb-2 md:mb-4 rounded shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 p-2">
          <span className="text-sm sm:text-base font-medium text-white">
            {isSinglePlayer 
              ? `Single Player (You: ${playerColor === 'w' ? 'White' : 'Black'}, AI Level: ${aiDifficulty})` 
              : 'Two Players'}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {isThinking && (
              <span className="animate-pulse text-[#F7D27F] text-sm sm:text-base font-medium">AI thinking...</span>
            )}
            {!isSinglePlayer && (
              <Button 
                variant={autoRotateBoard ? "default" : "outline"} 
                size="sm"
                onClick={toggleAutoRotate}
                className={`text-xs sm:text-sm ${autoRotateBoard 
                  ? "bg-[#F7D27F] text-black hover:bg-[#E6C26E]" 
                  : "text-white border-white hover:text-[#F7D27F]"}`}
              >
                {autoRotateBoard ? "Auto-rotate: ON" : "Auto-rotate: OFF"}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowGameModeDialog(true)}
              className="text-xs sm:text-sm text-white border-white hover:text-[#F7D27F]"
            >
              Change
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content area with responsive layout */}
      <div className="flex flex-col lg:flex-row gap-3 w-full max-w-7xl flex-1 max-h-[calc(100vh-150px)]">
        {/* Chessboard and captured pieces */}
        <div className="flex flex-col justify-between w-full">
          {/* Captured Pieces for Black */}
          <div className="mb-0.5 flex justify-center md:justify-start">
            <CapturedPieces color="Black" pieces={capturedBlack} />
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Main Chessboard with responsive size - centered on mobile */}
            <div className="flex justify-center items-center mx-auto">
              <Chessboard
                id="historyChessBoard"
                position={fen}
                onPieceDrop={handleDrop}
                onPieceClick={onPieceClick}
                onSquareClick={onSquareClick}
                onPieceDragBegin={onPieceDragBegin}
                boardWidth={boardWidth}
                animationDuration={300}
                customSquareStyles={{
                  ...customSquareStyles,
                }}
                boardOrientation={boardOrientation}
              />
            </div>
            
            {/* Controls section - stacked on mobile, side by side on desktop */}
            <div className="w-full text-black flex flex-col justify-between mt-3 md:mt-0 md:ml-3">
              {/* Time Counter */}
              <div className="rounded shadow-md bg-[#3B3433]">
                <TimeCounter 
                  ref={timerRef}
                  initialTimeInSeconds={600} 
                  currentTurn={currentTurn} 
                  gameActive={gameActive}
                  isGameOver={gameState.isGameOver}
                  history={history}
                />
              </div>
            
              {/* Move History - with fixed height */}
              <div className="flex flex-col flex-grow my-3 overflow-hidden">
                <h3 className="text-white text-sm font-semibold mb-1 px-2">Move History</h3>
                <div className="rounded shadow-md bg-[#3B3433] h-100 w-full">
                  <ScrollArea className="h-full w-full">
                    <table className="w-full text-white">
                      <thead className="sticky top-0 z-10 bg-[#3B3433]">
                        <tr>
                          <th className="py-2 px-2 sm:px-5 text-left text-xs sm:text-sm font-semibold">Turn</th>
                          <th className="py-2 px-2 sm:px-5 text-left text-xs sm:text-sm font-semibold">White</th>
                          <th className="py-2 px-2 sm:px-5 text-left text-xs sm:text-sm font-semibold">Black</th>
                          <th className="py-2 px-2 sm:px-5 text-right text-xs sm:text-sm font-semibold">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moveHistoryPairs.map((pair) => (
                          <tr key={pair.turn} className="hover:bg-[#4A4443] transition-colors duration-200">
                            <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">{pair.turn}.</td>
                            <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">{pair.whiteMove}</td>
                            <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">{pair.blackMove}</td>
                            <td className="py-2 px-2 sm:px-5 text-xs">
                              {pair.whiteTime !== "-" && (
                                <div className="mb-1.5 flex items-center justify-between gap-2">
                                  <div className="flex justify-end w-10 sm:w-16 h-1.5 overflow-hidden">
                                    <div 
                                      className="h-full bg-white"
                                      style={{ 
                                        width: `${Math.min(100, (pair.whiteTimeRaw / pair.maxTime) * 100)}%` 
                                      }}
                                    />
                                  </div>
                                  <span className="min-w-[24px] sm:min-w-[30px] text-xs">{pair.whiteTime}s</span>
                                </div>
                              )}
                              {pair.blackTime && (
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex justify-end w-10 sm:w-16 h-1.5 overflow-hidden">
                                    <div 
                                      className="h-full bg-black"
                                      style={{ 
                                        width: `${Math.min(100, (pair.blackTimeRaw / pair.maxTime) * 100)}%` 
                                      }}
                                    />
                                  </div>
                                  <span className="min-w-[24px] sm:min-w-[30px] text-xs">{pair.blackTime}s</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              </div>
              
              {/* Control Buttons - responsive layout */}
              <div className="grid grid-cols-2 gap-2">
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
                    className="px-2 sm:px-4 py-3 sm:py-6 text-sm sm:text-lg"
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
                    className="px-2 sm:px-4 py-3 sm:py-6 bg-[#DBB968] text-sm sm:text-lg text-black hover:bg-[#C7A95D]" 
                  >
                    New Game
                  </Button>
              </div>
            </div>
          </div>

          {/* Captured Pieces for White */}
          <div className="mt-0.5 flex justify-center md:justify-start">
            <CapturedPieces color="White" pieces={capturedWhite} />
          </div>
        </div>
      </div>

      {/* Game State Dialog */}
      <Dialog 
        open={gameState.isGameOver} 
        onOpenChange={(open) => !open && setGameState({...gameState, isGameOver: false})}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-center text-xl sm:text-3xl">{gameState.title}</DialogTitle>
          </DialogHeader>
          <p className="text-center text-base sm:text-lg">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-center text-xl sm:text-3xl">Choose Game Mode</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <h3 className="text-lg sm:text-xl font-medium">Play against Computer</h3>
              
              <div className="flex flex-col space-y-4">
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Select AI difficulty:</p>
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
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
              <h3 className="text-lg sm:text-xl font-medium">Two Player Mode</h3>
              <div className="flex flex-col space-y-2">
                <Button onClick={handleStartTwoPlayer} className="mb-2">
                  Start Two Player Game
                </Button>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <p>In two player mode, you can enable auto-rotate to flip the board automatically between turns.</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChessboardComponent;