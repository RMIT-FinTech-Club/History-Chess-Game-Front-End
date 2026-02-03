/**
 * Shared Types for Game Components
 * Used by both online (/game/[id]) and offline (/game/offline) pages
 */

import { Square } from "chess.js";

// ============================================
// Move History Types
// ============================================
export type MoveHistoryPair = {
    turn: number;
    whiteMove: string;
    blackMove: string;
    whiteTime: string;
    blackTime: string;
    whiteTimeRaw: number;
    blackTimeRaw: number;
    maxTime: number;
};

// ============================================
// Reward Types
// ============================================
export interface RewardBreakdown {
    base: number;
    eloBonus: number;
    movesBonus: number;
    streakBonus: number;
    dynastyBonus: number;
    total: number;
}

export interface CoinReward {
    amount: number;
    breakdown?: RewardBreakdown;
    transactionHash?: string;
    status: 'pending' | 'confirmed' | 'failed';
}

export interface XpReward {
    xpGained: number;
    previousLevel: number;
    newLevel: number;
    previousXp: number;
    newXp: number;
    levelUp: boolean;
    levelsGained: number;
}

export interface EloUpdate {
    whiteElo?: number;
    blackElo?: number;
    whiteChange?: number;
    blackChange?: number;
}

// ============================================
// Component Props Types
// ============================================
export type GameOverDialogProps = {
    open: boolean;
    title: string;
    message: string;
    onNewGame: () => void;
    eloUpdate?: EloUpdate;
    coinReward?: CoinReward;
    xpReward?: XpReward;
    isWinner?: boolean;
    isPvP?: boolean; // true = PvP (Elo), false = Dynasty Journey (XP)
    playerColor?: 'white' | 'black'; // Current player's color for showing their Elo
};

export type CoinRewardDisplayProps = {
    amount: number;
    breakdown?: RewardBreakdown;
    status?: 'pending' | 'confirmed' | 'failed';
    animate?: boolean;
};

export type MoveHistoryRowProps = {
    pair: MoveHistoryPair;
};

export type MoveHistoryTableProps = {
    moveHistoryPairs: MoveHistoryPair[];
};

export type GameControlsProps = {
    onUndo?: () => void;
    onNewGame: () => void;
    canUndo?: boolean;
    showUndo?: boolean;
};

export type GameHeaderProps = {
    isSinglePlayer: boolean;
    playerColor: "w" | "b";
    elo?: number;
    isThinking?: boolean;
    autoRotateBoard: boolean;
    onToggleAutoRotate: () => void;
    onChangeGameMode: () => void;
    isConnected?: boolean;
    aiLevel?: number;
};

export interface PlayerSectionProps {
    color: string;
    pieces: string[];
    timeInSeconds?: number;
    isCurrentTurn: boolean;
    isPaused?: boolean;
    gameActive?: boolean;
    profileName?: string;
    profileImage?: string;
    elo?: number;
}

export interface CapturedPiecesProps {
    pieces: string[];
    color: "white" | "black";
}

// ============================================
// Game State Types
// ============================================
export type GameState = {
    fen: string;
    turn: "w" | "b";
    playerColor: "white" | "black";
    gameId?: string;
    gameOver?: boolean;
    result?: string;
    whiteTimeLeft?: number;
    blackTimeLeft?: number;
    capturedPieces?: {
        white: string[];
        black: string[];
    };
    eloUpdate?: EloUpdate;
    coinReward?: CoinReward;
};

// ============================================
// Hook Props Types
// ============================================
export type UseChessHandlersProps = {
    isSinglePlayer: boolean;
    playerColor: "w" | "b";
    fen: string;
    selectedPiece: Square | null;
    setSelectedPiece: (square: Square | null) => void;
    makeMove: (from: Square, to: Square, promotion?: "q" | "r" | "b" | "n") => boolean;
};

// ============================================
// Layout Props Types
// ============================================
export interface GameLayoutProps {
    boardOrientation: "white" | "black";
    capturedWhite: string[];
    capturedBlack: string[];
    gameState: GameState | null;
    whiteProfile: { name: string; image: string; elo: number };
    blackProfile: { name: string; image: string; elo: number };
    formatTimeInSeconds: (ms?: number) => number;
    handleDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
    onPieceClick: (piece: string, square: Square) => void;
    onSquareClick: (square: Square) => void;
    onPieceDragBegin: (piece: string, sourceSquare: Square) => void;
    boardWidth: number;
    customSquareStyles: Record<string, React.CSSProperties>;
    isCurrentPlayerTurn: boolean;
    moveHistoryPairs: MoveHistoryPair[];
    handleNewGame: () => void;
    currentTurn: "w" | "b";
    totalMove: number;
}

export interface ChessBoardSectionProps {
    gameState: GameState | null;
    handleDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
    onPieceClick: (piece: string, square: Square) => void;
    onSquareClick: (square: Square) => void;
    onPieceDragBegin: (piece: string, sourceSquare: Square) => void;
    boardWidth: number;
    customSquareStyles: Record<string, React.CSSProperties>;
    boardOrientation: "white" | "black";
    isCurrentPlayerTurn: boolean;
}
