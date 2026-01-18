import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoveHistoryRow } from "./MoveHistoryRow";
import { MoveHistoryTableProps } from "../types";

export const MoveHistoryTable: React.FC<MoveHistoryTableProps> = ({ moveHistoryPairs }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [moveHistoryPairs]);

  return (
    <div
      className="
        relative w-full h-full flex flex-col
        rounded-lg border border-white/20
        bg-[#2A2625]/80 backdrop-blur-sm
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="bg-[#3B3433]/70 border-b border-white/10 shrink-0">
        <table className="w-full table-fixed text-white text-xs sm:text-sm [font-variant-numeric:tabular-nums]">
          <colgroup>
            <col className="w-[50px] sm:w-[60px]" />
            <col className="w-auto" />
            <col className="w-auto" />
            <col className="w-[50px] sm:w-[60px]" />
          </colgroup>
          <thead>
            <tr>
              <th className="py-2 px-2 text-center font-semibold text-white/70 whitespace-nowrap">Turn</th>
              <th className="py-2 px-2 text-center font-semibold text-white/70 whitespace-nowrap">White</th>
              <th className="py-2 px-2 text-center font-semibold text-white/70 whitespace-nowrap">Black</th>
              <th className="py-2 px-2 text-center font-semibold text-white/70 whitespace-nowrap">Time</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1 w-full h-full">
        <div className="w-full">
          <table className="w-full table-fixed text-white text-xs sm:text-sm border-separate border-spacing-0 [font-variant-numeric:tabular-nums]">
            <colgroup>
              <col className="w-[50px] sm:w-[60px]" />
              <col className="w-auto" />
              <col className="w-auto" />
              <col className="w-[50px] sm:w-[60px]" />
            </colgroup>
            <tbody className="divide-y divide-white/5">
              {moveHistoryPairs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-white/40 italic">
                    No moves yet
                  </td>
                </tr>
              ) : (
                moveHistoryPairs.map((pair) => (
                  <MoveHistoryRow key={pair.turn} pair={pair} />
                ))
              )}
            </tbody>
          </table>
          <div ref={scrollRef} className="h-1" />
        </div>
      </ScrollArea>
    </div>
  );
};
