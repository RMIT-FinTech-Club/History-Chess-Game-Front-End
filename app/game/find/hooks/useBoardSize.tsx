import { useLayoutEffect, useState } from "react";

export const useBoardSize = () => {
  const [boardWidth, setBoardWidth] = useState(580);

  useLayoutEffect(() => {
    const calculateBoardSize = () => {
      if (typeof window === "undefined") return 580;
      const width = window.innerWidth;
      if (width < 480) return Math.min(width - 48, 480);
      if (width < 768) return Math.min(width - 48, 580);
      return 650;
    };

    const handleResize = () => setBoardWidth(calculateBoardSize());
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return boardWidth;
};