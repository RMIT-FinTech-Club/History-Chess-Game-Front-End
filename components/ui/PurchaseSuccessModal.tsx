"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { MarketplaceItem } from "@/config/marketApi";

interface PurchaseSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: MarketplaceItem | null;
}

export default function PurchaseSuccessModal({ isOpen, onClose, item }: PurchaseSuccessModalProps) {
    // Auto close after 5 seconds if not closed
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!item) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-[#121212] border border-[#DBB968]/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(219,185,104,0.15)]"
                    >

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 -left-[100%] w-[100%] h-full bg-linear-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                        </div>

                        {/* Confetti / Rays Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#DBB968]/20 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative p-8 flex flex-col items-center text-center">

                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-20 h-20 mb-6 rounded-full bg-linear-to-b from-[#DBB968]/20 to-transparent border border-[#DBB968]/50 flex items-center justify-center shadow-[0_0_20px_rgba(219,185,104,0.3)]"
                            >
                                <span className="text-4xl">✨</span>
                            </motion.div>

                            <h2 className="font-display text-2xl text-white mb-2">
                                Acquisition Successful!
                            </h2>

                            <p className="text-white/60 font-serif text-sm mb-6">
                                You have successfully acquired <span className="text-[#DBB968] font-semibold">{item.name}</span>. It has been added to your inventory.
                            </p>

                            <div className="w-full p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4 mb-6">
                                <img
                                    src={item.imageUrl || "/placeholder-item.png"}
                                    alt={item.name}
                                    className="w-16 h-16 object-contain"
                                />
                                <div className="text-left">
                                    <div className="text-xs text-[#DBB968] uppercase tracking-wider mb-1">
                                        {item.rarity} Relic
                                    </div>
                                    <div className="text-white font-display">
                                        {item.name}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-xl bg-linear-to-r from-[#DBB968] to-[#B98F00] text-black font-bold uppercase tracking-wider shadow-[0_4px_15px_rgba(219,185,104,0.3)] hover:shadow-[0_6px_20px_rgba(219,185,104,0.4)] transition-all transform hover:-translate-y-0.5"
                            >
                                Continue Shopping
                            </button>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
