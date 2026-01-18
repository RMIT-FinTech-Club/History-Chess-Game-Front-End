// PlayerSection.tsx - Responsive player card
import Image from "next/image";
import React from "react";

type BaseProps = {
  color: "White" | "Black";
  pieces: string[];
  isCurrentTurn: boolean;
  gameActive: boolean;
  profileName?: string;
  profileImage?: string | null;
};
type Props = BaseProps & { elo?: number; side?: "w" | "b" };

export const PlayerSection: React.FC<Props> = ({
  color,
  pieces,
  isCurrentTurn,
  gameActive,
  profileName,
  profileImage,
  elo = 1298,
  side = color === "White" ? "w" : "b",
}) => {
  const name = profileName || color;

  const initials =
    name.split(/[\s_]+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join("") || "??";

  return (
    <div
      className="
        relative overflow-hidden rounded-xl w-full
        border border-white/10 bg-white/5 backdrop-blur-[2px]
        shadow-[0_6px_18px_rgba(0,0,0,.35)]
        px-3 sm:px-4 py-3 text-[#EBEBEB]
      "
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {profileImage ? (
          <Image
            src={profileImage}
            alt={`${name} avatar`}
            width={40}
            height={40}
            className="rounded-full object-cover bg-[#4A4A4A] shrink-0 w-10 h-10 sm:w-12 sm:h-12"
          />
        ) : (
          <div
            className="grid place-items-center rounded-full bg-[#4A4A4A] text-white shrink-0 w-10 h-10 sm:w-12 sm:h-12"
          >
            <span className="font-semibold text-sm sm:text-base leading-none">{initials}</span>
          </div>
        )}

        {/* Name & Elo */}
        <div className="min-w-0 flex-1 flex flex-col justify-center overflow-hidden">
          <span className="truncate font-medium text-base sm:text-lg leading-tight">{name}</span>
          <span className="text-xs sm:text-sm leading-tight opacity-85 tabular-nums">
            ELO: {elo.toLocaleString("en-US")}
          </span>
        </div>

        {/* Side indicator */}
        <div className="shrink-0">
          <div
            className={[
              "rounded-full border-2 sm:border-[3px] border-[#EBEBEB]",
              side === "w" ? "bg-white" : "bg-black",
              isCurrentTurn && gameActive ? "ring-2 ring-[#F7D27F]" : "",
              "w-5 h-5 sm:w-6 sm:h-6"
            ].join(" ")}
            aria-label={side === "w" ? "White" : "Black"}
          />
        </div>
      </div>
    </div>
  );
};
