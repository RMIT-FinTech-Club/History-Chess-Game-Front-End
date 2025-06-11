"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const FindMatchPage = () => {
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState<"blitz" | "rapid" | "bullet">("blitz");
  const [selectedColor, setSelectedColor] = useState<"white" | "black" | "random">("random");
  const router = useRouter();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:8000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      toast.success("Connected to server");
      console.log("Socket connected with ID:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      toast.error("Disconnected from server");
      console.log("Socket disconnected");
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      toast.error(error.message);
    });

    // Add matchmaking event handlers
    newSocket.on("inQueue", (data) => {
      console.log("In queue:", data);
      toast.info(data.message || "Waiting for opponent...");
      setIsSearching(true);
    });

    newSocket.on("matchFound", (data) => {
      console.log("Match found:", data);
      setIsSearching(false);
      toast.success("Match found! Redirecting to game...");
      
      // Store game data in localStorage with verified color from backend
      localStorage.setItem("gameData", JSON.stringify({
        gameId: data.gameId,
        playerColor: data.playerColor, // This comes from backend verification
        gameMode: selectedGameMode,
        userId: userId
      }));
      
      // Navigate to the game page with the game ID
      router.push(`/game/${data.gameId}`);
    });

    newSocket.on("matchmakingCancelled", () => {
      console.log("Matchmaking cancelled");
      setIsSearching(false);
      toast.info("Matchmaking cancelled");
    });

    return () => {
      if (newSocket) {
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("error");
        newSocket.off("inQueue");
        newSocket.off("matchFound");
        newSocket.off("matchmakingCancelled");
        newSocket.close();
      }
    };
  }, [router, selectedGameMode, userId]);

  const handleFindMatch = async () => {
    if (!userId) {
      toast.error("Please enter your user ID");
      return;
    }
    if (!socket || !isConnected) {
      toast.error("Not connected to server");
      return;
    }
    if (isSearching) {
      toast.info("Already searching for a match");
      return;
    }

    try {
      console.log("Finding match with:", {
        userId,
        playMode: selectedGameMode,
        colorChoice: selectedColor
      });
      
      socket.emit("findMatch", {
        userId,
        playMode: selectedGameMode,
        colorChoice: selectedColor
      });
    } catch (error) {
      console.error('Error finding match:', error);
      toast.error(error instanceof Error ? error.message : "Error finding match");
      setIsSearching(false);
    }
  };

  const handleCancelMatchmaking = () => {
    if (socket) {
      console.log("Cancelling matchmaking for user:", userId);
      socket.emit("cancelMatchmaking", { userId });
      setIsSearching(false);
      toast.info("Matchmaking cancelled");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center w-full py-8 px-4">
      <h1 className="text-2xl sm:text-3xl mb-8">Find a Match</h1>
      
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium mb-2">
              User ID
            </label>
            <input
              id="userId"
              type="text"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-2 border rounded text-black"
            />
          </div>

          <div>
            <label htmlFor="gameMode" className="block text-sm font-medium mb-2">
              Game Mode
            </label>
            <select
              id="gameMode"
              value={selectedGameMode}
              onChange={(e) => setSelectedGameMode(e.target.value as "blitz" | "rapid" | "bullet")}
              className="w-full p-2 border rounded text-black"
            >
              <option value="blitz">Blitz (3 min)</option>
              <option value="rapid">Rapid (10 min)</option>
              <option value="bullet">Bullet (1 min)</option>
            </select>
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium mb-2">
              Color Preference
            </label>
            <select
              id="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value as "white" | "black" | "random")}
              className="w-full p-2 border rounded text-black"
            >
              <option value="random">Random</option>
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            onClick={handleFindMatch}
            disabled={!isConnected || isSearching}
            className="w-full"
          >
            {isSearching ? "Searching..." : "Find Match"}
          </Button>

          {isSearching && (
            <Button
              onClick={handleCancelMatchmaking}
              variant="destructive"
              className="w-full"
            >
              Cancel Search
            </Button>
          )}
        </div>

        {!isConnected && (
          <p className="text-red-500 text-center">
            Not connected to server. Please refresh the page.
          </p>
        )}
      </div>
    </div>
  );
};

export default FindMatchPage; 