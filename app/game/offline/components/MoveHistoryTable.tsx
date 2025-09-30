import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoveHistoryRow } from "./MoveHistoryRow";
import { MoveHistoryTableProps } from "../types";

export const MoveHistoryTable: React.FC<MoveHistoryTableProps> = ({
  moveHistoryPairs,
}) => (
  <div className="h-full w-full flex flex-col overflow-hidden rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
    {/* Header */}
    <div className="px-6 py-4 border-b border-white/10">
      <h3 className="text-white text-xl font-semibold tracking-wide">
        Move History
      </h3>
    </div>

    {/* Table Container */}
    <div className="flex-1 min-h-0 overflow-hidden">
      <ScrollArea className="h-full w-full">
        <table className="w-full text-white">
          <thead className="sticky top-0 z-10 bg-black/60 backdrop-blur-sm">
            <tr className="grid grid-cols-4 border-b border-white/5">
              <th className="col-span-1 py-3 px-3 text-center text-sm font-medium text-white/70 uppercase tracking-wider">
                Turn
              </th>
              <th className="col-span-1 py-3 px-3 text-center text-sm font-medium text-white/70 uppercase tracking-wider">
                White
              </th>
              <th className="col-span-1 py-3 px-3 text-center text-sm font-medium text-white/70 uppercase tracking-wider">
                Black
              </th>
              <th className="col-span-1 py-3 px-3 text-center text-sm font-medium text-white/70 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {moveHistoryPairs.map((pair) => (
              <MoveHistoryRow key={pair.turn} pair={pair} />
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  </div>
);