"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Heading from "@/public/landing/SVG/heading";
import styles from "@/css/landing/title.module.css";

// Floating chess piece component with parallax
const FloatingChessPiece = ({
    piece,
    initialX,
    initialY,
    delay,
    scrollY
}: {
    piece: string;
    initialX: string;
    initialY: string;
    delay: number;
    scrollY: MotionValue<number>;
}) => {
    const y = useTransform(scrollY, [0, 500], [0, -100 - delay * 30]);
    const opacity = useTransform(scrollY, [0, 400], [0.6, 0]);

    return (
        <motion.div
            className="absolute text-gold-400/20 pointer-events-none select-none"
            style={{
                left: initialX,
                top: initialY,
                y,
                opacity
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{
                delay: delay * 0.3,
                duration: 1.5,
                ease: "easeOut"
            }}
        >
            <motion.span
                className="text-6xl md:text-8xl block"
                animate={{
                    y: [0, -15, 0],
                    rotate: [-3, 3, -3]
                }}
                transition={{
                    duration: 4 + delay,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {piece}
            </motion.span>
        </motion.div>
    );
};

// Art Deco corner ornament
const CornerOrnament = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
    const positionStyles = {
        'top-left': 'top-8 left-8',
        'top-right': 'top-8 right-8 rotate-90',
        'bottom-left': 'bottom-8 left-8 -rotate-90',
        'bottom-right': 'bottom-8 right-8 rotate-180'
    };

    return (
        <motion.div
            className={`absolute ${positionStyles[position]} opacity-30 pointer-events-none`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
        >
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M0 0 L40 0 L40 4 L4 4 L4 40 L0 40 Z"
                    fill="url(#goldGradient)"
                />
                <path
                    d="M10 10 L30 10 L30 14 L14 14 L14 30 L10 30 Z"
                    fill="url(#goldGradient)"
                    opacity="0.6"
                />
                <circle cx="8" cy="8" r="3" fill="url(#goldGradient)" />
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F4D03F" />
                        <stop offset="50%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#C5A355" />
                    </linearGradient>
                </defs>
            </svg>
        </motion.div>
    );
};

// Scroll indicator component
const ScrollIndicator = () => {
    return (
        <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
        >
            <span className="text-gold-400/60 text-sm font-serif tracking-widest uppercase">
                Scroll to Explore
            </span>
            <motion.div
                className="w-6 h-10 border-2 border-gold-500/40 rounded-full flex justify-center pt-2"
                animate={{ borderColor: ['rgba(212,175,55,0.4)', 'rgba(212,175,55,0.7)', 'rgba(212,175,55,0.4)'] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <motion.div
                    className="w-1.5 h-3 bg-gold-400 rounded-full"
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        </motion.div>
    );
};

const chessPieces = [
    { piece: "♔", x: "5%", y: "15%" },
    { piece: "♕", x: "90%", y: "20%" },
    { piece: "♗", x: "8%", y: "70%" },
    { piece: "♘", x: "88%", y: "65%" },
    { piece: "♖", x: "15%", y: "45%" },
    { piece: "♙", x: "85%", y: "40%" },
];

export default function Title() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div
            ref={containerRef}
            className="grid place-items-center relative text-white mb-0 w-full h-screen overflow-hidden"
        >
            {/* Corner Ornaments */}
            <CornerOrnament position="top-left" />
            <CornerOrnament position="top-right" />
            <CornerOrnament position="bottom-left" />
            <CornerOrnament position="bottom-right" />

            {/* Floating Chess Pieces */}
            {isMounted && chessPieces.map((p, index) => (
                <FloatingChessPiece
                    key={index}
                    piece={p.piece}
                    initialX={p.x}
                    initialY={p.y}
                    delay={index}
                    scrollY={scrollY}
                />
            ))}

            {/* Main Content */}
            <div className={`${styles.content} opacity-[1] flex flex-col justify-center items-center px-[5vw] relative z-10`}>
                {/* Welcome Text with enhanced styling */}
                <motion.p
                    className="md:text-[4rem] text-[3.5rem] font-serif text-gold-100/90 tracking-wider"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    Rewrite
                </motion.p>

                {/* SVG Heading with golden glow */}
                <motion.div
                    className="relative my-[3vh]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    {/* Golden glow behind heading */}
                    <div className="absolute inset-0 blur-[60px] bg-gold-500/20 scale-110" />
                    <Heading classes={`${styles.SVG} md:w-[60vw] w-[90vw] relative z-10`} width="60vw" />
                </motion.div>

                {/* Powered by text with icon */}
                <motion.div
                    className="flex flex-col items-center gap-6 mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏛️</span>
                        <p className="md:text-[2rem] text-[1.5rem] font-light text-center font-serif text-gold-200/80">
                            Where Grand Strategy Meets <span className="font-bold text-gold-400">Ancient Legacy</span>
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-3 bg-gold-500/10 border border-gold-500/50 text-gold-400 font-display tracking-widest uppercase hover:bg-gold-500 hover:text-black transition-all duration-300 rounded-sm"
                    >
                        Explore The Game
                    </motion.button>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <ScrollIndicator />

            {/* Background Video with enhanced overlay */}
            <div className="absolute inset-0 z-[-1]">
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 z-10" />

                {/* Radial vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] z-10" />

                <video
                    src="https://i.imgur.com/XpCnSpD.mp4"
                    className={`${styles.bg} w-full h-[100dvh] object-cover brightness-[0.3]`}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            </div>
        </div>
    );
}