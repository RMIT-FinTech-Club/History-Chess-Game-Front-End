import React from "react";
import { PlayerSection } from "./PlayerSection";
import { ChessBoardSection } from "./ChessBoardSection";
import { MoveHistoryTable } from "./MoveHistoryTable";
import { GameControls } from "./GameControls";
import { GameLayoutProps } from "../types";

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
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-3 w-full max-w-7xl flex-1">
      <div className="flex flex-col justify-between w-full min-h-0">
        {/* Top Player */}
        <div className="flex justify-center w-full md:justify-start">
          <PlayerSection 
            color={boardOrientation === "white" ? "Black" : "White"}
            pieces={boardOrientation === "white" ? capturedBlack : capturedWhite}
            timeInSeconds={formatTimeInSeconds(
              boardOrientation === "white" ? gameState?.blackTimeLeft : gameState?.whiteTimeLeft
            )}
            isCurrentTurn={boardOrientation === "white" 
              ? gameState?.turn === "b" 
              : gameState?.turn === "w"
            }
            isPaused={false}
            gameActive={!gameState?.gameOver}
            profileName={boardOrientation === "white" ? blackProfile.name : whiteProfile.name}
            profileImage={boardOrientation === "white" ? blackProfile.image : whiteProfile.image}
            elo={boardOrientation === "white" ? blackProfile.elo : whiteProfile.elo}
          />
        </div>
        
        {/* Board and Move History Row */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Chess Board */}
          <ChessBoardSection
            gameState={gameState}
            handleDrop={handleDrop}
            onPieceClick={onPieceClick}
            onSquareClick={onSquareClick}
            onPieceDragBegin={onPieceDragBegin}
            boardWidth={boardWidth}
            customSquareStyles={customSquareStyles}
            boardOrientation={boardOrientation}
            isCurrentPlayerTurn={isCurrentPlayerTurn}
          />
          
          {/* Right Side - Move History and Controls */}
          <div className="w-full text-black flex flex-col justify-between gap-3">
            <MoveHistoryTable moveHistoryPairs={moveHistoryPairs} />
            
            <GameControls
              onNewGame={handleNewGame}
              canUndo={false}
              showUndo={false}
            />
          </div>
        </div>
        
        {/* Bottom Player */}
        <div className="flex justify-center md:justify-start">
          <PlayerSection
            color={boardOrientation === "white" ? "White" : "Black"}
            pieces={boardOrientation === "white" ? capturedWhite : capturedBlack}
            timeInSeconds={formatTimeInSeconds(
              boardOrientation === "white" ? gameState?.whiteTimeLeft : gameState?.blackTimeLeft
            )}
            isCurrentTurn={boardOrientation === "white" 
              ? gameState?.turn === "w" 
              : gameState?.turn === "b"
            }
            isPaused={false}
            gameActive={!gameState?.gameOver}
            profileName={boardOrientation === "white" ? whiteProfile.name : blackProfile.name}
            profileImage={boardOrientation === "white" ? whiteProfile.image : blackProfile.image}
            elo={boardOrientation === "white" ? whiteProfile.elo : blackProfile.elo}
          />
        </div>
      </div>
    </div>
  );
};