"use client";

import styles from "@/css/players.module.css";
import Chevron from "@/public/players/chevron";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import axiosInstance from "@/config/apiConfig";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import { toast } from "sonner";
import { useSocketContext } from "@/context/WebSocketContext";
interface Players {
  username: string;
  avatarUrl: string;
  elo: number;
  id: string;
}

export default function PlayerList() {
  const router = useRouter();
  const { isAuthenticated, userId } = useGlobalStorage();
  const { socket, accessToken } = useSocketContext();

  const [allPlayers, setAllPlayers] = useState<Players[]>([]);
  const [onlinePlayerIds, setOnlinePlayerIds] = useState<string[]>([]);
  const [sortedPlayers, setSortedPlayers] = useState<Players[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Highest");

  // Use refs to prevent multiple API calls and track component state
  const isMountedRef = useRef(true);
  const hasInitializedRef = useRef(false);
  const fetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      hasInitializedRef.current = false;

      // Cancel any ongoing fetch requests
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
    };
  }, []);

  const fetchAllPlayers = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (!isMountedRef.current || hasInitializedRef.current) {
      return;
    }

    // Cancel previous request if still ongoing
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    fetchControllerRef.current = new AbortController();

    setIsLoading(true);
    hasInitializedRef.current = true;

    try {
      const response = await axiosInstance.get("/users", {
        params: { limit: 1000, offset: 0 },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: fetchControllerRef.current.signal,
      });

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      const players = (response.data.users || []).filter(
        (player: Players) => player.id !== userId
      );

      setAllPlayers(players);
      setError(null);
      console.log("Players fetched successfully:", players.length);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log("Request was aborted");
        return;
      }

      if (!isMountedRef.current) return;

      setError("Failed to load player list.");
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      fetchControllerRef.current = null;
    }
  }, [accessToken, userId]);

  // Fetch all players at first
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to view the players list.");
      router.push("/sign_in");
      return;
    }

    if (accessToken && !hasInitializedRef.current) {
      fetchAllPlayers();
    }
  }, [isAuthenticated, accessToken, fetchAllPlayers, router]);

  useEffect(() => {
    if (!socket || !isAuthenticated || !userId || !accessToken) {
      console.log("Socket, authentication, userId, or accessToken missing, skipping socket setup");
      return;
    }

    console.log("Setting up socket listeners for PlayerList");

    socket.emit("identify", userId);

    socket.emit("joinLeaderboardRoom");

    const handleOnlineUsersUpdate = (userIds: string[]) => {
      if (!isMountedRef.current) return;
      console.log("Received online users update:", userIds);
      setOnlinePlayerIds(userIds);
    };

    const handleEloUpdate = (payload: { userId: string; newElo: number }) => {
      if (!isMountedRef.current) return;
      console.log("Received ELO update:", payload);
      setAllPlayers((prev) =>
        prev.map((player) =>
          player.id === payload.userId
            ? { ...player, elo: payload.newElo }
            : player
        )
      );
    };

    const handleSocketError = (error: { message: string }) => {
      if (!isMountedRef.current) return;
      console.error("Socket error:", error.message);
      toast.error(error.message);
    };

    socket.on("leaderboardOnlineUsers", handleOnlineUsersUpdate);
    socket.on("eloUpdated", handleEloUpdate);
    socket.on("error", handleSocketError);

    const handleReconnect = () => {
      console.log("Socket reconnected, re-emitting identify and joinLeaderboardRoom");
      socket.emit("identify", userId);
      socket.emit("joinLeaderboardRoom");
    };

    socket.on("connect", handleReconnect);

    return () => {
      if (socket?.connected) {
        socket.emit("leaveLeaderboardRoom");
        socket.off("leaderboardOnlineUsers", handleOnlineUsersUpdate);
        socket.off("eloUpdated", handleEloUpdate);
        socket.off("error", handleSocketError);
        socket.off("connect", handleReconnect);
      }
    };
  }, [socket, isAuthenticated, userId, accessToken]);

  useEffect(() => {
    if (!allPlayers.length) {
      setSortedPlayers([]);
      return;
    }

    const onlineIdsSet = new Set(onlinePlayerIds);
    const onlineList: Players[] = [];
    const offlineList: Players[] = [];

    // Partition players into online and offline lists
    allPlayers.forEach((player) => {
      if (onlineIdsSet.has(player.id)) {
        onlineList.push(player);
      } else {
        offlineList.push(player);
      }
    });

    // Define sorting logic
    const sortLogic = (a: Players, b: Players) => {
      switch (selectedFilter) {
        case "Highest":
          return b.elo - a.elo;
        case "Lowest":
          return a.elo - b.elo;
        case "Name":
          return a.username.localeCompare(b.username);
        default:
          return 0;
      }
    };

    onlineList.sort(sortLogic);
    offlineList.sort(sortLogic);

    // Combine both list and update state
    setSortedPlayers([...onlineList, ...offlineList]);
  }, [allPlayers, onlinePlayerIds, selectedFilter]);

  const handleFilterClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("#menu")) {
      setShowFilter(!showFilter);
    }
  }, [showFilter]);

  const handleFilterSelect = useCallback((filter: string) => {
    setSelectedFilter(filter);
    setShowFilter(false);
  }, []);

  const handleChallengeClick = useCallback((username: string, isOnline: boolean) => {
    if (isOnline) {
      router.push(`/challenge?player=${encodeURIComponent(username)}`);
    }
  }, [router]);

  return (
    <div
      className={`w-full min-h-screen flex flex-col justify-start items-center relative text-white ${styles.container}`}
    >
      <p className="text-[3rem] md:text-[3rem] font-extrabold text-center mx-auto my-[3dvh] tracking-[0.2vw]">
        Players List
      </p>

      <div
        className="flex relative justify-center items-center bg-[#1F1F1F] mr-[5vw] md:mr-[15vw] ml-auto border-[0.1px] border-solid border-[#CBD5E1] rounded-[1vw] mb-[5vh] text-[1.5rem] px-[2rem] py-[1rem] cursor-pointer"
        onClick={handleFilterClick}
      >
        <span className="mr-[1rem]">Sort by</span>
        <Chevron
          width="2rem"
          classes={showFilter ? "rotate-180" : "rotate-0"}
          fill={showFilter ? "white" : "#94A3B8"}
        />
        {showFilter && (
          <div
            id="menu"
            className="flex flex-col absolute right-0 top-[calc(100%+1vh)] min-w-[20vw] p-[0.5rem] z-50 bg-[#1F1F1F] border-solid border-[0.1px] border-[#CBD5E1] rounded-[1vw] text-[1.5rem]"
          >
            <FilterOption
              label="Highest to Lowest Elo"
              value="Highest"
              selectedFilter={selectedFilter}
              onSelect={handleFilterSelect}
            />
            <FilterOption
              label="Lowest to Highest Elo"
              value="Lowest"
              selectedFilter={selectedFilter}
              onSelect={handleFilterSelect}
            />
            <FilterOption
              label="Names A-Z"
              value="Name"
              selectedFilter={selectedFilter}
              onSelect={handleFilterSelect}
            />
          </div>
        )}
      </div>

      <div className="w-[90vw] md:w-[70vw] flex flex-col justify-center items-start">
        {isLoading ? (
          <p className="w-full text-center py-5">Loading players...</p>
        ) : error ? (
          <div className="w-full flex justify-center items-center py-5 text-[#EA4335]">
            <p>{error}</p>
          </div>
        ) : sortedPlayers.length === 0 ? (
          <div className="w-full flex justify-center items-center py-5">
            <p>No players found</p>
          </div>
        ) : (
          sortedPlayers.map((user, index) => {
            const isOnline = onlinePlayerIds.includes(user.id);
            return (
              <PlayerCard
                key={user.id || index}
                user={user}
                isOnline={isOnline}
                onChallengeClick={handleChallengeClick}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

const FilterOption = ({
  label,
  value,
  selectedFilter,
  onSelect
}: {
  label: string;
  value: string;
  selectedFilter: string;
  onSelect: (value: string) => void;
}) => (
  <div
    className={`flex items-center min-w-[100%] w-[max-content] px-[1vw] py-[0.5vh] rounded-[0.5vw] ${selectedFilter === value
      ? "bg-linear-to-t from-[#605715] to-[#E8BB05]"
      : "bg-linear-to-t from-[#0000] to-[#0000]"
      }`}
    onClick={() => onSelect(value)}
  >
    <div
      className={`bg-center bg-no-repeat bg-contain w-[2vh] md:w-[2vw] aspect-square mr-[1vw] md:mr-[0.5vw] ${selectedFilter === value ? "opacity-100" : "opacity-0"
        } ${styles.check}`}
    ></div>
    {label}
  </div>
);

const PlayerCard = ({
  user,
  isOnline,
  onChallengeClick
}: {
  user: Players;
  isOnline: boolean;
  onChallengeClick: (username: string, isOnline: boolean) => void;
}) => (
  <div
    className={`w-full h-[8dvh] sm:h-[15vh] mb-[5vh] rounded-[2vw] bg-[rgba(255,255,255,0.3)] border-[0.1px] border-solid border-[#EEFF07] flex justify-start items-center ${styles.player}`}
  >
    <div
      className="relative sm:h-[9dvh] h-[5vh] aspect-square rounded-[50%] mx-[1dvh] sm:mx-[3dvh] border border-solid border-white bg-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${user.avatarUrl || "https://i.imgur.com/RoRONDn.jpeg"})`,
      }}
    >
      {isOnline && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-black"
          title="Online"
        ></div>
      )}
    </div>
    <div className="flex justify-center items-center w-[calc(100%-8dvh-2vw)] sm:w-[calc(100%-15vh-2vw)] h-full ml-[2vw]">
      <div className="flex flex-col w-[calc(70%/2)] md:w-[calc(70%/3)] h-full items-start justify-center">
        <p className="text-[#C4C4C4] sm:text-[1.3rem] text-[1rem] mb-[1dvh]">
          Player
        </p>
        <p className="font-bold sm:text-[1.3rem] text-[1rem] whitespace-nowrap overflow-hidden text-ellipsis w-full">
          {user.username}
        </p>
      </div>
      <div className="flex flex-col w-[calc(70%/2)] md:w-[calc(70%/3)] h-full items-start justify-center">
        <p className="text-[#C4C4C4] sm:text-[1.3rem] text-[1rem] mb-[1dvh]">
          Elo
        </p>
        <p className="font-bold sm:text-[1.3rem] text-[1rem]">{user.elo}</p>
      </div>
      <div className="md:flex hidden flex-col w-[calc(70%/3)] h-full items-start justify-center">
        <p className="text-[#C4C4C4] text-[1.3rem] mb-[1dvh]">Status</p>
        <p className="font-bold sm:text-[1.3rem] text-[1rem]">
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>
      <div className="w-[30%] h-full flex justify-start items-center">
        <p
          className={`
            sm:ml-[1vw] ml-0 text-[1.4rem] sm:text-[2rem] 
            ${isOnline
              ? "text-[#EEFF07] cursor-pointer"
              : "text-[#cfdab1] opacity-50 cursor-not-allowed"
            }
            relative font-bold ${styles.challenge} ${isOnline ? styles.challengeOnline : ""}
          `}
          onClick={() => onChallengeClick(user.username, isOnline)}
        >
          Challenge
        </p>
      </div>
    </div>
  </div>
);