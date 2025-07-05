import React from "react";
import { Button } from "@/components/ui/button";
import { GameControlsProps } from "../types";

export const GameControls: React.FC<GameControlsProps> = ({
  onUndo,
  onNewGame,
  canUndo,
  showUndo = true,
}) => {
  const shouldShowUndo = showUndo && onUndo;

  return (
    <div
      className={`grid gap-2 ${
        shouldShowUndo ? "grid-cols-2" : "grid-cols-1"
      }`}
    >
      {shouldShowUndo && (
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="default"
          size="sm"
          className="!py-6 !text-lg"
        >
          Undo Move
        </Button>
      )}
      <Button
        onClick={onNewGame}
        size="sm"
        className="!py-6 !bg-[#F7D27F] !text-lg !text-black hover:!bg-[#C7A95D]"
      >
        New Game
      </Button>
    </div>
  );
};