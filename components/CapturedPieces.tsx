import { defaultPieces } from "./Pieces";

interface CapturedPiecesProps {
  color: "White" | "Black";
  pieces: string[];
}

export const CapturedPieces = ({ color, pieces }: CapturedPiecesProps) => {
  return (
    <div className="w-30 max-h-[100%] p-2 rounded-md bg-white">
      <h2 className="text-center text-lg text-black font-bold">
        {color} Captured
      </h2>
      <div className="flex flex-col flex-wrap items-center justify-center">
        {pieces.map((piece, index) => (
          <div key={index} className="w-10 h-10 flex items-center justify-center">
            {defaultPieces[piece] || <span>?</span>}
          </div>
        ))}
      </div>
    </div>
  );
};