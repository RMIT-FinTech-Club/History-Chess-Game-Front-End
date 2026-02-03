import { motion } from "framer-motion";
import Image from "next/image";
import { FaCrown } from "react-icons/fa";
import { Player } from "./types";

interface PodiumProps {
    topPlayers: Player[];
    onlineDetails?: Set<string>; // Set of online player IDs
    onChallenge?: (player: Player) => void;
}

export default function Podium({ topPlayers, onlineDetails, onChallenge }: PodiumProps) {
    // Ensure we have 3 slots even if fewer players
    const first = topPlayers[0];
    const second = topPlayers[1];
    const third = topPlayers[2];

    return (
        <div className="flex justify-center items-end gap-4 md:gap-8 mb-12 w-full max-w-4xl px-4 pt-8">
            {/* 2nd Place */}
            <PodiumStep
                player={second}
                rank={2}
                delay={0.2}
                isOnline={second && onlineDetails?.has(second.id)}
                onChallenge={onChallenge}
            />

            {/* 1st Place */}
            <PodiumStep
                player={first}
                rank={1}
                delay={0}
                isOnline={first && onlineDetails?.has(first.id)}
                onChallenge={onChallenge}
            />

            {/* 3rd Place */}
            <PodiumStep
                player={third}
                rank={3}
                delay={0.4}
                isOnline={third && onlineDetails?.has(third.id)}
                onChallenge={onChallenge}
            />
        </div>
    );
}

function PodiumStep({
    player,
    rank,
    delay,
    isOnline,
    onChallenge
}: {
    player?: Player;
    rank: number;
    delay: number;
    isOnline?: boolean;
    onChallenge?: (player: Player) => void;
}) {
    const isFirst = rank === 1;
    const heightClass = isFirst ? "h-64 md:h-80" : rank === 2 ? "h-48 md:h-60" : "h-40 md:h-48";

    // Color Themes
    // Color Themes
    const colorMap: Record<number, { border: string; bg: string; text: string; glow: string }> = {
        1: {
            border: "border-gold-royal",
            bg: "bg-gradient-to-b from-gold-royal/20 to-gold-deep/5",
            text: "text-gold-royal",
            glow: "shadow-[0_0_30px_rgba(212,175,55,0.3)]"
        },
        2: {
            border: "border-gray-300",
            bg: "bg-gradient-to-b from-gray-300/20 to-gray-500/5",
            text: "text-gray-300",
            glow: "shadow-[0_0_20px_rgba(200,200,200,0.2)]"
        },
        3: {
            border: "border-orange-700",
            bg: "bg-gradient-to-b from-orange-700/20 to-orange-900/5",
            text: "text-orange-400",
            glow: "shadow-[0_0_20px_rgba(180,80,0,0.2)]"
        }
    };

    const colors = colorMap[rank] || colorMap[1];

    if (!player) {
        return (
            <div className={`w-1/3 max-w-[160px] flex flex-col items-center justify-end opacity-50 ${heightClass}`}>
                <div className="w-full h-full bg-white/5 rounded-t-lg border-t border-white/10" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, type: "spring" }}
            className={`relative w-1/3 max-w-[200px] flex flex-col items-center group cursor-pointer ${isFirst ? 'z-10' : 'z-0'}`}
            onClick={() => isOnline && onChallenge?.(player)}
        >
            {/* Avatar Section */}
            <div className={`relative mb-4 transition-transform duration-300 group-hover:scale-105 ${isFirst ? 'w-24 h-24 md:w-32 md:h-32' : 'w-16 h-16 md:w-20 md:h-20'}`}>
                {isFirst && (
                    <FaCrown className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl text-gold-shimmer drop-shadow-lg animate-pulse" />
                )}
                <div className={`
          relative w-full h-full rounded-full overflow-hidden 
          border-2 md:border-4 ${colors.border} ${colors.glow}
          bg-black
        `}>
                    <Image
                        src={player.avatarUrl || "/img/DefaultUser.png"}
                        alt={player.username}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Rank Badge */}
                <div className={`
          absolute -bottom-3 left-1/2 -translate-x-1/2 
          w-6 h-6 md:w-8 md:h-8 flex items-center justify-center 
          rounded-full bg-black border ${colors.border}
          font-display font-bold text-sm md:text-lg ${colors.text}
        `}>
                    {rank}
                </div>

                {/* Online Indicator */}
                {isOnline && (
                    <div className="absolute top-1 right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
                )}
            </div>

            {/* Info Card */}
            <div className="text-center mb-2 z-10 w-full px-2">
                <h3 className={`font-display font-bold text-sm md:text-lg truncate ${colors.text}`}>
                    {player.username}
                </h3>
                <p className="font-serif text-white/70 text-xs md:text-sm">
                    {player.elo.toLocaleString()} Elo
                </p>
            </div>

            {/* Podium Block */}
            <div className={`
        w-full ${heightClass} 
        rounded-t-lg backdrop-blur-md
        border-t border-x ${colors.border}
        ${colors.bg}
        relative overflow-hidden
      `}>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute bottom-4 w-full text-center opacity-30">
                    <span className={`font-display font-black text-4xl md:text-6xl ${colors.text}`}>
                        {rank}
                    </span>
                </div>
            </div>

            {/* Challenge Overlay (Desktop) */}
            {isOnline && (
                <div className="absolute inset-x-0 -bottom-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex justify-center">
                    <button className="px-4 py-1.5 bg-black/80 border border-gold-royal/50 rounded-full text-gold-light text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                        Challenge
                    </button>
                </div>
            )}
        </motion.div>
    );
}
