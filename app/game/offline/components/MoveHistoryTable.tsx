import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoveHistoryRow } from "./MoveHistoryRow";
import { MoveHistoryTableProps } from "../types";

export const MoveHistoryTable: React.FC<MoveHistoryTableProps> = ({ moveHistoryPairs }) => (
  <div
    className="
      relative w-[200px] sm:w-[300px] h-[280px]
      rounded-[12px] border border-white/35
      bg-[#3B3433]/60 backdrop-blur-sm
      shadow-[0_8px_30px_rgba(0,0,0,0.35)]
      p-2 sm:p-3
    "
  >
    <div className="rounded-t-[10px] overflow-hidden">
      <table className="w-full table-fixed text-white [font-variant-numeric:tabular-nums] bg-[#3B3433]/70">
        <colgroup>
          <col className="w-[64px]" />
          <col />
          <col />
          <col className="w-[64px]" />
        </colgroup>
        <thead>
          <tr>
            <th className="py-1 px-2 text-left text-[15px] font-semibold leading-none whitespace-nowrap">Turn</th>
            <th className="py-1 px-2 text-left text-[15px] font-semibold leading-none whitespace-nowrap">White</th>
            <th className="py-1 px-2 text-left text-[15px] font-semibold leading-none whitespace-nowrap">Black</th>
            <th className="py-1 px-2 text-left text-[15px] font-semibold leading-none whitespace-nowrap">Time</th>
          </tr>
        </thead>
      </table>
    </div>

    <ScrollArea
      className="
        h-[200px] w-full
        rounded-b-[10px] overflow-hidden
        [&>[data-radix-scroll-area-viewport]]:rounded-b-[10px]
        [&>[data-radix-scroll-area-viewport]]:overflow-hidden
      "
    >
      <table className="w-full table-fixed text-white border-separate border-spacing-0 [font-variant-numeric:tabular-nums] bg-[#3B3433]/40">
        <colgroup>
          <col className="w-[64px]" />
          <col />
          <col />
          <col className="w-[64px]" />
        </colgroup>
        <tbody className="divide-y divide-white/10">
          {moveHistoryPairs.map((pair) => (
            <MoveHistoryRow key={pair.turn} pair={pair} />
          ))}

          <tr>
            <td colSpan={4} className="h-1 p-0"></td>
          </tr>
        </tbody>
      </table>
    </ScrollArea>
  </div>
);
