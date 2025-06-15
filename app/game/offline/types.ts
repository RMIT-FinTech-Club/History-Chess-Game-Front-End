import { StockfishLevel } from "@/hooks/useStockfish";
import { Square } from "chess.js";

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

export type GameModeDialogProps = {
  open: boolean;
  aiDifficulty: StockfishLevel;
  setAiDifficulty: (level: StockfishLevel) => void;
  difficultyLevels: StockfishLevel[];
  handleStartSinglePlayer: (color: "w" | "b") => void;
  handleStartTwoPlayer: () => void;
  isAiReady: boolean;
  onClose: () => void;
};

export type GameOverDialogProps = {
  open: boolean;
  title: string;
  message: string;
  onNewGame: () => void;
};

export type UseChessHandlersProps = {
  isSinglePlayer: boolean;
  playerColor: "w" | "b";
  fen: string;
  selectedPiece: Square | null;
  setSelectedPiece: (square: Square | null) => void;
  makeMove: (from: Square, to: Square, promotion?: "q" | "r" | "b" | "n") => boolean;
};

export type MoveHistoryRowProps = {
  pair: MoveHistoryPair;
};

export type MoveHistoryTableProps = {
  moveHistoryPairs: MoveHistoryPair[];
};

export type GameControlsProps = {
  onUndo?: () => void; // Make this optional
  onNewGame: () => void;
  canUndo?: boolean; // Make this optional too since it's only needed when onUndo exists
  showUndo?: boolean;
};

export type GameHeaderProps = {
  isSinglePlayer: boolean;
  playerColor: "w" | "b";
  aiLevel: StockfishLevel;
  isThinking: boolean;
  autoRotateBoard: boolean;
  onToggleAutoRotate: () => void;
  onChangeGameMode: () => void;
};

export interface TimeCounterProps {
  initialTimeInSeconds?: number;
  currentTurn: "w" | "b";
  gameActive: boolean;
  isGameOver: boolean;
  onTimerReset?: () => void;
  history?: string[]; // Add history prop
}

export interface TimeCounterHandle {
  reset: () => void;
  undoTime: (lastTurn: "w" | "b", isAiOpponent?: boolean) => void;
}

export interface PlayerSectionProps {
  color: string;
  pieces: string[];
  timeInSeconds: number;
  isCurrentTurn: boolean;
  isPaused: boolean;
  gameActive: boolean;
  profileName?: string;
  profileImage?: string;
}
