"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const modes = [
    {
        title: "Bullet",
        time: "1 min",
        icon: "⚡",
        description: "Lightning fast decisions. Test your instincts in the crucible of time.",
        difficulty: 4,
        players: 127,
        color: "from-amber-500/20 to-orange-600/10"
    },
    {
        title: "Blitz",
        time: "5 min",
        icon: "🔥",
        description: "Fast-paced action. Quick thinking meets strategic depth.",
        difficulty: 3,
        players: 89,
        color: "from-red-500/20 to-amber-600/10"
    },
    {
        title: "Rapid",
        time: "10 min",
        icon: "⏱️",
        description: "Strategic depth. Plan your conquest with precision and foresight.",
        difficulty: 2,
        players: 156,
        color: "from-blue-500/20 to-cyan-600/10"
    },
    {
        title: "Classic",
        time: "30 min",
        icon: "👑",
        description: "The traditional experience. Chess as the grandmasters intended.",
        difficulty: 1,
        players: 43,
        color: "from-purple-500/20 to-indigo-600/10"
    }
];

// Difficulty bar component
const DifficultyBar = ({ level }: { level: number }) => (
    <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-2 uppercase tracking-wider">Speed</span>
        {[1, 2, 3, 4].map((bar) => (
            <div
                key={bar}
                className={`w-2 h-4 rounded-sm transition-colors duration-300 ${bar <= level
                        ? 'bg-gold-500'
                        : 'bg-white/10'
                    }`}
            />
        ))}
    </div>
);

// Mode card with 3D tilt effect
const ModeCard = ({ mode, index }: { mode: typeof modes[0]; index: number }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        setMousePosition({ x, y });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setMousePosition({ x: 0, y: 0 });
            }}
            className="group relative cursor-pointer"
            style={{
                perspective: '1000px'
            }}
        >
            {/* Outer glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} blur-[40px] opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-2xl`} />

            <motion.div
                className="relative glass-card rounded-2xl overflow-hidden bg-black/40 border border-white/5 group-hover:border-gold-500/30 transition-colors duration-500"
                style={{
                    transform: isHovered
                        ? `rotateY(${mousePosition.x * 8}deg) rotateX(${-mousePosition.y * 8}deg)`
                        : 'rotateY(0deg) rotateX(0deg)',
                    transition: 'transform 0.1s ease-out'
                }}
            >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Chess board pattern background */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id={`chess-${index}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="12" height="12" fill="#D4AF37" />
                                <rect x="12" y="12" width="12" height="12" fill="#D4AF37" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#chess-${index})`} />
                    </svg>
                </div>

                <div className="relative p-8 flex flex-col items-center text-center z-10">
                    {/* Icon with animated ring */}
                    <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full border-2 border-gold-500/30 flex items-center justify-center group-hover:border-gold-400 transition-colors duration-300">
                            <motion.span
                                className="text-4xl"
                                animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                {mode.icon}
                            </motion.span>
                        </div>
                        {/* Animated ring */}
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-gold-500/50"
                            animate={isHovered ? {
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 0, 0.5]
                            } : {}}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </div>

                    {/* Title & Time */}
                    <h3 className="font-display text-2xl text-gold-100 mb-1 group-hover:text-gold-400 transition-colors">
                        {mode.title}
                    </h3>
                    <div className="font-mono text-sm text-gold-500 mb-4 px-4 py-1.5 rounded-full border border-gold-500/20 bg-gold-500/5 group-hover:bg-gold-500/10 transition-colors">
                        <motion.span
                            key={isHovered ? 'active' : 'idle'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {mode.time}
                        </motion.span>
                    </div>

                    {/* Description */}
                    <p className="font-sans text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed text-sm mb-6">
                        {mode.description}
                    </p>

                    {/* Footer stats */}
                    <div className="w-full pt-4 border-t border-white/5 flex items-center justify-between">
                        <DifficultyBar level={mode.difficulty} />
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-gray-500">{mode.players} playing</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function Step1() {
    return (
        <section className="w-full py-20 relative z-10 overflow-hidden">
            {/* Background chess board pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="chess-bg" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="30" height="30" fill="#D4AF37" />
                            <rect x="30" y="30" width="30" height="30" fill="#D4AF37" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#chess-bg)" />
                </svg>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header with crown icon */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="text-3xl">👑</span>
                        <h2 className="font-display text-4xl md:text-5xl text-gold-100">
                            Choose Your Arena
                        </h2>
                        <span className="text-3xl">👑</span>
                    </div>
                    <p className="font-serif text-gold-400/80 text-lg">
                        Select your preferred pace of battle
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-gold-500/50" />
                        <div className="w-2 h-2 rounded-full bg-gold-500/50" />
                        <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-gold-500/50" />
                    </div>
                </motion.div>

                {/* Mode Cards Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {modes.map((mode, index) => (
                        <ModeCard key={mode.title} mode={mode} index={index} />
                    ))}
                </div>
            </div>

            {/* Decorative blurs */}
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gold-600/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary-blue-2/20 rounded-full blur-[100px] translate-y-1/3 translate-x-1/3 pointer-events-none" />
        </section>
    );
}