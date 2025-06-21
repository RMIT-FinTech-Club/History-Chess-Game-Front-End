"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import "@/css/chessboard.css";
import { PlayerSection } from "@/app/game/offline/components/PlayerSection";
import { useOfflineGame } from "@/app/game/offline/hooks/useOfflineGame";
import { useBoardSize } from "@/hooks/useBoardSize";
import { useMoveHistory } from "./hooks/useMoveHistory";
import { useChessHandlers } from "./hooks/useChessHandlers";
import { GameHeader } from "./components/GameHeader";
import { GameOverDialog } from "./components/GameOverDialog";
import { GameModeDialog } from "./components/GameModeDialog";
import { MoveHistoryTable } from "./components/MoveHistoryTable";
import { GameControls } from "./components/GameControls";
import type { StockfishLevel } from "@/app/game/offline/hooks/useStockfish";
import { TimeCounterHandle } from "./types";
import YellowLight from "@/components/decor/YellowLight";

const OfflinePage = () => {
  const [mounted, setMounted] = useState(false);
  const [showGameModeDialog, setShowGameModeDialog] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<StockfishLevel>(5);
  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
  const [gameActive, setGameActive] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [autoRotateBoard, setAutoRotateBoard] = useState(false);
  
  const timerRef = useRef<TimeCounterHandle>(null);
  const boardWidth = useBoardSize();

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
    makeMove,
    undoMove,
    currentTurn: gameTurn,
    isSinglePlayer,
    playerColor,
    isThinking,
    startSinglePlayerGame,
    startTwoPlayerGame,
    aiLevel,
    isAiReady,
    handleTimeOut, // Add this line
  } = useOfflineGame();

  const moveHistoryPairs = useMoveHistory(history, moveTimings);
  
  const chessHandlers = useChessHandlers({
    isSinglePlayer,
    playerColor,
    fen,
    selectedPiece,
    setSelectedPiece,
    makeMove,
  });

  // Update current turn and orientation
  useEffect(() => {
    setCurrentTurn(gameTurn);
    if (!isSinglePlayer && autoRotateBoard) {
      setBoardOrientation(gameTurn === "w" ? "white" : "black");
    }
  }, [gameTurn, isSinglePlayer, autoRotateBoard]);

  useEffect(() => {
    setMounted(true);
    setShowGameModeDialog(true);
  }, []);

  useEffect(() => {
    setGameActive(!gameState.isGameOver && history.length > 0);
  }, [gameState.isGameOver, history.length]);

  useEffect(() => {
    if (isSinglePlayer) {
      setBoardOrientation(playerColor === "w" ? "white" : "black");
      setAutoRotateBoard(false);
    }
  }, [isSinglePlayer, playerColor]);

  // Add these state variables for times
  const [whiteTimeInSeconds, setWhiteTimeInSeconds] = useState(600);
  const [blackTimeInSeconds, setBlackTimeInSeconds] = useState(600);
  const [isPaused, setIsPaused] = useState(true);

  // Add a new state to track time for each move
  const [moveTimeHistory, setMoveTimeHistory] = useState<{white: number, black: number}[]>([]);

  // Add timer effect
  useEffect(() => {
    if (gameState.isGameOver || isPaused || !gameActive) {
      return;
    }
    
    const timer = setInterval(() => {
      if (currentTurn === "w") {
        setWhiteTimeInSeconds((prev) => Math.max(0, prev - 1));
      } else {
        setBlackTimeInSeconds((prev) => Math.max(0, prev - 1));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentTurn, isPaused, gameActive, gameState.isGameOver]);

  // Start timer automatically after first move
  useEffect(() => {
    if (gameActive && history.length > 0 && isPaused) {
      setIsPaused(false);
    }
  }, [gameActive, history.length, isPaused]);

  // Update the timer effect to store time history when moves are made
  useEffect(() => {
    if (history.length > moveTimeHistory.length) {
      // A new move was made, store current times
      setMoveTimeHistory(prev => [...prev, {
        white: whiteTimeInSeconds,
        black: blackTimeInSeconds
      }]);
    }
  }, [history.length, whiteTimeInSeconds, blackTimeInSeconds, moveTimeHistory.length]);

  // Reset times when starting new game
  const handleNewGame = useCallback(() => {
    setShowGameModeDialog(true);
    setWhiteTimeInSeconds(600);
    setBlackTimeInSeconds(600);
    setIsPaused(true);
    setMoveTimeHistory([]); // Reset time history
  }, []);

  // --- Handlers ---
  const handleStartSinglePlayer = useCallback(
    (color: "w" | "b") => {
      startSinglePlayerGame(color, aiDifficulty);
      setShowGameModeDialog(false);
      setBoardOrientation(color === "w" ? "white" : "black");
      setAutoRotateBoard(false);
      setWhiteTimeInSeconds(600);
      setBlackTimeInSeconds(600);
      setIsPaused(true);
      setMoveTimeHistory([]); // Reset time history
    },
    [startSinglePlayerGame, aiDifficulty]
  );

  const handleStartTwoPlayer = useCallback(() => {
    startTwoPlayerGame();
    setShowGameModeDialog(false);
    setBoardOrientation("white");
    setWhiteTimeInSeconds(600);
    setBlackTimeInSeconds(600);
    setIsPaused(true);
    setMoveTimeHistory([]); // Reset time history
  }, [startTwoPlayerGame]);

  const handleUndo = useCallback(() => {
    const lastTurn = fen.split(" ")[1] === "w" ? "b" : "w";
    undoMove();
    
    // Restore previous timer state
    if (moveTimeHistory.length > 0) {
      const previousTimeState = moveTimeHistory[moveTimeHistory.length - 1];
      setWhiteTimeInSeconds(previousTimeState.white);
      setBlackTimeInSeconds(previousTimeState.black);
      
      // Remove the last time state since we're undoing
      setMoveTimeHistory(prev => prev.slice(0, -1));
    }
    
    // Pause the timer during undo
    setIsPaused(true);
    
    // Resume timer after a short delay if game is still active
    setTimeout(() => {
      if (gameActive && !gameState.isGameOver) {
        setIsPaused(false);
      }
    }, 100);
  }, [fen, undoMove, moveTimeHistory, gameActive, gameState.isGameOver]);

  const toggleAutoRotate = useCallback(() => {
    if (!isSinglePlayer) {
      const newAutoRotate = !autoRotateBoard;
      setAutoRotateBoard(newAutoRotate);
      if (newAutoRotate) {
        setBoardOrientation(currentTurn === "w" ? "white" : "black");
      }
    }
  }, [isSinglePlayer, autoRotateBoard, currentTurn]);

  const difficultyLevels: StockfishLevel[] = [1, 2, 3, 5, 8, 10, 15, 20];

  if (!mounted) return <p>Loading Chessboard...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center w-full py-5 px-2 md:px-4">
      <h1 className="text-4xl font-semibold">OFFLINE CHESS GAME</h1>
      <YellowLight top={'30vh'} left={'55vw'} />
      
      <GameHeader
        isSinglePlayer={isSinglePlayer}
        playerColor={playerColor}
        aiLevel={aiLevel}
        isThinking={isThinking}
        autoRotateBoard={autoRotateBoard}
        onToggleAutoRotate={toggleAutoRotate}
        onChangeGameMode={() => setShowGameModeDialog(true)}
      />

      <div className="flex flex-col lg:flex-row gap-3 w-full max-w-7xl flex-1">
        <div className="flex flex-col justify-between w-full min-h-0">
          <div className="flex justify-center md:justify-start">
            <PlayerSection 
              color="Black" 
              pieces={capturedBlack} 
              timeInSeconds={blackTimeInSeconds}
              isCurrentTurn={currentTurn === "b"}
              isPaused={isPaused}
              gameActive={gameActive}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex justify-center items-center">
              <Chessboard
                id="historyChessBoard"
                position={fen}
                onPieceDrop={chessHandlers.handleDrop}
                onPieceClick={chessHandlers.onPieceClick}
                onSquareClick={chessHandlers.onSquareClick}
                onPieceDragBegin={chessHandlers.onPieceDragBegin}
                boardWidth={boardWidth}
                animationDuration={300}
                customSquareStyles={customSquareStyles}
                boardOrientation={boardOrientation}
              />
            </div>
            
            <div className="w-full text-black flex flex-col justify-between gap-3">
              <MoveHistoryTable moveHistoryPairs={moveHistoryPairs} />
              
              <GameControls
                onUndo={handleUndo}
                onNewGame={handleNewGame}
                canUndo={history.length > 0}
              />
            </div>
          </div>
          
          <div className="flex justify-center md:justify-start">
            <PlayerSection 
              color="White" 
              pieces={capturedWhite} 
              timeInSeconds={whiteTimeInSeconds}
              isCurrentTurn={currentTurn === "w"}
              isPaused={isPaused}
              gameActive={gameActive}
            />
          </div>
        </div>
      </div>

      <GameOverDialog
        open={gameState.isGameOver}
        title={gameState.title}
        message={gameState.message}
        onNewGame={() => setShowGameModeDialog(true)}
      />

      <GameModeDialog
        open={showGameModeDialog}
        aiDifficulty={aiDifficulty}
        setAiDifficulty={setAiDifficulty}
        difficultyLevels={difficultyLevels}
        handleStartSinglePlayer={handleStartSinglePlayer}
        handleStartTwoPlayer={handleStartTwoPlayer}
        isAiReady={isAiReady}
        onClose={() => setShowGameModeDialog(false)}
      />
    </div>
  );
};

export default OfflinePage;