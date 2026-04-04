"use client";

import React, { useState } from "react";
import Image from "next/image";


const dynastyThemes = [
  { id: "historyChessBoard", label: "Historical" },
  { id: "brownChessBoard", label: "Brown" },
  { id: "blueChessBoard", label: "Blue" },
];

export const boardPieceColors: Record<string, { white: { fill: string; outline: string }; black: { fill: string; outline: string }; }> = {
  historyChessBoard: {
    white: { fill: "#F4ECD8", outline: "#3B3433" },
    black: { fill: "#3B3433", outline: "#F4ECD8" },
  },
  brownChessBoard: {
    white: { fill: "#F5DEB3", outline: "#8B4513" },
    black: { fill: "#8B4513", outline: "#F5DEB3" },
  },
  blueChessBoard: {
    white: { fill: "#DCEEFF", outline: "#223A5E" },
    black: { fill: "#223A5E", outline: "#DCEEFF" },
  },
};

export default function BoardChoose({ selected, onSelect, }: { selected: string; onSelect: (boardId: string) => void; }) {
  const [open, setOpen] = useState(false);


  const handleSelect = (themeId: string) => {
    onSelect(themeId);
    setOpen(false);
    localStorage.setItem("selectedBoardTheme", themeId); // Save for later use
  };


  return (
    <div className="relative inline-flex items-center space-x-2 w-full">
      <div className="relative w-full">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="w-full flex items-center justify-between bg-surface-glass text-text-muted px-4 py-3 rounded-lg border border-border-glass hover:bg-white/5 transition-colors"
        >
          <span className="font-serif">{dynastyThemes.find((d) => d.id === selected)?.label ?? "Select Board"}</span>
          <span className="ml-2 text-gold-highlight">▾</span>
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full bg-[#2A2524] backdrop-blur-xl rounded-lg shadow-2xl border border-border-glass overflow-hidden">
            {dynastyThemes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                className={`px-4 py-2 cursor-pointer transition-colors ${selected === theme.id
                  ? "bg-gold-highlight/20 text-gold-highlight font-semibold"
                  : "text-text-secondary hover:bg-surface-glass"
                  }`}
              >
                <span className="font-serif">{theme.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// PNG version of the pieces
export function getCustomPieces(boardId: string, kingSkinUrl?: string) {

  const pieceTypes = [
    "wK", "wQ", "wR", "wB", "wN", "wP",
    "bK", "bQ", "bR", "bB", "bN", "bP",
  ];

  const customPieces: { [key: string]: React.FC<{ squareWidth: number; isDragging: boolean }> } = {};

  pieceTypes.forEach((type) => {
    // If it's the White King and we have a custom skin, use that
    const imagePath = (type === "wK" && kingSkinUrl)
      ? kingSkinUrl
      : `/pieces/${boardId}/${type}.png`;

    // We assume the component will receive props including squareWidth
    customPieces[type] = ({ squareWidth, isDragging }: { squareWidth: number; isDragging: boolean }) => (
      <div
        style={{
          width: squareWidth,
          height: squareWidth,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: isDragging ? 0 : 1, // Hide original piece while dragging
        }}
      >
        <div className="relative w-[80%] h-[80%] pointer-events-none select-none">
          <Image
            src={imagePath}
            alt={type}
            fill
            className="object-contain"
          />
        </div>
      </div>
    );
  });

  return customPieces;
}
