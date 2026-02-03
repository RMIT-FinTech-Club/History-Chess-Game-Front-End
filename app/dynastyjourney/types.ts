/**
 * Dynasty Types for Frontend
 * Mirrors the backend configuration types
 */

export interface DynastyReward {
    skinName: string;
    skinDescription: string;
    skinImageUrl: string;
    items: {
        name: string;
        description: string;
        imageUrl: string;
    }[];
}

export interface BoardTheme {
    light: string;
    dark: string;
    accent: string;
}

export interface Dynasty {
    id: number;
    name: string;
    startElo: number;
    endElo: number;
    imageUrl: string;
    description: string;
    reward: DynastyReward;
    botLevel: number;
    boardTheme?: BoardTheme;
}

export interface DynastyConfig {
    levelsPerDynasty: number;
    eloPerLevel: number;
    totalDynasties: number;
}

export interface DynastyProgress {
    currentElo: number; // PvP Elo (separate from Dynasty)
    peakElo: number;
    currentDynasty: Dynasty;
    currentLevel: number; // Rank within dynasty (1-5)
    peakDynasty: Dynasty;
    peakLevel: number;
    levelEloRange: {
        start: number;
        end: number;
    };
    progressPercentage: number; // Now XP-based
    unlockedDynasties: Dynasty[];
    allDynasties: Dynasty[];
    nextDynasty: Dynasty | null;
    // XP-based fields (Dynasty Journey progression)
    dynastyLevel: number; // Overall level (1-50)
    dynastyXp: number; // Current XP
    xpToNextLevel: number; // XP needed for next level
    xpProgressPercentage: number; // XP progress percentage
}

export interface DynastyAPIResponse<T> {
    success: boolean;
    data: T;
}

export interface AllDynastiesData {
    dynasties: Dynasty[];
    config: DynastyConfig;
}
