import React from "react";
import { MoveHistoryRowProps } from "../types";

export const MoveHistoryRow: React.FC<MoveHistoryRowProps> = ({ pair }) => (
  <tr className="hover:bg-white/5">
    <td className="py-1 px-2 text-center text-white/85 whitespace-nowrap text-center">{pair.turn}.</td>
    <td className="py-1 px-2 text-center whitespace-nowrap truncate">{pair.whiteMove}</td>
    <td className="py-1 px-2 text-center whitespace-nowrap truncate">{pair.blackMove}</td>
    <td className="py-1 px-2 text-center text-white/80 whitespace-nowrap">
      {pair.whiteTime !== "-" && (
        <div className="flex items-center justify-center gap-2">
          <div className="flex justify-end w-30 h-1.5 overflow-hidden">
            <div
              className="h-full bg-white"
              style={{
                width: `${Math.min(
                  100,
                  (pair.whiteTimeRaw / pair.maxTime) * 1000
                )}%`,
              }}
            />
          </div>
          <span className="min-w-[40px] text-left text-xs">
            {pair.whiteTime}
          </span>
        </div>
      )}
      {pair.blackTime && (
        <div className="flex items-center justify-center gap-2">
          <div className="flex justify-end w-30 h-1.5 overflow-hidden">
            <div
              className="h-full bg-black"
              style={{
                width: `${Math.min(
                  100,
                  (pair.blackTimeRaw / pair.maxTime) * 1000
                )}%`,
              }}
            />
          </div>
          <span className="min-w-[40px] text-left text-xs">
            {pair.blackTime}s
          </span>
        </div>
      )}
    </td>
  </tr>
);