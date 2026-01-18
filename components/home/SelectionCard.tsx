"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface SelectionCardProps {
    title: string;
    description: string;
    image: string;
    onClick: () => void;
    delay?: number;
    variant?: 'online' | 'offline';
    features?: string[];
    playerCount?: number;
}

// Floating chess piece for background decoration
const FloatingChessPiece = ({ piece, className, delay }: { piece: string; className: string; delay: number }) => (
    <motion.div
        className={`absolute pointer-events-none select-none ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
    >
        <motion.span
            className="text-6xl block"
            animate={{
                y: [0, -15, 0],
                rotate: [-5, 5, -5],
                scale: [1, 1.05, 1]
            }}
            transition={{
                duration: 6 + delay * 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {piece}
        </motion.span>
    </motion.div>
);

export default function SelectionCard({
    title,
    description,
    image,
    onClick,
    delay = 0,
    variant = 'online',
    features = [],
    playerCount
}: SelectionCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const isOnline = variant === 'online';
    const icon = isOnline ? '🌐' : '🤖';
    const gradientColor = isOnline
        ? 'from-emerald-500/20 via-cyan-500/10 to-blue-500/20'
        : 'from-purple-500/20 via-violet-500/10 to-indigo-500/20';
    const accentColor = isOnline ? 'text-emerald-400' : 'text-purple-400';
    const borderAccent = isOnline ? 'group-hover:border-emerald-500/40' : 'group-hover:border-purple-500/40';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative cursor-pointer w-full md:w-[45%] h-[520px]"
        >
            {/* Hover Glow */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${gradientColor} blur-[60px] transition-all duration-500 rounded-[30px]`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 0.4 : 0 }}
            />

            <div className={`relative h-full glass-card rounded-[30px] overflow-hidden border border-white/5 ${borderAccent} transition-colors duration-500 flex flex-col bg-black/40`}>
                {/* Image Area */}
                <div className="h-[55%] w-full relative overflow-hidden">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 group-hover:opacity-60 transition-opacity duration-500 z-10`} />

                    {/* Background image */}
                    <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                        style={{ backgroundImage: `url(${image})` }}
                    />

                    {/* Floating chess pieces in background */}
                    <FloatingChessPiece piece="♔" className="top-4 left-4 text-white/10 z-20" delay={0} />
                    <FloatingChessPiece piece="♕" className="top-8 right-8 text-white/10 z-20" delay={0.5} />

                    {/* Mode Icon Badge */}
                    <div className="absolute top-6 right-6 z-20">
                        <motion.div
                            className="w-16 h-16 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:border-gold-500/50 transition-all duration-300"
                            animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="text-3xl">{icon}</span>
                        </motion.div>
                    </div>

                    {/* Player count for online mode */}
                    {isOnline && playerCount && (
                        <div className="absolute top-6 left-6 z-20">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm text-white font-mono">{playerCount} online</span>
                            </div>
                        </div>
                    )}

                    {/* Difficulty selector preview for offline */}
                    {!isOnline && (
                        <div className="absolute top-6 left-6 z-20">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                <span className="text-sm text-white/70">AI Level:</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`w-2 h-3 rounded-sm ${level <= 3 ? 'bg-purple-400' : 'bg-white/20'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 flex flex-col justify-between relative z-20">
                    <div>
                        <h3 className="font-display text-4xl md:text-5xl text-white mb-3 group-hover:text-gold-400 transition-colors duration-300 flex items-center gap-4">
                            {title}
                        </h3>
                        <div className="h-1 w-12 bg-gold-500/30 mb-4 group-hover:w-24 group-hover:bg-gold-500 transition-all duration-300" />
                        <p className="font-sans text-gray-400 text-lg group-hover:text-gray-200 transition-colors">
                            {description}
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {features.map((feature, index) => (
                            <motion.span
                                key={feature}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: delay + 0.3 + index * 0.1 }}
                                className={`px-3 py-1 rounded-full text-xs font-sans ${accentColor} bg-white/5 border border-white/10`}
                            >
                                {feature}
                            </motion.span>
                        ))}
                    </div>
                </div>

                {/* Bottom Highlight */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Corner accent */}
                <div className={`absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 ${isOnline ? 'border-emerald-500/30 group-hover:border-emerald-500' : 'border-purple-500/30 group-hover:border-purple-500'} rounded-br-lg transition-colors duration-300`} />
            </div>
        </motion.div>
    );
}
