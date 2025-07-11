"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chessboard } from "react-chessboard";
import "@/css/chessboard.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CapturedPieces } from "@/components/CapturedPieces";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import YellowLight from "@/components/ui/YellowLight";

function formatTime(ms?: number) {
  if (typeof ms !== "number") return "10:00";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

const OnlineGamePlayPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState("");

  // Get gameId from URL params
  const gameIdFromUrl = searchParams.get("gameId");

  const {
    gameState,
    isConnected,
    gameId,
    message,
    setMessage,
    joinGame,
    sendMove,
    leaveGame, // Add this
    rejoinGame,
    reconnectAttempts,
    wasInGame,
  } = useOnlineGame({ userId });

  // Load userId and join game
  useEffect(() => {
    const storedUserId = localStorage.getItem("chess_user_id");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      router.push("/game/online");
      return;
    }
  }, [router]);

  // Separate effect to join game when both userId and connection are ready
  useEffect(() => {
    if (gameIdFromUrl && userId && isConnected) {
      joinGame(gameIdFromUrl);
    }
  }, [gameIdFromUrl, userId, isConnected, joinGame]);

  // Redirect if no game
  useEffect(() => {
    if (!gameIdFromUrl && !gameId) {
      router.push("/game/online");
    }
  }, [gameIdFromUrl, gameId, router]);

  const boardOrientation = useMemo<"white" | "black">(() => {
    if (gameState?.players && userId) {
      const idx = gameState.players.indexOf(userId);
      return idx === 1 ? "black" : "white";
    }
    return "white";
  }, [gameState?.players, userId]);

  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);

  useEffect(() => {
    setCapturedWhite([]);
    setCapturedBlack([]);
  }, [gameState?.fen]);

  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!gameState || gameState.gameOver) return false;
      
      const isWhiteTurn = gameState.turn === "w";
      const isPlayerWhite = gameState.players && gameState.players[0] === userId;
      
      if ((isWhiteTurn && !isPlayerWhite) || (!isWhiteTurn && isPlayerWhite)) {
        toast.error("Not your turn", { duration: 1000 });
        return false;
      }
      
      const move = `${sourceSquare}${targetSquare}`;
      sendMove(move);
      return true;
    },
    [gameState, userId, sendMove]
  );

  const handleLeaveGame = useCallback(() => {
    // Show confirmation dialog
    const confirmLeave = window.confirm(
      "Are you sure you want to leave the game? This will count as a forfeit and your opponent will win."
    );
    
    if (confirmLeave) {
      leaveGame();
      // Don't redirect immediately - wait for the gameOver event
    }
  }, [leaveGame]);

  // Auto-redirect to lobby when game ends and user leaves
  useEffect(() => {
    if (gameState?.gameOver && !gameId) {
      const timer = setTimeout(() => {
        router.push("/game/online");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState?.gameOver, gameId, router]);

  const moveHistory = gameState?.moves || [];

  // Format move history to match offline page style
  const moveHistoryPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      const whiteMove = moveHistory[i];
      const blackMove = moveHistory[i + 1];
      
      pairs.push({
        turn: Math.floor(i / 2) + 1,
        whiteMove: whiteMove?.move || "",
        blackMove: blackMove?.move || "",
        whiteTime: "-", // Online games don't track per-move timing
        blackTime: "-",
      });
    }
    return pairs;
  }, [moveHistory]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F7D27F] mx-auto mb-4"></div>
          <div className="text-lg">Loading game...</div>
        </div>
      </div>
    );
  }

  // Determine current turn for styling
  const currentTurn = gameState.turn;
  const whiteTimeMs = gameState.whiteTimeLeft || 0;
  const blackTimeMs = gameState.blackTimeLeft || 0;
  const whiteTimeSeconds = Math.floor(whiteTimeMs / 1000);
  const blackTimeSeconds = Math.floor(blackTimeMs / 1000);

  return (
    <div className="min-h-screen p-4">
      <YellowLight top="20%" left="60%" />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleLeaveGame}
              variant="outline"
              className="text-white border-white hover:text-[#F7D27F] hover:border-[#F7D27F]"
              disabled={gameState?.gameOver} // Disable if game is already over
            >
              ← {gameState?.gameOver ? "Game Ended" : "Leave Game"}
            </Button>
            <span className="text-white font-medium">
              Game ID: {gameId || gameIdFromUrl}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-white text-sm">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Board Section */}
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-4">
              <CapturedPieces color="Black" pieces={capturedBlack} />
            </div>
            
            <div className="mb-4">
              <Chessboard
                id="historyChessBoard"
                position={gameState?.fen || ""}
                onPieceDrop={handleDrop}
                boardWidth={Math.min(600, typeof window !== 'undefined' ? window.innerWidth - 100 : 500)}
                animationDuration={300}
                boardOrientation={boardOrientation}
                arePiecesDraggable={!!userId && !!gameId && !gameState?.gameOver}
              />
            </div>
            
            <div>
              <CapturedPieces color="White" pieces={capturedWhite} />
            </div>
          </div>

          {/* Game Info Section */}
          <div className="w-full space-y-4 flex flex-col self-center">
            
            {/* Timer - Updated to match offline design */}
            <div className="flex flex-col mb-4">
              <h2 className="text-white text-sm font-semibold px-2 mb-2">
                Time Remaining
              </h2>
              <div className="flex flex-col w-full bg-[#3B3433] py-2 px-3 sm:px-5 rounded-lg text-white shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col space-y-2">
                    <div className={`flex items-center gap-2 sm:gap-3 ${currentTurn === "w" && !gameState?.gameOver ? "text-[#F7D27F] font-bold" : ""}`}>
                      <span className="w-16 sm:w-24 text-xs sm:text-sm">White:</span>
                      <span className={`font-mono text-sm sm:text-base ${whiteTimeSeconds < 60 ? "text-red-500" : ""}`}>
                        {formatTime(whiteTimeMs)}
                      </span>
                      {currentTurn === "w" && !gameState?.gameOver && (
                        <span className="animate-pulse ml-1">●</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 sm:gap-3 ${currentTurn === "b" && !gameState?.gameOver ? "text-[#F7D27F] font-bold" : ""}`}>
                      <span className="w-16 sm:w-24 text-xs sm:text-sm">Black:</span>
                      <span className={`font-mono text-sm sm:text-base ${blackTimeSeconds < 60 ? "text-red-500" : ""}`}>
                        {formatTime(blackTimeMs)}
                      </span>
                      {currentTurn === "b" && !gameState?.gameOver && (
                        <span className="animate-pulse ml-1">●</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Move History - Updated to match offline design */}
            <div className="flex flex-col flex-grow overflow-hidden">
              <h3 className="text-white text-sm font-semibold px-2 mb-2">
                Move History
              </h3>
              <div className="rounded shadow-md bg-[#3B3433] h-96 w-full">
                <ScrollArea className="h-full w-full">
                  <table className="w-full text-white">
                    <thead className="sticky top-0 z-10 bg-[#3B3433]">
                      <tr>
                        <th className="py-2 px-2 sm:px-5 text-left text-xs sm:text-sm font-semibold">
                          Turn
                        </th>
                        <th className="py-2 px-2 sm:px-5 text-left text-xs sm:text-sm font-semibold">
                          White
                        </th>
                        <th className="py-2 px-2 sm:px-5 text-left text-xs sm:text-sm font-semibold">
                          Black
                        </th>
                        <th className="py-2 px-2 sm:px-5 text-right text-xs sm:text-sm font-semibold">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {moveHistoryPairs.map((pair) => (
                        <tr key={pair.turn} className="hover:bg-[#4A4443] transition-colors duration-200">
                          <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">{pair.turn}.</td>
                          <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">{pair.whiteMove}</td>
                          <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">{pair.blackMove}</td>
                          <td className="py-2 px-2 sm:px-5 text-xs">
                            <div className="text-center">-</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameState?.gameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2C2420] rounded-lg p-6 border border-[#5A524F] max-w-md w-full mx-4">
            <h2 className="text-white text-xl font-bold mb-4">Game Over</h2>
            <p className="text-gray-300 mb-4">
              {gameState.result || "Game ended."}
            </p>
            
            {/* Show ELO changes if available */}
            {gameState.eloUpdate && (
              <div className="bg-[#3D3025] rounded p-3 mb-4">
                <p className="text-[#F7D27F] text-sm font-medium mb-2">Rating Changes:</p>
                {Object.entries(gameState.eloUpdate).map(([playerId, change]) => (
                  <div key={playerId} className="text-white text-sm">
                    {playerId === userId ? "You" : "Opponent"}: 
                    <span className={Number(change) > 0 ? "text-green-400 ml-2" : "text-red-400 ml-2"}>
                      {Number(change) > 0 ? "+" : ""}{Number(change)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={() => router.push("/game/online")}
                className="flex-1 bg-[#F7D27F] text-black hover:bg-[#E6C26E]"
              >
                Back to Lobby
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-[#2C2420] border border-[#5A524F] rounded-lg p-4 max-w-sm">
          <p className="text-white mb-2">{message}</p>
          <Button 
            onClick={() => setMessage("")}
            size="sm"
            variant="outline"
            className="text-white border-[#5A524F]"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Reconnection UI feedback */}
      {!isConnected && wasInGame && (
        <div className="fixed top-4 right-4 bg-yellow-600 text-white p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Reconnecting... (Attempt {reconnectAttempts})</span>
          </div>
          <Button 
            onClick={() => rejoinGame()}
            size="sm"
            className="mt-2 w-full"
          >
            Manual Rejoin
          </Button>
        </div>
      )}

    </div>
  );
};

export default OnlineGamePlayPage;