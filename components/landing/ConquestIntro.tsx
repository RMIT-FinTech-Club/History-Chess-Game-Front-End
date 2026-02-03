"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image"; // Assuming artwork availability, or use placeholders

export default function ConquestIntro() {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section ref={sectionRef} className="w-full min-h-screen relative py-20 flex items-center overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-red-900/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-amber-900/10 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/4" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Text Content */}
                    <motion.div
                        style={{ opacity }}
                        className="lg:w-1/2 space-y-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="font-serif text-gold-500 uppercase tracking-[0.3em] text-sm">
                                The Campaign Mode
                            </span>
                            <h2 className="font-display text-5xl md:text-7xl text-gold-100 mt-4 leading-[1.1]">
                                Command <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-amber-600">
                                    The Flow of Time
                                </span>
                            </h2>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="font-sans text-gray-300 text-lg leading-relaxed md:w-4/5"
                        >
                            History is not written in stone—it is forged in battle.
                            Step into the boots of legendary generals from the
                            <span className="text-gold-400 font-serif"> Ly, Tran, and Le dynasties</span>.
                            Relive pivotal moments where your strategy determines the fate of a nation.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex gap-6"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-display text-4xl text-white">3</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Great Eras</span>
                            </div>
                            <div className="w-[1px] h-12 bg-white/10" />
                            <div className="flex flex-col gap-1">
                                <span className="font-display text-4xl text-white">50+</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Battles</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Visual Content - Parallax Map/Art */}
                    <motion.div
                        style={{ y }}
                        className="lg:w-1/2 relative aspect-square md:aspect-[4/3] w-full"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/20 to-transparent rounded-full blur-[100px]" />

                        {/* Layered Composition */}
                        <div className="relative w-full h-full">
                            {/* Abstract Map Layer */}
                            <motion.div
                                className="absolute inset-0 border border-gold-500/20 rounded-2xl bg-black/40 backdrop-blur-sm overflow-hidden"
                                initial={{ rotate: -5, opacity: 0 }}
                                whileInView={{ rotate: -3, opacity: 1 }}
                                transition={{ duration: 1 }}
                            >
                                <div className="absolute inset-0 bg-[url('/landing/map_texture.png')] opacity-30 bg-cover grayscale" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-6xl opacity-20 filter blur-sm">🗺️</span>
                                </div>
                            </motion.div>

                            {/* Floating "Piece" Layer */}
                            <motion.div
                                className="absolute -right-8 -bottom-8 w-2/3 h-2/3 border border-white/10 bg-black/80 backdrop-blur-md rounded-xl p-6 shadow-2xl"
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                <div className="h-full border border-gold-500/10 rounded flex items-center justify-center flex-col gap-4">
                                    <span className="text-5xl drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">⚔️</span>
                                    <div className="text-center">
                                        <p className="font-display text-gold-200">Battle of Bach Dang</p>
                                        <p className="text-xs text-gray-500 mt-1">Difficulty: Hard</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
