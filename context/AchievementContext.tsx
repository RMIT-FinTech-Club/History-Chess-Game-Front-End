"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { Award } from "lucide-react";
import axiosInstance from "@/config/apiConfig";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

// Types
export type AchievementId = "scholar" | "warrior" | "collector" | "legend" | "culture";

interface Achievement {
    id: AchievementId;
    title: string;
    description: string;
    maxProgress: number;
    currentProgress: number;
    isUnlocked: boolean;
}

interface AchievementContextType {
    achievements: Record<AchievementId, Achievement>;
    trackProgress: (id: AchievementId, amount?: number) => void;
    checkCollection: (itemDynasties: string[]) => void;
}

// Initial Data
const INITIAL_ACHIEVEMENTS: Record<AchievementId, Omit<Achievement, "currentProgress" | "isUnlocked">> = {
    scholar: { id: "scholar", title: "Dynasty Scholar", description: "Explore the lore of 5 different dynasties", maxProgress: 5 },
    warrior: { id: "warrior", title: "War Historian", description: "Learn about 10 famous battles", maxProgress: 10 },
    collector: { id: "collector", title: "Royal Collector", description: "Collect items from 3 different dynasties", maxProgress: 3 },
    legend: { id: "legend", title: "Legend Keeper", description: "Discover 20 historical facts", maxProgress: 20 },
    culture: { id: "culture", title: "Culture Bearer", description: "Participate in 5 cultural events", maxProgress: 5 }
};

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
    const { accessToken, userId } = useGlobalStorage();

    const [achievements, setAchievements] = useState<Record<AchievementId, Achievement>>(() => {
        const defaults: any = {};
        Object.values(INITIAL_ACHIEVEMENTS).forEach(a => {
            defaults[a.id] = { ...a, currentProgress: 0, isUnlocked: false };
        });
        return defaults;
    });

    const [loaded, setLoaded] = useState(false);

    // Fetch from Backend on Mount or Auth Change
    useEffect(() => {
        const fetchAchievements = async () => {
            if (!userId || !accessToken) return;

            try {
                const response = await axiosInstance.get('/achievements', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (response.data.success) {
                    setAchievements(prev => {
                        const updated = { ...prev };
                        response.data.data.forEach((backendAch: any) => {
                            const key = backendAch.achievementId as AchievementId;
                            if (updated[key]) {
                                updated[key] = {
                                    ...updated[key],
                                    currentProgress: backendAch.currentProgress,
                                    isUnlocked: backendAch.isUnlocked
                                };
                            }
                        });
                        return updated;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch achievements", error);
            }
            setLoaded(true);
        };

        fetchAchievements();
    }, [userId, accessToken]);

    const triggerUnlock = (achievement: Achievement) => {
        toast.custom((t) => (
            <div className="w-[350px] relative overflow-hidden rounded-xl bg-[#121212]/95 border border-[#DBB968] p-4 shadow-[0_0_30px_rgba(219,185,104,0.3)] animate-in slide-in-from-top-5 duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-[#DBB968]/20 to-transparent opacity-20" />
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#DBB968] blur-3xl opacity-20" />

                <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#DBB968] to-[#8A7338] flex items-center justify-center shadow-lg">
                        <Award className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <p className="text-[#DBB968] text-xs font-serif uppercase tracking-widest mb-0.5">Achievement Unlocked</p>
                        <h4 className="text-white font-display text-lg">{achievement.title}</h4>
                        <p className="text-gray-400 text-xs">{achievement.description}</p>
                    </div>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const syncProgressToBackend = async (achievement: Achievement) => {
        if (!accessToken) return;
        try {
            await axiosInstance.post('/achievements/progress', {
                achievementId: achievement.id,
                currentProgress: achievement.currentProgress,
                maxProgress: achievement.maxProgress
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
        } catch (error) {
            console.error(`Failed to sync achievement ${achievement.id}`, error);
        }
    };

    const trackProgress = (id: AchievementId, amount: number = 1) => {
        if (!userId || !accessToken) return;

        let achievementToSync: Achievement | null = null;
        let shouldTriggerUnlock = false;

        setAchievements(prev => {
            const achievement = prev[id];
            if (!achievement || achievement.isUnlocked) return prev;

            const newProgress = Math.min(achievement.currentProgress + amount, achievement.maxProgress);
            if (newProgress === achievement.currentProgress) return prev;

            const isNowUnlocked = newProgress >= achievement.maxProgress;

            const updatedAch = {
                ...achievement,
                currentProgress: newProgress,
                isUnlocked: isNowUnlocked
            };

            achievementToSync = updatedAch;
            shouldTriggerUnlock = isNowUnlocked && !achievement.isUnlocked;

            return {
                ...prev,
                [id]: updatedAch
            };
        });

        // Effect after render (in this simpler context, directly calling after setState is tricky due to closure, 
        // but since we captured the object, we can use it.
        // However, React state updates are scheduled. The sync might run before the UI updates, which is fine.
        // The triggerUnlock should ideall happen after.

        if (achievementToSync) {
            syncProgressToBackend(achievementToSync);
            if (shouldTriggerUnlock) {
                // Determine the updated achievement object correctly
                // @ts-ignore
                triggerUnlock(achievementToSync);
            }
        }
    };

    const checkCollection = (itemDynasties: string[]) => {
        if (!userId || !accessToken) return;

        let achievementToSync: Achievement | null = null;
        let shouldTriggerUnlock = false;

        const uniqueDynasties = new Set(itemDynasties).size;

        setAchievements(prev => {
            const achievement = prev.collector;
            if (achievement.isUnlocked) return prev;

            const newProgress = Math.min(uniqueDynasties, achievement.maxProgress);
            if (newProgress <= achievement.currentProgress) return prev;

            const isNowUnlocked = newProgress >= achievement.maxProgress;

            const updatedAch = {
                ...achievement,
                currentProgress: newProgress,
                isUnlocked: isNowUnlocked
            };

            achievementToSync = updatedAch;
            shouldTriggerUnlock = isNowUnlocked && !achievement.isUnlocked;

            return {
                ...prev,
                collector: updatedAch
            };
        });

        if (achievementToSync) {
            syncProgressToBackend(achievementToSync);
            if (shouldTriggerUnlock) {
                // @ts-ignore
                triggerUnlock(achievementToSync);
            }
        }
    };

    return (
        <AchievementContext.Provider value={{ achievements, trackProgress, checkCollection }}>
            {children}
        </AchievementContext.Provider>
    );
}

export const useAchievements = () => {
    const context = useContext(AchievementContext);
    if (context === undefined) {
        throw new Error("useAchievements must be used within an AchievementProvider");
    }
    return context;
};
