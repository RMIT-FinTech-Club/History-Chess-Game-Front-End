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
    nameChinese: string;
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
    currentElo: number;
    peakElo: number;
    currentDynasty: Dynasty;
    currentLevel: number;
    peakDynasty: Dynasty;
    peakLevel: number;
    levelEloRange: {
        start: number;
        end: number;
    };
    progressPercentage: number;
    unlockedDynasties: Dynasty[];
    allDynasties: Dynasty[];
    nextDynasty: Dynasty | null;
}

export interface DynastyAPIResponse<T> {
    success: boolean;
    data: T;
}

export interface AllDynastiesData {
    dynasties: Dynasty[];
    config: DynastyConfig;
}
