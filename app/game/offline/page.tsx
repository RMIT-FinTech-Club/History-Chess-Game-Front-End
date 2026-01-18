"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { MatchDetail } from "./components/MatchDetailProps";
import { CapturedPieces } from "./components/CapturedPieces";
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
  const [savedTheme, setSavedTheme] = useState<{ light?: string; dark?: string } | null>(null);
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
    setShowGameModeDialog(true)
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
      setMoveTimeHistory(prev => prev.slice(0, -1));
    }
  }, [fen, undoMove, moveTimeHistory, gameActive, gameState.isGameOver]);

  const handleSurrender = useCallback(() => {
    if (gameActive && !gameState.isGameOver) {
      const surrenderingPlayer = currentTurn === "w" ? "White" : "Black";
      gameState.isGameOver = true;
      gameState.title = "Game Over";
      gameState.message = `${surrenderingPlayer} has surrendered.`;
      setGameActive(false);
    }
  }, [gameActive, gameState.isGameOver, currentTurn]);

  const toggleAutoRotate = useCallback(() => {
    if (!isSinglePlayer) {
      const newAutoRotate = !autoRotateBoard;
      setAutoRotateBoard(newAutoRotate);
      if (newAutoRotate) {
        setBoardOrientation(currentTurn === "w" ? "white" : "black");
      }
    }
  }, [isSinglePlayer, autoRotateBoard, currentTurn]);

  useEffect(() => {
    try {
      const s = localStorage.getItem("chessTheme");
      if (s) setSavedTheme(JSON.parse(s));
    } catch { }
  }, []);

  const boardVars = useMemo(
    () =>
      ({
        ["--board-light" as any]: savedTheme?.light ?? "#F0D9B5",
        ["--board-dark" as any]: savedTheme?.dark ?? "#B58863",
        ["--board-frame" as any]: "#E9B654",
        ["--board-frame-2" as any]: "#363624",
      }) as React.CSSProperties,
    [savedTheme]
  );
  const difficultyLevels: StockfishLevel[] = [1, 2, 3, 5, 8, 10, 15, 20];
  const totalMove = history.length;
  if (!mounted) return <p>Loading Chessboard...</p>;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col items-center">

      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          backgroundColor: "#0A0A0A",
          backgroundImage: `
            /* Top trái/phải */
            radial-gradient(65rem 40rem at 0% -15%, rgba(233,182,84,.65), transparent 60%),
            radial-gradient(65rem 40rem at 100% -15%, rgba(233,182,84,.65), transparent 60%),

            /* Thân trang trái/phải + trên giữa */
            radial-gradient(70rem 45rem at -10% 20%, rgba(233,182,84,.55), transparent 60%),
            radial-gradient(70rem 45rem at 110% 25%, rgba(233,182,84,.55), transparent 60%),
            radial-gradient(85rem 55rem at 50% -10%, rgba(233,182,84,.45), transparent 60%),

            /* Vàng mờ tổng thể */
            radial-gradient(110rem 70rem at 50% 0%, rgba(233,182,84,.10), transparent 70%),

            /* >>> Góc phải dưới: quầng lớn dịu */
            radial-gradient(60rem 40rem at 115% 115%, rgba(233,182,84,.50), transparent 60%),

            /* >>> Góc phải dưới: điểm nhấn nhỏ đậm hơn */
            radial-gradient(26rem 18rem at 100% 100%, rgba(233,182,84,.75), transparent 60%),

            /* Vignette đáy */
            radial-gradient(120rem 80rem at 50% 120%, rgba(0,0,0,.65), transparent 60%)
          `,
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundSize: "cover"
        }}
      />

      <div
        className="absolute inset-0 -z-30 pointer-events-none
          [background:
            radial-gradient(120rem_80rem_at_50%_120%,rgba(0,0,0,.65),transparent_60%)
          ]"
      />

      <YellowLight top={'30vh'} left={'55vw'} />

      <GameHeader
        isSinglePlayer={isSinglePlayer}
        playerColor={playerColor}
        aiLevel={aiLevel}
        autoRotateBoard={autoRotateBoard}
        onToggleAutoRotate={toggleAutoRotate}
        onChangeGameMode={() => setShowGameModeDialog(true)}
      />

      <div className="grid w-[95vw] flex-1 grid-cols-1 lg:grid-cols-[350px_minmax(560px,1fr)_380px] gap-6">
        <aside className="min-h-0 space-y-4">
          <PlayerSection
            color="Black"
            pieces={capturedBlack}
            isCurrentTurn={currentTurn === "b"}
            gameActive={gameActive}
          />

          <PlayerSection
            color="White"
            pieces={capturedWhite}
            isCurrentTurn={currentTurn === "w"}
            gameActive={gameActive}
          />
          <div className="rounded-xl px-4 py-3 text-white/90">
            <CapturedPieces whiteCaptured={capturedWhite} blackCaptured={capturedBlack} />
          </div>
        </aside>

        <section className="flex flex-col items-center">
          <div className="rounded-2xl border border-white/20 bg-gradient-to-b from-[#E9B654]/30 to-transparent p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)]" style={boardVars}>
            <Chessboard
              id="historyChessBoard"
              position={fen}
              onPieceDrop={chessHandlers.handleDrop}
              onPieceClick={chessHandlers.onPieceClick}
              onSquareClick={chessHandlers.onSquareClick}
              onPieceDragBegin={chessHandlers.onPieceDragBegin}
              boardWidth={630}
              animationDuration={300}
              customSquareStyles={customSquareStyles}
              boardOrientation={boardOrientation}
            />
          </div>

          <div className="mt-2 w-full max-w-[650px]">
            <GameControls onUndo={handleUndo} onNewGame={handleNewGame} onSurrender={handleSurrender} canUndo={history.length > 0} />
          </div>
        </section>

        <aside className="min-h-0 flex flex-col gap-4">
          <div className="rounded-xl p-4 text-white/90">
            <h1 className="text-xl font-semibold mb-2">Move History</h1>
            <div className="rounded-xl p-2">
              <MoveHistoryTable moveHistoryPairs={moveHistoryPairs} />
            </div>
          </div>

          <div className="rounded-xl p-4 text-white/90">
            <h1 className="text-xl font-semibold mb-3">Match Details</h1>
            <MatchDetail currentTurn={currentTurn} totalMove={totalMove} />
          </div>
        </aside>
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
