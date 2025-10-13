"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
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
import YellowLight from "@/components/decor/YellowLight";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

const VALID_STOCKFISH_LEVELS: StockfishLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20];

const parseStockfishLevel = (value: string | null): StockfishLevel | null => {
  if (!value) return null;
  const level = Number(value);
  return (VALID_STOCKFISH_LEVELS as number[]).includes(level) ? (level as StockfishLevel) : null;
};

const parseColorParam = (value: string | null): "w" | "b" =>
  value === "black" || value === "b" ? "b" : "w";

const isTruthyParam = (value: string | null): boolean =>
  value === "1" || value === "true";

const OfflinePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const autoStartLevel = parseStockfishLevel(searchParams?.get("level"));
  const autoStartMode = searchParams?.get("mode");
  const autoStartFlag = isTruthyParam(searchParams?.get("autostart"));
  const shouldAutoStart = autoStartMode === "singleplayer" && autoStartFlag && autoStartLevel !== null;
  const autoStartColor = parseColorParam(searchParams?.get("color"));

  const [mounted, setMounted] = useState(false);
  const [showGameModeDialog, setShowGameModeDialog] = useState(!shouldAutoStart);
  const [aiDifficulty, setAiDifficulty] = useState<StockfishLevel>(autoStartLevel ?? 5);
  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
  const [gameActive, setGameActive] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [autoRotateBoard, setAutoRotateBoard] = useState(false);
  const [autoStartTriggered, setAutoStartTriggered] = useState(false);
  const [moveTimeHistory, setMoveTimeHistory] = useState<{ white: number; black: number }[]>([]);

  const boardWidth = useBoardSize();
  const { isAuthenticated } = useGlobalStorage();

  useEffect(() => {
    setShowGameModeDialog(!shouldAutoStart);
  }, [shouldAutoStart]);

  useEffect(() => {
    if (autoStartLevel && aiDifficulty !== autoStartLevel) {
      setAiDifficulty(autoStartLevel);
    }
  }, [autoStartLevel, aiDifficulty]);

  useEffect(() => {
    setAutoStartTriggered(false);
  }, [autoStartLevel, shouldAutoStart]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to play game.");
      router.push('/sign_in')
    }
  }, [isAuthenticated, router])

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

  useEffect(() => {
    if (!mounted || !shouldAutoStart || autoStartTriggered || !autoStartLevel) {
      return;
    }

    if (!isAiReady) {
      return;
    }

    setAiDifficulty(autoStartLevel);
    startSinglePlayerGame(autoStartColor, autoStartLevel);
    setShowGameModeDialog(false);
    setBoardOrientation(autoStartColor === "w" ? "white" : "black");
    setAutoRotateBoard(false);
    setMoveTimeHistory([]);
    setAutoStartTriggered(true);
  }, [
    autoStartColor,
    autoStartLevel,
    autoStartTriggered,
    isAiReady,
    mounted,
    shouldAutoStart,
    startSinglePlayerGame,
  ]);

  // Update current turn and orientation
  useEffect(() => {
    setCurrentTurn(gameTurn);
    if (!isSinglePlayer && autoRotateBoard) {
      setBoardOrientation(gameTurn === "w" ? "white" : "black");
    }
  }, [gameTurn, isSinglePlayer, autoRotateBoard]);

  useEffect(() => {
    setMounted(true);
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

  // Reset times when starting new game
  const handleNewGame = useCallback(() => {
    setMoveTimeHistory([]); // Reset time history
  }, []);

  // --- Handlers ---
  const handleStartSinglePlayer = useCallback(
    (color: "w" | "b") => {
      startSinglePlayerGame(color, aiDifficulty);
      setShowGameModeDialog(false);
      setBoardOrientation(color === "w" ? "white" : "black");
      setAutoRotateBoard(false);
      setMoveTimeHistory([]); // Reset time history
    },
    [startSinglePlayerGame, aiDifficulty]
  );

  const handleStartTwoPlayer = useCallback(() => {
    startTwoPlayerGame();
    setShowGameModeDialog(false);
    setBoardOrientation("white");
    setMoveTimeHistory([]); // Reset time history
  }, [startTwoPlayerGame]);

  const handleUndo = useCallback(() => {
    const lastTurn = fen.split(" ")[1] === "w" ? "b" : "w";
    undoMove();

    // Restore previous timer state
    if (moveTimeHistory.length > 0) {
      const previousTimeState = moveTimeHistory[moveTimeHistory.length - 1];

      // Remove the last time state since we're undoing
      setMoveTimeHistory(prev => prev.slice(0, -1));
    }
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
    <div className="!h-[100dvh] overflow-hidden flex flex-col items-center w-full">

      <YellowLight top={'30vh'} left={'55vw'} />

      <GameHeader
        isSinglePlayer={isSinglePlayer}
        playerColor={playerColor}
        aiLevel={aiLevel}
        autoRotateBoard={autoRotateBoard}
        onToggleAutoRotate={toggleAutoRotate}
        onChangeGameMode={() => setShowGameModeDialog(true)}
      />

      <div className="flex flex-col lg:flex-row gap-3 w-[90vw] flex-1">
        <div className="flex flex-col justify-between w-full min-h-0">
          <div className="flex justify-center md:justify-start">
            <PlayerSection
              color="Black"
              pieces={capturedBlack}
              isCurrentTurn={currentTurn === "b"}
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

            <div className="w-full h-[71dvh] text-black flex flex-col justify-between gap-3">
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
              isCurrentTurn={currentTurn === "w"}
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
