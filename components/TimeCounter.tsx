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

export const TimeCounter = forwardRef<TimeCounterHandle, TimeCounterProps> (({
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

  // Store move history times to properly restore on undo
  const moveTimesRef = useRef<{white: number[], black: number[]}>({
    white: [initialTimeInSeconds],
    black: [initialTimeInSeconds]
  });
  
  // Game clock state - start paused when a new game begins
  const [isPaused, setIsPaused] = useState(true);
  // Track if pause was done manually by user
  const manuallyPaused = useRef(false);
  
  // Start timer automatically after the first move
  useEffect(() => {
    if (gameActive && history && history.length > 0 && isPaused && !manuallyPaused.current) {
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
    manuallyPaused.current = false; // Reset manual pause flag
    lastMoveTimeRef.current = {
      w: initialTimeInSeconds,
      b: initialTimeInSeconds
    };
    // Reset move history times
    moveTimesRef.current = {
      white: [initialTimeInSeconds],
      black: [initialTimeInSeconds]
    };
    if (onTimerReset) {
      onTimerReset();
    }
  };
  
  // Store time state when a move is made (separate from time updates)
  useEffect(() => {
    if (history && history.length > 0) {
      // Only update the move times array when history changes
      if (currentTurn === "w") {
        // Black just moved, record black's remaining time
        moveTimesRef.current.black.push(blackTimeInSeconds);
        lastMoveTimeRef.current.b = blackTimeInSeconds;
      } else {
        // White just moved, record white's remaining time
        moveTimesRef.current.white.push(whiteTimeInSeconds);
        lastMoveTimeRef.current.w = whiteTimeInSeconds;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history?.length, currentTurn]);

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    reset: resetTimers,
    undoTime: (lastTurn: "w" | "b") => {
      // When undoing a move, restore the time from before that move was made
      if (lastTurn === "w") {
        // Last move was by white, restore white's time from history
        if (moveTimesRef.current.white.length > 1) {
          const previousTime = moveTimesRef.current.white[moveTimesRef.current.white.length - 2];
          setWhiteTimeInSeconds(previousTime);
          // Remove the most recent time entry
          moveTimesRef.current.white.pop();
        }
      } else {
        // Last move was by black, restore black's time from history
        if (moveTimesRef.current.black.length > 1) {
          const previousTime = moveTimesRef.current.black[moveTimesRef.current.black.length - 2];
          setBlackTimeInSeconds(previousTime);
          // Remove the most recent time entry
          moveTimesRef.current.black.pop();
        }
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
    <div className="flex flex-col w-full bg-[#3B3433] py-2 px-5 rounded-lg text-white shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-2">
          <div className={`flex items-center gap-3 ${currentTurn === "w" && !isPaused && gameActive ? "text-[#F7D27F] font-bold" : ""}`}>
            <span className="w-24 text-sm">White:</span>
            <span className={`font-mono text-base ${whiteTimeInSeconds < 60 ? "text-red-500" : ""}`}>
              {formatTime(whiteTimeInSeconds)}
            </span>
            {currentTurn === "w" && !isPaused && gameActive && (
              <span className="animate-pulse ml-1">●</span>
            )}
          </div>
          <div className={`flex items-center gap-3 ${currentTurn === "b" && !isPaused && gameActive ? "text-[#F7D27F] font-bold" : ""}`}>
            <span className="w-24 text-sm">Black:</span>
            <span className={`font-mono text-base ${blackTimeInSeconds < 60 ? "text-red-500" : ""}`}>
              {formatTime(blackTimeInSeconds)}
            </span>
            {currentTurn === "b" && !isPaused && gameActive && (
              <span className="animate-pulse ml-1">●</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setIsPaused(!isPaused);
              manuallyPaused.current = !isPaused; // Set flag when manually pausing
            }}
            disabled={isGameOver || !gameActive}
            className="hover:text-[#F7D27F] text-white border-white px-3 py-1"
          >
            {isPaused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetTimers}
            className="hover:text-[#F7D27F] text-white border-white px-3 py-1"
          >
            <SkipBackIcon size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
});

// Add displayName to fix ESLint warning
TimeCounter.displayName = 'TimeCounter';