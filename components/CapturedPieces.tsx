import { defaultPieces } from "./Pieces";
import { useState } from "react";

interface CapturedPiecesProps {
  color: "White" | "Black";
  pieces: string[];
}

export const CapturedPieces = ({ color, pieces }: CapturedPiecesProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate if we need to truncate
  const displayLimit = 4;
  const truncatedCount = pieces.length > displayLimit && !isHovered ? pieces.length - displayLimit : 0;
  
  // When hovered, show all pieces; otherwise show truncated list
  const displayPieces = isHovered ? pieces : 
                        truncatedCount > 0 ? pieces.slice(-displayLimit) : pieces;

  return (
    <div className="w-[600px] p-1 rounded-md flex items-center">
      {/* Title now on the same row as pieces */}
      <h2 className="text-lg font-bold mr-2 min-w-[120px]">
        {color} Captured:
      </h2>
      
      <div 
        className="flex relative transition-all duration-300 ease-in-out flex-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Show pieces in a row with or without overlay effect based on hover state */}
        <div className={`flex flex-row items-center transition-all duration-300 ${isHovered ? 'flex-wrap' : ''}`}>
          {displayPieces.map((piece, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center" 
              style={{ 
                transform: !isHovered && index > 0 ? `translateX(${-80 * index}%)` : 'translateX(0)',
                zIndex: !isHovered ? index : 0,
                position: 'relative',
                transition: 'transform 0.3s ease-in-out'
              }}
            >
              {defaultPieces[piece] || <span>?</span>}
            </div>
          ))}
          
          {/* Display truncation indicator after the last piece */}
          {truncatedCount > 0 && !isHovered && (
            <div 
              className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full text-sm text-black font-bold ml-1"
              style={{ 
                transform: displayPieces.length > 0 ? `translateX(${-80 * (displayPieces.length + 1)}%)` : 'translateX(0)',
                position: 'relative',
                zIndex: displayPieces.length
              }}
            >
              +{truncatedCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};