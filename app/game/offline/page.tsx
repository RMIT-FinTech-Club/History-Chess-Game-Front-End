"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
const Chessboard = dynamic(() => import("react-chessboard").then((mod) => mod.Chessboard), {
  ssr: false,
  loading: () => <div className="w-full aspect-square bg-black/20 animate-pulse rounded-lg" />
});
import "@/css/chessboard.css";
import { PlayerSection } from "@/app/game/offline/components/PlayerSection";
import { useOfflineGame } from "@/app/game/offline/hooks/useOfflineGame";

import { useMoveHistory } from "./hooks/useMoveHistory";
import { useChessHandlers } from "./hooks/useChessHandlers";
import { GameHeader } from "./components/GameHeader";
import GameSidebar from "@/components/navigation/GameSidebar";
import { GameModeDialog } from "./components/GameModeDialog";
import { MoveHistoryTable } from "./components/MoveHistoryTable";
import { MatchDetail } from "./components/MatchDetailProps";
import { CapturedPieces } from "./components/CapturedPieces";
import { GameControls } from "./components/GameControls";
import type { StockfishLevel } from "@/app/game/offline/hooks/useStockfish";
import YellowLight from "@/components/decor/YellowLight";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import axiosInstance from "@/config/apiConfig";
import type { XpReward } from "@/components/game/shared/types";

// Import shared GameOverDialog for unified styling with coin rewards
import { GameOverDialog } from "@/components/game/shared";

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
  const [xpReward, setXpReward] = useState<XpReward | null>(null);
  // Remove isDynastyMode state, derive it instead
  // const [isDynastyMode, setIsDynastyMode] = useState(false);
  const [hasSubmittedResult, setHasSubmittedResult] = useState(false);
  // Start smaller to prevent forcing container expansion before measurement
  const [boardWidth, setBoardWidth] = useState(400);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, userName, avatar, accessToken } = useGlobalStorage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoStartProcessed = useRef(false);

  // Derive mode from URL params directly to ensure it matches current navigation
  const isDynastyMode = useMemo(() => {
    return !!(searchParams.get('level') && searchParams.get('autostart') === '1');
  }, [searchParams]);

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
    // isThinking,
    startSinglePlayerGame,
    startTwoPlayerGame,
    aiLevel,
    isAiReady,
    // handleTimeOut,
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
  }, [gameTurn, isSinglePlayer, autoRotateBoard, setBoardOrientation]);

  // Dynamic Board Resizing to prevent overlap
  useEffect(() => {
    if (!boardContainerRef.current) return;

    const updateSize = () => {
      if (!boardContainerRef.current) return;
      const containerWidth = boardContainerRef.current.clientWidth;
      const windowWidth = window.innerWidth;
      const maxHeight = window.innerHeight * 0.75;

      // Calculate max width based on desktop layout constraints
      // Lg/XL breakpoint usually has 2 sidebars 
      // Sidebar widths ~280px-340px each. Gap ~24px*2. Padding ~32px.
      // We explicitly cap the board to ensure it fits between sidebars if screen is < 1600px
      let maxAvailableWidth = containerWidth;

      if (windowWidth >= 1024) { // lg breakpoint
        // Rough estimate of retained space for sidebars to be safe
        // Window - (LeftSidebar + RightSidebar + Margins)
        const estimatedSidebars = windowWidth >= 1280 ? 720 : 600;
        const spaceBetween = windowWidth - estimatedSidebars - 48; // 48 is gutter
        maxAvailableWidth = Math.min(containerWidth, spaceBetween);
      }

      const maxBoardWidth = 720;

      // Calculate safe width
      const safeWidth = Math.min(maxAvailableWidth - 24, maxHeight, maxBoardWidth);
      setBoardWidth(Math.floor(safeWidth));
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(boardContainerRef.current);

    // Initial call
    updateSize();

    return () => resizeObserver.disconnect();
  }, [showGameModeDialog]); // Recalculate when dialog might shift layout

  useEffect(() => {
    setMounted(true);

    const levelParam = searchParams.get('level');
    const autostartParam = searchParams.get('autostart');

    // Logic for setting AI difficulty and auto-starting
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
    } else if (!autoStartProcessed.current && !isDynastyMode) {
      // Only show dialog if NOT in Dynasty Mode (double check)
      setShowGameModeDialog(true);
    }
  }, [searchParams, isDynastyMode]); // added params deps

  // Use a separate ref to track if game has been auto-started
  const gameAutoStarted = useRef(false);

  // Auto-start game when AI is ready (for Dynasty Journey redirect)
  useEffect(() => {
    // Only proceed if we haven't already started the game
    if (gameAutoStarted.current) return;

    // Use the derived isDynastyMode or check params again
    if (isDynastyMode && isAiReady && autoStartProcessed.current) {
      const colorParam = searchParams.get('color');
      gameAutoStarted.current = true; // Mark as started BEFORE calling startSinglePlayerGame
      const playerColorChoice = colorParam === 'black' ? 'b' : 'w';
      startSinglePlayerGame(playerColorChoice, aiDifficulty);
      setBoardOrientation(playerColorChoice === 'w' ? 'white' : 'black');
      setAutoRotateBoard(false);
    }
  }, [isAiReady, aiDifficulty, startSinglePlayerGame, searchParams, isDynastyMode]);

  useEffect(() => {
    setGameActive(!gameState.isGameOver && history.length > 0);
  }, [gameState.isGameOver, history.length]);

  // Submit Dynasty Journey result when game ends
  useEffect(() => {
    const submitDynastyResult = async () => {
      if (!gameState.isGameOver || hasSubmittedResult || !isDynastyMode || !accessToken) {
        return;
      }

      const isWin = gameState.title.toLowerCase().includes('win');

      try {
        const response = await axiosInstance.post(
          '/dynasty/result',
          {
            isWin,
            difficulty: aiDifficulty,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (response.data.success) {
          setXpReward(response.data.data);
          setHasSubmittedResult(true);

          if (response.data.data.levelUp) {
            toast.success(`Level Up! You are now level ${response.data.data.newLevel}!`);
          }
        }
      } catch (error) {
        console.error('Failed to submit dynasty result:', error);
        // Don't show error toast to avoid distraction from game over dialog
      }
    };

    submitDynastyResult();
  }, [gameState.isGameOver, hasSubmittedResult, isDynastyMode, accessToken, aiDifficulty, gameState.title]);

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
    setXpReward(null); // Reset XP reward
    setHasSubmittedResult(false); // Reset submission flag

    if (isDynastyMode) {
      router.push('/dynastyjourney');
    } else {
      setShowGameModeDialog(true);
    }
  }, [isDynastyMode, router, setShowGameModeDialog]);

  // --- Handlers ---
  const handleStartSinglePlayer = useCallback(
    (color: "w" | "b") => {
      startSinglePlayerGame(color, aiDifficulty);
      setShowGameModeDialog(false);
      setBoardOrientation(color === "w" ? "white" : "black");
      setAutoRotateBoard(false);
      setMoveTimeHistory([]); // Reset time history
    },
    [startSinglePlayerGame, aiDifficulty, setShowGameModeDialog, setBoardOrientation, setAutoRotateBoard]
  );

  const handleStartTwoPlayer = useCallback(() => {
    startTwoPlayerGame();
    setShowGameModeDialog(false);
    setBoardOrientation("white");
    setMoveTimeHistory([]); // Reset time history
  }, [startTwoPlayerGame, setShowGameModeDialog, setBoardOrientation]);

  const handleUndo = useCallback(() => {
    undoMove();

    // Restore previous timer state
    if (moveTimeHistory.length > 0) {
      setMoveTimeHistory(prev => prev.slice(0, -1));
    }
  }, [undoMove, moveTimeHistory]);

  const handleSurrender = useCallback(() => {
    if (gameActive && !gameState.isGameOver) {
      const surrenderingPlayer = currentTurn === "w" ? "White" : "Black";
      gameState.isGameOver = true;
      gameState.title = "Game Over";
      gameState.message = `${surrenderingPlayer} has surrendered.`;
      setGameActive(false);
    }
  }, [gameActive, gameState, currentTurn, setGameActive]);

  const toggleAutoRotate = useCallback(() => {
    if (!isSinglePlayer) {
      const newAutoRotate = !autoRotateBoard;
      setAutoRotateBoard(newAutoRotate);
      if (newAutoRotate) {
        setBoardOrientation(currentTurn === "w" ? "white" : "black");
      }
    }
  }, [isSinglePlayer, autoRotateBoard, currentTurn, setAutoRotateBoard, setBoardOrientation]);

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
        "--board-light": savedTheme?.light ?? "#F0D9B5",
        "--board-dark": savedTheme?.dark ?? "#B58863",
        "--board-frame": savedTheme?.accent ?? "#E9B654",
        "--board-frame-2": "#363624",
      }) as React.CSSProperties,
    [savedTheme]
  );
  const difficultyLevels: StockfishLevel[] = [1, 2, 3, 5, 8, 10, 15, 20];
  const totalMove = history.length;
  if (!mounted) return <p>Loading Chessboard...</p>;

  return (
    <div className="fixed inset-0 h-screen w-full overflow-hidden flex bg-[#0A0A0A]">

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
            radial-gradient(120rem_80rem_at_50%_120%,rgba(0,0,0,.85),transparent_60%)
          ]"
      />

      <YellowLight top={'30vh'} left={'55vw'} />

      {/* Sidebar Navigation */}
      <GameSidebar
        onLeaveGame={() => router.push('/home')}
        onToggleTheme={() => { }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center h-full pl-16 transition-all duration-300 w-full">
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
          <aside className="hidden lg:flex lg:flex-col lg:w-[280px] xl:w-[340px] gap-6 flex-shrink-0 transition-all duration-300">
            <div className="space-y-4">
              <PlayerSection
                color="Black"
                isCurrentTurn={currentTurn === "b"}
                gameActive={gameActive}
                elo={isSinglePlayer && playerColor === "w" ? getBotElo(aiDifficulty) : 1200}
                profileName={isSinglePlayer && playerColor === "w" ? `Bot (Level ${aiDifficulty})` : "Player 2"}
                side="b"
              />
              <PlayerSection
                color="White"
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
          <section ref={boardContainerRef} className="flex flex-col items-center flex-1 min-w-0 max-w-[800px] relative">
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
                boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1), 0 25px 80px -15px rgba(0, 0, 0, 0.7)",
                ...boardVars,
                ["--board-frame-2" as keyof React.CSSProperties]: "#2a221b", // Darker wood frame
              }}
            >
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

            {/* Game Controls - Matches Board Width */}
            <div className="mt-6 w-full flex justify-center" style={{ width: boardWidth }}>
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
          <aside className="w-full lg:w-[280px] xl:w-[340px] flex flex-col gap-6 flex-shrink-0 mt-8 lg:mt-0 overflow-hidden transition-all duration-300">
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
          onNewGame={() => {
            if (isDynastyMode) {
              router.push('/dynastyjourney');
            } else {
              setShowGameModeDialog(true);
            }
          }}
          xpReward={isDynastyMode ? (xpReward || undefined) : undefined}
          coinReward={gameState.title.toLowerCase().includes("win") && !isDynastyMode ? {
            amount: 5, // Bot win base reward
            status: 'pending' as const,
            breakdown: {
              base: 5,
              eloBonus: 0,
              movesBonus: history.length > 40 ? 1 : 0,
              streakBonus: 0,
              dynastyBonus: 0,
              total: 5 + (history.length > 40 ? 1 : 0)
            }
          } : undefined}
          isWinner={gameState.title.toLowerCase().includes("win")}
          isPvP={false}
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
    </div>
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