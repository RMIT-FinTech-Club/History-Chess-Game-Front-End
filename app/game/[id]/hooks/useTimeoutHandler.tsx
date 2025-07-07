import { useState, useEffect } from "react";
import { GameState } from "../types";

export const useTimeoutHandler = (gameState: GameState | null) => {
  const [timeoutGameOver, setTimeoutGameOver] = useState(false);
  const [timeoutResult, setTimeoutResult] = useState("");

  useEffect(() => {
    if (!gameState || gameState.gameOver || timeoutGameOver) return;

    const whiteTime = gameState.whiteTimeLeft || 0;
    const blackTime = gameState.blackTimeLeft || 0;

    if (whiteTime <= 0) {
      setTimeoutGameOver(true);
      setTimeoutResult("Black wins by timeout");
      console.log("White ran out of time");
    } else if (blackTime <= 0) {
      setTimeoutGameOver(true);
      setTimeoutResult("White wins by timeout");
      console.log("Black ran out of time");
    }
  }, [gameState?.whiteTimeLeft, gameState?.blackTimeLeft, gameState?.gameOver, timeoutGameOver]);

  const resetTimeout = () => {
    setTimeoutGameOver(false);
    setTimeoutResult("");
  };

  return {
    timeoutGameOver,
    timeoutResult,
    resetTimeout,
  };
};