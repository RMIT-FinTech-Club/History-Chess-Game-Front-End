import { useState, useEffect } from "react";
import { Square, Chess } from "chess.js";

export const useSquareHighlight = (
  selectedPiece: Square | null,
  fen: string,
  timeoutGameOver: boolean
) => {
  const [customSquareStyles, setCustomSquareStyles] = useState({});
  const [chess] = useState(new Chess());

  useEffect(() => {
    if (selectedPiece && fen && !timeoutGameOver) {
      chess.load(fen);
      const moves = chess.moves({ square: selectedPiece, verbose: true });
      const newStyles: Record<string, React.CSSProperties> = {};
      
      newStyles[selectedPiece] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      };
      
      moves.forEach(move => {
        newStyles[move.to] = {
          backgroundColor: chess.get(move.to) ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 255, 0, 0.4)'
        };
      });
      
      setCustomSquareStyles(newStyles);
    } else {
      setCustomSquareStyles({});
    }
  }, [selectedPiece, fen, chess, timeoutGameOver]);

  return { customSquareStyles };
};