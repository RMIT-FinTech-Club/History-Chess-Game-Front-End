"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import "@/css/chessboard.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CapturedPieces } from "@/components/CapturedPieces";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOnlineGame } from "@/hooks/useOnlineGame";

function formatTime(ms?: number) {
  if (typeof ms !== "number") return "-";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

const OnlineGamePage: React.FC = () => {
  // User/game state
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [gameIdInput, setGameIdInput] = useState("");
  const [moveInput, setMoveInput] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  // Online game hook
  const {
    gameState,
    isConnected,
    gameId,
    message,
    setMessage,
    opponentId,
    setOpponentId,
    gameLink,
    joinGame,
    sendMove,
    createGame,
    findMatch,
    challengeUser,
  } = useOnlineGame({ userId });

  // Board orientation: show from player's color if possible
  const boardOrientation = useMemo<"white" | "black">(() => {
    if (gameState?.players && userId) {
      const idx = gameState.players.indexOf(userId);
      return idx === 1 ? "black" : "white";
    }
    return "white";
  }, [gameState?.players, userId]);

  // Captured pieces (simple, based on FEN diff)
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);

  useEffect(() => {
    // Reset captured pieces on new game
    setCapturedWhite([]);
    setCapturedBlack([]);
  }, [gameState?.fen]);

  // Chessboard move handler
  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!gameState || gameState.gameOver) return false;
      // Only allow move if it's your turn
      const isWhiteTurn = gameState.turn === "w";
      const isPlayerWhite =
        gameState.players && gameState.players[0] === userId;
      if (
        (isWhiteTurn && !isPlayerWhite) ||
        (!isWhiteTurn && isPlayerWhite)
      ) {
        toast.error("Not your turn", { duration: 1000 });
        return false;
      }
      // Send move in UCI format (e.g., "e2e4")
      const move = `${sourceSquare}${targetSquare}`;
      sendMove(move);
      return true;
    },
    [gameState, userId, sendMove]
  );

  // Manual move input (for debugging or SAN moves)
  const handleManualMove = () => {
    if (!moveInput) return;
    sendMove(moveInput);
    setMoveInput("");
  };

  // Move history rendering
  const moveHistory = gameState?.moves || [];

  return (
    <div className="flex flex-col items-center w-full py-1 px-2 md:px-4 justify-between">
      <h1 className="text-xl sm:text-2xl mb-2">Online Chess Game</h1>
      <div className="w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 p-2">
          <span className="text-sm sm:text-base font-medium text-white">
            {gameId ? `Game ID: ${gameId}` : "No game joined"}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
              title={isConnected ? "Connected" : "Disconnected"}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOptions((v) => !v)}
              className="text-xs sm:text-sm text-white border-white hover:text-[#F7D27F]"
            >
              {showOptions ? "Hide" : "Game Options"}
            </Button>
          </div>
        </div>
      </div>
      {showOptions && (
        <div className="w-full max-w-2xl bg-[#222] rounded p-4 mb-4">
          <div className="mb-2">
            <input
              type="text"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />
            <input
              type="text"
              placeholder="Username (optional)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />
            <input
              type="text"
              placeholder="Game ID"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />
            <Button
              onClick={() => {
                joinGame(gameIdInput);
                setShowOptions(false);
              }}
              className="bg-teal-500 text-white p-2 rounded hover:bg-teal-600 w-full mb-2"
            >
              Join Game
            </Button>
            <Button
              onClick={() => {
                createGame("blitz", "random");
                setShowOptions(false);
              }}
              className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600 w-full mb-2"
            >
              Create Game
            </Button>
            <Button
              onClick={() => {
                findMatch("blitz", "random");
                setShowOptions(false);
              }}
              className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600 w-full mb-2"
            >
              Find Match
            </Button>
            <input
              type="text"
              placeholder="Opponent ID"
              value={opponentId}
              onChange={(e) => setOpponentId(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />
            <Button
              onClick={() => {
                challengeUser(opponentId, "blitz", "random");
                setShowOptions(false);
              }}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 w-full"
            >
              Challenge User
            </Button>
            {gameLink && (
              <p className="mt-2 text-blue-600">
                Game Link:{" "}
                <a href={gameLink} target="_blank" rel="noopener noreferrer">
                  {gameLink}
                </a>
              </p>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-3 w-full max-w-7xl flex-1 max-h-[calc(100vh-150px)]">
        <div className="flex flex-col justify-between w-full">
          <div className="flex justify-center md:justify-start">
            <CapturedPieces color="Black" pieces={capturedBlack} />
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex justify-center items-center">
              <Chessboard
                id="historyChessBoard"
                position={gameState?.fen || ""}
                onPieceDrop={handleDrop}
                boardWidth={480}
                animationDuration={300}
                boardOrientation={boardOrientation}
                arePiecesDraggable={!!userId && !!gameId && !gameState?.gameOver}
              />
            </div>
            <div className="md:hidden flex justify-center md:justify-start">
              <CapturedPieces color="White" pieces={capturedWhite} />
            </div>
            <div className="w-full text-black flex flex-col flex-wrap justify-between gap-3">
              <div>
                <h2 className="text-white text-sm font-semibold px-2">
                  Time Remaining
                </h2>
                <div className="rounded shadow-md bg-[#3B3433] p-2">
                  <div className="flex justify-between">
                    <span className="text-white">
                      White: {formatTime(gameState?.whiteTimeLeft)}
                    </span>
                    <span className="text-white">
                      Black: {formatTime(gameState?.blackTimeLeft)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col flex-grow overflow-hidden">
                <h3 className="text-white text-sm font-semibold px-2">
                  Move History
                </h3>
                <div className="rounded shadow-md bg-[#3B3433] h-96 w-full">
                  <ScrollArea className="h-full w-full">
                    <table className="w-full text-white">
                      <thead className="sticky top-0 z-10 bg-[#3B3433]">
                        <tr>
                          <th className="py-2 px-2 sm:px-5 text-left text-xs sm:text-sm font-semibold">
                            #
                          </th>
                          <th className="py-2 px-2 sm:px-5 text-left text-xs sm:text-sm font-semibold">
                            Move
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {moveHistory.map((m, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">
                              {m.moveNumber}
                            </td>
                            <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">
                              {m.move}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Move (e.g., e2e4)"
                    value={moveInput}
                    onChange={(e) => setMoveInput(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <Button
                    onClick={handleManualMove}
                    className="bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600"
                  >
                    Send Move
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="md:block hidden flex justify-center md:justify-start">
            <CapturedPieces color="White" pieces={capturedWhite} />
          </div>
        </div>
      </div>
      {gameState?.gameOver && (
        <div className="bg-yellow-100 text-black p-4 rounded shadow mt-4">
          <h2 className="text-xl font-semibold mb-2">Game Over</h2>
          <p>{gameState.result || "Game ended."}</p>
          <Button
            onClick={() => setShowOptions(true)}
            className="mt-2"
          >
            New Game
          </Button>
        </div>
      )}
      {message && (
        <div className="bg-yellow-100 text-black p-4 rounded shadow mt-4">
          <p>{message}</p>
          <Button
            onClick={() => setMessage("")}
            className="mt-2"
            variant="outline"
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
};

export default OnlineGamePage;