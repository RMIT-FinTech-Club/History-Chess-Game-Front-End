import { useState, useEffect } from "react";
import { GameState } from "../types";

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [moveHistory, setMoveHistory] = useState<Array<{
    moveNumber: number;
    move: string;
    color: string;
    time: number;
  }>>([]);
  const [moveTimings, setMoveTimings] = useState<string[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [autoRotateBoard, setAutoRotateBoard] = useState(false);
  const [whiteProfile, setWhiteProfile] = useState({ 
    name: "White", 
    image: "/footer/footer_bear.svg" 
  });
  const [blackProfile, setBlackProfile] = useState({ 
    name: "Black", 
    image: "/footer/footer_bear.svg" 
  });

  // Update board orientation when auto-rotate changes
  useEffect(() => {
    if (gameState && autoRotateBoard) {
      setBoardOrientation(gameState.turn === "w" ? "white" : "black");
    } else if (gameState?.playerColor) {
      setBoardOrientation(gameState.playerColor);
    }
  }, [gameState?.turn, autoRotateBoard, gameState?.playerColor]);

  return {
    gameState,
    setGameState,
    boardOrientation,
    setBoardOrientation,
    moveHistory,
    setMoveHistory,
    moveTimings,
    setMoveTimings,
    capturedWhite,
    setCapturedWhite,
    capturedBlack,
    setCapturedBlack,
    autoRotateBoard,
    setAutoRotateBoard,
    whiteProfile,
    setWhiteProfile,
    blackProfile,
    setBlackProfile,
  };
};