"use client";

import { motion } from "framer-motion";
import { useState } from "react";

// Generate gradient colors for avatars
const generateAvatarGradient = (index: number) => {
    const gradients = [
        'from-amber-500 to-orange-600',
        'from-purple-500 to-indigo-600',
        'from-emerald-500 to-teal-600',
        'from-rose-500 to-pink-600',
        'from-cyan-500 to-blue-600',
    ];
    return gradients[index % gradients.length];
};

// Rank badge component
const RankBadge = ({ rank }: { rank: number }) => {
    const badges = [
        { icon: '👑', label: 'Grandmaster', color: 'text-yellow-400' },
        { icon: '🛡️', label: 'Master', color: 'text-purple-400' },
        { icon: '⚔️', label: 'Expert', color: 'text-blue-400' },
        { icon: '🎯', label: 'Advanced', color: 'text-green-400' },
        { icon: '🌱', label: 'Beginner', color: 'text-gray-400' },
    ];
    const badge = badges[Math.min(rank, badges.length - 1)];

    return (
        <span className={`${badge.color} text-lg`} title={badge.label}>
            {badge.icon}
        </span>
    );
};

// Status indicator
const StatusIndicator = ({ status }: { status: 'online' | 'in-game' | 'away' }) => {
    const statusConfig = {
        'online': { color: 'bg-green-500', icon: '🟢', label: 'Online' },
        'in-game': { color: 'bg-yellow-500', icon: '🟡', label: 'In Game' },
        'away': { color: 'bg-blue-500', icon: '🔵', label: 'Away' },
    };
    const config = statusConfig[status];

    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${config.color} ${status === 'online' ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`}
                style={{ boxShadow: status === 'online' ? '0 0 8px #22c55e' : undefined }} />
            <span className="text-xs text-gray-500">{config.label}</span>
        </div>
    );
};

const players = [
    { name: "Grandmaster V", rating: 2800, winRate: 87, games: 1250, status: 'online' as const, rank: 0 },
    { name: "Tactician One", rating: 2450, winRate: 72, games: 890, status: 'in-game' as const, rank: 1 },
    { name: "Iron Defense", rating: 2100, winRate: 68, games: 654, status: 'online' as const, rank: 2 },
    { name: "Speed King", rating: 1950, winRate: 61, games: 432, status: 'away' as const, rank: 3 },
    { name: "Novice Hero", rating: 1200, winRate: 45, games: 87, status: 'online' as const, rank: 4 },
];

// Player row component with enhanced styling
const PlayerRow = ({ player, index }: { player: typeof players[0]; index: number }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-gold-500/20 transition-all duration-300 group cursor-pointer"
        >
            <div className="flex items-center gap-4">
                {/* Avatar with gradient background */}
                <div className="relative">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${generateAvatarGradient(index)} flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform duration-300 shadow-lg`}>
                        {player.name.charAt(0)}
                    </div>
                    {/* Status dot */}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-black ${player.status === 'online' ? 'bg-green-500' :
                            player.status === 'in-game' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                </div>

                {/* Player info */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h4 className="font-sans font-medium text-white group-hover:text-gold-300 transition-colors">
                            {player.name}
                        </h4>
                        <RankBadge rank={player.rank} />
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="font-mono text-xs text-gold-500">
                            {player.rating} ELO
                        </span>
                        <StatusIndicator status={player.status} />
                    </div>
                    {/* Stats on hover */}
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                            height: isHovered ? 'auto' : 0,
                            opacity: isHovered ? 1 : 0
                        }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Win Rate: <span className="text-green-400">{player.winRate}%</span></span>
                            <span>Games: <span className="text-gray-300">{player.games}</span></span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Challenge button with sword animation */}
            <motion.button
                className="relative px-6 py-2.5 rounded-lg border border-gold-500/30 text-gold-400 font-sans text-sm tracking-wider uppercase hover:bg-gold-500 hover:text-black transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Sword crossing animation on hover */}
                <motion.span
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                >
                    <span className="absolute left-1 opacity-50">⚔️</span>
                </motion.span>
                <span className="relative z-10">Challenge</span>
            </motion.button>
        </motion.div>
    );
};

// Typing/searching indicator
const SearchingIndicator = () => (
    <div className="flex items-center gap-2 text-gray-500">
        <span className="text-sm">Searching for players</span>
        <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gold-500"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
            ))}
        </div>
    </div>
);

export default function Step2() {
    return (
        <section className="w-full py-20 relative z-10">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="text-3xl">⚔️</span>
                        <h2 className="font-display text-4xl md:text-5xl text-gold-100">
                            The Lobby
                        </h2>
                        <span className="text-3xl">⚔️</span>
                    </div>
                    <p className="font-serif text-gold-400/80 text-lg">
                        Challenge worthy opponents from around the world
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <div className="glass-card rounded-2xl overflow-hidden backdrop-blur-md border border-white/10 bg-black/40">
                        {/* Header with Quick Match */}
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-display text-xl text-gold-100">Active Players</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                                        <span className="font-mono text-xs text-green-400">LIVE</span>
                                    </div>
                                </div>

                                {/* Quick Match Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-black font-bold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-shadow"
                                >
                                    <span className="text-lg">🎲</span>
                                    Quick Match
                                </motion.button>
                            </div>

                            {/* Searching indicator */}
                            <div className="mt-4 flex items-center justify-between">
                                <SearchingIndicator />
                                <span className="text-sm text-gray-500">
                                    {players.filter(p => p.status === 'online').length} online now
                                </span>
                            </div>
                        </div>

                        {/* Player List */}
                        <div className="p-4 space-y-2">
                            {players.map((player, index) => (
                                <PlayerRow key={player.name} player={player} index={index} />
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <span>🌍</span>
                                <span>Players from 32 countries online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background effects */}
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gold-600/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary-blue-2/20 rounded-full blur-[100px] translate-y-1/3 translate-x-1/3 pointer-events-none" />
        </section>
    );
}