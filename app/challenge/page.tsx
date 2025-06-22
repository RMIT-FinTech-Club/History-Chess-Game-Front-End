"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { toast } from "sonner";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import { useSocket } from "./hooks/useSocket";
import "@/css/chessboard.css";

import PlayerSelector from "./PlayerSelector";
import GameModeSelector from "./GameModeSelector";
import SideSelector from "./SideSelector";
import ChallengeModal from "./ChallengeModal";
import { ChallengeData, GameMode, Player, Side } from "./types";

export default function Challenge() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const usernameFromURL = searchParams.get("player");
    const { userId, accessToken, isAuthenticated } = useGlobalStorage();
    const [players, setPlayers] = useState<Player[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState<GameMode>("blitz");
    const [selectedSide, setSelectedSide] = useState<Side>("random");
    const [isChallenging, setIsChallenging] = useState(false);
    const [showPlayerSelect, setShowPlayerSelect] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player>({
        id: "",
        username: "Player List",
        avt: "https://i.imgur.com/RoRONDn.jpeg",
        elo: 0,
    });
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error("Please sign in to challenge other players.");
            router.push('/sign_in')
        }
    }, [isAuthenticated, router])

    const handlePlayersUpdate = useCallback((newPlayers: Player[]) => {
        console.log("handlePlayersUpdate called with newPlayers:", newPlayers);
        // Force new array reference to ensure re-render
        setPlayers([...newPlayers]);
        if (usernameFromURL) {
            const target = newPlayers.find((p) => p.username === usernameFromURL);
            if (target) {
                console.log("Setting selectedPlayer based on usernameFromURL:", target);
                setSelectedPlayer(target);
            }
        }
        setError(null);
        console.log("Players state updated, new players:", [...newPlayers]);
    }, [usernameFromURL]);

    const handleChallengeReceived = useCallback((data: ChallengeData) => {
        console.log("Received game challenge:", data);
        setChallengeData(data);
        setShowChallengeModal(true);
    }, []);

    const { socket, isConnected } = useSocket({
        userId,
        accessToken,
        onPlayersUpdateAction: handlePlayersUpdate,
        onChallengeReceivedAction: handleChallengeReceived,
        setIsChallengingAction: setIsChallenging,
    });

    const handleSendChallenge = () => {
        if (!selectedMode || !selectedSide || !selectedPlayer.id) {
            toast.error("Please select all options before sending a challenge");
            return;
        }
        if (isChallenging) {
            toast.warning("Already sending a challenge");
            return;
        }
        if (!isConnected || !socket) {
            toast.error("Not connected to the server");
            return;
        }
        setIsChallenging(true);
        socket.emit("challengeUser", {
            opponentId: selectedPlayer.id,
            playMode: selectedMode,
            colorPreference: selectedSide,
        });
    };

    const handleAcceptChallenge = () => {
        if (!socket || !challengeData) return;
        console.log("Accepting challenge");
        setShowChallengeModal(false);
        toast.info("Accepting challenge...");
        socket.emit("respondToChallenge", { accept: true });
    };

    const handleDeclineChallenge = () => {
        if (!socket) return;
        console.log("Declining challenge");
        setShowChallengeModal(false);
        toast.info("Declining challenge...");
        socket.emit("respondToChallenge", { accept: false });
    };

    return (
        <div className="w-full min-h-max p-[2vw] text-white gap-[2vh] overflow-hidden">
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
                            players={players}
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
                        {isChallenging ? "Sending Challenge..." : "Send Invitation"}
                    </div>
                </div>
            </div>

            <ChallengeModal
                isOpen={showChallengeModal}
                challengeData={challengeData}
                onCloseAction={() => setShowChallengeModal(false)}
                onAcceptAction={handleAcceptChallenge}
                onDeclineAction={handleDeclineChallenge}
            />
        </div>
    );
}