import React, { useState } from "react";
import Hamburger from "@/components/ui/Hamburger";
import SideBar from "./SideBar";
import { Button } from "@/components/ui/button";
import { GameHeaderProps } from "../types";

export const GameHeader: React.FC<GameHeaderProps> = ({
  isSinglePlayer,
  playerColor,
  aiLevel,
  autoRotateBoard,
  onToggleAutoRotate,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-[90vw] h-[4vh] mt-[1vh]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-[90vw] relative">
        <span className="text-[2vh] leading-[4vh] font-medium text-[#F7D27F]">
          {isSinglePlayer
            ? `Single Player (You: ${
                playerColor === "w" ? "White" : "Black"
              }, AI Level: ${aiLevel})`
            : "Two Players"}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {!isSinglePlayer && (
            <Button
              variant={autoRotateBoard ? "default" : "outline"}
              size="sm"
              onClick={onToggleAutoRotate}
              className={`text-[2vh] leading-[4vh] !font-medium !py-[1.25rem] ${
                autoRotateBoard
                  ? "!bg-black !text-white hover:!bg-gray-800"
                  : "text-white border-white hover:text-[#F7D27F]"
              }`}
            >
              {autoRotateBoard ? "Auto-rotate: ON" : "Auto-rotate: OFF"}
            </Button>
          )}
        </div>
        <div className="z-50">
          <Hamburger onClick={() => setSidebarOpen((prev) => !prev)} />
        </div>
        <SideBar isOpen={sidebarOpen} />
      </div>
    </div>
  );
};