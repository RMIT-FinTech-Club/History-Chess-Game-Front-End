"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function ArenaIntro() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const xLeft = useTransform(scrollYProgress, [0, 1], [-100, 50]);
    const xRight = useTransform(scrollYProgress, [0, 1], [100, -50]);

    return (
        <section ref={containerRef} className="w-full py-24 relative overflow-hidden flex flex-col items-center justify-center min-h-[70vh]">

            {/* Background Kinetic Typography */}
            <div className="absolute inset-0 flex flex-col justify-center items-center opacity-[0.03] select-none pointer-events-none overflow-hidden">
                <motion.div style={{ x: xLeft }} className="whitespace-nowrap font-display text-[15vw] leading-none text-white">
                    GRANDMASTER GRANDMASTER
                </motion.div>
                <motion.div style={{ x: xRight }} className="whitespace-nowrap font-display text-[15vw] leading-none text-white opacity-50">
                    STRATEGY STRATEGY
                </motion.div>
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="font-serif text-blue-400 uppercase tracking-[0.3em] text-sm">
                        Competitive Play
                    </span>
                    <h2 className="font-display text-5xl md:text-7xl text-white mt-4 mb-8">
                        The World is <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-600">
                            Your Battlefield
                        </span>
                    </h2>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="font-sans text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-12"
                >
                    From bullet chess to grand strategy, test your mettle against
                    the finest minds across the globe. Climb the ELO ladder,
                    earn your rank, and etch your name into the Hall of Masters.
                </motion.p>

                {/* Visual Rank Progression */}
                <motion.div
                    className="flex justify-center items-center gap-4 md:gap-8 flex-wrap"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4, staggerChildren: 0.1 }}
                >
                    {[
                        { icon: "♟️", label: "Novice" },
                        { icon: "♞", label: "Apprentice" },
                        { icon: "♝", label: "Adept" },
                        { icon: "♜", label: "Expert" },
                        { icon: "♛", label: "Master" },
                        { icon: "👑", label: "Legend" },
                    ].map((rank, i) => (
                        <motion.div
                            key={rank.label}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="flex flex-col items-center gap-2 group cursor-default"
                        >
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 flex items-center justify-center text-2xl md:text-3xl bg-white/5 backdrop-blur-sm group-hover:bg-gold-500/20 group-hover:border-gold-500/50 transition-all duration-300 ${i === 5 ? 'border-gold-500/50 bg-gold-500/10 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : ''}`}>
                                {rank.icon}
                            </div>
                            <span className={`text-xs uppercase tracking-wider font-medium ${i === 5 ? 'text-gold-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                {rank.label}
                            </span>
                            {i < 5 && <div className="hidden md:block w-8 h-px bg-white/5 absolute -right-6 top-8" />}
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}
