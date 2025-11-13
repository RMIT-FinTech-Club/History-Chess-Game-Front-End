import React from "react";
import { Chessboard } from "react-chessboard";
import { ChessBoardSectionProps } from "../types";
import { getCustomPieces } from  "../../../challenge/PiecesBoardSelector";
import { useSelectedBoardId } from "../hooks/useSelectedBoardId";

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
  const boardId = useSelectedBoardId(); // Use the custom hook to get the board ID

  return (
    <div className="flex justify-center items-center">
      <Chessboard
        id={boardId}
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
        customPieces={getCustomPieces(boardId)}
      />
    </div>
  );
};