"use client";

// Import custom pieces utility
import { getCustomPieces } from "@/app/challenge/PiecesBoardSelector";

import React, { useEffect, useMemo, useState } from "react";
import { Square } from "chess.js";
import dynamic from "next/dynamic";
const Chessboard = dynamic(() => import("react-chessboard").then((mod) => mod.Chessboard), {
  ssr: false,
  loading: () => <div className="w-full aspect-square bg-black/20 animate-pulse rounded-lg" />
});
import "@/css/chessboard.css";
import YellowLight from "@/components/decor/YellowLight";

// Import hooks
import { useBoardSize } from "@/hooks/useBoardSize";
import { useChessHandlers } from "./hooks/useChessHandlers";
import { useOnlineMoveHistory } from "./hooks/useOnlineMoveHistory";
import { useOnlineSocket } from "./hooks/useOnlineSocket";
import { useGameState } from "./hooks/useGameState";
import { useTimeoutHandler } from "./hooks/useTimeoutHandler";
import { useMoveHandler } from "./hooks/useMoveHandler";
import { useSquareHighlight } from "./hooks/useSquareHighlight";

// Import local components
import { OpponentDisconnectionWarning } from "./components/OpponentDisconnectionWarning";

// Import offline components for unified layout
import { PlayerSection } from "@/app/game/offline/components/PlayerSection";
import { CapturedPieces } from "@/app/game/offline/components/CapturedPieces";
import { MatchDetail } from "@/app/game/offline/components/MatchDetailProps";
import { MoveHistoryTable } from "@/app/game/offline/components/MoveHistoryTable";
import { GameControls } from "@/app/game/offline/components/GameControls";
import { GameHeader } from "@/app/game/offline/components/GameHeader";

// Import shared components for unified game over experience
import { GameOverDialog, ConnectionStatusOverlay } from "@/components/game/shared";
import GameSidebar from "@/components/navigation/GameSidebar";

const GamePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [mounted, setMounted] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [savedTheme, setSavedTheme] = useState<{ light?: string; dark?: string; accent?: string } | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("historyChessBoard");

  // Get userId from GlobalStorage
  useEffect(() => setMounted(true), []);

  // Load chessboard theme from localStorage
  useEffect(() => {
    try {
      // First try to load dynasty/board theme selected in challenge page
      const boardThemeId = localStorage.getItem("selectedBoardTheme");
      if (boardThemeId) {
        setSelectedBoardId(boardThemeId);
      }

      // Then load custom color theme if available
      const s = localStorage.getItem("chessTheme");
      if (s) setSavedTheme(JSON.parse(s));
    } catch { }
  }, []);


  // Unwrap the params Promise
  const resolvedParams = React.use(params);
  const gameId = resolvedParams.id;

  // Use custom hooks
  const boardWidth = useBoardSize();

  const {
    gameState,
    setGameState,
    boardOrientation,
    setBoardOrientation,
    moveHistory,
    setMoveHistory,
    capturedWhite,
    setCapturedWhite,
    capturedBlack,
    setCapturedBlack,
    autoRotateBoard,
    whiteProfile,
    blackProfile,
  } = useGameState();

  // Use online-specific socket hook
  const {
    // socket,
    isConnected,
    connectionStatus,
    opponentDisconnected,
    disconnectionMessage,
    sendMove,  // Get sendMove from socket
    surrender, // Forfeit function that stays on page
    leaveGame  // Navigation function for after game
  } = useOnlineSocket({
    gameId: gameId,
    autoRotateBoard,
    setGameState,
    setBoardOrientation,
    setMoveHistory,
    setCapturedWhite,
    setCapturedBlack,
  });

  // Use timeout handler
  const { timeoutGameOver, timeoutResult, resetTimeout } = useTimeoutHandler(gameState);

  // Use move handler with socket's sendMove function
  const { makeMove } = useMoveHandler({
    gameState,
    timeoutGameOver,
    setSelectedPiece,
    sendMove,  // Pass socket's sendMove function
  });

  // Use chess handlers hook
  const { handleDrop, onPieceDragBegin, onPieceClick, onSquareClick } = useChessHandlers({
    isSinglePlayer: false,
    playerColor: gameState?.playerColor === "white" ? "w" : "b",
    fen: gameState?.fen || "",
    selectedPiece,
    setSelectedPiece,
    makeMove,
  });

  // Use square highlighting
  const { customSquareStyles } = useSquareHighlight(
    selectedPiece,
    gameState?.fen || "",
    timeoutGameOver
  );

  // Enhanced handleNewGame with proper cleanup
  const handleNewGame = () => {
    resetTimeout();

    // Reset all game state
    setGameState(null);
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setSelectedPiece(null);

    // Leave current game and redirect
    leaveGame();
  };

  // Handle surrender (forfeit the game) - stays on page to show result dialog
  const handleSurrender = () => {
    if (!isGameOver) {
      surrender(); // This will trigger a forfeit and show gameOver dialog
    }
  };

  useEffect(() => {
    if (!autoRotate) return;
    if (!gameState?.turn) return;
    setBoardOrientation(gameState.turn === "w" ? "white" : "black");
  }, [autoRotate, gameState?.turn, setBoardOrientation]);

  // Use online move history hook
  const moveHistoryPairs = useOnlineMoveHistory(moveHistory);

  // Board theme variables
  const boardVars = useMemo(
    () => ({
      "--board-light": savedTheme?.light ?? "#F0D9B5",
      "--board-dark": savedTheme?.dark ?? "#B58863",
      "--board-frame": savedTheme?.accent ?? "#E9B654",
      "--board-frame-2": "#363624",
    } as React.CSSProperties & Record<string, string>),
    [savedTheme]
  );

  const customPieces = useMemo(() => getCustomPieces(selectedBoardId), [selectedBoardId]);



  // Toggle auto rotate
  const handleToggleAutoRotate = () => {
    setAutoRotate(prev => {
      const next = !prev;
      if (next && gameState?.turn) {
        setBoardOrientation(gameState.turn === "w" ? "white" : "black");
      }
      return next;
    });
  };

  if (!mounted) return <p>Loading Chessboard...</p>;

  const currentTurn = (gameState?.turn as "w" | "b") ?? "w";
  const totalMove = moveHistory.length;

  // Check if game is over (either from server or timeout)
  const isGameOver = gameState?.gameOver || timeoutGameOver;

  // Determine if current player is the winner
  const determineIsWinner = (): boolean => {
    if (timeoutGameOver) {
      // Check timeout result for winner
      return timeoutResult?.includes(gameState?.playerColor === "white" ? "White" : "Black") ?? false;
    }

    const result = gameState?.result?.toLowerCase() || "";
    if (result.includes("draw") || result.includes("stalemate")) {
      return false;
    }

    // Check if the result mentions the player's color as winner
    const playerColor = gameState?.playerColor;
    if (playerColor === "white" && result.includes("white wins")) {
      return true;
    }
    if (playerColor === "black" && result.includes("black wins")) {
      return true;
    }

    return false;
  };

  const isPlayerWinner = determineIsWinner();

  // Set appropriate title based on whether THIS player won
  const gameOverTitle = (() => {
    if (timeoutGameOver) return "Time's Up!";
    if (!gameState?.result) return "Game Over";

    // Show Victory or Defeat based on player's perspective
    if (isPlayerWinner) return "Victory!";

    const result = gameState.result.toLowerCase();
    if (result.includes("draw") || result.includes("stalemate")) return "Draw";
    if (result.includes("wins")) return "Defeat";

    return gameState.result;
  })();

  const gameOverMessage = (() => {
    if (timeoutGameOver) {
      return timeoutResult;
    }

    if (!gameState?.result) return "The game has ended";

    // Always show the actual result as the message
    return gameState.result;
  })();

  // Determine if game is active for the UI
  const gameActive = !isGameOver && moveHistory.length > 0;

  return (
    <div className="fixed inset-0 h-screen w-full overflow-hidden flex bg-[#0A0A0A]">

      {/* Background with gold gradients - matching offline page */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          backgroundColor: "#0A0A0A",
          backgroundImage: `
            /* Top left/right */
            radial-gradient(65rem 40rem at 0% -15%, rgba(233,182,84,.65), transparent 60%),
            radial-gradient(65rem 40rem at 100% -15%, rgba(233,182,84,.65), transparent 60%),

            /* Body left/right + top center */
            radial-gradient(70rem 45rem at -10% 20%, rgba(233,182,84,.55), transparent 60%),
            radial-gradient(70rem 45rem at 110% 25%, rgba(233,182,84,.55), transparent 60%),
            radial-gradient(85rem 55rem at 50% -10%, rgba(233,182,84,.45), transparent 60%),

            /* Overall gold */
            radial-gradient(110rem 70rem at 50% 0%, rgba(233,182,84,.10), transparent 70%),

            /* Bottom right glow */
            radial-gradient(60rem 40rem at 115% 115%, rgba(233,182,84,.50), transparent 60%),

            /* Bottom right accent */
            radial-gradient(26rem 18rem at 100% 100%, rgba(233,182,84,.75), transparent 60%),

            /* Bottom vignette */
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

      {/* Sidebar Navigation */}
      <GameSidebar
        onLeaveGame={() => leaveGame()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center h-full pl-16 transition-all duration-300">
        {/* Opponent Disconnection Warning */}
        <OpponentDisconnectionWarning
          isDisconnected={opponentDisconnected && !isGameOver}
          message={disconnectionMessage}
        />

        {/* Connection Status Overlay - shows when reconnecting */}
        <ConnectionStatusOverlay status={connectionStatus} />

        <GameHeader
          isSinglePlayer={false}
          playerColor={(gameState?.playerColor === "white" ? "w" : "b") as "w" | "b"}
          aiLevel={1}
          autoRotateBoard={autoRotate}
          onToggleAutoRotate={handleToggleAutoRotate}
          onChangeGameMode={() => {
            leaveGame();
          }}
        />

        {/* Main Game Layout - Responsive (matching offline page) */}
        <div className="flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto flex-1 gap-6 px-4 lg:px-8 pb-8 justify-center items-stretch pt-2 min-h-0 overflow-y-auto lg:overflow-hidden">

          {/* Left Sidebar - Players & Captured */}
          <aside className="hidden lg:flex lg:flex-col lg:w-[320px] xl:w-[360px] gap-6 shrink-0">
            <div className="space-y-4">
                <PlayerSection
                  color="Black"
                  isCurrentTurn={currentTurn === "b"}
                  gameActive={gameActive}
                  elo={blackProfile.elo || 1200}
                  profileName={blackProfile.name || "Opponent"}
                  profileImage={blackProfile.image || undefined}
                  side="b"
                  timeLeft={gameState?.blackTimeLeft}
                />
                <PlayerSection
                  color="White"
                  isCurrentTurn={currentTurn === "w"}
                  gameActive={gameActive}
                  elo={whiteProfile.elo || 1200}
                  profileName={whiteProfile.name || "You"}
                  profileImage={whiteProfile.image || undefined}
                  side="w"
                  timeLeft={gameState?.whiteTimeLeft}
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
                position={gameState?.fen || "start"}
                onPieceDrop={handleDrop}
                onPieceClick={onPieceClick}
                onSquareClick={onSquareClick}
                onPieceDragBegin={onPieceDragBegin}
                boardWidth={Math.min(boardWidth, 700)}
                animationDuration={300}
                customSquareStyles={customSquareStyles}
                boardOrientation={boardOrientation}
                customPieces={customPieces}
              />
            </div>

            {/* Connection Status Badge */}
            <div className="mt-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
              <span className={`text-xs font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Game Controls - Matches Board Width */}
            <div className="mt-6 w-full flex justify-center" style={{ maxWidth: Math.min(boardWidth, 700) }}>
              <GameControls
                onNewGame={handleNewGame}
                onSurrender={handleSurrender}
                canUndo={false}
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
          <aside className="w-full lg:w-[320px] xl:w-[360px] flex flex-col gap-6 shrink-0 mt-8 lg:mt-0 overflow-hidden">
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

        {/* Game Over Dialog with Coin Rewards */}
        <GameOverDialog
          open={isGameOver}
          title={gameOverTitle}
          message={gameOverMessage}
          onNewGame={handleNewGame}
          eloUpdate={gameState?.eloUpdate}
          coinReward={isPlayerWinner ? gameState?.coinReward : undefined}
          isWinner={isPlayerWinner}
          isPvP={true}
          playerColor={gameState?.playerColor}
        />
      </div>
    </div>
  );
};

export default GamePage;