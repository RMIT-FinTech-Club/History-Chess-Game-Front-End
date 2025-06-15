import { useMemo } from "react";
import { MoveHistoryPair } from "../types";
import { Move } from "chess.js";

export const useMoveHistory = (history: Move[], moveTimings: string[]) => {
  return useMemo(() => {
    const maxTimePerMove = 60;
    
    const formatTimeInSeconds = (time: string) => {
      if (!time || time === "-") return "-";
      const timeNum = parseFloat(time);
      return timeNum.toFixed(1);
    };

    const formattedHistory: MoveHistoryPair[] = [];
    
    for (let i = 0; i < history.length; i += 2) {
      const whiteMoveData = history[i];
      const blackMoveData = history[i + 1];
      
      const whiteMoveSan =
        typeof whiteMoveData === "string"
          ? whiteMoveData
          : (whiteMoveData as { san: string })?.san || "";
      const blackMoveSan =
        typeof blackMoveData === "string"
          ? blackMoveData
          : (blackMoveData as { san: string })?.san || "";

      formattedHistory.push({
        turn: Math.floor(i / 2) + 1,
        whiteMove: whiteMoveSan,
        blackMove: blackMoveSan || "",
        whiteTime: moveTimings[i] ? formatTimeInSeconds(moveTimings[i]) : "-",
        blackTime: moveTimings[i + 1]
          ? formatTimeInSeconds(moveTimings[i + 1])
          : "",
        whiteTimeRaw: moveTimings[i] ? parseFloat(moveTimings[i]) : 0,
        blackTimeRaw: moveTimings[i + 1] ? parseFloat(moveTimings[i + 1]) : 0,
        maxTime: maxTimePerMove,
      });
    }
    
    return formattedHistory;
  }, [history, moveTimings]);
};