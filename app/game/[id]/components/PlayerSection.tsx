// PlayerSection.tsx (ONLINE – giữ nguyên props như bạn đang truyền)
import Image from "next/image";
import { useMemo } from "react";
import { useBoardSize } from "@/hooks/useBoardSize";

export type PlayerSectionProps = {
  color: "White" | "Black";
  pieces: string[];              // chưa dùng ở UI này nhưng giữ để tương thích
  timeInSeconds: number;         // bạn đã đưa đúng kiểu number
  isCurrentTurn: boolean;
  isPaused: boolean;
  gameActive: boolean;
  profileName?: string;
  profileImage?: string | null;
  elo?: number;
};

export const PlayerSection = ({
  color,
  timeInSeconds,
  isCurrentTurn,
  isPaused,
  gameActive,
  profileName,
  profileImage,
  elo = 1247,
}: PlayerSectionProps) => {
  const name = profileName || color;
  const boardWidth = useBoardSize() || 350;

  // Khóa đúng 350 theo mock, vẫn tính từ hook nếu bạn muốn nới sau
  const WIDTH = Math.min(350, boardWidth);
  const AVATAR = 48;
  const DOT = 22;

  const initials = useMemo(
    () =>
      name
        .split(/[\s_]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0]!.toUpperCase())
        .join("") || "??",
    [name]
  );

  // Suy ra side từ color (không cần prop mới)
  const side = color === "White" ? "w" : "b";

  // H:MM:SS giống design
  const formatHMS = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const timeLabel = useMemo(() => {
    const you = name.toLowerCase() === "you";
    if (isCurrentTurn && !isPaused && gameActive) {
      return you ? "Your turn" : `${color}'s turn`;
    }
    return you ? "Your time" : `${color}'s time`;
  }, [name, isCurrentTurn, isPaused, gameActive, color]);

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
      {/* Hàng trên: avatar + tên/ELO + chấm màu */}
      <div className="h-[58px] flex items-center gap-3">
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
              "rounded-full border-[3px] border-[#EBEBEB]",
              side === "w" ? "bg-white" : "bg-black",
              isCurrentTurn && gameActive && !isPaused ? "ring-2 ring-[#F7D27F]" : "",
            ].join(" ")}
            style={{ width: DOT, height: DOT }}
            aria-label={side === "w" ? "White" : "Black"}
          />
        </div>
      </div>

      {/* Khung thời gian ở giữa giống mock */}
      <div
        className="
          mt-3 w-full h-[76px]
          rounded-lg bg-black/35 border border-white/10
          grid place-items-center
        "
      >
        <div className="text-center leading-tight">
          <div
            className={[
              "font-mono tabular-nums text-[34px] sm:text-[36px]",
              isCurrentTurn && !isPaused && gameActive ? "text-[#F7D27F] font-semibold" : "text-[#F7D27F]",
              timeInSeconds < 60 ? "text-red-400" : "",
            ].join(" ")}
          >
            {formatHMS(timeInSeconds)}
          </div>
          <div className="text-[13px] opacity-90">{timeLabel}</div>
        </div>
      </div>
    </div>
  );
};
