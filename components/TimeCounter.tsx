"use client";

import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Button } from "./ui/button";
import { PauseIcon, PlayIcon, SkipBackIcon } from "lucide-react";

interface TimeCounterProps {
  initialTimeInSeconds?: number;
  currentTurn: "w" | "b";
  gameActive: boolean;
  isGameOver: boolean;
  onTimerReset?: () => void;
  history?: string[]; // Add history prop
}

export interface TimeCounterHandle {
  reset: () => void;
  undoTime: (lastTurn: "w" | "b") => void;
}

export const TimeCounter = forwardRef<TimeCounterHandle, TimeCounterProps>(({
  initialTimeInSeconds = 600, // 10 minutes default
  currentTurn,
  gameActive,
  isGameOver,
  onTimerReset,
  history,
}, ref) => {
  // Track time for both players
  const [whiteTimeInSeconds, setWhiteTimeInSeconds] = useState(initialTimeInSeconds);
  const [blackTimeInSeconds, setBlackTimeInSeconds] = useState(initialTimeInSeconds);
  
  // Track last move timestamps for accurate undo
  const lastMoveTimeRef = useRef<{[key: string]: number}>({
    w: initialTimeInSeconds,
    b: initialTimeInSeconds
  });
  
  // Game clock state - start paused when a new game begins
  const [isPaused, setIsPaused] = useState(true);
  
  // Start timer automatically after the first move
  useEffect(() => {
    if (gameActive && history && history.length > 0 && isPaused) {
      setIsPaused(false);
    }
  }, [gameActive, history, isPaused]);
  
  // Format seconds into MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Reset timers to initial value
  const resetTimers = () => {
    setWhiteTimeInSeconds(initialTimeInSeconds);
    setBlackTimeInSeconds(initialTimeInSeconds);
    setIsPaused(true); // Start paused when resetting
    lastMoveTimeRef.current = {
      w: initialTimeInSeconds,
      b: initialTimeInSeconds
    };
    if (onTimerReset) {
      onTimerReset();
    }
  };
  
  // Save current time whenever it changes
  useEffect(() => {
    if (currentTurn === "w") {
      lastMoveTimeRef.current.b = blackTimeInSeconds;
    } else {
      lastMoveTimeRef.current.w = whiteTimeInSeconds;
    }
  }, [whiteTimeInSeconds, blackTimeInSeconds, currentTurn]);
  
  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    reset: resetTimers,
    undoTime: (lastTurn: "w" | "b") => {
      // When undoing a move, restore the previous time value from before the move
      if (lastTurn === "w") {
        setWhiteTimeInSeconds(lastMoveTimeRef.current.w);
      } else {
        setBlackTimeInSeconds(lastMoveTimeRef.current.b);
      }
    }
  }));

  // Timer effect - decrements the time of the current player when it's their turn
  useEffect(() => {
    if (isGameOver || isPaused || !gameActive) {
      return; // Don't run timer if game is over, paused, or not active
    }
    
    const timer = setInterval(() => {
      if (currentTurn === "w") {
        setWhiteTimeInSeconds((prev) => Math.max(0, prev - 1));
      } else {
        setBlackTimeInSeconds((prev) => Math.max(0, prev - 1));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentTurn, isPaused, gameActive, isGameOver]);
  
  // Check for time out (when a player's time reaches zero)
  useEffect(() => {
    if (whiteTimeInSeconds === 0 || blackTimeInSeconds === 0) {
      // You can add a callback here for when a player runs out of time
      // For now, we'll just pause the timers
      setIsPaused(true);
    }
  }, [whiteTimeInSeconds, blackTimeInSeconds]);

  return (
    <div className="flex flex-col space-y-2 w-full bg-[#3B3433] p-4 rounded-md text-white">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <div className={`flex items-center gap-2 ${currentTurn === "w" && !isPaused && gameActive ? "text-[#F7D27F] font-bold" : ""}`}>
            <span className="w-20">White:</span>
            <span className={`font-mono ${whiteTimeInSeconds < 60 ? "text-red-500" : ""}`}>
              {formatTime(whiteTimeInSeconds)}
            </span>
            {currentTurn === "w" && !isPaused && gameActive && (
              <span className="animate-pulse">●</span>
            )}
          </div>
          <div className={`flex items-center gap-2 ${currentTurn === "b" && !isPaused && gameActive ? "text-[#F7D27F] font-bold" : ""}`}>
            <span className="w-20">Black:</span>
            <span className={`font-mono ${blackTimeInSeconds < 60 ? "text-red-500" : ""}`}>
              {formatTime(blackTimeInSeconds)}
            </span>
            {currentTurn === "b" && !isPaused && gameActive && (
              <span className="animate-pulse">●</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            disabled={isGameOver || !gameActive}
            className="hover:text-[#F7D27F] text-white border-white"
          >
            {isPaused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetTimers}
            className="hover:text-[#F7D27F] text-white border-white"
          >
            <SkipBackIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
});

// Add displayName to fix ESLint warning
TimeCounter.displayName = 'TimeCounter';