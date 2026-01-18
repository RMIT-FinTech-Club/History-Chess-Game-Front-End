"use client";

import { useRef, useEffect } from "react";
import { PlayerSelectorProps, Player } from "./types";

// Random opponent placeholder
const RANDOM_PLAYER: Player = {
    id: "",
    username: "Random Opponent",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    elo: 0,
};

export default function PlayerSelector({
    selectedPlayer,
    players,
    showPlayerSelect,
    onPlayerChangeAction,
    onToggleSelectAction,
    onCloseSelectAction
}: PlayerSelectorProps) {
    const playerListRef = useRef<HTMLDivElement>(null);
    const isRandomSelected = selectedPlayer.id === "";

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (playerListRef.current && !playerListRef.current.contains(event.target as Node)) {
                onCloseSelectAction();
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
    }, [showPlayerSelect, onCloseSelectAction]);

    // Add "Random Opponent" as first option in list
    const allOptions = [RANDOM_PLAYER, ...players];

    return (
        <div className="relative">
            {/* Selected Player Display */}
            <div
                onClick={onToggleSelectAction}
                className={`
                    flex items-center gap-3 w-full bg-[#3B3433] rounded-xl px-4 py-3 cursor-pointer
                    border-2 transition-all duration-200
                    ${isRandomSelected
                        ? "border-gold-highlight/50 hover:border-gold-highlight"
                        : "border-transparent hover:border-white/30"
                    }
                `}
            >
                {/* Avatar */}
                <div
                    className={`
                        w-12 h-12 rounded-full bg-center bg-cover bg-no-repeat border-2
                        ${isRandomSelected ? "border-gold-highlight" : "border-white/50"}
                    `}
                    style={{
                        backgroundImage: isRandomSelected
                            ? `linear-gradient(135deg, #E8BB05 0%, #7A651C 100%)`
                            : `url(${selectedPlayer.avt})`
                    }}
                >
                    {isRandomSelected && (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                            🎲
                        </div>
                    )}
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                    <p className={`font-display text-lg font-bold truncate ${isRandomSelected ? "text-gold-highlight" : "text-white"}`}>
                        {selectedPlayer.username}
                    </p>
                    {!isRandomSelected && selectedPlayer.elo > 0 && (
                        <p className="font-serif text-sm text-white/60">
                            ELO: {selectedPlayer.elo}
                        </p>
                    )}
                    {isRandomSelected && (
                        <p className="font-serif text-xs text-white/50">
                            Click to select a specific player
                        </p>
                    )}
                </div>

                {/* Dropdown Arrow */}
                <div className="text-white/60">
                    <svg
                        className={`w-5 h-5 transition-transform duration-200 ${showPlayerSelect ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown Player List */}
            {showPlayerSelect && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                    <div
                        ref={playerListRef}
                        className="bg-[#2A2524] backdrop-blur-xl max-h-[300px] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#2A2524] px-4 py-3 border-b border-white/10">
                            <h3 className="font-serif text-sm font-semibold text-white/80 uppercase tracking-wider">
                                Select Opponent
                            </h3>
                        </div>

                        {/* Player Options */}
                        <div className="p-2 space-y-1">
                            {allOptions.map((player, index) => {
                                const isRandom = player.id === "";
                                const isSelected = player.id === selectedPlayer.id;

                                return (
                                    <div
                                        key={player.id || `random-${index}`}
                                        onClick={() => {
                                            onPlayerChangeAction(player);
                                            onCloseSelectAction();
                                        }}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-lg cursor-pointer
                                            transition-all duration-150
                                            ${isSelected
                                                ? "bg-gold-highlight/20 border border-gold-highlight/50"
                                                : "hover:bg-white/10 border border-transparent"
                                            }
                                        `}
                                    >
                                        {/* Avatar */}
                                        <div
                                            className={`
                                                w-10 h-10 rounded-full bg-center bg-cover bg-no-repeat
                                                border-2 shrink-0
                                                ${isRandom ? "border-gold-highlight" : "border-white/30"}
                                            `}
                                            style={{
                                                backgroundImage: isRandom
                                                    ? `linear-gradient(135deg, #E8BB05 0%, #7A651C 100%)`
                                                    : `url(${player.avt})`
                                            }}
                                        >
                                            {isRandom && (
                                                <div className="w-full h-full flex items-center justify-center text-xl">
                                                    🎲
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-display font-semibold truncate ${isRandom ? "text-gold-highlight" : "text-white"}`}>
                                                {player.username}
                                            </p>
                                            {!isRandom && player.elo > 0 && (
                                                <p className="font-serif text-xs text-white/50">
                                                    ELO: {player.elo}
                                                </p>
                                            )}
                                            {isRandom && (
                                                <p className="font-serif text-xs text-white/50">
                                                    Match with anyone online
                                                </p>
                                            )}
                                        </div>

                                        {/* Selected Indicator */}
                                        {isSelected && (
                                            <div className="text-gold-highlight">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Empty State */}
                            {players.length === 0 && (
                                <div className="text-center py-6 text-white/50">
                                    <p className="font-serif text-sm">No players online</p>
                                    <p className="font-serif text-xs mt-1">Use Random Match to find an opponent</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}