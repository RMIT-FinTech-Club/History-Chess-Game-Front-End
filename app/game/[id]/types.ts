import { StockfishLevel } from "@/app/game/offline/hooks/useStockfish";
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
  eloUpdate?: {
    whiteElo?: number;
    blackElo?: number;
  };
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
  elo?: number;
}

// Add type definition for game state
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
  eloUpdate?: {
    whiteElo?: number;
    blackElo?: number;
  }
};

export interface UseOnlineSocketProps {
  gameId: string;
  autoRotateBoard: boolean;
  setGameState: (state: GameState | ((prev: GameState | null) => GameState)) => void;
  setBoardOrientation: (orientation: "white" | "black") => void;
  setMoveHistory: React.Dispatch<React.SetStateAction<Array<{
    moveNumber: number;
    move: string;
    color: string;
    time: number;
  }>>>;
  setCapturedWhite: React.Dispatch<React.SetStateAction<string[]>>;
  setCapturedBlack: React.Dispatch<React.SetStateAction<string[]>>;
}

export interface ConnectionStatusProps {
  isConnected: boolean;
}

export interface ChessBoardSectionProps {
  gameState: any;
  handleDrop: (sourceSquare: any, targetSquare: any) => boolean;
  onPieceClick: (piece: any, square: any) => void;
  onSquareClick: (square: any) => void;
  onPieceDragBegin: (piece: any, sourceSquare: any) => void;
  boardWidth: number;
  customSquareStyles: Record<string, React.CSSProperties>;
  boardOrientation: "white" | "black";
  isCurrentPlayerTurn: boolean;
}

export interface GameLayoutProps {
  boardOrientation: "white" | "black";
  capturedWhite: string[];
  capturedBlack: string[];
  gameState: any;
  whiteProfile: { name: string; image: string, elo: number };
  blackProfile: { name: string; image: string, elo: number };
  formatTimeInSeconds: (ms?: number) => number;
  handleDrop: any;
  onPieceClick: any;
  onSquareClick: any;
  onPieceDragBegin: any;
  boardWidth: number;
  customSquareStyles: Record<string, React.CSSProperties>;
  isCurrentPlayerTurn: boolean;
  moveHistoryPairs: any[];
  handleNewGame: () => void;
}


