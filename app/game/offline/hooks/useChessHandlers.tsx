import { useCallback } from "react";
import { Square } from "chess.js";
import { toast } from "sonner";
import { UseChessHandlersProps } from "../types";

export const useChessHandlers = ({
  isSinglePlayer,
  playerColor,
  fen,
  selectedPiece,
  setSelectedPiece,
  makeMove,
}: UseChessHandlersProps) => {
  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece: string) => {
      if (
        isSinglePlayer &&
        ((playerColor === "w" && fen.includes(" b ")) ||
          (playerColor === "b" && fen.includes(" w ")))
      ) {
        toast.error("Not your turn", {
          description: "Wait for the AI to make its move.",
          duration: 1000,
        });
        return false;
      }

      const sourcePiece = piece.charAt(1).toLowerCase();
      const sourceColor = piece.charAt(0);
      const isPawnPromotion =
        sourcePiece === "p" &&
        ((sourceColor === "w" && targetSquare[1] === "8") ||
          (sourceColor === "b" && targetSquare[1] === "1"));

      let promotionPiece: "q" | "r" | "b" | "n" | undefined = undefined;

      if (piece.length === 2 && isPawnPromotion) return true;
      else if (
        piece.length === 2 &&
        piece.charAt(1).toLowerCase() !== "p" &&
        ((sourceColor === "w" && targetSquare[1] === "8") ||
          (sourceColor === "b" && targetSquare[1] === "1"))
      ) {
        const promo = piece.charAt(1).toLowerCase();
        if (promo === "q" || promo === "r" || promo === "b" || promo === "n") {
          promotionPiece = promo;
        }
      }

      const success = makeMove(sourceSquare as Square, targetSquare as Square, promotionPiece);
      if (!success) {
        toast.error("Invalid Move", {
          description: "That move is not allowed.",
          duration: 1000,
        });
      }
      return success;
    },
    [isSinglePlayer, playerColor, fen, makeMove]
  );

  const onPieceDragBegin = useCallback(
    (piece: string, sourceSquare: Square) => {
      if (isSinglePlayer) {
        const pieceColor = piece.charAt(0).toLowerCase();
        if (
          (playerColor === "w" && pieceColor !== "w") ||
          (playerColor === "b" && pieceColor !== "b")
        )
          return;
      }
      setSelectedPiece(sourceSquare);
    },
    [isSinglePlayer, playerColor, setSelectedPiece]
  );

  const onPieceClick = useCallback(
    (piece: string, sourceSquare: Square) => {
      if (isSinglePlayer) {
        const pieceColor = piece.charAt(0).toLowerCase();
        if (
          (playerColor === "w" && pieceColor !== "w") ||
          (playerColor === "b" && pieceColor !== "b")
        )
          return;
      }
      setSelectedPiece(selectedPiece === sourceSquare ? null : sourceSquare);
    },
    [isSinglePlayer, playerColor, selectedPiece, setSelectedPiece]
  );

  const onSquareClick = useCallback(
    (square: Square) => {
      if (selectedPiece && square !== selectedPiece) {
        const pieceOnSquare = fen
          .split(" ")[0]
          .split("/")
          .map((row, i) => {
            let colIndex = 0;
            const result: { [key: string]: string } = {};
            for (let j = 0; j < row.length; j++) {
              const char = row[j];
              if (/\d/.test(char)) colIndex += parseInt(char);
              else {
                const squareNotation = `${String.fromCharCode(
                  97 + colIndex
                )}${8 - i}`;
                result[squareNotation] = char;
                colIndex++;
              }
            }
            return result;
          })
          .reduce((acc, row) => ({ ...acc, ...row }), {});

        const piece = pieceOnSquare[selectedPiece];
        const isPawnPromotion =
          piece &&
          piece.toLowerCase() === "p" &&
          ((piece === "P" && square[1] === "8") ||
            (piece === "p" && square[1] === "1"));

        const promotionPiece = isPawnPromotion ? "q" : undefined;
        const success = makeMove(selectedPiece, square, promotionPiece);
        if (!success) setSelectedPiece(null);
      }
    },
    [selectedPiece, fen, makeMove, setSelectedPiece]
  );

  return {
    handleDrop,
    onPieceDragBegin,
    onPieceClick,
    onSquareClick,
  };
};