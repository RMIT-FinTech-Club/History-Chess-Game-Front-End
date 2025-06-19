import React from "react";
import { Button } from "@/components/ui/button";
import { GameHeaderProps } from "../types";

export const GameHeader: React.FC<GameHeaderProps> = ({
  isSinglePlayer,
  playerColor,
  aiLevel,
  isThinking,
  autoRotateBoard,
  onToggleAutoRotate,
  onChangeGameMode,
}) => (
  <div className="w-full max-w-7xl">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <span className="text-lg font-medium text-[#F7D27F]">
        {isSinglePlayer
          ? `Single Player (You: ${
              playerColor === "w" ? "White" : "Black"
            }, AI Level: ${aiLevel})`
          : "Two Players"}
      </span>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {isThinking && (
          <span className="animate-pulse text-[#F7D27F] text-sm sm:text-base font-medium">
            AI thinking...
          </span>
        )}
        {!isSinglePlayer && (
          <Button
            variant={autoRotateBoard ? "default" : "outline"}
            size="sm"
            onClick={onToggleAutoRotate}
            className={`!text-md !font-medium !py-[1.25rem] ${
              autoRotateBoard
                ? "!bg-black !text-white hover:!bg-gray-800"
                : "text-white border-white hover:text-[#F7D27F]"
            }`}
          >
            {autoRotateBoard ? "Auto-rotate: ON" : "Auto-rotate: OFF"}
          </Button>
        )}
      </div>
    </div>
  </div>
);