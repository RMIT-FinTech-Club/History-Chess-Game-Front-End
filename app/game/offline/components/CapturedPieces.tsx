import React, { useState } from 'react';
import { defaultPieces } from '../../../../components/Pieces';

const CapturedList: React.FC<{ pieces: string[] }> = ({ pieces }) => {
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
  blackCaptured: string[];
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ whiteCaptured, blackCaptured }) => {
  return (
    <div className="text-white w-full">
      <h2 className="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Captured Pieces
      </h2>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white border border-gray-300 shrink-0" />
          <span className="text-xs sm:text-sm text-gray-300 shrink-0">captured:</span>
          <div className="flex-1 min-w-0 overflow-hidden">
            <CapturedList pieces={blackCaptured} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-800 border border-gray-600 shrink-0" />
          <span className="text-xs sm:text-sm text-gray-300 shrink-0">captured:</span>
          <div className="flex-1 min-w-0 overflow-hidden">
            <CapturedList pieces={whiteCaptured} />
          </div>
        </div>
      </div>
    </div>
  );
};
