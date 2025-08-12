"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { toast } from "sonner";
import { useChallengeSocket } from "./hooks/useSocket";
import { useLobby } from "@/context/LobbyContext";

import { useBoardHeight } from "@/hooks/useBoardSize"
import PlayerSelector from "./PlayerSelector";
import GameModeSelector from "./GameModeSelector";
import SideSelector from "./SideSelector";
import { GameMode, Player, Side } from "./types";

import "@/css/chessboard.css";

export default function Challenge() {
    const height = useBoardHeight();
    const searchParams = useSearchParams();
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
        <div className="w-full h-[calc(100dvh-var(--navbar-height))] p-[2vw] text-white flex justify-center items-center overflow-hidden">
            <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4 items-start justify-between">
                <div className="w-[max-content] mx-auto">
                    <Chessboard
                        id="historyChessBoard"
                        position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                        boardWidth={height}
                        animationDuration={0}
                        arePiecesDraggable={false}
                    />
                </div>
                <div className="flex flex-col" style={{ height: `${height}px` }}>
                    <div className="h-full bg-[transparent] bg-[linear-gradient(120deg,rgba(255,255,255,0.3),rgba(0,0,0,0.2))] backdrop-blur-[20px] mb-[2vh] text-white flex flex-col p-[2vh] rounded-[2vh]">
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