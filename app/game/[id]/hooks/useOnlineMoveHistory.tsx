import { useMemo } from "react";
import { MoveHistoryPair } from "../types";

export const useOnlineMoveHistory = (
  history: Array<{moveNumber: number; move: string; color: string; time: number}>
) => {
  return useMemo(() => {
    const maxTimePerMove = 60;
    
    const formatTimeInSeconds = (timeMs: number) => {
      if (!timeMs || timeMs === 0) return "-";
      return (timeMs / 1000).toFixed(1);
    };

    const formattedHistory: MoveHistoryPair[] = [];
    
    // Process moves sequentially - white moves are at even indices, black at odd
    for (let i = 0; i < history.length; i += 2) {
      const whiteMove = history[i];
      const blackMove = history[i + 1];
      
      const turnNumber = Math.floor(i / 2) + 1;
      
      formattedHistory.push({
        turn: turnNumber,
        whiteMove: whiteMove?.move || "",
        blackMove: blackMove?.move || "",
        whiteTime: whiteMove ? formatTimeInSeconds(whiteMove.time) : "-",
        blackTime: blackMove ? formatTimeInSeconds(blackMove.time) : "",
        whiteTimeRaw: whiteMove ? whiteMove.time / 1000 : 0,
        blackTimeRaw: blackMove ? blackMove.time / 1000 : 0,
        maxTime: maxTimePerMove,
      });
    }
    
    return formattedHistory;
  }, [history]);
};