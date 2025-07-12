"use client";

import { useRef, useEffect } from "react";
import { PlayerSelectorProps } from "./types";

export default function PlayerSelector({
    selectedPlayer,
    players, // This is now 'onlinePlayers' passed down from Challenge
    showPlayerSelect,
    onPlayerChangeAction,
    onToggleSelectAction,
    onCloseSelectAction
}: PlayerSelectorProps) {
    const playerListRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className="flex items-center w-full bg-[#3B3433] rounded-[2vh] px-[2vw] py-[2vh] relative">
            <div
                className="bg-center bg-cover bg-no-repeat h-full aspect-square rounded-full border border-solid border-white mr-[2vh]"
                style={{ backgroundImage: `url(${selectedPlayer.avt})` }}
            />
            <div className="text-[1.4rem] font-bold grow">
                {selectedPlayer.username}
                <span className="text-gray-400 ml-[0.2vw] text-[1rem]">
                    ({selectedPlayer.elo})
                </span>
            </div>
            <p
                className="text-[#DBB968] text-[1.2rem] w-[max-content] cursor-pointer transition-colors duration-200 hover:text-white"
                onClick={onToggleSelectAction}
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
                                    key={player.id || index}
                                    onClick={() => {
                                        onPlayerChangeAction(player);
                                        onCloseSelectAction();
                                    }}
                                    className="flex items-center gap-[2vh] p-[1vh] rounded-[1vh] cursor-pointer border border-[#444] bg-[#3B3433] transition-colors hover:bg-[#DBB968] duration-200 hover:text-black"
                                >
                                    <div
                                        className="h-[4vh] aspect-square rounded-full bg-center bg-cover bg-no-repeat border border-white"
                                        style={{ backgroundImage: `url(${player.avt})` }}
                                    />
                                    <p className="font-semibold text-[1.2rem]">
                                        {player.username}
                                        <span className="text-gray-400 ml-[0.2vw] text-[0.8rem]">
                                            ({player.elo})
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div
                            className="mt-[2vh] text-center text-[#DBB968] cursor-pointer hover:text-white w-[max-content] mx-auto"
                            onClick={onCloseSelectAction}
                        >
                            Cancel
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}