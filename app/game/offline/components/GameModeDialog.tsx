import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GameModeDialogProps } from "../types";

export const GameModeDialog: React.FC<GameModeDialogProps> = ({
  open,
  aiDifficulty,
  setAiDifficulty,
  difficultyLevels,
  handleStartSinglePlayer,
  handleStartTwoPlayer,
  isAiReady,
  onClose,
}) => (
  <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex justify-center text-2xl font-medium text-[#F7D27F] mb-4">
          CHOOSE GAME MODE
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-normal text-[#F7D27F]">
            Play against Computer
          </h3>
          <div className="flex flex-col space-y-4">
            <div>
              <p className="text-muted-foreground text-sm mb-2">
                Select AI difficulty:
              </p>
              <div className="flex flex-wrap gap-2">
                {difficultyLevels.map((level) => (
                  <Button
                    key={level}
                    size="sm"
                    onClick={() => setAiDifficulty(level)}
                    className={`!text-xs ${
                      aiDifficulty === level
                        ? "!bg-black !text-white border border-white hover:!bg-gray-800"
                        : "text-white hover:text-[#F7D27F]"
                    }`}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={() => handleStartSinglePlayer("w")}
                className="flex-1 !font-medium"
                disabled={!isAiReady}
              >
                Play as White
              </Button>
              <Button
                onClick={() => handleStartSinglePlayer("b")}
                className="flex-1 !font-medium"
                disabled={!isAiReady}
              >
                Play as Black
              </Button>
            </div>
            {!isAiReady && (
              <p className="text-yellow-500">Loading AI engine...</p>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-normal text-[#F7D27F]">Two Player Mode</h3>
          <div className="flex flex-col space-y-2">
            <Button onClick={handleStartTwoPlayer} className="!font-medium">
              Start Two Player Game
            </Button>
            <div className="text-xs sm:text-sm text-muted-foreground">
              <p>
                In two player mode, you can enable auto-rotate to flip the board
                automatically between turns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);