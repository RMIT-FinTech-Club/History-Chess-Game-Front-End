"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { toast } from "sonner";
import { useChallengeSocket } from "./hooks/useSocket";
import { useLobby } from "@/context/LobbyContext";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

import { useBoardHeight } from "@/hooks/useBoardSize";
import PlayerSelector from "./PlayerSelector";
import GameModeSelector from "./GameModeSelector";
import SideSelector from "./SideSelector";
import { GameMode, Player, Side } from "./types";
import BoardChoose, { getCustomPieces } from "./PiecesBoardSelector";
import { useMatchmaking } from "./hooks/useMatchmaking";

import "@/css/chessboard.css";

// Default placeholder for random match
const RANDOM_PLAYER: Player = {
    id: "",
    username: "Random Opponent",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    elo: 0,
};

export default function Challenge() {
    const height = useBoardHeight();
    const searchParams = useSearchParams();
    const usernameFromURL = searchParams.get("player");
    const { userId } = useGlobalStorage();

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
    const [selectedPlayer, setSelectedPlayer] = useState<Player>(RANDOM_PLAYER);
    const [boardId, setBoardId] = useState("historyChessBoard");

    // Matchmaking hook for random matches
    const { isConnected, isSearching, findMatch, cancelMatchmaking } = useMatchmaking({
        userId,
        selectedGameMode: selectedMode,
    });

    // Determine if a specific player is selected (vs random)
    const isSpecificPlayerSelected = selectedPlayer.id !== "";

    // EFFECT: Set initial selected player from URL when onlinePlayers are available
    useEffect(() => {
        if (usernameFromURL && onlinePlayers.length > 0) {
            const target = onlinePlayers.find((p) => p.username === usernameFromURL);
            if (target) {
                setSelectedPlayer(target);
            }
        }
    }, [usernameFromURL, onlinePlayers]);

    // This hook handles socket events specific to the challenge *sending* flow
    useChallengeSocket({
        setIsChallengingAction: setIsChallengingSomeone,
    });

    // Main action handler - Smart routing based on player selection
    const handleAction = () => {
        if (!selectedMode || !selectedSide) {
            toast.error("Please select game mode and side");
            return;
        }

        if (isSpecificPlayerSelected) {
            // Challenge specific player
            if (isChallengingSomeone) {
                toast.warning("Already sending a challenge");
                return;
            }
            sendChallenge(selectedPlayer.id, selectedMode, selectedSide);
        } else {
            // Find random match
            findMatch(selectedSide);
        }
    };

    // Handle player change with option to reset to random
    const handlePlayerChange = (player: Player) => {
        setSelectedPlayer(player);
    };

    const handleResetToRandom = () => {
        setSelectedPlayer(RANDOM_PLAYER);
        setShowPlayerSelect(false);
    };

    // Determine button state and text
    const getButtonState = () => {
        if (isSearching) {
            return { text: "Searching...", disabled: false, isCancel: true };
        }
        if (isChallengingSomeone) {
            return { text: "Sending Challenge...", disabled: true, isCancel: false };
        }
        if (!isConnected) {
            return { text: "Connecting...", disabled: true, isCancel: false };
        }
        if (isSpecificPlayerSelected) {
            return { text: `Challenge ${selectedPlayer.username}`, disabled: false, isCancel: false };
        }
        return { text: "Find Random Match", disabled: false, isCancel: false };
    };

    const buttonState = getButtonState();

    return (
        <div className="w-full min-h-[calc(100dvh-var(--navbar-height))] py-6 px-4 md:px-8 text-white flex justify-center items-center overflow-hidden">
            {/* Main Container - Cinematic Layout */}
            <div
                className="
                    relative w-full max-w-6xl
                    flex flex-col lg:flex-row items-center lg:items-stretch
                    gap-4 lg:gap-6
                "
            >
                {/* Decorative Gold Glow Behind */}
                <div className="absolute inset-0 -z-10 opacity-30">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-main/20 rounded-full blur-[120px]" />
                </div>

                {/* Left: Chessboard Section */}
                <div className="relative flex-shrink-0 flex items-center justify-center">
                    {/* Board Container with subtle glow */}
                    <div className="relative">
                        {/* Gold border glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-gold-main/40 via-transparent to-gold-deep/40 rounded-lg blur-sm opacity-60" />

                        <div className="relative rounded-lg overflow-hidden shadow-2xl">
                            <Chessboard
                                id={boardId}
                                position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                                boardWidth={height}
                                animationDuration={0}
                                arePiecesDraggable={false}
                                customPieces={getCustomPieces(boardId)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Setup Panel */}
                <div
                    className="
                        relative w-full lg:w-[420px] lg:min-w-[400px]
                        flex flex-col
                    "
                    style={{ height: `${height}px` }}
                >
                    {/* Glass Panel */}
                    <div
                        className="
                            flex-1 flex flex-col
                            bg-gradient-to-br from-[#1a1614]/95 via-[#252220]/90 to-[#1a1614]/95
                            backdrop-blur-xl
                            border border-white/10
                            rounded-2xl
                            shadow-2xl
                            overflow-hidden
                        "
                    >
                        {/* Header with gold accent line */}
                        <div className="relative px-5 pt-5 pb-3">
                            {/* Gold top accent */}
                            <div className="absolute top-0 left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-gold-highlight to-transparent" />

                            <h1 className="font-display text-xl md:text-2xl tracking-widest gold-gradient-text text-center">
                                PLAY ONLINE
                            </h1>
                            <p className="font-serif text-xs text-white/50 mt-1 text-center">
                                {isSpecificPlayerSelected
                                    ? `Challenging ${selectedPlayer.username}`
                                    : "Select opponent or find random match"}
                            </p>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
                            {/* Opponent Selection */}
                            <section>
                                <label className="block font-serif text-[10px] font-semibold text-white/60 mb-1.5 uppercase tracking-widest">
                                    Opponent
                                </label>
                                <PlayerSelector
                                    selectedPlayer={selectedPlayer}
                                    players={onlinePlayers}
                                    showPlayerSelect={showPlayerSelect}
                                    onPlayerChangeAction={handlePlayerChange}
                                    onToggleSelectAction={() => setShowPlayerSelect(true)}
                                    onCloseSelectAction={() => setShowPlayerSelect(false)}
                                />
                                {isSpecificPlayerSelected && (
                                    <button
                                        onClick={handleResetToRandom}
                                        className="mt-1.5 text-[10px] text-gold-highlight hover:text-white transition-colors cursor-pointer"
                                    >
                                        ← Switch to Random
                                    </button>
                                )}
                            </section>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Game Mode */}
                            <section>
                                <label className="block font-serif text-[10px] font-semibold text-white/60 mb-1.5 uppercase tracking-widest">
                                    Time Control
                                </label>
                                <GameModeSelector
                                    selectedMode={selectedMode}
                                    onModeChange={setSelectedMode}
                                />
                            </section>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Board Theme */}
                            <section>
                                <label className="block font-serif text-[10px] font-semibold text-white/60 mb-1.5 uppercase tracking-widest">
                                    Board Theme
                                </label>
                                <BoardChoose selected={boardId} onSelect={setBoardId} />
                            </section>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Side Selection */}
                            <section>
                                <label className="block font-serif text-[10px] font-semibold text-white/60 mb-1.5 uppercase tracking-widest">
                                    Play As
                                </label>
                                <SideSelector
                                    selectedSide={selectedSide}
                                    onSideChangeAction={setSelectedSide}
                                    chessBoard={boardId}
                                />
                            </section>
                        </div>

                        {/* Action Button - Fixed at bottom */}
                        <div className="px-5 pb-5 pt-3">
                            <button
                                onClick={buttonState.isCancel ? cancelMatchmaking : handleAction}
                                disabled={buttonState.disabled}
                                className={`
                                    w-full py-3 rounded-lg font-serif text-sm font-bold uppercase tracking-wider
                                    transition-all duration-300 cursor-pointer
                                    shadow-lg
                                    ${buttonState.isCancel
                                        ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/30"
                                        : buttonState.disabled
                                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-gold-main via-gold-dark to-gold-deep hover:from-gold-hover-main hover:via-gold-hover-mid hover:to-gold-hover-deep text-black hover:text-white shadow-gold-main/20"
                                    }
                                    ${isSearching ? "animate-pulse" : ""}
                                `}
                            >
                                {buttonState.isCancel ? "Cancel Search" : buttonState.text}
                            </button>

                            {/* Connection Status */}
                            {!isConnected && (
                                <p className="text-center text-red-400 text-[10px] mt-2">
                                    ⚠ Not connected to server
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}