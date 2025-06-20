import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Side, UseMatchmakingProps } from "../types"
import basePath from "@/pathConfig";

export const useMatchmaking = ({ userId, selectedGameMode }: UseMatchmakingProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const newSocket = io(`${basePath}`, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
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

    newSocket.on("inQueue", (data) => {
      console.log("In queue:", data);
      toast.info(data.message || "Waiting for opponent...");
      setIsSearching(true);
    });

    newSocket.on("matchFound", (data) => {
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