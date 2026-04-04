"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { AuctionListing } from "@/features/market/api/marketApi";

interface BidModalProps {
    auction: AuctionListing | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (listingId: string, amount: number) => Promise<void>;
}

export default function BidModal({ auction, isOpen, onClose, onSubmit }: BidModalProps) {
    const [bidAmount, setBidAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const minimumBid = auction
        ? (auction.currentBid ? auction.currentBid + 1 : auction.price)
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || amount < minimumBid) {
            setError(`Minimum bid is ${minimumBid.toLocaleString()} coins`);
            return;
        }

        if (!auction) return;

        setLoading(true);
        try {
            await onSubmit(auction.id || auction._id!, amount);
            onClose();
            setBidAmount("");
        } catch (err: unknown) {
            let errorMessage = "Failed to place bid";
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { error?: string } } };
                errorMessage = axiosError.response?.data?.error || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const details = auction?.nftDetails;

    return (
        <AnimatePresence>
            {isOpen && auction && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="glass-card rounded-2xl border border-purple-500/30 overflow-hidden">
                            {/* Header */}
                            <div className="relative p-6 bg-gradient-to-b from-purple-500/20 to-transparent">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">🔨</span>
                                    <div>
                                        <h2 className="font-display text-xl text-white">
                                            Place Your Bid
                                        </h2>
                                        <p className="text-sm text-purple-300">
                                            {details?.name || "Auction Item"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Item preview */}
                            <div className="px-6 py-4 border-y border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center relative">
                                        <Image
                                            src={details?.imageUrl || "/placeholder-item.png"}
                                            alt={details?.name || "Item preview"}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-500 text-xs mb-1">Current Bid</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">🪙</span>
                                            <span className="font-display text-2xl text-gold-400">
                                                {(auction.currentBid || auction.price).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Minimum next bid: {minimumBid.toLocaleString()} coins
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 font-serif">
                                        Your Bid Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                                            🪙
                                        </span>
                                        <input
                                            type="number"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            min={minimumBid}
                                            placeholder={minimumBid.toString()}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white text-lg font-display focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm">{error}</p>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 rounded-xl font-sans font-semibold text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Placing Bid..." : "Place Bid"}
                                </motion.button>

                                <p className="text-xs text-gray-500 text-center">
                                    By placing a bid, you agree to purchase the item if you win.
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
