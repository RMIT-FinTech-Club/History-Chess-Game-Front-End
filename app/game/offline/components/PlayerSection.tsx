import { defaultPieces } from "../../../../components/Pieces";
import { useState } from "react";
import Image from "next/image";
import { PlayerSectionProps } from "../types";

export const PlayerSection = ({ 
  color, 
  pieces, 
  timeInSeconds, 
  isCurrentTurn, 
  isPaused, 
  gameActive,
  profileName,
  profileImage 
}: PlayerSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Use profileName if provided, otherwise default to color
  const displayName = profileName || color;
  
  // Use profileImage if provided, otherwise default to current image
  const displayImage = profileImage || "/footer/footer_bear.svg";
  
  // Calculate if we need to truncate
  const displayLimit = 4;
  const truncatedCount = pieces.length > displayLimit && !isHovered ? pieces.length - displayLimit : 0;
  
  // When hovered, show all pieces; otherwise show truncated list
  const displayPieces = isHovered ? pieces : 
                        truncatedCount > 0 ? pieces.slice(-displayLimit) : pieces;

  // Format seconds into MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-[650px] py-3 rounded-md flex items-center gap-4">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Image
          src={displayImage}
          alt={`${displayName} player avatar`}
          width={60}
          height={50}
          className="rounded-full h-[60px] border-2 border-gray-300"
        />
      </div>
      
      {/* Player Info Section */}
      <div className="flex-1 flex justify-between gap-2">
        {/* Player Name and Time */}
        <div className="flex flex-col">
          <h2 className={`text-sm sm:text-lg font-bold text-white ${isCurrentTurn && !isPaused && gameActive ? "text-[#F7D27F]" : ""}`}>
            {displayName}
            {isCurrentTurn && !isPaused && gameActive && (
              <span className="animate-pulse text-[#F7D27F] ml-2">●</span>
            )}
          </h2>
          {/* Captured Pieces Section */}
          <div className="flex items-center gap-2">
            <div
              className="flex relative transition-all duration-300 ease-in-out flex-1"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {pieces.length === 0 ? (
                <span className="text-xs text-gray-400">None</span>
              ) : (
                <div className={`flex flex-row items-center transition-all duration-300 ${isHovered ? 'flex-wrap' : ''}`}>
                  {displayPieces.map((piece, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center"
                      style={{
                        transform: !isHovered && index > 0 ? `translateX(${-80 * index}%)` : 'translateX(0)',
                        zIndex: !isHovered ? index : 0,
                        position: 'relative',
                        transition: 'transform 0.3s ease-in-out',
                      }}
                    >
                      {defaultPieces[piece] || <span>?</span>}
                    </div>
                  ))}
                  
                  {/* Display truncation indicator after the last piece */}
                  {truncatedCount > 0 && !isHovered && (
                    <div
                      className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center bg-gray-200 rounded-full text-xs sm:text-sm text-black font-bold ml-1"
                      style={{
                        transform: displayPieces.length > 0 ? `translateX(${-80 * (displayPieces.length + 3)}%)` : 'translateX(0)',
                        position: 'relative',
                        zIndex: displayPieces.length,
                      }}
                    >
                      +{truncatedCount}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Time Display */}
        <div className="flex items-center gap-2">
          <span className={`font-mono text-4xl text-[#F7D27F] ${timeInSeconds < 60 ? "text-red-500" : ""} ${isCurrentTurn && !isPaused && gameActive ? "text-[#F7D27F] font-bold" : ""}`}>
            {formatTime(timeInSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};