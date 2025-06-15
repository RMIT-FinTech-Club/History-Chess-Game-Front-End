import React from "react";
import { Chessboard } from "react-chessboard";
import { ChessBoardSectionProps } from "../types";

export const ChessBoardSection: React.FC<ChessBoardSectionProps> = ({
  gameState,
  handleDrop,
  onPieceClick,
  onSquareClick,
  onPieceDragBegin,
  boardWidth,
  customSquareStyles,
  boardOrientation,
  isCurrentPlayerTurn,
}) => {
  return (
    <div className="flex justify-center items-center">
      <Chessboard
        id="historyChessBoard"
        position={gameState?.fen || ""}
        onPieceDrop={handleDrop}
        onPieceClick={onPieceClick}
        onSquareClick={onSquareClick}
        onPieceDragBegin={onPieceDragBegin}
        boardWidth={boardWidth}
        animationDuration={300}
        customSquareStyles={customSquareStyles}
        boardOrientation={boardOrientation}
        arePiecesDraggable={!!gameState && !gameState.gameOver && isCurrentPlayerTurn}
      />
    </div>
  );
};