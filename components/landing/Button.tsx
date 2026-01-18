"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Trust indicator component
const TrustIndicator = ({ icon, text }: { icon: string; text: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-gray-400"
    >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-sans">{text}</span>
    </motion.div>
);

export default function Button() {
    const router = useRouter();

    return (
        <div className="w-full py-24 flex flex-col items-center relative z-20">
            {/* Main CTA Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                {/* Primary Button - Start Your Legacy */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/sign_in")}
                    className="relative group"
                >
                    {/* Pulsing glow background */}
                    <motion.div
                        className="absolute inset-0 bg-gold-400 blur-xl rounded-full"
                        animate={{
                            opacity: [0.2, 0.4, 0.2],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    <div className="relative px-10 py-5 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 bg-[length:200%_100%] animate-shimmer rounded-full border border-gold-300 shadow-[0_0_30px_rgba(219,185,104,0.3)] flex items-center gap-3">
                        {/* Crown icon */}
                        <span className="text-2xl">👑</span>

                        <span className="font-display text-xl md:text-2xl text-black font-bold tracking-wider uppercase">
                            Start Your Legacy
                        </span>

                        {/* Animated arrow */}
                        <motion.span
                            className="text-xl"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            →
                        </motion.span>
                    </div>
                </motion.button>

                {/* Secondary Button - Watch Tutorial */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        // Could link to tutorial video or guide
                        window.open("https://www.youtube.com/watch?v=chess-tutorial", "_blank");
                    }}
                    className="relative group"
                >
                    <div className="relative px-8 py-5 bg-transparent border-2 border-gold-500/50 hover:border-gold-400 rounded-full transition-colors duration-300 flex items-center gap-3 group-hover:bg-gold-500/10">
                        {/* Play icon */}
                        <motion.div
                            className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center"
                            whileHover={{ scale: 1.1 }}
                        >
                            <span className="text-gold-400 ml-0.5">▶</span>
                        </motion.div>

                        <span className="font-sans text-lg text-gold-400 font-medium">
                            Watch Tutorial
                        </span>
                    </div>
                </motion.button>
            </div>

            {/* Trust Indicators */}
            <motion.div
                className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <TrustIndicator icon="👥" text="1000+ Players" />
                <div className="w-1 h-4 bg-white/10 rounded-full hidden sm:block" />
                <TrustIndicator icon="🎮" text="Free to Play" />
                <div className="w-1 h-4 bg-white/10 rounded-full hidden sm:block" />
                <TrustIndicator icon="⭐" text="4.8 Rating" />
                <div className="w-1 h-4 bg-white/10 rounded-full hidden sm:block" />
                <TrustIndicator icon="🏆" text="Weekly Tournaments" />
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
}