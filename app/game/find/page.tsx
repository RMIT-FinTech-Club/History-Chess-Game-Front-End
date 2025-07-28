"use client";

import React, { useEffect, useState } from "react";
import GameSetupPanel from "./components/GameSetupPanel";
import { Chessboard } from "react-chessboard";
import "@/css/chessboard.css";
import YellowLight from "@/components/decor/YellowLight";
import { useBoardHeight } from "@/hooks/useBoardSize";
import { useRouter } from "next/navigation";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import { toast } from "sonner";

const FindMatchPage = () => {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useGlobalStorage();
  const height = useBoardHeight();
  const router = useRouter();

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
    <div className="w-full h-[calc(100dvh-var(--navbar-height))] p-[2vw] text-white flex justify-center items-center overflow-hidden">
      <YellowLight top={'-50vh'} left={'80vw'} />
      <div className="w-[max-content] mx-auto">
        <Chessboard
          id="historyChessBoard"
          position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          boardWidth={height}
          animationDuration={0}
          arePiecesDraggable={false}
        />
      </div>
      <GameSetupPanel />
    </div>
  );
};

export default FindMatchPage;