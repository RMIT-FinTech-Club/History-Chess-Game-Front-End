"use client";

import { useState } from "react";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import { useMatchmaking } from "../hooks/useMatchmaking";
import GameConfiguration from "./GameConfiguration";
import MatchmakingControls from "./MatchmakingControls";
import { GameMode, Side } from "../types";

export default function GameSetupPanel() {
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>("blitz");
  const [selectedColor, setSelectedColor] = useState<Side>("random");
  const { userId } = useGlobalStorage();

  const { isConnected, isSearching, findMatch, cancelMatchmaking } = useMatchmaking({
    userId,
    selectedGameMode
  });

  const handleFindMatch = () => {
    findMatch(selectedColor);
  };

  return (
    <div className="col-span-1 flex flex-col items-center w-full py-8 px-4">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4">PLAY ONLINE MODE</h1>
      
      <div className="w-full max-w-2xl space-y-8">
        <GameConfiguration
          selectedGameMode={selectedGameMode}
          selectedColor={selectedColor}
          onGameModeChangeAction={setSelectedGameMode}
          onColorChangeAction={setSelectedColor}
        />
        
        <MatchmakingControls
          isConnected={isConnected}
          isSearching={isSearching}
          onFindMatchAction={handleFindMatch}
          onCancelMatchmakingAction={cancelMatchmaking}
        />
      </div>
    </div>
  );
}