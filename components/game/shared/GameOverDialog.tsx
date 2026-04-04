"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Award, TrendingUp, TrendingDown, Sparkles, Star, Swords } from "lucide-react";
import type { GameOverDialogProps } from "./types";
import { CoinRewardDisplay } from "./CoinRewardDisplay";

/**
 * Unified GameOverDialog Component
 * 
 * Features:
 * - Result icons (Trophy for win, Crown for loss, Target for draw)
 * - ELO rating changes with +/- indicators (for PvP)
 * - XP reward display with level-up animations (for Dynasty Journey)
 * - Coin reward display with animations (for winner)
 * - Historical Cinematic theme styling
 * 
 * Used by both online (PvP) and offline (Dynasty Journey) game pages
 */
export const GameOverDialog: React.FC<GameOverDialogProps> = ({
    open,
    title,
    message,
    onNewGame,
    eloUpdate,
    coinReward,
    xpReward,
    // isWinner = false,
    isPvP = true,
    playerColor,
}) => {
    // Determine result type for styling
    const getResultType = (): 'win' | 'loss' | 'draw' => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes("win") || lowerTitle.includes("won") || lowerTitle.includes("victory")) {
            return 'win';
        } else if (lowerTitle.includes("draw") || lowerTitle.includes("stalemate")) {
            return 'draw';
        }
        return 'loss';
    };

    const resultType = getResultType();

    // Get the current user's Elo data based on their color
    const getUserEloData = () => {
        if (!eloUpdate || !playerColor) return null;

        if (playerColor === 'white') {
            return {
                elo: eloUpdate.whiteElo,
                change: eloUpdate.whiteChange
            };
        } else {
            return {
                elo: eloUpdate.blackElo,
                change: eloUpdate.blackChange
            };
        }
    };

    const userEloData = getUserEloData();

    // Get appropriate icon based on result
    const getResultIcon = () => {
        switch (resultType) {
            case 'win':
                return (
                    <div className="relative">
                        <div className="absolute inset-0 blur-2xl bg-gold-shimmer/50 rounded-full animate-pulse" />
                        <Trophy className="relative w-20 h-20 text-gold-shimmer drop-shadow-lg" />
                    </div>
                );
            case 'draw':
                return (
                    <div className="relative">
                        <div className="absolute inset-0 blur-xl bg-blue-400/30 rounded-full" />
                        <Target className="relative w-20 h-20 text-blue-400 drop-shadow-lg" />
                    </div>
                );
            case 'loss':
                return (
                    <div className="relative">
                        <div className="absolute inset-0 blur-xl bg-red-900/30 rounded-full" />
                        <Swords className="relative w-20 h-20 text-red-400/80 drop-shadow-lg" />
                    </div>
                );
        }
    };

    // Get background gradient based on result
    const getBackgroundClass = () => {
        switch (resultType) {
            case 'win':
                return 'bg-linear-to-br from-amber-950/95 via-yellow-950/90 to-amber-900/95';
            case 'draw':
                return 'bg-linear-to-br from-slate-900/95 via-blue-950/90 to-slate-900/95';
            case 'loss':
                return 'bg-linear-to-br from-gray-900/95 via-red-950/40 to-gray-900/95';
        }
    };

    // Get title color based on result
    const getTitleClass = () => {
        switch (resultType) {
            case 'win':
                return 'gold-gradient-text';
            case 'draw':
                return 'text-blue-300';
            case 'loss':
                return 'text-red-400/90';
        }
    };

    // Get display title for result
    const getDisplayTitle = () => {
        if (resultType === 'win') return 'VICTORY';
        if (resultType === 'draw') return 'DRAW';
        return 'DEFEAT';
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onNewGame()}>
            <DialogContent
                className={`sm:max-w-lg ${getBackgroundClass()} border-2 
                   ${resultType === 'win' ? 'border-gold-royal/50' : resultType === 'loss' ? 'border-red-900/30' : 'border-white/10'}
                   shadow-2xl backdrop-blur-sm`}
            >
                <DialogHeader className="text-center pb-4">
                    {/* Result Icon */}
                    <div className="flex justify-center mb-4">
                        {getResultIcon()}
                    </div>

                    {/* Title */}
                    <DialogTitle
                        className={`font-display text-3xl sm:text-4xl text-center ${getTitleClass()} drop-shadow-md`}
                    >
                        {getDisplayTitle()}
                    </DialogTitle>

                    {/* Sub-message */}
                    {message && (
                        <p className="font-serif text-center text-white/70 mt-2 text-sm sm:text-base">
                            {message}
                        </p>
                    )}
                </DialogHeader>

                <div className="space-y-6">
                    {/* XP Reward Section (Dynasty Journey) */}
                    {xpReward && (
                        <div className="bg-linear-to-br from-emerald-900/40 to-emerald-950/60 backdrop-blur-sm rounded-xl p-5 border border-emerald-500/20">
                            <h3 className="font-display text-lg text-emerald-300 mb-4 text-center flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Experience Gained
                            </h3>

                            <div className="text-center mb-4">
                                <span className="font-display text-4xl font-bold text-emerald-400">
                                    +{xpReward.xpGained}
                                </span>
                                <span className="font-serif text-emerald-300/80 ml-2">XP</span>
                            </div>

                            {/* Level Up Animation */}
                            {xpReward.levelUp && (
                                <div className="bg-linear-to-r from-gold-dark/30 via-gold-shimmer/20 to-gold-dark/30 rounded-lg p-4 mb-4 border border-gold-royal/30 animate-pulse">
                                    <div className="flex items-center justify-center gap-3">
                                        <Star className="w-6 h-6 text-gold-shimmer" />
                                        <span className="font-display text-xl text-gold-shimmer">
                                            LEVEL UP!
                                        </span>
                                        <Star className="w-6 h-6 text-gold-shimmer" />
                                    </div>
                                    <p className="text-center font-serif text-gold-light mt-2">
                                        Level {xpReward.previousLevel} → Level {xpReward.newLevel}
                                    </p>
                                </div>
                            )}

                            {/* XP Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-serif text-white/60">
                                    <span>Level {xpReward.newLevel}</span>
                                    <span>{xpReward.newXp} / 500 XP</span>
                                </div>
                                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(100, (xpReward.newXp / 500) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Coin Reward Section (only for winners) */}
                    {coinReward && coinReward.amount > 0 && (
                        <div className="flex justify-center">
                            <CoinRewardDisplay
                                amount={coinReward.amount}
                                breakdown={coinReward.breakdown}
                                status={coinReward.status}
                                animate={true}
                            />
                        </div>
                    )}

                    {/* No Coins for Loser */}
                    {resultType === 'loss' && isPvP && !coinReward && (
                        <div className="text-center py-3 bg-black/20 rounded-lg border border-white/5">
                            <p className="font-serif text-white/50 text-sm italic">
                                No coins earned this match
                            </p>
                        </div>
                    )}

                    {/* ELO Update Section (for PvP) - Shows only current user's Elo */}
                    {userEloData && userEloData.elo !== undefined && (
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                            <h3 className="font-display text-lg text-gold-light mb-4 text-center flex items-center justify-center gap-2">
                                <Award className="w-5 h-5" />
                                Elo Change
                            </h3>

                            <div className="flex flex-col items-center gap-3">
                                {/* User's New Elo */}
                                <div className="flex items-center gap-4">
                                    <span className="font-display text-3xl font-bold text-white">
                                        {userEloData.elo}
                                    </span>
                                    {userEloData.change !== undefined && (
                                        <span className={`flex items-center gap-1 text-lg font-semibold px-3 py-1 rounded-lg ${userEloData.change >= 0
                                            ? 'text-emerald-400 bg-emerald-500/20'
                                            : 'text-red-400 bg-red-500/20'
                                            }`}>
                                            {userEloData.change >= 0 ? (
                                                <TrendingUp className="w-5 h-5" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5" />
                                            )}
                                            {userEloData.change >= 0 ? '+' : ''}{userEloData.change}
                                        </span>
                                    )}
                                </div>

                                {/* Info Note */}
                                <p className="text-center text-xs text-white/50 font-serif mt-2 italic">
                                    Your new rating has been applied
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3 pt-4">
                        <Button
                            onClick={onNewGame}
                            size="lg"
                            className={`font-display text-white font-bold px-8 py-4 rounded-xl 
                         shadow-lg hover:shadow-xl transition-all duration-300 
                         transform hover:scale-105 active:scale-95
                         ${resultType === 'win'
                                    ? 'bg-linear-to-r from-gold-dark to-gold-royal hover:from-gold-royal hover:to-gold-shimmer'
                                    : resultType === 'loss'
                                        ? 'bg-linear-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700'
                                        : 'bg-linear-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500'
                                }`}
                        >
                            {resultType === 'win' ? '🎮 Play Again' : resultType === 'loss' ? '⚔️ Try Again' : 'Find New Game'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GameOverDialog;
