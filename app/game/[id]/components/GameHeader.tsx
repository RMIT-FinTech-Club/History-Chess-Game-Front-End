import React, { useState } from "react";
import Hamburger from "@/components/ui/Hamburger";
import SideBar from "./SideBar";
import { Button } from "@/components/ui/button";
import { GameHeaderProps } from "../types";
import { ConnectionStatus } from "./ConnectionStatus";

export const GameHeader: React.FC<
  GameHeaderProps & { elo?: number; isConnected?: boolean }
> = ({
  isSinglePlayer,
  playerColor,
  autoRotateBoard,
  onToggleAutoRotate,
  elo,
  isConnected
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header className="w-[95vw] mt-2 mb-3">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <Hamburger onClick={() => setSidebarOpen(prev => !prev)} />

        {/* CENTER: Title + Connected */}
        <div className="justify-self-center max-w-full text-center">
          <span className="text-[24px] sm:text-[16px] leading-6 font-medium text-[#F7D27F]">
            {isSinglePlayer
              ? `Single Player (You: ${playerColor === "w" ? "White" : "Black"})`
              : "Two Players"}
          </span>
          <ConnectionStatus isConnected={!!isConnected} />
        </div>

        {/* RIGHT: ELO + Auto-rotate */}
        <div className="justify-self-end flex items-center gap-2 sm:gap-3">
          {typeof elo === "number" && (
            <span className="px-3 py-1 rounded-full bg-[#F0C76B] text-black text-[12px] sm:text-[13px] font-semibold shadow">
              ELO: {elo.toLocaleString("en-US")}
            </span>
          )}
          {!isSinglePlayer && (
            <Button
              variant={autoRotateBoard ? "default" : "outline"}
              size="sm"
              onClick={onToggleAutoRotate}
              className={`text-[12px] sm:text-[13px] !font-medium !py-2 ${
                autoRotateBoard
                  ? "!bg-black !text-white hover:!bg-neutral-800"
                  : "text-white border-white hover:text-[#F7D27F]"
              }`}
            >
              {autoRotateBoard ? "Auto-rotate: ON" : "Auto-rotate: OFF"}
            </Button>
          )}
        </div>
      </div>

      <SideBar isOpen={sidebarOpen} />
    </header>
  );
};
