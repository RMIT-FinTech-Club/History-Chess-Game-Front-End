"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const dynasties = [
    {
        id: "ly",
        name: "Ly Dynasty",
        era: "1009 - 1225",
        title: "The Era of Enlightenment",
        desc: "A golden age of Buddhism and cultural flourishing. Secure the borders, build the Temple of Literature, and defend against the Song.",
        color: "#1e3a8a", // Blue-ish
        accent: "bg-blue-900/50",
        image: "/landing/ly_dynasty.png" // Placeholder
    },
    {
        id: "tran",
        name: "Tran Dynasty",
        era: "1225 - 1400",
        title: "The Era of Steel",
        desc: "Three times defeating the Mongol invaders. Master the art of guerrilla warfare and grand strategy.",
        color: "#991b1b", // Red-ish
        accent: "bg-red-900/50",
        image: "/landing/tran_dynasty.png" // Placeholder
    },
    {
        id: "le",
        name: "Le Dynasty",
        era: "1428 - 1789",
        title: "The Era of Restoration",
        desc: "Reclaiming independence from the Ming. Establish the code of law and expand the realm to the South.",
        color: "#581c87", // Purple-ish
        accent: "bg-purple-900/50",
        image: "/landing/le_dynasty.png" // Placeholder
    }
];

export default function DynastyShowcase() {
    const [activeDynasty, setActiveDynasty] = useState(dynasties[0]);

    return (
        <section className="w-full min-h-screen flex items-center py-32 relative overflow-hidden">
            {/* Background tint based on active dynasty */}
            <motion.div
                animate={{ backgroundColor: activeDynasty.color }}
                className="absolute inset-0 opacity-10 transition-colors duration-1000 z-0"
            />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center">

                    {/* Visual Side (Left) */}
                    <div className="w-full lg:w-1/2 relative h-[500px] flex items-center justify-center">
                        {/* Abstract Geometric Decoration representing the dynasty */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeDynasty.id}
                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 1.1, rotate: 10 }}
                                transition={{ duration: 0.6 }}
                                className={`w-80 h-96 ${activeDynasty.accent} backdrop-blur-xl border border-white/10 rounded-t-full rounded-b-lg relative flex items-center justify-center`}
                            >
                                <div className="absolute inset-0 bg-gold-500/10 mix-blend-overlay" />
                                <span className="font-display text-9xl text-white/20 select-none">
                                    {activeDynasty.name.charAt(0)}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Content Side (Right) */}
                    <div className="w-full lg:w-1/2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="space-y-2"
                        >
                            <span className="font-serif text-gold-500 tracking-[0.2em] uppercase text-sm">
                                Historical Campaigns
                            </span>
                            <h2 className="font-display text-5xl md:text-6xl text-gold-100">
                                Relive the Glory
                            </h2>
                        </motion.div>

                        <div className="space-y-4">
                            {dynasties.map((dynasty) => (
                                <motion.div
                                    key={dynasty.id}
                                    onClick={() => setActiveDynasty(dynasty)}
                                    className={`p-6 rounded-xl border transition-all cursor-pointer group ${activeDynasty.id === dynasty.id
                                        ? "bg-white/10 border-gold-500/50"
                                        : "bg-transparent border-white/5 hover:bg-white/5"
                                        }`}
                                    whileHover={{ x: 10 }}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className={`font-display text-xl ${activeDynasty.id === dynasty.id ? "text-gold-400" : "text-gray-400 group-hover:text-gold-200"
                                            }`}>
                                            {dynasty.name}
                                        </h3>
                                        <span className="font-mono text-xs text-gray-500">{dynasty.era}</span>
                                    </div>

                                    <AnimatePresence>
                                        {activeDynasty.id === dynasty.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="font-serif text-gray-300 text-sm italic mb-2">
                                                    &quot;{dynasty.title}&quot;
                                                </p>
                                                <p className="font-sans text-gray-400 text-sm leading-relaxed">
                                                    {dynasty.desc}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>

                        <button className="px-8 py-3 bg-gold-600/20 border border-gold-500/30 hover:bg-gold-500 hover:text-black transition-all rounded text-gold-400 font-display uppercase tracking-widest text-sm">
                            View All Campaigns
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
