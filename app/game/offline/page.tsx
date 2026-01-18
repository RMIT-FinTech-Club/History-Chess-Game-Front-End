"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
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
import { MatchDetail } from "./components/MatchDetailProps";
import { CapturedPieces } from "./components/CapturedPieces";
import { GameControls } from "./components/GameControls";
import type { StockfishLevel } from "@/app/game/offline/hooks/useStockfish";
import YellowLight from "@/components/decor/YellowLight";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

const getBotElo = (level: number) => {
  // Approximate mapping: Level 1 ~ 400, Level 20 ~ 3200
  return 400 + (level * 140);
};

const OfflinePage = () => {
  const [mounted, setMounted] = useState(false);
  const [showGameModeDialog, setShowGameModeDialog] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<StockfishLevel>(5);
  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
  const [gameActive, setGameActive] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [autoRotateBoard, setAutoRotateBoard] = useState(false);
  const [savedTheme, setSavedTheme] = useState<{ light?: string; dark?: string; accent?: string } | null>(null);
  const boardWidth = useBoardSize();
  const { isAuthenticated, userName, avatar } = useGlobalStorage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoStartProcessed = useRef(false);

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

  // Update current turn and orientation
  useEffect(() => {
    setCurrentTurn(gameTurn);
    if (!isSinglePlayer && autoRotateBoard) {
      setBoardOrientation(gameTurn === "w" ? "white" : "black");
    }
  }, [gameTurn, isSinglePlayer, autoRotateBoard]);

  useEffect(() => {
    setMounted(true);

    // Check for URL parameters from Dynasty Journey
    const levelParam = searchParams.get('level');
    const autostartParam = searchParams.get('autostart');

    if (levelParam && autostartParam === '1' && !autoStartProcessed.current) {
      // Parse the level from URL and set as AI difficulty
      const parsedLevel = parseInt(levelParam, 10) as StockfishLevel;
      const validLevels: StockfishLevel[] = [1, 2, 3, 5, 8, 10, 15, 20];

      // Find the closest valid level
      const closestLevel = validLevels.reduce((prev, curr) =>
        Math.abs(curr - parsedLevel) < Math.abs(prev - parsedLevel) ? curr : prev
      );

      setAiDifficulty(closestLevel);
      autoStartProcessed.current = true;

      // Don't show dialog - we'll auto-start once AI is ready
    } else if (!autoStartProcessed.current) {
      setShowGameModeDialog(true);
    }
  }, []); // Empty deps - only run once on mount

  // Use a separate ref to track if game has been auto-started
  const gameAutoStarted = useRef(false);

  // Auto-start game when AI is ready (for Dynasty Journey redirect)
  useEffect(() => {
    // Only proceed if we haven't already started the game
    if (gameAutoStarted.current) return;

    const levelParam = searchParams.get('level');
    const autostartParam = searchParams.get('autostart');
    const colorParam = searchParams.get('color');

    if (levelParam && autostartParam === '1' && isAiReady && autoStartProcessed.current) {
      gameAutoStarted.current = true; // Mark as started BEFORE calling startSinglePlayerGame
      const playerColorChoice = colorParam === 'black' ? 'b' : 'w';
      startSinglePlayerGame(playerColorChoice, aiDifficulty);
      setBoardOrientation(playerColorChoice === 'w' ? 'white' : 'black');
      setAutoRotateBoard(false);
    }
  }, [isAiReady, aiDifficulty, startSinglePlayerGame, searchParams]);

  useEffect(() => {
    setGameActive(!gameState.isGameOver && history.length > 0);
  }, [gameState.isGameOver, history.length]);

  useEffect(() => {
    if (isSinglePlayer) {
      setBoardOrientation(playerColor === "w" ? "white" : "black");
      setAutoRotateBoard(false);
    }
  }, [isSinglePlayer, playerColor]);

  // Add a new state to track time for each move
  const [moveTimeHistory, setMoveTimeHistory] = useState<{ white: number, black: number }[]>([]);

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
    // Check for theme from URL params (Dynasty Journey)
    const themeLightParam = searchParams.get('themeLight');
    const themeDarkParam = searchParams.get('themeDark');
    const themeAccentParam = searchParams.get('themeAccent');

    if (themeLightParam && themeDarkParam) {
      // Dynasty theme from URL takes priority
      setSavedTheme({
        light: decodeURIComponent(themeLightParam),
        dark: decodeURIComponent(themeDarkParam),
        accent: themeAccentParam ? decodeURIComponent(themeAccentParam) : undefined
      });
    } else {
      // Fallback to localStorage
      try {
        const s = localStorage.getItem("chessTheme");
        if (s) setSavedTheme(JSON.parse(s));
      } catch { }
    }
  }, [searchParams]);

  const boardVars = useMemo(
    () =>
      ({
        ["--board-light" as any]: savedTheme?.light ?? "#F0D9B5",
        ["--board-dark" as any]: savedTheme?.dark ?? "#B58863",
        ["--board-frame" as any]: savedTheme?.accent ?? "#E9B654",
        ["--board-frame-2" as any]: "#363624",
      }) as React.CSSProperties,
    [savedTheme]
  );
  const difficultyLevels: StockfishLevel[] = [1, 2, 3, 5, 8, 10, 15, 20];
  const totalMove = history.length;
  if (!mounted) return <p>Loading Chessboard...</p>;

  return (
    <div className="fixed inset-0 h-screen w-full overflow-hidden flex flex-col items-center">

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

      {/* Main Game Layout - Responsive */}
      <div className="flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto flex-1 gap-6 px-4 lg:px-8 pb-8 justify-center items-stretch pt-8 min-h-0 overflow-y-auto lg:overflow-hidden">

        {/* Left Sidebar - Players & Captured */}
        <aside className="hidden lg:flex lg:flex-col lg:w-[320px] xl:w-[360px] gap-6 flex-shrink-0">
          <div className="space-y-4">
            <PlayerSection
              color="Black"
              pieces={capturedBlack}
              isCurrentTurn={currentTurn === "b"}
              gameActive={gameActive}
              elo={isSinglePlayer && playerColor === "w" ? getBotElo(aiDifficulty) : 1200}
              profileName={isSinglePlayer && playerColor === "w" ? `Bot (Level ${aiDifficulty})` : "Player 2"}
              side="b"
            />
            <PlayerSection
              color="White"
              pieces={capturedWhite}
              isCurrentTurn={currentTurn === "w"}
              gameActive={gameActive}
              elo={isSinglePlayer && playerColor === "w" ? 1200 : getBotElo(aiDifficulty)}
              profileName={isSinglePlayer && playerColor === "w" ? (userName || "You") : `Bot (Level ${aiDifficulty})`}
              profileImage={isSinglePlayer && playerColor === "w" ? (avatar || undefined) : undefined}
              side="w"
            />
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-lg">
            <CapturedPieces whiteCaptured={capturedWhite} blackCaptured={capturedBlack} />
          </div>
        </aside>

        {/* Center - Chessboard Section */}
        <section className="flex flex-col items-center flex-1 min-w-0 max-w-[800px]">
          {/* Mobile Turn Indicator */}
          <div className="lg:hidden flex justify-between items-center w-full mb-4 px-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 transition-colors ${currentTurn === 'w' ? 'bg-white/20 ring-1 ring-yellow-500/50' : 'bg-black/40'}`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span className="text-white/90 text-sm font-medium">White</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 transition-colors ${currentTurn === 'b' ? 'bg-white/20 ring-1 ring-yellow-500/50' : 'bg-black/40'}`}>
              <div className="w-3 h-3 rounded-full bg-black border border-white/30" />
              <span className="text-white/90 text-sm font-medium">Black</span>
            </div>
          </div>

          {/* Chessboard Container - Bigger & Centered */}
          <div
            className="rounded-xl border-[6px] border-[#3d2e1f] bg-[#1a1614] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{
              boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1), 0 20px 60px -10px rgba(0, 0, 0, 0.6)",
              ...boardVars
            }}
          >
            <Chessboard
              id="historyChessBoard"
              position={fen}
              onPieceDrop={chessHandlers.handleDrop}
              onPieceClick={chessHandlers.onPieceClick}
              onSquareClick={chessHandlers.onSquareClick}
              onPieceDragBegin={chessHandlers.onPieceDragBegin}
              boardWidth={Math.min(boardWidth, 700)}
              animationDuration={300}
              customSquareStyles={customSquareStyles}
              boardOrientation={boardOrientation}
            />
          </div>

          {/* Game Controls - Matches Board Width */}
          <div className="mt-6 w-full flex justify-center" style={{ maxWidth: Math.min(boardWidth, 700) }}>
            <GameControls
              onUndo={handleUndo}
              onNewGame={handleNewGame}
              onSurrender={handleSurrender}
              canUndo={history.length > 0}
            />
          </div>

          {/* Mobile Captured Pieces */}
          <div className="lg:hidden w-full max-w-[600px] mt-3 px-2">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-3">
              <CapturedPieces whiteCaptured={capturedWhite} blackCaptured={capturedBlack} />
            </div>
          </div>
        </section>

        {/* Right Sidebar - Move History & Match Details */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] flex flex-col gap-6 flex-shrink-0 mt-8 lg:mt-0 overflow-hidden">
          {/* Match Details */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-1 shadow-lg">
            <MatchDetail currentTurn={currentTurn} totalMove={totalMove} />
          </div>

          {/* Move History */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-1 shadow-lg flex-1 min-h-[300px] flex flex-col">
            <div className="p-4 border-b border-white/10 bg-white/5 rounded-t-lg shrink-0">
              <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Move History
              </h2>
            </div>
            <div className="p-2 flex-1 min-h-0">
              <MoveHistoryTable moveHistoryPairs={moveHistoryPairs} />
            </div>
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
    </div >
  );
};

// Wrapper component with Suspense for useSearchParams
const OfflinePageWrapper = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] text-white">Loading game...</div>}>
      <OfflinePage />
    </Suspense>
  );
};

export default OfflinePageWrapper;