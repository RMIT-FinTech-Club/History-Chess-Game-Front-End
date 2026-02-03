import { motion } from "framer-motion";
import Image from "next/image";
import { Player } from "./types";
import { FaCircle } from "react-icons/fa";

interface LeaderboardTableProps {
    players: Player[];
    startIndex: number; // Rank of the first player in the list (usually 4)
    onlineDetails?: Set<string>;
    onChallenge?: (player: Player) => void;
}

export default function LeaderboardTable({ players, startIndex, onlineDetails, onChallenge }: LeaderboardTableProps) {
    if (players.length === 0) {
        return (
            <div className="text-center py-12 text-white/50 font-serif italic">
                No more legends to display.
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl px-4 pb-20">
            <div className="glass-card overflow-hidden rounded-xl border border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40 border-b border-white/10">
                                <th className="py-4 px-6 font-serif text-xs font-bold text-gold-muted uppercase tracking-wider w-16 text-center">Rank</th>
                                <th className="py-4 px-6 font-serif text-xs font-bold text-gold-muted uppercase tracking-wider">Player</th>
                                <th className="py-4 px-6 font-serif text-xs font-bold text-gold-muted uppercase tracking-wider text-right">Elo</th>
                                <th className="py-4 px-6 font-serif text-xs font-bold text-gold-muted uppercase tracking-wider text-right w-32 hidden md:table-cell">Status</th>
                                <th className="py-4 px-6 font-serif text-xs font-bold text-gold-muted uppercase tracking-wider text-right w-32">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {players.map((player, index) => {
                                const rank = startIndex + index;
                                const isOnline = onlineDetails?.has(player.id);

                                return (
                                    <motion.tr
                                        key={player.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05, duration: 0.3 }}
                                        className="group hover:bg-white/3 transition-colors"
                                    >
                                        {/* Rank */}
                                        <td className="py-4 px-6 text-center">
                                            <span className="font-display font-bold text-white/60 group-hover:text-gold-light transition-colors">
                                                #{rank}
                                            </span>
                                        </td>

                                        {/* Player */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-black shrink-0 group-hover:border-gold-royal/50 transition-colors">
                                                    <Image
                                                        src={player.avatarUrl || "/img/DefaultUser.png"}
                                                        alt={player.username}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <span className="font-sans font-semibold text-white/90 group-hover:text-white transition-colors truncate max-w-[150px] sm:max-w-xs">
                                                    {player.username}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Elo */}
                                        <td className="py-4 px-6 text-right font-mono text-gold-light font-medium">
                                            {player.elo.toLocaleString()}
                                        </td>

                                        {/* Status (Desktop) */}
                                        <td className="py-4 px-6 text-right hidden md:table-cell">
                                            <div className="flex items-center justify-end gap-2">
                                                <FaCircle className={`w-2 h-2 ${isOnline ? "text-green-500 animate-pulse" : "text-gray-600"}`} />
                                                <span className={`text-xs font-medium ${isOnline ? "text-green-400" : "text-gray-500"}`}>
                                                    {isOnline ? "Online" : "Offline"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => isOnline && onChallenge?.(player)}
                                                disabled={!isOnline}
                                                className={`
                           px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                           ${isOnline
                                                        ? "bg-gold-royal/10 text-gold-royal hover:bg-gold-royal hover:text-black border border-gold-royal/30 hover:border-gold-royal"
                                                        : "bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed opacity-50"
                                                    }
                         `}
                                            >
                                                {isOnline ? "Challenge" : "Offline"}
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
