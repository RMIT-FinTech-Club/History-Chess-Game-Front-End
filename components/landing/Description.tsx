"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Feature card data with icons
const features = [
    {
        icon: "⚔️",
        title: "Strategic Battles",
        description: "Master chess tactics through intense turn-based combat where every move shapes history."
    },
    {
        icon: "📜",
        title: "Historical Narratives",
        description: "Immerse yourself in Vietnam's rich history as you play through pivotal moments."
    },
    {
        icon: "🏆",
        title: "Competitive Rankings",
        description: "Climb the global leaderboard and prove your mastery against players worldwide."
    },
    {
        icon: "🤖",
        title: "AI Opponents",
        description: "Challenge our trained bots ranging from novice to grandmaster difficulty."
    }
];

// Floating chess piece silhouette
const FloatingSilhouette = ({ piece, className, delay }: { piece: string; className: string; delay: number }) => (
    <motion.div
        className={`absolute text-gold-500/5 pointer-events-none select-none ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: 1 }}
    >
        <motion.span
            className="text-[120px] block"
            animate={{
                y: [0, -20, 0],
                rotate: [-5, 5, -5]
            }}
            transition={{
                duration: 8 + delay,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {piece}
        </motion.span>
    </motion.div>
);

// Feature Card component
const FeatureCard = ({ feature, index, isInView }: { feature: typeof features[0]; index: number; isInView: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
        className="group relative"
    >
        {/* Hover glow */}
        <div className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/10 blur-[30px] transition-all duration-500 rounded-2xl" />

        <div className="relative glass-card p-6 rounded-2xl border border-white/5 group-hover:border-gold-500/30 transition-all duration-500 h-full bg-gradient-to-br from-white/5 to-transparent">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-gold-500/20 transition-all duration-300">
                <span className="text-3xl">{feature.icon}</span>
            </div>

            {/* Title */}
            <h3 className="font-display text-xl text-gold-100 mb-2 group-hover:text-gold-400 transition-colors duration-300">
                {feature.title}
            </h3>

            {/* Description */}
            <p className="font-sans text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                {feature.description}
            </p>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-gold-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    </motion.div>
);



export default function Description() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    return (
        <section ref={ref} className="relative w-full py-24 md:py-32 overflow-hidden">
            {/* Floating chess silhouettes */}
            <FloatingSilhouette piece="♔" className="left-[-5%] top-[10%]" delay={0} />
            <FloatingSilhouette piece="♕" className="right-[-5%] top-[60%]" delay={0.5} />
            <FloatingSilhouette piece="♗" className="left-[10%] bottom-[5%]" delay={1} />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-display text-4xl md:text-6xl text-gold-100 mb-6">
                            Reimagining <span className="text-gold-400 italic">History</span>
                        </h2>
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-gold-500/50" />
                            <div className="w-3 h-3 rounded-full bg-gold-500/50" />
                            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-gold-500/50" />
                        </div>
                    </motion.div>

                    {/* Main content grid */}
                    <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
                        {/* Left: Main description card */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="glass-card p-8 md:p-10 rounded-2xl border-l-4 border-gold-500 relative overflow-hidden"
                        >
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-[60px]" />

                            <p className="font-sans text-lg md:text-xl leading-relaxed text-gray-300 text-justify relative z-10">
                                <span className="text-6xl float-left mr-4 mt-[-8px] font-display text-gold-400 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                                    W
                                </span>
                                hat is the FinTech History Chess Game? It is not merely a game, but a journey through time.
                                We blend the classic strategy of chess with the rich tapestry of Vietnamese history,
                                creating an immersive experience that challenges your mind while honoring the past.
                            </p>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="font-serif text-gold-200/80 italic text-lg">
                                    &quot;Experience a unique battlefield where every piece tells a story, and every move
                                    echoes through the ages.&quot;
                                </p>
                            </div>
                        </motion.div>

                        {/* Right: Quote and tags */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="space-y-8"
                        >
                            <div className="glass-card p-8 rounded-2xl">
                                <p className="font-sans text-gray-300 text-lg leading-relaxed mb-6">
                                    Prepare yourself for a tactical masterpiece powered by
                                    modern technology and traditional values. Every battle is a lesson,
                                    every victory a piece of legacy.
                                </p>

                                <div className="flex flex-wrap gap-3">
                                    {['Strategy', 'History', 'Glory', 'Legacy'].map((tag, index) => (
                                        <motion.div
                                            key={tag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                            transition={{ delay: 0.6 + index * 0.1 }}
                                            className="px-5 py-2 rounded-full border border-gold-500/30 text-gold-400 font-sans text-sm tracking-wider uppercase hover:bg-gold-500/10 hover:border-gold-500/50 transition-all cursor-default"
                                        >
                                            {tag}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Stats card */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: '500+', label: 'Players' },
                                    { value: '10K+', label: 'Games' },
                                    { value: '4.8', label: 'Rating' }
                                ].map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                                        transition={{ delay: 0.8 + index * 0.1 }}
                                        className="glass-card p-4 rounded-xl text-center"
                                    >
                                        <div className="font-display text-2xl md:text-3xl text-gold-400">
                                            {stat.value}
                                        </div>
                                        <div className="text-gray-500 text-xs uppercase tracking-wider">
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={feature.title}
                                feature={feature}
                                index={index}
                                isInView={isInView}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gold-600/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary-blue-2/30 rounded-full blur-[100px] translate-y-1/3 translate-x-1/3 pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[200px] h-[200px] bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />
        </section>
    );
}