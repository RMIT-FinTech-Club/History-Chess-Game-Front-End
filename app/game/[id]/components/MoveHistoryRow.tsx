import React from "react";
import { MoveHistoryRowProps } from "../types";

export const MoveHistoryRow: React.FC<MoveHistoryRowProps> = ({ pair }) => (
  <tr className="grid grid-cols-4 hover:bg-[#4A4443] transition-colors duration-200">
    <td className="col-span-1 py-2 px-2 text-center text-sm">{pair.turn}.</td>
    <td className="col-span-1 py-2 px-2 text-center text-sm">{pair.whiteMove}</td>
    <td className="col-span-1 py-2 px-2 text-center text-sm">{pair.blackMove}</td>
    <td className="col-span-1 py-2 px-2 text-center text-sm">
      {pair.whiteTime !== "-" && (
        <div className="flex items-center justify-center gap-2">
          <div className="flex justify-end w-10 h-1.5 overflow-hidden">
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
            {pair.whiteTime}s
          </span>
        </div>
      )}
      {pair.blackTime && (
        <div className="flex items-center justify-center gap-2">
          <div className="flex justify-end w-10 h-1.5 overflow-hidden">
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