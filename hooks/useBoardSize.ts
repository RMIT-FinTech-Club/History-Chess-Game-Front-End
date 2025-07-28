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

export const useBoardHeight = () => {
  const [boardHeight, setBoardHeight] = useState(580);

  useLayoutEffect(() => {
    const calculateBoardSize = () => {
      if (typeof window === "undefined") return 580;
      const width = window.innerWidth;
      let height = window.innerHeight;
      height = height - parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-height").trim()) || 0;

      return Math.min((height * 0.9), (width/2));
    };

    const handleResize = () => setBoardHeight(calculateBoardSize());

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return boardHeight;
};