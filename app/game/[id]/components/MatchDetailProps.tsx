import React from "react";

interface MatchDetailProps {
  currentTurn: "w" | "b";
  totalMove: number;
}

/**
 * Component để hiển thị thông tin chi tiết của trận đấu,
 * bao gồm tổng số nước đi và lượt của người chơi hiện tại.
 */
export const MatchDetail: React.FC<MatchDetailProps> = ({ currentTurn, totalMove }) => {
  const turnText = currentTurn === "w" ? "White" : "Black";

  return (
    <div
      className="
        relative w-full text-white
        rounded-[10px]
        border border-white/35
        bg-[#3B3433]/60 backdrop-blur-sm
        shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        w-[300px] sm:w-[300px]
        p-4
      "
    >
      <div className="flex justify-between items-center text-xl mb-3">
        <span className="font-medium">Move Number:</span>
        <span className="font-bold">{totalMove}</span>
      </div>
      <div className="flex justify-between items-center text-xl">
        <span className="font-medium">Turn:</span>
        <span className={`px-4 py-1 text-sm font-semibold rounded ${
            currentTurn === 'b' ? 'bg-black text-white' : 'bg-white text-black'
        }`}>
          {turnText}
        </span>
      </div>
    </div>
  );
};

