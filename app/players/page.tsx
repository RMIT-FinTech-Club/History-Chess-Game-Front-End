"use client"

import styles from "@/css/players.module.css"
import Chevron from "@/public/players/chevron"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import axiosInstance from "@/config/apiConfig"
import { useGlobalStorage } from "@/hooks/GlobalStorage"
import { toast } from "sonner"
import { useSocketContext } from "@/context/WebSocketContext"

interface Players {
  username: string
  avt: string
  elo: number
  id: string
}

export default function PlayerList() {
  const router = useRouter()
  const { isAuthenticated } = useGlobalStorage();
  const [showFilter, setShowFilter] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("Highest")
  const [players, setPlayers] = useState<Players[]>([])
  const [error, setError] = useState<string | null>(null)
  const [onlinePlayers, setOnlinePlayers] = useState<Players[]>([]);
  const [sortedPlayers, setSortedPlayers] = useState<Players[]>([]);
  const { socket, isConnected, userId, accessToken } = useSocketContext();


  const handleOnlinePlayersUpdate = useCallback(async (users: string[]) => {
    console.log("LobbyContext: Received onlineUsers event with users:", users);
    try {
      if (!accessToken) {
        console.error("LobbyContext: AccessToken is missing for fetching user details.");
        return;
      }

      const userDetailsPromises = users.map((id) => {
        return axiosInstance.get(`/users/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then(res => {
            return { success: true, data: res.data };
          })
          .catch(error => {
            console.error(`LobbyContext: Error fetching user ${id}:`, error);
            if (error.response) {
              console.error("Error response data:", error.response.data);
              console.error("Error response status:", error.response.status);
              console.error("Error response headers:", error.response.headers);
            } else if (error.request) {
              console.error("Error request:", error.request);
            } else {
              console.error("Error message:", error.message);
            }
            return { success: false, error, userId: id };
          });
      });

      const results = await Promise.all(userDetailsPromises);

      const formattedPlayers = results
        .filter((result): result is { success: true, data: Players } => result.success)
        .map(({ data: userData }) => ({
          id: userData.id,
          username: userData.username || "Unknown",
          avt: userData.avt || "https://i.imgur.com/RoRONDn.jpeg",
          elo: userData.elo || 0,
        }))
        .filter((player) => player.id !== userId);

      setOnlinePlayers(formattedPlayers);

    } catch (err) {
      console.error("LobbyContext: Unexpected error in onlineUsers handler:", err);
      toast.error("Failed to load online player details");
    }
  }, [userId, accessToken]);

  const getSortedPlayers = () => {
    const sorted = [...onlinePlayers];

    console.log("SORTING PLAYERS:", sorted);
    switch (selectedFilter) {
      case "Highest":
        return sorted.sort((a, b) => b.elo - a.elo);
      case "Lowest":
        return sorted.sort((a, b) => a.elo - b.elo);
      case "Name":
        return sorted.sort((a, b) => a.username.localeCompare(b.username));
      default:
        return sorted;
    }
  }



  // Handle socket connection and authentication
  useEffect(() => {
    socket?.on("onlineUsers", handleOnlinePlayersUpdate);

    if (!isAuthenticated) {
      toast.error("Please sign in to view players list.");
      router.push('/sign_in');
    }
    
  }, [isAuthenticated, router, socket, handleOnlinePlayersUpdate]);

  useEffect(() => {
    if (onlinePlayers.length > 0) {
      const sorted = getSortedPlayers();
      // console.log("SORTED PLAYERS:", sorted);
      setSortedPlayers(sorted);
    }
  }, [onlinePlayers, selectedFilter]);

  return (
    <div className={`w-full min-h-screen flex flex-col justify-start items-center relative text-white ${styles.container}`}>
      <p className="text-[3rem] md:text-[3rem] font-extrabold text-center mx-auto my-[3dvh] tracking-[0.2vw]">Players List</p>
      <div
        className="flex relative justify-center items-center bg-[#1F1F1F] mr-[5vw] md:mr-[15vw] ml-auto border-[0.1px] border-solid border-[#CBD5E1] rounded-[1vw] mb-[5vh] text-[1.5rem] px-[2rem] py-[1rem] cursor-pointer"
        onClick={(e) => {
          const target = e.target as HTMLElement
          if (!target.closest('#menu')) {
            setShowFilter(!showFilter)
          }
        }}
      >
        <span className="mr-[1rem]">Sort by</span>
        <Chevron width="2rem" classes={showFilter ? 'rotate-180' : 'rotate-0'} fill={showFilter ? 'white' : '#94A3B8'} />
        {showFilter && <div id="menu" className="flex flex-col absolute right-0 top-[calc(100%+1vh)] min-w-[20vw] p-[0.5rem] z-50 bg-[#1F1F1F] border-solid border-[0.1px] border-[#CBD5E1] rounded-[1vw] text-[1.5rem]">
          <div
            className={`flex items-center min-w-[100%] w-[max-content] px-[1vw] py-[0.5vh] rounded-[0.5vw] ${selectedFilter === "Highest" ? "bg-linear-to-t from-[#605715] to-[#E8BB05]" : "bg-linear-to-t from-[#0000] to-[#0000]"}`}
            onClick={() => setSelectedFilter("Highest")}
          >
            <div className={`bg-center bg-no-repeat bg-contain w-[2vh] md:w-[2vw] aspect-square mr-[1vw] md:mr-[0.5vw] ${selectedFilter === "Highest" ? "opacity-100" : "opacity-0"} ${styles.check}`}></div>
            Highest to Lowest Elo
          </div>
          <div
            className={`flex items-center min-w-[100%] w-[max-content] px-[1vw] py-[0.5vh] rounded-[0.5vw] ${selectedFilter === "Lowest" ? "bg-linear-to-t from-[#605715] to-[#E8BB05]" : "bg-linear-to-t from-[#0000] to-[#0000]"}`}
            onClick={() => setSelectedFilter("Lowest")}
          >
            <div className={`bg-center bg-no-repeat bg-contain w-[2vh] md:w-[2vw] aspect-square mr-[1vw] md:mr-[0.5vw] ${selectedFilter === "Lowest" ? "opacity-100" : "opacity-0"} ${styles.check}`}></div>
            Lowest to Highest Elo
          </div>
          <div
            className={`flex items-center min-w-[100%] w-[max-content] px-[1vw] py-[0.5vh] rounded-[0.5vw] ${selectedFilter === "Name" ? "bg-linear-to-t from-[#605715] to-[#E8BB05]" : "bg-linear-to-t from-[#0000] to-[#0000]"}`}
            onClick={() => setSelectedFilter("Name")}
          >
            <div className={`bg-center bg-no-repeat bg-contain w-[2vh] md:w-[2vw] aspect-square mr-[1vw] md:mr-[0.5vw] ${selectedFilter === "Name" ? "opacity-100" : "opacity-0"} ${styles.check}`}></div>
            Names A-Z
          </div>
        </div>}
      </div>
      <div className="w-[90vw] md:w-[70vw] flex flex-col justify-center items-start">
        {error ? (
          <div className="w-full flex justify-center items-center py-5 text-[#EA4335]">
            <p>{error}</p>
          </div>
        ) : sortedPlayers.length === 0 ? (
          <div className="w-full flex justify-center items-center py-5">
            <p>No players list found</p>
          </div>
        ) : (
          sortedPlayers.map((user, index) => (
            <div key={index} className={`w-full h-[8dvh] sm:h-[15vh] mb-[5vh] rounded-[2vw] bg-[rgba(255,255,255,0.3)] border-[0.1px] border-solid border-[#EEFF07] flex justify-start items-center ${styles.player}`}>
              <div
                className="sm:h-[9dvh] h-[5vh] aspect-square rounded-[50%] mx-[1dvh] sm:mx-[3dvh] border border-solid border-white bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url(https://i.imgur.com/RoRONDn.jpeg)` }}>
              </div>
              <div className="flex justify-center items-center w-[calc(100%-8dvh-2vw)] sm:w-[calc(100%-15vh-2vw)] h-full ml-[2vw]">
                <div className="flex flex-col w-[calc(70%/2)] md:w-[calc(70%/3)] h-full items-start justify-center">
                  <p className="text-[#C4C4C4] sm:text-[1.3rem] text-[1rem] mb-[1dvh]">Player</p>
                  <p className="font-bold sm:text-[1.3rem] text-[1rem] whitespace-nowrap overflow-hidden text-ellipsis w-full">{user.username}</p>
                </div>
                <div className="flex flex-col w-[calc(70%/2)] md:w-[calc(70%/3)] h-full items-start justify-center">
                  <p className="text-[#C4C4C4] sm:text-[1.3rem] text-[1rem] mb-[1dvh]">Elo</p>
                  <p className="font-bold sm:text-[1.3rem] text-[1rem]">{user.elo}</p>
                </div>
                <div className="md:flex hidden flex-col w-[calc(70%/3)] h-full items-start justify-center">
                  <p className="text-[#C4C4C4] text-[1.3rem] mb-[1dvh]">Global Ranking</p>
                  {/* <p className="font-bold text-[1.3rem]">{user.rank}</p>  */}
                </div>
                <div className="w-[30%] h-full flex justify-start items-center">
                  <p
                    className={`sm:ml-[1vw] ml-0 text-[1.4rem] sm:text-[2rem] text-[#EEFF07] cursor-pointer relative font-bold ${styles.challenge}`}
                    onClick={() => router.push(`/challenge?player=${encodeURIComponent(user.username)}`)}
                  >
                    Challenge
                  </p>
                </div>
              </div>
            </div>
          )))
        }
      </div>
    </div>
  )
}