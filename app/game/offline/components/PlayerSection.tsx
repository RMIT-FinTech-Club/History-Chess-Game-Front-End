  // PlayerSection.tsx (compact 350px)
  import Image from "next/image";
  import { useBoardSize } from "@/hooks/useBoardSize";

  type BaseProps = {
    color: "White" | "Black";
    pieces: string[];
    isCurrentTurn: boolean;
    gameActive: boolean;
    profileName?: string;
    profileImage?: string | null;
  };
  type Props = BaseProps & { elo?: number; side?: "w" | "b" };

  export const PlayerSection = ({
    color,
    pieces,
    isCurrentTurn,
    gameActive,
    profileName,
    profileImage,
    elo = 1298,
    side = color === "White" ? "w" : "b",
  }: Props) => {
    const name = profileName || color;

    // Compact sizes
    const WIDTH = 350;   
    const AVATAR = 48;  
    const DOT = 24;    

    const initials =
      name.split(/[\s_]+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join("") || "??";

    return (
      <div
        className="
          relative overflow-hidden rounded-xl
          border border-white/10 bg-white/5 backdrop-blur-[2px]
          shadow-[0_6px_18px_rgba(0,0,0,.35)]
          px-4 py-3 text-[#EBEBEB]
          after:content-[''] after:absolute after:inset-1.5
          after:rounded-lg after:border after:border-white/10 after:pointer-events-none
        "
        style={{ width: `${WIDTH}px`, height: "180px" }}  
      >
        <div className="h-full flex items-center gap-3">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={`${name} avatar`}
              width={AVATAR}
              height={AVATAR}
              className="rounded-full object-cover bg-[#4A4A4A] shrink-0"
            />
          ) : (
            <div
              className="grid place-items-center rounded-full bg-[#4A4A4A] text-white shrink-0"
              style={{ width: AVATAR, height: AVATAR }}
            >
              <span className="font-semibold text-[18px] leading-none">{initials}</span>
            </div>
          )}

          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <span className="truncate font-medium text-[18px] leading-tight">{name}</span>
            <span className="text-[13px] leading-tight opacity-85 tabular-nums">
              ELO: {elo.toLocaleString("en-US")}
            </span>
          </div>

          <div className="shrink-0">
            <div
              className={[
                "rounded-full border border-[3px] border-[#EBEBEB]",
                side === "w" ? "bg-white" : "bg-black",
                isCurrentTurn && gameActive ? "ring-2 ring-[#F7D27F]" : "",
              ].join(" ")}
              style={{ width: DOT, height: DOT }}
              aria-label={side === "w" ? "White" : "Black"}
            />
          </div>
        </div>
      </div>
    );
  };
