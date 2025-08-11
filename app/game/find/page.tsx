"use client";

import React, { useEffect, useState } from "react";
import GameSetupPanel from "./components/GameSetupPanel";
import { Chessboard } from "react-chessboard";
import "@/css/chessboard.css";
import YellowLight from "@/components/decor/YellowLight";
import { useBoardSize } from "@/hooks/useBoardSize";
import { useRouter } from "next/navigation";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import { toast } from "sonner";

const FindMatchPage = () => {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useGlobalStorage();
  const boardWidth = useBoardSize();
  const router = useRouter();

  const [theme, setTheme] = useState({
      frame: '#E9B654',
      frame2: '#363624',
      light: '#F0D9B5',
      dark: '#B58863',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to play game.");
      router.push('/sign_in')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-2 items-center justify-center p-4 my-10 relative"
         style={
            {
              ['--board-frame' as any]: theme.frame,
              ['--board-frame-2' as any]: theme.frame2,
              ['--board-light' as any]: theme.light,
              ['--board-dark' as any]: theme.dark,
            } as React.CSSProperties
        }
      >
      <YellowLight top={'-50vh'} left={'80vw'} />
      <Chessboard
        id="historyChessBoard"
        position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        boardWidth={boardWidth}
        animationDuration={0}
        arePiecesDraggable={false}
      />
      <GameSetupPanel />
    </div>
  );
};

export default FindMatchPage;