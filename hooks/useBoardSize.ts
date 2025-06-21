import { useLayoutEffect, useState } from "react";

export const useBoardSize = () => {
  const [boardWidth, setBoardWidth] = useState(580);

  useLayoutEffect(() => {
    const calculateBoardSize = () => {
      if (typeof window === "undefined") return 580;
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 480) return Math.min(width - 48, 480);
      if (width < 768) return Math.min(width - 48, 580);
      return height * 0.75; // Default to 75% of viewport height
    };

    const handleResize = () => setBoardWidth(calculateBoardSize());
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return boardWidth;
};