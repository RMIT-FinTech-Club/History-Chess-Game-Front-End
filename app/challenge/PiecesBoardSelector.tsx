"use client";

import React, { JSX, useState } from "react";
import { defaultPieces } from "../../components/Pieces";

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
    <div className="relative inline-flex items-center space-x-2">
      <h3 className="text-white text-sm font-semibold">Dynasty choose</h3>
      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="bg-gray-800 text-white text-sm px-4 py-2 rounded-md shadow-md hover:bg-gray-700"
        >
          {dynastyThemes.find((d) => d.id === selected)?.label ?? "Select Board"}
          <span className="ml-2">▾</span>
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full bg-white rounded-md shadow-lg text-sm text-black">
            {dynastyThemes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${selected === theme.id ? "bg-yellow-100 font-semibold" : ""
                  }`}
              >
                {theme.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// PNG version of the pieces
export function getCustomPieces(boardId: string) {
  const theme = boardPieceColors[boardId] || boardPieceColors["historyChessBoard"];

  const pieceTypes = [
    "wK", "wQ", "wR", "wB", "wN", "wP",
    "bK", "bQ", "bR", "bB", "bN", "bP",
  ];

  const customPieces: { [key: string]: () => JSX.Element } = {};

  pieceTypes.forEach((type) => {

    const imagePath = `/pieces/${boardId}/${type}.png`;
    customPieces[type] = () => (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "6%",
          borderRadius: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={imagePath}
          alt={type}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none", // prevent interaction issues during drag
            userSelect: "none",
          }}
          draggable={false}
        />

      </div>
    );
  });

  return customPieces;
}
