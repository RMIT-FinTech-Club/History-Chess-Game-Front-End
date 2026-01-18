import React from "react";

interface MatchDetailProps {
  currentTurn: "w" | "b";
  totalMove: number;
}

/**
 * Component to display match details including move count and current turn
 */
export const MatchDetail: React.FC<MatchDetailProps> = ({ currentTurn, totalMove }) => {
  const turnText = currentTurn === "w" ? "White" : "Black";

  return (
    <div
      className="
        w-full text-white
        rounded-lg border border-white/20
        bg-[#2A2625]/80 backdrop-blur-sm
        overflow-hidden
      "
    >
      {/* Move Number */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
        <span className="text-sm sm:text-base text-white/70 font-medium">Move Number</span>
        <span className="text-lg sm:text-xl font-bold text-yellow-500">{totalMove}</span>
      </div>

      {/* Current Turn */}
      <div className="flex justify-between items-center px-4 py-3">
        <span className="text-sm sm:text-base text-white/70 font-medium">Turn</span>
        <span
          className={`
            px-3 py-1 text-xs sm:text-sm font-semibold rounded-full
            ${currentTurn === 'b'
              ? 'bg-gray-800 text-white border border-white/20'
              : 'bg-white text-gray-900'
            }
          `}
        >
          {turnText}
        </span>
      </div>
    </div>
  );
};
