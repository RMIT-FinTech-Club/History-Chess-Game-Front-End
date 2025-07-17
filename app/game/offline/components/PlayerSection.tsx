import { defaultPieces } from "../../../../components/Pieces";
import { useState, useLayoutEffect } from "react";
import Image from "next/image";
import { PlayerSectionProps } from "../types";
import { useBoardSize } from "@/hooks/useBoardSize";

export const PlayerSection = ({
  color,
  pieces,
  isCurrentTurn,
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

  // Get the board width from the custom hook
  const boardWidth = useBoardSize();

  // Calculate the height for avatar
  const [avtHeight, setAvtHeight] = useState(60);
  useLayoutEffect(() => {
    const calculateAvtHeight = () => {
      if (typeof window === "undefined") return 60;
      return window.innerHeight / 100 * 8 // 8vh
    };

    const handleResize = () => setAvtHeight(calculateAvtHeight);

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [])

  return (
    <div
      className="flex items-center h-[10vh] overflow-y-hidden my-[1vh]"
      style={{ width: `${boardWidth}px` }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Image
          src={displayImage}
          alt={`${displayName} player avatar`}
          width={avtHeight}
          height={avtHeight}
          className="rounded-full aspect-square border-2 border-gray-300 mr-[1vh]"
        />
      </div>

      {/* Player Info Section */}
      <div className="flex-1 flex justify-between gap-2">
        {/* Player Name and Time */}
        <div className="flex flex-col">
          <h2 className={`text-[2vh] font-bold text-white ${isCurrentTurn && gameActive ? "text-[#F7D27F]" : ""}`}>
            {displayName}
            {isCurrentTurn && gameActive && (
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
                <span className="text-[1.5vh] text-gray-400">None</span>
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
      </div>
    </div>
  );
};