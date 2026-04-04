"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scroll, Award, Crown, Sword, BookOpen, Star } from "lucide-react";



const ACHIEVEMENTS_DATA = [
    {
        id: "scholar",
        icon: Scroll,
        color: "text-blue-400"
    },
    {
        id: "warrior",
        icon: Sword,
        color: "text-red-400"
    },
    {
        id: "collector",
        icon: Crown,
        color: "text-gold-shimmer"
    },
    {
        id: "legend",
        icon: BookOpen,
        color: "text-purple-400"
    },
    {
        id: "culture",
        icon: Star,
        color: "text-emerald-400"
    }
];

import { useAchievements, AchievementId } from "@/context/AchievementContext";

export default function HistoricalAchievements() {
    const { achievements } = useAchievements();

    const displayAchievements = ACHIEVEMENTS_DATA.map((data) => {
        const achievement = achievements[data.id as AchievementId];
        return {
            ...achievement,
            ...data
        };
    });

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-[#DBB968]" />
                <h2 className="font-display text-2xl text-[#DBB968]">Historical Achievements</h2>
                <span className="text-xs text-gray-500 font-serif border border-white/10 px-2 py-0.5 rounded-full">
                    Beta Feature
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayAchievements.map((achievement) => (
                    <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.02 }}
                        className={`relative p-4 rounded-xl border ${achievement.isUnlocked
                            ? "bg-[#DBB968]/10 border-[#DBB968]/30"
                            : "bg-white/5 border-white/5 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all"
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className={`p-2 rounded-lg bg-black/30 ${achievement.color}`}>
                                <achievement.icon className="w-5 h-5" />
                            </div>
                            {achievement.isUnlocked && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DBB968] bg-[#DBB968]/10 px-2 py-0.5 rounded-full">
                                    Unlocked
                                </span>
                            )}
                        </div>

                        <h3 className={`font-display text-base ${achievement.isUnlocked ? "text-white" : "text-gray-400"}`}>
                            {achievement.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-serif mb-3 min-h-[32px]">
                            {achievement.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="relative h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(Math.min(achievement.currentProgress, achievement.maxProgress) / achievement.maxProgress) * 100}%` }}
                                className={`absolute inset-y-0 left-0 rounded-full ${ACHIEVEMENT_COLORS[achievement.id as keyof typeof ACHIEVEMENT_COLORS] || 'bg-[#DBB968]'}`}
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-gray-600 font-mono">
                                {Math.min(achievement.currentProgress, achievement.maxProgress)} / {achievement.maxProgress}
                            </span>
                            <span className="text-[10px] text-gray-600">
                                {Math.round((Math.min(achievement.currentProgress, achievement.maxProgress) / achievement.maxProgress) * 100)}%
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

const ACHIEVEMENT_COLORS = {
    scholar: "bg-blue-500",
    warrior: "bg-red-500",
    collector: "bg-[#DBB968]",
    legend: "bg-purple-500",
    culture: "bg-emerald-500"
};
