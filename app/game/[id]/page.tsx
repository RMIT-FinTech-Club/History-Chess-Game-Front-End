"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Square } from "chess.js";
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

// Import components
import { ConnectionStatus } from "./components/ConnectionStatus";
import { GameLayout } from "./components/GameLayout";
import { GameOverDialog } from "./components/GameOverDialog";
import { OpponentDisconnectionWarning } from "./components/OpponentDisconnectionWarning";
import { GameHeader } from "./components/GameHeader";

const GamePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [mounted, setMounted] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [savedTheme, setSavedTheme] = useState<{light?: string; dark?: string} | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  // Get userId from GlobalStorage
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    try {
      const s = localStorage.getItem("chessTheme");
      if (s) setSavedTheme(JSON.parse(s));
    } catch {}
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
    socket,
    isConnected,
    opponentDisconnected,
    disconnectionMessage,
    sendMove,  // Get sendMove from socket
    leaveGame
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

  useEffect(() => {
    if (!autoRotate) return;
    if (!gameState?.turn) return;
    setBoardOrientation(gameState.turn === "w" ? "white" : "black");
  }, [autoRotate, gameState?.turn, setBoardOrientation]);

  // Use online move history hook
  const moveHistoryPairs = useOnlineMoveHistory(moveHistory);
  const boardVars = useMemo(
    () => ({
      ["--board-light" as any]: savedTheme?.light ?? "#F0D9B5",
      ["--board-dark" as any]: savedTheme?.dark ?? "#B58863",
      ["--board-frame" as any]: "#E9B654",
      ["--board-frame-2" as any]: "#363624",
    }) as React.CSSProperties,
    [savedTheme]
  );
  // Convert time from milliseconds to seconds
  const formatTimeInSeconds = (ms?: number) => {
    if (typeof ms !== "number") return 0;
    return Math.floor(ms / 1000);
  };

  if (!mounted) return <p>Loading Chessboard...</p>;
  
  const isCurrentPlayerTurn = gameState?.turn === "w"
    ? gameState?.playerColor === "white"
    : gameState?.playerColor === "black";

  const handleToggleAutoRotate = () => {
    setAutoRotate(prev => {
      const next = !prev;
      if (next && gameState?.turn) {
        setBoardOrientation(gameState.turn === "w" ? "white" : "black");
      }
      return next;
    });
  };
  // Check if game is over (either from server or timeout)
  const isGameOver = gameState?.gameOver || timeoutGameOver;
  const gameOverTitle = timeoutGameOver ? "Time's Up!" : (gameState?.result || "Game Over");
  const gameOverMessage = (() => {
    if (timeoutGameOver) {
      return timeoutResult;
    }

    if (!gameState?.result) return "The game has ended";

    // Check if the result contains winner information
    if (gameState.result.includes("wins")) {
      return gameState.result;
    } else if (gameState.result.includes("draw")) {
      return "The game ended in a draw";
    } else if (gameState.result.includes("checkmate")) {
      return gameState.result;
    } else if (gameState.result.includes("stalemate")) {
      return "The game ended in stalemate";
    } else if (gameState.result.includes("timeout")) {
      return gameState.result;
    }

    return gameState.result;
  })();

  return (
    <div className="min-h-screen flex flex-col items-center w-full py-5 px-2 md:px-4" style={boardVars}>
      <YellowLight top={'30vh'} left={'55vw'} />

      {/* Opponent Disconnection Warning */}
      <OpponentDisconnectionWarning
        isDisconnected={opponentDisconnected && !isGameOver}
        message={disconnectionMessage}
      />
      <GameHeader
        isSinglePlayer={false}
        playerColor={(gameState?.playerColor === "white" ? "w" : "b") as "w" | "b"}
        isThinking={false}
        autoRotateBoard={autoRotate}
        onToggleAutoRotate={handleToggleAutoRotate}
        onChangeGameMode={() => {
          leaveGame();
        }}
        isConnected={isConnected}
        elo={gameState?.playerColor === "white" ? (whiteProfile.elo || 0) : (blackProfile.elo || 0)}
      />

      {/* Main Game Layout */}
      <GameLayout
        boardOrientation={boardOrientation}
        capturedWhite={capturedWhite}
        capturedBlack={capturedBlack}
        gameState={gameState}
        whiteProfile={{
          name: whiteProfile.name,
          image: whiteProfile.image,
          elo: whiteProfile.elo || 0
        }}
        blackProfile={{
          name: blackProfile.name,
          image: blackProfile.image,
          elo: blackProfile.elo || 0
        }}
        formatTimeInSeconds={formatTimeInSeconds}
        handleDrop={handleDrop}
        onPieceClick={onPieceClick}
        onSquareClick={onSquareClick}
        onPieceDragBegin={onPieceDragBegin}
        boardWidth={boardWidth}
        customSquareStyles={customSquareStyles}
        isCurrentPlayerTurn={isCurrentPlayerTurn}
        moveHistoryPairs={moveHistoryPairs}
        handleNewGame={handleNewGame}
        currentTurn={(gameState?.turn as "w" | "b") ?? "w"}
        totalMove={moveHistory.length}
      />

      {/* Game Over Dialog */}
      <GameOverDialog
        open={isGameOver}
        title={gameOverTitle}
        message={gameOverMessage}
        onNewGame={handleNewGame}
        eloUpdate={gameState?.eloUpdate}
      />
    </div>
  );
};

export default GamePage;