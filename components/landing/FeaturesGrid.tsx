"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Feature data
const features = [
    {
        id: "conquest",
        title: "Empire Conquest",
        icon: "👑",
        description: "Rewrite the fate of the Ly, Tran, and Le dynasties in our narrative campaign mode.",
        image: "/home/chessboard.svg", // Placeholder, ideally a campaign map image
        color: "from-amber-500/20 to-red-900/40",
        border: "border-amber-500/30"
    },
    {
        id: "marketplace",
        title: "Royal Treasury",
        icon: "💎",
        description: "Trade rare artifacts, unique chess sets, and historical skins on the marketplace.",
        image: "/market/chest.png", // Placeholder
        color: "from-blue-500/20 to-purple-900/40",
        border: "border-blue-500/30"
    },
    {
        id: "pvp",
        title: "Grand Arena",
        icon: "⚔️",
        description: "Prove your mastery against players worldwide in Ranked and Tournament play.",
        image: "/home/pvp_bg.png", // Placeholder
        color: "from-green-500/20 to-emerald-900/40",
        border: "border-green-500/30"
    }
];

const FeatureItem = ({ feature, index, isInView }: { feature: typeof features[0], index: number, isInView: boolean }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.2, duration: 0.8 }}
            className={`group relative overflow-hidden rounded-2xl border ${feature.border} bg-black/40 backdrop-blur-sm hover:border-gold-400/50 transition-colors duration-500`}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-linear-to-br ${feature.color} opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />

            <div className="relative p-8 flex flex-col items-start h-full">
                {/* Icon Box */}
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                </div>

                <h3 className="font-display text-2xl text-gold-100 mb-3 group-hover:text-gold-400 transition-colors">
                    {feature.title}
                </h3>

                <p className="font-sans text-gray-400 text-sm leading-relaxed mb-6 group-hover:text-gray-200 transition-colors">
                    {feature.description}
                </p>

                {/* Learn More link style */}
                <div className="mt-auto flex items-center gap-2 text-gold-500/80 text-sm uppercase tracking-widest group-hover:text-gold-400 group-hover:gap-4 transition-all">
                    <span>Explore</span>
                    <span>→</span>
                </div>
            </div>
        </motion.div>
    );
};

export default function FeaturesGrid() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="features" ref={ref} className="w-full py-24 relative z-10">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    className="text-center mb-16"
                >
                    <h2 className="font-display text-4xl md:text-5xl text-gold-100 mb-4">
                        Game Features
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto" />
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureItem key={feature.id} feature={feature} index={index} isInView={isInView} />
                    ))}
                </div>
            </div>
        </section>
    );
}
