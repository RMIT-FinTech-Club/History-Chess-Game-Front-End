"use client";

import { motion } from "framer-motion";


const artifacts = [
    { name: "Jade Emperor Set", rarity: "Legendary", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    { name: "Crimson Dragon", rarity: "Epic", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
    { name: "Golden Lotus", rarity: "Rare", color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30" },
];

export default function MarketplaceShowcase() {
    return (
        <section className="w-full min-h-screen flex items-center py-32 relative overflow-hidden">
            {/* Diagonal Divider Background */}
            <div className="absolute inset-0 -skew-y-3 origin-top-left bg-white/[0.02] z-0 transform scale-110" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-20">

                    {/* Visual Side (Left) - Floating Cards */}
                    <div className="lg:w-1/2 relative min-h-[500px] w-full flex items-center justify-center">
                        {/* Glow */}
                        <div className="absolute inset-0 bg-purple-900/20 blur-[100px] rounded-full" />

                        {artifacts.map((item, index) => (
                            <motion.div
                                key={item.name}
                                className={`absolute w-64 p-4 rounded-xl backdrop-blur-xl border ${item.border} ${item.bg} shadow-2xl`}
                                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                                whileInView={{
                                    opacity: 1,
                                    y: (index - 1) * 60, // Staggered vertical position
                                    x: (index - 1) * 40, // Staggered horizontal
                                    scale: index === 1 ? 1.1 : 0.95, // Center prominent
                                    zIndex: index === 1 ? 20 : 10
                                }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                whileHover={{ scale: 1.1, zIndex: 30 }}
                            >
                                <div className="aspect-square rounded-lg bg-black/40 mb-4 flex items-center justify-center border border-white/5 relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-linear-to-tr ${item.bg} opacity-20`} />
                                    <span className="text-4xl">💎</span>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-display text-white">{item.name}</h4>
                                    <span className={`text-xs uppercase tracking-wider font-bold ${item.color}`}>
                                        {item.rarity}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Text Side (Right) */}
                    <motion.div
                        className="lg:w-1/2 space-y-8"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div>
                            <span className="font-serif text-purple-400 uppercase tracking-[0.3em] text-sm flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-purple-500/50"></span>
                                The Royal Treasury
                            </span>
                            <h2 className="font-display text-5xl md:text-6xl text-white mt-4 leading-tight">
                                Adorn Your <br />
                                <span className="text-gold-400 italic">Legacy</span>
                            </h2>
                        </div>

                        <p className="font-sans text-gray-300 text-lg leading-relaxed md:w-4/5">
                            Victory is not just about winning—it is about winning in style.
                            Visit the marketplace to discover rare chess sets, authentic
                            historical skins, and unique visual effects. Own a piece of
                            history and intimidate your opponents before the first move is made.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors group">
                                <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🎨</span>
                                <h4 className="font-bold text-white mb-1">Custom Skins</h4>
                                <p className="text-xs text-gray-400">Generals, Boards, Pieces</p>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-gold-500/30 transition-colors group">
                                <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">⚖️</span>
                                <h4 className="font-bold text-white mb-1">Trade & Collect</h4>
                                <p className="text-xs text-gray-400">Player-driven economy</p>
                            </div>
                        </div>

                        <button className="px-8 py-3 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-500 hover:text-white transition-all rounded text-purple-300 font-display uppercase tracking-widest text-sm mt-6">
                            Enter Marketplace
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
