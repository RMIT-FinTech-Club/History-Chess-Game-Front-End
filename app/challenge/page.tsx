"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import io from "socket.io-client";

import styles from "@/css/challenge.module.css";
import Clock from "@/public/challenge/SVG/clock";
import Pieces from "@/public/challenge/SVG/pieces";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import { toast } from "sonner";
interface Players {
    id: string;
    username: string;
    avt: string;
    elo: number;
}

export default function Challenge() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const usernameFromURL = searchParams.get("player")

    const [players, setPlayers] = useState<Players[]>([])
    const [error, setError] = useState<string | null>(null)
    const [socket, setSocket] = useState<any>(null)
    const [isConnected, setIsConnected] = useState(false)
    // const [userId, setUserId] = useState<string>("")
    const { accessToken, userId } = useGlobalStorage();

    const [selectedMode, setSelectedMode] = useState<"blitz" | "rapid" | "bullet">("blitz");
    const [selectedSide, setSelectedSide] = useState<"white" | "black" | "random">("random");
    const [isChallenging, setIsChallenging] = useState(false)

    const [showPlayerSelect, setShowPlayerSelect] = useState(false)
    const [selectedPlayer, setSelectedPlayer] = useState<Players>({
        id: '',
        username: 'Unknown',
        avt: 'https://i.imgur.com/RoRONDn.jpeg',
        elo: 0
    })

    const playerListRef = useRef<HTMLDivElement>(null)
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [challengeData, setChallengeData] = useState<{
        challengerId: string;
        challengerName: string;
        playMode: string;
        colorPreference: string;
    } | null>(null);

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
            newSocket.emit("identify", userId);
            newSocket.emit("getOnlineUsers");
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
            console.log("Socket disconnected");
        });

        // Add challenge response handler
        newSocket.on("challengeResponse", (data: { opponentId: string, accepted: boolean }) => {
            console.log("Received challenge response:", data);
            if (data.accepted) {
                // Handle accepted challenge
                console.log("Challenge accepted!");
                toast.success("Challenge accepted! Waiting for game to start...");
            } else {
                // Handle declined challenge
                console.log("Challenge declined");
                setIsChallenging(false);
                toast.info("Challenge was declined");
            }
        });

        // Add challenge error handler
        newSocket.on("challengeError", (error: { message: string }) => {
            console.error("Challenge error:", error.message);
            setIsChallenging(false);
            toast.error(error.message);
        });

        // Add game challenge received handler
        newSocket.on("gameChallenge", (data: {
            challengerId: string,
            challengerName: string,
            playMode: string,
            colorPreference: string
        }) => {
            console.log("Received game challenge:", data);
            setChallengeData(data);
            setShowChallengeModal(true);
            console.log("Modal state after update:", { showChallengeModal: true, challengeData: data });
        });

        // Add game starting handler
        newSocket.on("gameStarting", (data: {
            gameId: string,
            playMode: string,
            colorPreference: string
        }) => {
            console.log("Game starting:", data);
            toast.success("Game starting! Redirecting...");



            localStorage.setItem("gameData", JSON.stringify({
                gameId: data.gameId,
                gameMode: data.playMode,
                colorPreference: data.colorPreference,
                userId: userId
            }));
            router.push(`/game/${data.gameId}`);
        });

        newSocket.on("onlineUsers", (users: string[]) => {
            console.log("Online users:", users);
            // Fetch user details for each online user
            const fetchUserDetails = async () => {
                try {
                    const userDetailsPromises = users.map(userId =>
                        axios.get(`http://localhost:8080/users/${userId}`)
                    );

                    const responses = await Promise.all(userDetailsPromises);
                    const formattedPlayers = responses
                        .map(response => ({
                            id: response.data.id,
                            username: response.data.username || 'Unknown',
                            avt: response.data.avt || 'https://i.imgur.com/RoRONDn.jpeg',
                            elo: response.data.elo || 0
                        }))
                        .filter(player => player.id !== userId);

                    setPlayers(formattedPlayers);

                    if (usernameFromURL) {
                        const target = formattedPlayers.find((p: Players) => p.username === usernameFromURL);
                        if (target) {
                            setSelectedPlayer(target);
                        }
                    }
                    setError(null);
                } catch (err) {
                    console.error('Error fetching user details:', err);
                    setError('Failed to load player details');
                }
            };


            fetchUserDetails();
        });

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [userId, usernameFromURL, router]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (playerListRef.current && !playerListRef.current.contains(event.target as Node)) {
                setShowPlayerSelect(false)
            }
        }

        if (showPlayerSelect) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showPlayerSelect])

    const modeDescriptions: Record<"blitz" | "rapid" | "bullet", string> = {
        blitz: 'Blitz is a fast-paced chess mode where each player gets only a few minutes for the entire game. It requires quick thinking, sharp instincts, and rapid decision-making. Ideal for players who enjoy pressure and fast action.',
        rapid: 'Rapid offers a balanced experience with moderate time controls. It gives you enough time to plan deeper strategies without feeling rushed. Perfect for those who want a thoughtful yet dynamic game.',
        bullet: 'Bullet is the ultimate test of speed, with games often lasting just one minute per side. There\'s little time to calculate—pure instinct and lightning reflexes rule. Great for adrenaline seekers and quick-handed tacticians.',
    };


    const modeOptions: { label: string; value: "blitz" | "rapid" | "bullet" }[] = [
        { label: 'blitz', value: 'blitz' },
        { label: 'rapid', value: 'rapid' },
        { label: 'bullet', value: 'bullet' },
    ]

    const sideOptions = [
        { label: 'white', value: 'white', fill: 'white', outline: 'black' },
        { label: 'black', value: 'black', fill: 'black', outline: 'white' },
        { label: 'random', value: 'random', fill: '#C4C4C4', outline: 'white' }
    ]

    return (
        <div className="w-full h-[calc(100dvh-var(--nav-height))] flex flex-col p-[2vw] text-white">
            <div className="h-full flex items-center justify-between">
                <div className={`h-full aspect-square bg-center bg-no-repeat bg-cover bg-[#BF9544] rounded-[2vw] mr-[2vw] ${styles.board}`}></div>
                <div className="h-full w-full flex flex-col justify-between">
                    <div className="h-full mb-[2vw] text-white flex flex-col justify-between">

                        <div className="h-[calc(100%/8)] flex items-center w-full bg-[#3B3433] rounded-[2vh] px-[2vw] py-[2vh] relative">
                            <div
                                className="bg-center bg-cover bg-no-repeat h-full aspect-square rounded-full border border-solid border-white mr-[2vh]"
                                style={{ backgroundImage: `url(${selectedPlayer.avt})` }}
                            ></div>
                            <div className="text-[1.4rem] font-bold grow">{selectedPlayer.username}<span className="text-gray-400 ml-[0.2vw] text-[1rem]">{`(${selectedPlayer.elo})`}</span></div>
                            <p
                                className="text-[#DBB968] text-[1.2rem] w-[max-content] cursor-pointer transition-colors duration-200 hover:text-white"
                                onClick={() => setShowPlayerSelect(true)}
                            >
                                Change Player
                            </p>

                            {showPlayerSelect && (
                                <div className="absolute top-[calc(100%+2vh)] left-0 w-full bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                                    <div ref={playerListRef} className="bg-[#2F2A29] rounded-[2vh] p-[2vh] w-full text-white">
                                        <h2 className="text-[1.5rem] font-bold mb-[1vh]">Select a player</h2>
                                        <div className="flex flex-col gap-[1vh] max-h-[50vh] overflow-y-auto list-container">
                                            {players.map((player, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        setSelectedPlayer(player)
                                                        setShowPlayerSelect(false)
                                                    }}
                                                    className="flex items-center gap-[2vh] p-[1vh] rounded-[1vh] cursor-pointer border border-[#444] bg-[#3B3433] transition-colors hover:bg-[#DBB968] duration-200 hover:text-black"
                                                >
                                                    <div
                                                        className="h-[4vh] aspect-square rounded-full bg-center bg-cover bg-no-repeat border border-white"
                                                        style={{ backgroundImage: `url(${player.avt})` }}
                                                    ></div>
                                                    <p className="font-semibold text-[1.2rem]">{player.username}<span className="text-gray-400 ml-[0.2vw] text-[0.8rem]">{`(${player.elo})`}</span></p>
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

                        <div className="h-[calc(100%/8)] flex items-center justify-between w-full">
                            {modeOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => setSelectedMode(opt.value)}
                                    className={`h-full w-1/4 flex items-center justify-around px-[2vh] cursor-pointer border-[1vh] group border-[#3B3433] border-solid rounded-[2vh] ${selectedMode === opt.value ? 'bg-[#DBB968] text-black' : 'bg-[#3B3433]'}`}
                                >
                                    <Clock fill={selectedMode === opt.value ? '#000' : '#DBB968'} classes={`h-1/2 aspect-square bg-center ${selectedMode !== opt.value && 'group-hover:rotate-20'} transition-transform duration-200`} />
                                    <p className="ml-[1vh] text-[1.1rem] font-extrabold uppercase w-full text-nowrap">{opt.label}</p>
                                </div>
                            ))}
                        </div>

                        {selectedMode && (
                            <div
                                className={`transition-all duration-300 ease-out transform scale-100 opacity-100 flex justify-center items-center ${selectedMode ? 'min-h-[calc(100%/3)] max-h-[40vh] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'} w-full bg-[#3B3433] rounded-[2vh] text-[1.2rem] font-bold text-justify leading-[3rem] p-[2vh] mt-[1vh]`}
                            >
                                {modeDescriptions[selectedMode]}
                            </div>
                        )}

                        <div className="h-[calc(100%/8)] flex items-center justify-between w-full">
                            {sideOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => setSelectedSide(opt.value as typeof selectedSide)}
                                    className={`h-full w-1/4 flex items-center justify-around px-[2vh] cursor-pointer border-[1vh] border-[#3B3433] transition-colors hover:bg-[#DBB968] duration-200 border-solid rounded-[2vh] ${selectedSide === opt.value ? 'bg-[#DBB968] text-black' : 'bg-[#3B3433]'}`}
                                >
                                    <Pieces classes="h-1/2 aspect-square bg-center" fill={opt.fill} outline={opt.outline} />
                                    <p className="ml-[1vh] text-[1.1rem] font-extrabold uppercase w-full text-nowrap">{opt.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="bg-[#F7D27F] text-black text-center text-[2rem] font-bold py-[1vh] rounded-[2vh] cursor-pointer transition-colors duration-200 hover:text-white"
                        onClick={() => {
                            if (!selectedMode || !selectedSide || !selectedPlayer) {
                                alert("Please select all options before sending a challenge");
                                return;
                            }
                            if (isChallenging) {
                                alert("Already sending a challenge");
                                return;
                            }
                            setIsChallenging(true);
                            socket?.emit("challengeUser", {
                                opponentId: selectedPlayer.id,
                                playMode: selectedMode,
                                colorPreference: selectedSide
                            });
                        }}
                    >
                        {isChallenging ? "Sending Challenge..." : "Send Invitation"}
                    </div>
                </div>
            </div>


            {/* Challenge Modal */}
            {showChallengeModal && challengeData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-[#3B3433] rounded-[2vh] p-[3vh] max-w-[500px] w-full mx-4 border border-[#DBB968] relative z-[10000]">
                        <h2 className="text-[#DBB968] text-[1.5rem] font-bold mb-[2vh]">Game Challenge</h2>
                        <p className="text-white text-[1.2rem] mb-[3vh]">
                            {challengeData.challengerName} wants to play a {challengeData.playMode} game with {challengeData.colorPreference} color preference.
                        </p>
                        <div className="flex gap-[2vh]">
                            <button
                                onClick={() => {
                                    console.log("Accepting challenge");
                                    setShowChallengeModal(false);
                                    toast.info("Accepting challenge...");
                                    socket?.emit("respondToChallenge", { accept: true });
                                }}
                                className="flex-1 bg-[#DBB968] text-black text-[1.2rem] font-bold py-[1.5vh] rounded-[1vh] hover:bg-[#C4A55A] transition-colors"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => {
                                    console.log("Declining challenge");
                                    setShowChallengeModal(false);
                                    toast.info("Declining challenge...");
                                    socket?.emit("respondToChallenge", { accept: false });
                                }}
                                className="flex-1 bg-[#2F2A29] text-white text-[1.2rem] font-bold py-[1.5vh] rounded-[1vh] border border-[#DBB968] hover:bg-[#3B3433] transition-colors"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}