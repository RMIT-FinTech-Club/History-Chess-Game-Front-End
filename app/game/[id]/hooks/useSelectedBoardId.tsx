import { useState, useEffect } from "react";

export function useSelectedBoardId(defaultId: string = "historyChessBoard") {
  const [boardId, setBoardId] = useState<string>(defaultId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedBoardTheme");
      if (saved) {
        setBoardId(saved);
      }
    }
  }, []);

  return boardId;
}
