import React from "react";
import { PlayerSection } from "./PlayerSection";          
import { ChessBoardSection } from "./ChessBoardSection";
import { MoveHistoryTable } from "../../offline/components/MoveHistoryTable";
import { GameControls } from "./GameControls";
import { GameLayoutProps } from "../types";
import { CapturedPieces } from "./CapturedPieces";
import { MatchDetail } from "./MatchDetailProps";
import { GameHeader } from "./GameHeader";

export const GameLayout: React.FC<GameLayoutProps> = ({
  boardOrientation,
  capturedWhite,
  capturedBlack,
  gameState,
  whiteProfile,
  blackProfile,
  formatTimeInSeconds,
  handleDrop,
  onPieceClick,
  onSquareClick,
  onPieceDragBegin,
  boardWidth,
  customSquareStyles,
  isCurrentPlayerTurn,
  moveHistoryPairs,
  handleNewGame,
  currentTurn,
  totalMove,
}) => {
  // helper chọn theo orientation cho TOP/BOTTOM
  const topIsOpponent = boardOrientation === "white";
  const topProfile = topIsOpponent ? blackProfile : whiteProfile;
  const bottomProfile = topIsOpponent ? whiteProfile : blackProfile;

  const topColor: "White" | "Black" = topIsOpponent ? "Black" : "White";
  const bottomColor: "White" | "Black" = topIsOpponent ? "White" : "Black";

  const topTime = formatTimeInSeconds(
    topIsOpponent ? gameState?.blackTimeLeft : gameState?.whiteTimeLeft
  );
  const bottomTime = formatTimeInSeconds(
    topIsOpponent ? gameState?.whiteTimeLeft : gameState?.blackTimeLeft
  );

  const topTurn =
    boardOrientation === "white" ? gameState?.turn === "b" : gameState?.turn === "w";
  const bottomTurn =
    boardOrientation === "white" ? gameState?.turn === "w" : gameState?.turn === "b";

  return (

    
    <div className="w-[95vw] grid flex-1 grid-cols-1 lg:grid-cols-[350px_minmax(560px,1fr)_380px] gap-6">
      {/* LEFT SIDEBAR */}
      <aside className="min-h-0 space-y-4">
        {/* TOP player (Rival) */}
        <PlayerSection
          color={topColor}
          pieces={topIsOpponent ? capturedBlack : capturedWhite}
          timeInSeconds={topTime}
          isCurrentTurn={!!topTurn}
          isPaused={false}
          gameActive={!gameState?.gameOver}
          profileName={topProfile.name}
          profileImage={topProfile.image}
          elo={topProfile.elo}
        />

        {/* BOTTOM player (You) */}
        <PlayerSection
          color={bottomColor}
          pieces={topIsOpponent ? capturedWhite : capturedBlack}
          timeInSeconds={bottomTime}
          isCurrentTurn={!!bottomTurn}
          isPaused={false}
          gameActive={!gameState?.gameOver}
          profileName={bottomProfile.name}
          profileImage={bottomProfile.image}
          elo={bottomProfile.elo}
        />

        <div className="rounded-xl px-4 py-3 text-white/90">
          <CapturedPieces whiteCaptured={capturedWhite} blackCaptured={capturedBlack} />
        </div>
      </aside>

      {/* CENTER: BOARD */}
      <section className="flex flex-col items-center">
        <ChessBoardSection
          gameState={gameState}
          handleDrop={handleDrop}
          onPieceClick={onPieceClick}
          onSquareClick={onSquareClick}
          onPieceDragBegin={onPieceDragBegin}
          boardWidth={630}
          customSquareStyles={customSquareStyles}
          boardOrientation={boardOrientation}
          isCurrentPlayerTurn={isCurrentPlayerTurn}
        />

        <div className="mt-2 w-full max-w-[650px]">
          <GameControls onNewGame={handleNewGame} canUndo={false} showUndo={false} />
        </div>
      </section>

      {/* RIGHT: HISTORY + MATCH DETAIL */}
      <aside className="min-h-0 flex flex-col gap-4">
        <div className="rounded-xl p-4 text-white/90">
          <h1 className="text-xl font-semibold mb-2">Move History</h1>
          <div className="rounded-xl p-2">
            <MoveHistoryTable moveHistoryPairs={moveHistoryPairs} />
          </div>
        </div>

        <div className="rounded-xl p-4 text-white/90">
          <h1 className="text-xl font-semibold mb-3">Match Details</h1>
          <MatchDetail currentTurn={currentTurn} totalMove={totalMove} />
        </div>
      </aside>
    </div>
  );
};
