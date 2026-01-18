import React, { useState } from 'react';
import { defaultPieces } from '../../../../components/Pieces';


const CapturedList = ({ pieces }: { pieces: string[] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const displayLimit = 7;

  const truncatedCount = pieces.length > displayLimit && !isHovered ? pieces.length - displayLimit : 0;
  const displayPieces = isHovered ? pieces : (truncatedCount > 0 ? pieces.slice(-displayLimit) : pieces);

  if (pieces.length === 0) {
    return <span className="text-xs text-gray-500 italic">None</span>;
  }

  return (
    <div
      className="flex relative items-center min-h-[32px] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-center transition-all duration-300 ${isHovered ? 'flex-wrap gap-1' : ''}`}>
        {displayPieces.map((piece, index) => (
          <div
            key={`${piece}-${index}`}
            className="flex items-center justify-center transition-transform duration-300 ease-in-out"
            style={{
              transform: !isHovered && index > 0 ? `translateX(${-60 * index}%)` : 'translateX(0)',
              zIndex: index,
            }}
          >
            {defaultPieces[piece] || <span>?</span>}
          </div>
        ))}
      </div>

      {truncatedCount > 0 && (
         <div
            className="absolute flex items-center justify-center w-6 h-6 bg-gray-800/80 backdrop-blur-sm rounded-full text-xs text-white font-bold border-2 border-gray-500"
            style={{
                transform: `translateX(${(displayPieces.length * 12) - 18}px)`,
                zIndex: displayPieces.length,
            }}
        >
          +{truncatedCount}
        </div>
      )}
    </div>
  );
};


interface CapturedPiecesProps {
  whiteCaptured: string[];
  blackCaptured:string[];
}


export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ whiteCaptured, blackCaptured }) => {
  return (
    <div className="text-white w-full max-w-[350px]">
      <h2 className="text-xl font-bold mb-2">Captured</h2>
      <div className="bg-black/30 border border-white/20 rounded-lg p-3 space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-1">
            White captured:
          </h3>
          <CapturedList pieces={blackCaptured} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-1">
            Black captured:
          </h3>
          <CapturedList pieces={whiteCaptured} />
        </div>
      </div>
    </div>
  );
};

