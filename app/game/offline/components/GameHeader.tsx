import React from "react";
import { Button } from "@/components/ui/button";
import { GameHeaderProps } from "../types";

export const GameHeader: React.FC<GameHeaderProps & { elo?: number }> = ({
  isSinglePlayer,
  playerColor,
  aiLevel,
  autoRotateBoard,
  onToggleAutoRotate,
  elo,
}) => {
  return (
    <header className="w-full max-w-[95vw] mt-2 mb-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Game Info */}
        <div className="flex items-center gap-4">
          <span className="text-gold-royal font-display font-bold text-lg">
            FTC CHESS
          </span>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-sm sm:text-base font-serif text-white/80">
            {isSinglePlayer ? "Single Player" : "Two Players"}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {typeof elo === "number" && (
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-black/50 border border-gold-deep/30 text-gold-light text-xs font-semibold">
              ELO: {elo.toLocaleString("en-US")}
            </span>
          )}

          <span className="px-3 py-1 rounded-full bg-black/50 border border-gold-deep/30 text-gold-light text-xs font-semibold">
            You: {playerColor === "w" ? "White" : "Black"}
          </span>

          {isSinglePlayer && (
            <span className="px-3 py-1 rounded-full bg-gold-royal/20 border border-gold-royal/50 text-gold-light text-xs font-semibold">
              AI Level {aiLevel}
            </span>
          )}

          {!isSinglePlayer && (
            <Button
              variant={autoRotateBoard ? "default" : "outline"}
              size="sm"
              onClick={onToggleAutoRotate}
              className={`text-xs h-7 px-3 ${autoRotateBoard
                  ? "bg-gold-royal text-black hover:bg-gold-shimmer"
                  : "bg-transparent text-white/70 border-white/20 hover:text-white hover:border-gold-royal"
                }`}
            >
              {autoRotateBoard ? "Auto-Rotate On" : "Auto-Rotate Off"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
