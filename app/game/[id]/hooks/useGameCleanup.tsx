// filepath: c:\Users\Minh\Documents\GitHub\History-Chess-Game-Front-End\app\game\[id]\hooks\useGameCleanup.tsx
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Socket } from "socket.io-client";

export const useGameCleanup = (socket: Socket | null, gameId: string) => {
  const router = useRouter();

  const handleNewGame = useCallback(() => {
    console.log(`Leaving game with ID: ${gameId}`);
    
    // Clean up local storage
    localStorage.removeItem("gameData");
    localStorage.removeItem("chess_active_game");

    // Disconnect the socket to trigger server-side cleanup
    if (socket) {
      socket.disconnect();
    }

    // Navigate to find page
    router.push("/game/find");
  }, [socket, gameId, router]);

  return { handleNewGame };
};