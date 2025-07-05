"use client";

import { GameConfigurationProps } from "../types";
import GameModeSelector from "./GameModeSelector";
import SideSelector from "./SideSelector";

export default function GameConfiguration({
  selectedGameMode,
  selectedColor,
  onGameModeChangeAction,
  onColorChangeAction
}: GameConfigurationProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xl font-semibold mb-4">
          Game Mode
        </label>
        <GameModeSelector
          selectedMode={selectedGameMode}
          onModeChange={onGameModeChangeAction}
        />
      </div>

      <div>
        <label className="block text-xl font-semibold mb-4">
          Color Preference
        </label>
        <SideSelector
          selectedSide={selectedColor}
          onSideChangeAction={onColorChangeAction}
        />
      </div>
    </div>
  );
}