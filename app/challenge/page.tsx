"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { toast } from "sonner";
import { useChallengeSocket } from "./hooks/useSocket";
import { useLobby } from "@/context/LobbyContext";

import PlayerSelector from "./PlayerSelector";
import GameModeSelector from "./GameModeSelector";
import SideSelector from "./SideSelector";
import { GameMode, Player, Side } from "./types";

import "@/css/chessboard.css";

export default function Challenge() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const usernameFromURL = searchParams.get("player");

    // Get the global context values
    const {
        onlinePlayers,
        sendChallenge,
        isChallengingSomeone,
        setIsChallengingSomeone,
    } = useLobby();

    const [selectedMode, setSelectedMode] = useState<GameMode>("blitz");
    const [selectedSide, setSelectedSide] = useState<Side>("random");
    const [showPlayerSelect, setShowPlayerSelect] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player>({
        id: "",
        username: "Player List",
        avt: "https://i.imgur.com/RoRONDn.jpeg",
        elo: 0,
    });

    // EFFECT: Set initial selected player from URL when onlinePlayers are available
    useEffect(() => {
        if (usernameFromURL && onlinePlayers.length > 0) {
            const target = onlinePlayers.find((p) => p.username === usernameFromURL);
            if (target) {
                console.log("Setting selectedPlayer based on usernameFromURL:", target);
                setSelectedPlayer(target);
            }
        }
    }, [usernameFromURL, onlinePlayers]);

    // This hook handles socket events specific to the challenge *sending* flow (responses, errors)
    // No change needed here, it still only takes setIsChallengingAction.
    const { socket } = useChallengeSocket({
        setIsChallengingAction: setIsChallengingSomeone,
    });

    // --- REMOVE THIS useEffect: gameStarting is now handled globally by GlobalGameRedirector ---
    // useEffect(() => {
    //     if (!socket || !userId) {
    //         console.log("Challenge Page gameStarting useEffect: Socket or userId not ready. Skipping.");
    //         return;
    //     }
    //     console.log("Challenge Page gameStarting useEffect: Setting up gameStarting listener.");
    //     const handleGameStarting = (data: { gameId: string; playMode: string; colorPreference: string }) => {
    //         console.log("Challenge Page: Game starting! Redirecting...", data);
    //         toast.success("Game starting! Redirecting...");
    //         localStorage.setItem(
    //             "gameData",
    //             JSON.stringify({
    //                 gameId: data.gameId,
    //                 gameMode: data.playMode,
    //                 colorPreference: data.colorPreference,
    //                 userId: userId,
    //             })
    //         );
    //         router.push(`/game/${data.gameId}`);
    //     };
    //     socket.on("gameStarting", handleGameStarting);
    //     return () => {
    //         if (socket) {
    //             socket.off("gameStarting", handleGameStarting);
    //         }
    //     };
    // }, [socket, userId, router]);
    // --- END REMOVE ---

    const handleSendChallenge = () => {
        if (!selectedMode || !selectedSide || !selectedPlayer.id) {
            toast.error("Please select all options before sending a challenge");
            return;
        }
        if (isChallengingSomeone) {
            toast.warning("Already sending a challenge");
            return;
        }
        sendChallenge(selectedPlayer.id, selectedMode, selectedSide);
    };

    return (
        <div className="w-full h-[calc(100dvh-var(--nav-height))] p-[2vw] text-white gap-[2vh] overflow-hidden">
            <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4 items-start justify-between">
                <div className="w-full max-w-full">
                    <Chessboard
                        id="historyChessBoard"
                        position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                        boardWidth={window.innerWidth > 768 ? 600 : window.innerWidth > 480 ? 400 : 300}
                        animationDuration={0}
                        arePiecesDraggable={false}
                    />
                </div>
                <div className="h-full col-span-1 flex flex-col justify-between">
                    <div className="h-full mb-[2vw] text-white flex flex-col justify-start gap-[4vh]">
                        <PlayerSelector
                            selectedPlayer={selectedPlayer}
                            players={onlinePlayers}
                            showPlayerSelect={showPlayerSelect}
                            onPlayerChangeAction={setSelectedPlayer}
                            onToggleSelectAction={() => setShowPlayerSelect(true)}
                            onCloseSelectAction={() => setShowPlayerSelect(false)}
                        />

                        <GameModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />

                        <SideSelector selectedSide={selectedSide} onSideChangeAction={setSelectedSide} />
                    </div>
                    <div
                        className="bg-[#F7D27F] text-black text-center text-[1.5rem] font-bold py-[1vh] rounded-[0.625rem] cursor-pointer transition-colors duration-200 hover:text-white"
                        onClick={handleSendChallenge}
                    >
                        {isChallengingSomeone ? "Sending Challenge..." : "Send Invitation"}
                    </div>
                </div>
            </div>
        </div>
    );
}