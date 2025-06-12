"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import io from "socket.io-client";

import styles from "@/css/challenge.module.css";
import Clock from "@/public/challenge/SVG/clock";
import Pieces from "@/public/challenge/SVG/pieces";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

interface Players {
  id: string;
  username: string;
  avt: string;
  elo: number;
}

export default function Challenge() {
  const searchParams = useSearchParams();
  const usernameFromURL = searchParams.get("player");

  const [players, setPlayers] = useState<Players[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  // const [userId, setUserId] = useState<string>("")
  const { accessToken, userId } = useGlobalStorage();

  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<
    "white" | "black" | "random" | null
  >(null);

  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Players>({
    id: "",
    username: "Unknown",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    elo: 0,
  });

  const playerListRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    const newSocket = io("http://localhost:8080", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected with ID:", newSocket.id);
      // Identify user when connected
      newSocket.emit("identify", userId);
      // Request online users list after identifying
      newSocket.emit("getOnlineUsers");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    newSocket.on("onlineUsers", (users: string[]) => {
      console.log("Online users:", users);
      // Fetch user details for each online user
      const fetchUserDetails = async () => {
        try {
          const userDetailsPromises = users.map((userId) =>
            axios.get(`http://localhost:8080/users/${userId}`)
          );

          const responses = await Promise.all(userDetailsPromises);
          const formattedPlayers = responses.map((response) => ({
            id: response.data.id,
            username: response.data.username || "Unknown",
            avt: response.data.avt || "https://i.imgur.com/RoRONDn.jpeg",
            elo: response.data.elo || 0,
          }));

          setPlayers(formattedPlayers);
          if (usernameFromURL) {
            const target = formattedPlayers.find(
              (p: Players) => p.username === usernameFromURL
            );
            if (target) {
              setSelectedPlayer(target);
            }
          }
          setError(null);
        } catch (err) {
          console.error("Error fetching user details:", err);
          setError("Failed to load player details");
        }
      };
      fetchUserDetails();
    });

    // newSocket.emit('challengeUser', {
    //     opponentId: selectedPlayer.id,
    //     playMode: selectedMode,
    //     colorPreference: selectedSide
    // });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [userId, usernameFromURL]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        playerListRef.current &&
        !playerListRef.current.contains(event.target as Node)
      ) {
        setShowPlayerSelect(false);
      }
    }

    if (showPlayerSelect) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPlayerSelect]);

  const modeOptions = [
    { label: "1 min", value: "1min" },
    { label: "1 | 1", value: "1|1" },
    { label: "2 | 1", value: "2|1" },
    { label: "3 min", value: "3min" },
    { label: "3 | 2", value: "3|2" },
    { label: "5 mins", value: "5min" },
    { label: "10 min", value: "10min" },
    { label: "15 | 10", value: "15|10" },
    { label: "30 mins", value: "30min" },
  ];

  const sideOptions = [
    { label: "white", value: "white", fill: "white", outline: "black" },
    { label: "black", value: "black", fill: "black", outline: "white" },
    { label: "random", value: "random", fill: "#C4C4C4", outline: "white" },
  ];

  return (
    <div className="w-full h-[100dvh] flex flex-col p-[2vw] text-white">
      <div className="h-full flex items-center justify-between">
        <div
          className={`h-full aspect-square bg-center bg-no-repeat bg-cover bg-[#BF9544] rounded-[2vw] mr-[2vw] ${styles.board}`}
        ></div>
        <div className="h-full w-full flex flex-col justify-between">
          <div className="h-full mb-[2vw] text-white flex flex-col justify-between">
            <div className="h-[calc(100%/8)] flex items-center w-full bg-[#3B3433] rounded-[2vh] px-[2vw] py-[2vh] relative">
              <div
                className="bg-center bg-cover bg-no-repeat h-full aspect-square rounded-full border border-solid border-white mr-[2vh]"
                style={{ backgroundImage: `url(${selectedPlayer.avt})` }}
              ></div>
              <div className="text-[1.4rem] font-bold grow">
                {selectedPlayer.username}
                <span className="text-gray-400 ml-[0.2vw] text-[1rem]">{`(${selectedPlayer.elo})`}</span>
              </div>
              <p
                className="text-[#DBB968] text-[1.2rem] w-[max-content] cursor-pointer transition-colors duration-200 hover:text-white"
                onClick={() => setShowPlayerSelect(true)}
              >
                Change Player
              </p>

              {showPlayerSelect && (
                <div className="absolute top-[calc(100%+2vh)] left-0 w-full bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                  <div
                    ref={playerListRef}
                    className="bg-[#2F2A29] rounded-[2vh] p-[2vh] w-full text-white"
                  >
                    <h2 className="text-[1.5rem] font-bold mb-[1vh]">
                      Select a player
                    </h2>
                    <div className="flex flex-col gap-[1vh] max-h-[50vh] overflow-y-auto list-container">
                      {players.map((player, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedPlayer(player);
                            setShowPlayerSelect(false);
                          }}
                          className="flex items-center gap-[2vh] p-[1vh] rounded-[1vh] cursor-pointer border border-[#444] bg-[#3B3433] transition-colors hover:bg-[#DBB968] duration-200 hover:text-black"
                        >
                          <div
                            className="h-[4vh] aspect-square rounded-full bg-center bg-cover bg-no-repeat border border-white"
                            style={{ backgroundImage: `url(${player.avt})` }}
                          ></div>
                          <p className="font-semibold text-[1.2rem]">
                            {player.username}
                            <span className="text-gray-400 ml-[0.2vw] text-[0.8rem]">{`(${player.elo})`}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                    <div
                      className="mt-[2vh] text-center text-[#DBB968] cursor-pointer hover:text-white w-[max-content] mx-auto"
                      onClick={() => setShowPlayerSelect(false)}
                    >
                      Cancel
                    </div>
                  </div>
                </div>
              )}
            </div>

            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="h-[calc(100%/8)] flex items-center justify-between w-full"
              >
                {modeOptions.slice(i * 3, i * 3 + 3).map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setSelectedMode(opt.value)}
                    className={`h-full w-1/4 flex items-center justify-around px-[2vh] cursor-pointer border-[1vh] group border-[#3B3433] border-solid rounded-[2vh] ${
                      selectedMode === opt.value
                        ? "bg-[#DBB968] text-black"
                        : "bg-[#3B3433]"
                    }`}
                  >
                    <Clock
                      fill={selectedMode === opt.value ? "#000" : "#DBB968"}
                      classes={`h-1/2 aspect-square bg-center ${
                        selectedMode !== opt.value && "group-hover:rotate-20"
                      } transition-transform duration-200`}
                    />
                    <p className="ml-[1vh] text-[1.1rem] font-extrabold uppercase w-full text-nowrap">
                      {opt.label}
                    </p>
                  </div>
                ))}
              </div>
            ))}

            <div className="h-[calc(100%/8)] flex items-center justify-between w-full">
              {sideOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() =>
                    setSelectedSide(opt.value as typeof selectedSide)
                  }
                  className={`h-full w-1/4 flex items-center justify-around px-[2vh] cursor-pointer border-[1vh] border-[#3B3433] transition-colors hover:bg-[#DBB968] duration-200 border-solid rounded-[2vh] ${
                    selectedSide === opt.value
                      ? "bg-[#DBB968] text-black"
                      : "bg-[#3B3433]"
                  }`}
                >
                  <Pieces
                    classes="h-1/2 aspect-square bg-center"
                    fill={opt.fill}
                    outline={opt.outline}
                  />
                  <p className="ml-[1vh] text-[1.1rem] font-extrabold uppercase w-full text-nowrap">
                    {opt.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="bg-[#F7D27F] text-black text-center text-[2rem] font-bold py-[1vh] rounded-[2vh] cursor-pointer transition-colors duration-200 hover:text-white"
            onClick={() =>
              alert(
                `Selected mode: ${selectedMode}\nSelected side: ${selectedSide}\nSelected player: ${selectedPlayer.username}`
              )
            }
          >
            Send Invitation
          </div>
        </div>
      </div>
    </div>
  );
}
