import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Side, UseMatchmakingProps } from "../types"
import { useSocket } from "@/context/WebSocketContext";

export const useMatchmaking = ({ userId, selectedGameMode }: UseMatchmakingProps) => {
  const { socket } = useSocket();

  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // console.log(socket)
  useEffect(() => {
    if (!socket) return;

    // setSocket(socket);

    setIsConnected(true);

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      toast.error(error.message);
    });

    socket.on("inQueue", (data) => {
      console.log("In queue:", data);
      toast.info(data.message || "Waiting for opponent...");
      setIsSearching(true);
    });

    socket.on("matchFound", (data) => {
      console.log("Match found:", data);
      setIsSearching(false);
      toast.success("Match found! Redirecting to game...");

      localStorage.setItem("gameData", JSON.stringify({
        gameId: data.gameId,
        playerColor: data.playerColor,
        gameMode: selectedGameMode,
        userId: userId
      }));

      router.push(`/game/${data.gameId}`);
    });

    socket.on("matchmakingCancelled", () => {
      console.log("Matchmaking cancelled");
      setIsSearching(false);
      toast.info("Matchmaking cancelled");
    });

    return () => {
      if (socket) {
        socket.off("error");
        socket.off("inQueue");
        socket.off("matchFound");
        socket.off("matchmakingCancelled");
      }
    };
  }, [router, selectedGameMode, userId, socket]);

  const findMatch = (colorChoice: Side) => {
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
      setIsSearching(true);
      console.log("Finding match with:", {
        userId,
        playMode: selectedGameMode,
        colorChoice
      });

      socket.emit("findMatch", {
        userId,
        playMode: selectedGameMode,
        colorChoice
      });
      console.log("Matchmaking for user:", userId);
    } catch (error) {
      console.error('Error finding match:', error);
      toast.error(error instanceof Error ? error.message : "Error finding match");
      setIsSearching(false);
    }
  };

  const cancelMatchmaking = () => {
    if (socket) {
      console.log("Cancelling matchmaking for user:", userId);
      socket.emit("cancelMatchmaking", { userId });
      setIsSearching(false);
      toast.info("Matchmaking cancelled");
    }
  };

  return {
    isConnected,
    isSearching,
    findMatch,
    cancelMatchmaking
  };
};