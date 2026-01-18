"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BackgroundEffects() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none bg-black">
            {/* Base Gradient - Dark with subtle gold undertones */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a0f] via-[#0d0d08] to-black opacity-95" />

            {/* Noise Overlay */}
            <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />

            {/* Floating Orbs (Golden Glows) */}
            <motion.div
                animate={{
                    x: [0, 50, -50, 0],
                    y: [0, -30, 30, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gold-hover blur-[120px] opacity-30"
            />

            <motion.div
                animate={{
                    x: [0, -30, 30, 0],
                    y: [0, 40, -40, 0],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gold-royal blur-[100px] opacity-25"
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
        </div>
    );
}
