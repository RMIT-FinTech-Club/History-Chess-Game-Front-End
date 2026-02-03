"use client";

import React, { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import type { CoinRewardDisplayProps, RewardBreakdown } from "./types";

/**
 * CoinRewardDisplay Component
 * Displays coin rewards with animated counter and Historical Cinematic styling
 * 
 * Features:
 * - Animated number counter (0 → final amount)
 * - Gold shimmer effect matching design philosophy
 * - Breakdown tooltip for bonuses
 * - Pending/confirmed status indicator
 */
export const CoinRewardDisplay: React.FC<CoinRewardDisplayProps> = ({
    amount,
    breakdown,
    status = 'pending',
    animate = true,
}) => {
    const [displayAmount, setDisplayAmount] = useState(animate ? 0 : amount);
    const [showBreakdown, setShowBreakdown] = useState(false);

    // Animate counter from 0 to amount
    useEffect(() => {
        if (!animate) {
            setDisplayAmount(amount);
            return;
        }

        const duration = 1500; // 1.5 seconds animation
        const steps = 30;
        const increment = amount / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current = Math.min(Math.round(increment * step), amount);
            setDisplayAmount(current);

            if (step >= steps) {
                clearInterval(timer);
                setDisplayAmount(amount);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [amount, animate]);

    const hasBonus = breakdown && (
        breakdown.eloBonus > 0 ||
        breakdown.movesBonus > 0 ||
        breakdown.streakBonus > 0 ||
        breakdown.dynastyBonus > 0
    );

    return (
        <div className="relative">
            {/* Main Reward Display */}
            <div
                className="flex flex-col items-center gap-3 p-6 rounded-xl 
                   bg-gradient-to-br from-amber-900/40 via-yellow-900/30 to-amber-950/40
                   border border-gold-royal/30 backdrop-blur-sm
                   shadow-lg shadow-gold-main/10"
                onMouseEnter={() => setShowBreakdown(true)}
                onMouseLeave={() => setShowBreakdown(false)}
            >
                {/* Coin Icon with Glow */}
                <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-gold-shimmer/40 rounded-full animate-pulse" />
                    <Coins
                        className="relative w-12 h-12 text-gold-shimmer drop-shadow-lg"
                        strokeWidth={1.5}
                    />
                </div>

                {/* Animated Amount */}
                <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl text-gold-shimmer font-bold 
                         animate-shimmer-text drop-shadow-md">
                        +{displayAmount}
                    </span>
                    <span className="font-serif text-lg text-gold-light/80">
                        GameCoins
                    </span>
                </div>

                {/* Status Indicator */}
                <div className={`flex items-center gap-2 text-sm font-serif ${status === 'confirmed'
                        ? 'text-emerald-400'
                        : status === 'failed'
                            ? 'text-red-400'
                            : 'text-gold-light/60'
                    }`}>
                    {status === 'pending' && (
                        <>
                            <div className="w-2 h-2 rounded-full bg-gold-light/60 animate-pulse" />
                            <span>Processing on blockchain...</span>
                        </>
                    )}
                    {status === 'confirmed' && (
                        <>
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Confirmed</span>
                        </>
                    )}
                    {status === 'failed' && (
                        <>
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <span>Transaction failed</span>
                        </>
                    )}
                </div>

                {/* Bonus Indicator */}
                {hasBonus && (
                    <div className="text-xs text-gold-light/50 font-serif">
                        Includes bonuses! Hover for details.
                    </div>
                )}
            </div>

            {/* Breakdown Tooltip */}
            {showBreakdown && breakdown && (
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50
                     bg-bg-dark/95 border border-gold-royal/40 rounded-lg p-4 min-w-[220px]
                     shadow-xl backdrop-blur-md animate-fade-in"
                >
                    <h4 className="font-display text-sm text-gold-shimmer mb-3 text-center">
                        Reward Breakdown
                    </h4>

                    <div className="space-y-2 font-serif text-sm">
                        {/* Base */}
                        <div className="flex justify-between text-white/70">
                            <span>Base Reward:</span>
                            <span className="text-white">{breakdown.base} GC</span>
                        </div>

                        {/* ELO Bonus */}
                        {breakdown.eloBonus > 0 && (
                            <div className="flex justify-between text-emerald-400/80">
                                <span>ELO Bonus:</span>
                                <span>+{breakdown.eloBonus.toFixed(1)} GC</span>
                            </div>
                        )}

                        {/* Moves Bonus */}
                        {breakdown.movesBonus > 0 && (
                            <div className="flex justify-between text-blue-400/80">
                                <span>Long Game Bonus:</span>
                                <span>+{breakdown.movesBonus.toFixed(1)} GC</span>
                            </div>
                        )}

                        {/* Streak Bonus */}
                        {breakdown.streakBonus > 0 && (
                            <div className="flex justify-between text-orange-400/80">
                                <span>Win Streak:</span>
                                <span>+{breakdown.streakBonus.toFixed(1)} GC</span>
                            </div>
                        )}

                        {/* Dynasty Bonus */}
                        {breakdown.dynastyBonus > 0 && (
                            <div className="flex justify-between text-purple-400/80">
                                <span>Dynasty Tier:</span>
                                <span>+{breakdown.dynastyBonus.toFixed(1)} GC</span>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-gold-royal/30 my-2" />

                        {/* Total */}
                        <div className="flex justify-between font-semibold text-gold-shimmer">
                            <span>Total:</span>
                            <span>{breakdown.total} GameCoins</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoinRewardDisplay;
