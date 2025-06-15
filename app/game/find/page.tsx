"use client";

import React, { useEffect, useState } from "react";
import GameSetupPanel from "./components/GameSetupPanel";
import { Chessboard } from "react-chessboard";
import "@/css/chessboard.css"; 
import YellowLight from "@/components/decor/YellowLight";

const FindMatchPage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-2 items-center justify-center p-4 my-10 relative">
      <YellowLight top={'-50vh'} left={'80vw'}/>
      <Chessboard
          id="historyChessBoard"
          position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          boardWidth={700}
          animationDuration={0}
          arePiecesDraggable={false}
      />
      <GameSetupPanel />
    </div>
  );
};

export default FindMatchPage;