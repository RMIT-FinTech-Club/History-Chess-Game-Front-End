import { useLayoutEffect, useState } from "react";

export const useBoardSize = () => {
  const [boardWidth, setBoardWidth] = useState(580);

  useLayoutEffect(() => {
    const calculateBoardSize = () => {
      if (typeof window === "undefined") return 580;
      const width = window.innerWidth;
      const height = window.innerHeight;
      return Math.min((height * 0.71), (width/2));
    };

    const handleResize = () => setBoardWidth(calculateBoardSize());

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return boardWidth;
};