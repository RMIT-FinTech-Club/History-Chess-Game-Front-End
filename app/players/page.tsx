"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import axiosInstance from "@/config/apiConfig";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import { toast } from "sonner";
import { useSocketContext } from "@/context/WebSocketContext";
import Podium from "@/components/leaderboard/Podium";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import { Player } from "@/components/leaderboard/types";
import BackgroundEffects from "@/components/decor/BackgroundEffects";

function LeaderboardContent() {
  const router = useRouter();
  const { isAuthenticated, userId } = useGlobalStorage();
  const { socket, accessToken } = useSocketContext();

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [onlinePlayerIds, setOnlinePlayerIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Use refs to track fetch status
  const isMountedRef = useRef(true);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch logic
  const fetchPlayers = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await axiosInstance.get("/users", {
        params: { limit: 1000, offset: 0 },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (isMountedRef.current && response.data.users) {
        // Map backend response to Player type
        const players: Player[] = (response.data.users as Player[]).map((p) => ({
          id: p.id,
          username: p.username,
          avatarUrl: p.avatarUrl,
          elo: p.elo
        }));

        // Initial sort by Elo
        setAllPlayers(players.sort((a, b) => b.elo - a.elo));
      }
    } catch (err) {
      console.error("Failed to fetch players", err);
      toast.error("Failed to load leaderboard.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [accessToken]);

  // Auth check & initial fetch
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to view the leaderboard.");
      router.push("/sign_in");
      return;
    }
    fetchPlayers();
  }, [isAuthenticated, fetchPlayers, router]);

  // Socket Logic
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    socket.emit("identify", userId);
    socket.emit("joinLeaderboardRoom");

    const handleOnlineUpdate = (ids: string[]) => {
      if (isMountedRef.current) {
        setOnlinePlayerIds(new Set(ids));
      }
    };

    const handleEloUpdate = ({ userId: uid, newElo }: { userId: string, newElo: number }) => {
      if (isMountedRef.current) {
        setAllPlayers(prev => {
          const updated = prev.map(p => p.id === uid ? { ...p, elo: newElo } : p);
          // Re-sort on update
          return updated.sort((a, b) => b.elo - a.elo);
        });
      }
    };

    socket.on("leaderboardOnlineUsers", handleOnlineUpdate);
    socket.on("eloUpdated", handleEloUpdate);

    return () => {
      socket.off("leaderboardOnlineUsers", handleOnlineUpdate);
      socket.off("eloUpdated", handleEloUpdate);
      socket.emit("leaveLeaderboardRoom");
    };
  }, [socket, isAuthenticated, userId]);

  const handleChallenge = (player: Player) => {
    router.push(`/challenge?player=${encodeURIComponent(player.username)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold-royal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Split Top 3 and Rest
  const top3 = allPlayers.slice(0, 3);
  const rest = allPlayers.slice(3);

  return (
    <main className="min-h-screen relative flex flex-col items-center overflow-x-hidden pt-24 text-white">
      <BackgroundEffects />

      {/* Header */}
      <div className="relative z-10 text-center mb-12 animate-fade-up">
        <h1 className="font-display text-4xl md:text-6xl gold-gradient-text mb-4 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          Hall of Legends
        </h1>
        <p className="font-serif text-white/50 text-sm md:text-base tracking-widest uppercase">
          The Greatest Strategists of the Realm
        </p>
      </div>

      {/* Podium */}
      <div className="relative z-10 w-full flex justify-center">
        <Podium
          topPlayers={top3}
          onlineDetails={onlinePlayerIds}
          onChallenge={handleChallenge}
        />
      </div>

      {/* Table */}
      <div className="relative z-10 w-full flex justify-center animate-fade-up delay-300">
        <LeaderboardTable
          players={rest}
          startIndex={4}
          onlineDetails={onlinePlayerIds}
          onChallenge={handleChallenge}
        />
      </div>
    </main>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold-royal border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LeaderboardContent />
    </Suspense>
  );
}