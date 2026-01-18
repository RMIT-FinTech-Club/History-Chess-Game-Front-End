import React from "react";
import { Button } from "@/components/ui/button";
import { GameControlsProps } from "../types";

interface CustomGameControlsProps extends GameControlsProps {
  onSurrender: () => void;
}

export const GameControls: React.FC<CustomGameControlsProps> = ({
  onUndo,
  onNewGame,
  onSurrender, 
  canUndo,
  showUndo = true,
}) => {
  const shouldShowUndo = showUndo && onUndo;

  return (
    <div className="flex w-full gap-3 justify-center">
      {shouldShowUndo && (
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="default"
          className="rounded-full !py-3 !text-base px-4 flex-1"
        >
          Undo Move
        </Button>
      )}
      <Button
        onClick={onNewGame}
        className="rounded-full !py-3 !bg-[#F7D27F] !text-base !text-black hover:!bg-[#C7A95D] px-4 flex-1"
      >
        New Game
      </Button>

      <Button
        onClick={onSurrender}
        variant="secondary"
        className="rounded-full !py-3 !text-base px-4 flex-1"
      >
        Surrender
      </Button>
    </div>
  );
};
