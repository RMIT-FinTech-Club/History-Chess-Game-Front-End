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
  undoTime: (lastTurn: "w" | "b", isAiOpponent?: boolean) => void;
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
  
  // Track time history for every move with move index
  const timeHistoryRef = useRef<{moveIndex: number, white: number, black: number}[]>([
    { moveIndex: 0, white: initialTimeInSeconds, black: initialTimeInSeconds }
  ]);
  
  // Game clock state - start paused when a new game begins
  const [isPaused, setIsPaused] = useState(true);
  // Track if pause was done manually by user
  const manuallyPaused = useRef(false);
  
  // Track the last history length we've seen
  const lastHistoryLengthRef = useRef(0);
  
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
    
    // Reset time history
    timeHistoryRef.current = [
      { moveIndex: 0, white: initialTimeInSeconds, black: initialTimeInSeconds }
    ];
    lastHistoryLengthRef.current = 0;
    
    if (onTimerReset) {
      onTimerReset();
    }
  };
  
  // Store time state when a move is made
  useEffect(() => {
    if (!history) return;
    
    const currentHistoryLength = history.length;
    
    // Only update time history when a new move is made
    if (currentHistoryLength > lastHistoryLengthRef.current) {
      // Save current time state when a move is made
      timeHistoryRef.current.push({
        moveIndex: currentHistoryLength,
        white: whiteTimeInSeconds,
        black: blackTimeInSeconds
      });
      
      lastHistoryLengthRef.current = currentHistoryLength;
    }
  }, [history?.length, whiteTimeInSeconds, blackTimeInSeconds]);

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    reset: resetTimers,
    undoTime: (lastTurn: "w" | "b", isAiOpponent = false) => {
      if (!history) return;
      
      // Get the current history length
      const currentHistoryLength = history.length;
      
      if (currentHistoryLength === 0) return;
      
      // Find the time state from before the last move
      let entryToRestore;
      
      if (isAiOpponent) {
        // In single player mode, go back 2 moves if possible (player move + AI response)
        // or just 1 if we're at the beginning
        const targetIndex = Math.max(0, currentHistoryLength - 2);
        
        // Find the entry with that move index
        entryToRestore = timeHistoryRef.current.find(entry => 
          entry.moveIndex === targetIndex
        );
      } else {
        // In two player mode, just go back 1 move
        const targetIndex = currentHistoryLength - 1;
        
        // Find the entry with that move index
        entryToRestore = timeHistoryRef.current.find(entry => 
          entry.moveIndex === targetIndex
        );
      }
      
      // If we found a valid entry, restore the times
      if (entryToRestore) {
        setWhiteTimeInSeconds(entryToRestore.white);
        setBlackTimeInSeconds(entryToRestore.black);
        
        // Remove all entries after the one we restored
        timeHistoryRef.current = timeHistoryRef.current.filter(
          entry => entry.moveIndex <= entryToRestore!.moveIndex
        );
        
        // Update the last history length
        lastHistoryLengthRef.current = entryToRestore.moveIndex;
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