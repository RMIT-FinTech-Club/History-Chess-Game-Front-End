"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { Button } from "@/components/ui/button";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import { toast } from "sonner";
import "@/css/chessboard.css";
import YellowLight from "@/components/ui/YellowLight";

interface TimeControlOption {
  label: string;
  value: string;
  time: number;
  increment?: number;
}

const timeControls = {
  bullet: [
    { label: "Bullet", value: "bullet", time: 60 },
  ],
  blitz: [
    { label: "Blitz", value: "blitz", time: 180 },
    ],
  rapid: [
    { label: "Rapid", value: "rapid", time: 600 },
  ],
};

const OnlinePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState("");
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControlOption>(
    timeControls.blitz[0] 
  );
  const [isSearching, setIsSearching] = useState(false);

  // Check if there's a gameId in URL params to join directly
  const gameIdFromUrl = searchParams.get("gameId");

  const { 
    findMatch, 
    joinGame, 
    isConnected, 
    gameId, 
    gameState, 
    message 
  } = useOnlineGame({ userId });

  // Load userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("chess_user_id");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Prompt for user ID if not found
      const newUserId = prompt("Please enter your User ID:");
      if (newUserId) {
        setUserId(newUserId);
        localStorage.setItem("chess_user_id", newUserId);
      }
    }
  }, []);

  // Auto-join game if gameId in URL
  useEffect(() => {
    if (gameIdFromUrl && userId && isConnected) {
      joinGame(gameIdFromUrl);
    }
  }, [gameIdFromUrl, userId, isConnected, joinGame]);

  // Redirect to play page when game is active
  useEffect(() => {
    if (gameId && gameState) {
      router.push(`/game/online/play?gameId=${gameId}`);
    }
  }, [gameId, gameState, router]);

  const handleFindMatch = useCallback(async () => {
    if (!userId) {
      toast.error("Please provide a User ID first");
      return;
    }

    if (!isConnected) {
      toast.error("Not connected to server");
      return;
    }

    setIsSearching(true);
    
    try {
      await findMatch(selectedTimeControl.value, "random");
      toast.success("Searching for match...");
    } catch {
      toast.error("Failed to start matchmaking");
      setIsSearching(false);
    }
  }, [userId, isConnected, selectedTimeControl, findMatch]);

  const TimeControlButton: React.FC<{ 
    option: TimeControlOption; 
    isSelected: boolean; 
    onClick: () => void;
  }> = ({ option, isSelected, onClick }) => (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`h-12 min-w-[80px] text-sm font-medium transition-all ${
        isSelected 
          ? "bg-[#F7D27F] text-black hover:bg-[#E6C26E] border-[#F7D27F]" 
          : "bg-[#3B3433] text-white border-[#5A524F] hover:bg-[#4A4443] hover:border-[#F7D27F]"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        {option.label}
      </div>
    </Button>
  );

  // Show loading if joining from URL
  if (gameIdFromUrl && !gameState) {
    return (
      <div className="h-[calc(100dvh-var(--navbar-height))] bg-gradient-to-br from-[#2C2420] via-[#3D3025] to-[#4A3728] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F7D27F] mx-auto mb-4"></div>
          <div className="text-lg font-semibold">Joining game...</div>
          <div className="text-sm opacity-75">Game ID: {gameIdFromUrl}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-var(--navbar-height))] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 items-center">
        <YellowLight top="20%" left="60%" />
        
        {/* Chessboard Section */}
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <Chessboard
              id="historyChessBoard"
              position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              boardWidth={Math.min(600, typeof window !== 'undefined' ? window.innerWidth : 500)}
              animationDuration={0}
              arePiecesDraggable={false}
            />
            {isSearching && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F7D27F] mx-auto mb-4"></div>
                  <div className="text-lg font-semibold">Finding Match...</div>
                  <div className="text-sm opacity-75">Please wait</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex-1 max-w-md w-full">
          <div className="bg-[#3B3433] rounded-2xl p-8 border border-[#5A524F]">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                PLAY ONLINE MODE
              </h1>
              <div className="flex items-center justify-center gap-2 text-[#F7D27F]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-lg font-semibold">
                  {selectedTimeControl.time >= 600 ? Math.floor(selectedTimeControl.time / 60) + " MINS" : 
                   selectedTimeControl.increment ? `${Math.floor(selectedTimeControl.time / 60)}|${selectedTimeControl.increment}` : 
                   Math.floor(selectedTimeControl.time / 60) + " MINS"}
                </span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* User ID Input */}
            {!userId && (
              <div className="mb-6">
                <label className="text-white font-semibold mb-2 block">Enter User ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Your User ID"
                    className="flex-1 px-3 py-2 bg-[#3B3433] border border-[#5A524F] rounded text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        if (value) {
                          setUserId(value);
                          localStorage.setItem("chess_user_id", value);
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const input = document.querySelector('input') as HTMLInputElement;
                      if (input?.value) {
                        setUserId(input.value);
                        localStorage.setItem("chess_user_id", input.value);
                      }
                    }}
                    className="bg-[#F7D27F] text-black hover:bg-[#E6C26E]"
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Time Control Categories */}
            <div className="space-y-6">
              
              {/* Bullet Mode */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-lg">Bullet Mode</h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeControls.bullet.map((option) => (
                    <TimeControlButton
                      key={option.value}
                      option={option}
                      isSelected={selectedTimeControl.value === option.value}
                      onClick={() => setSelectedTimeControl(option)}
                    />
                  ))}
                </div>
              </div>

              {/* Blitz Mode */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-lg">Blitz Mode</h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeControls.blitz.map((option) => (
                    <TimeControlButton
                      key={option.value}
                      option={option}
                      isSelected={selectedTimeControl.value === option.value}
                      onClick={() => setSelectedTimeControl(option)}
                    />
                  ))}
                </div>
              </div>

              {/* Rapid Mode */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-lg">Rapid Mode</h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeControls.rapid.map((option) => (
                    <TimeControlButton
                      key={option.value}
                      option={option}
                      isSelected={selectedTimeControl.value === option.value}
                      onClick={() => setSelectedTimeControl(option)}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Play Button */}
            <div className="mt-8">
              <Button
                onClick={handleFindMatch}
                disabled={!isConnected || isSearching || !userId}
                className="w-full h-16 text-2xl font-bold bg-[#F7D27F] text-black hover:bg-[#E6C26E] transition-all duration-200 rounded-xl shadow-lg"
              >
                {isSearching ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                    SEARCHING...
                  </div>
                ) : (
                  "PLAY"
                )}
              </Button>
              
              {!isConnected && (
                <div className="text-center mt-3">
                  <span className="text-red-400 text-sm">Disconnected from server</span>
                </div>
              )}
              
              {message && (
                <div className="text-center mt-3">
                  <span className="text-[#F7D27F] text-sm">{message}</span>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OnlinePage;