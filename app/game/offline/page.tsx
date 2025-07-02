"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";
import { Chessboard } from "react-chessboard";
import { Square } from "chess.js";
import "@/css/chessboard.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CapturedPieces } from "@/components/CapturedPieces";
import type { StockfishLevel } from "@/hooks/useStockfish";
import {
  TimeCounter,
  TimeCounterHandle,
} from "@/components/TimeCounter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOfflineGame } from "@/hooks/useOfflineGame";

// --- Helper Components ---

type MoveHistoryPair = {
  turn: number;
  whiteMove: string;
  blackMove: string;
  whiteTime: string;
  blackTime: string;
  whiteTimeRaw: number;
  blackTimeRaw: number;
  maxTime: number;
};

const MoveHistoryRow = ({ pair }: { pair: MoveHistoryPair }) => (
  <tr className="hover:bg-[#4A4443] transition-colors duration-200">
    <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">{pair.turn}.</td>
    <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">{pair.whiteMove}</td>
    <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">{pair.blackMove}</td>
    <td className="py-2 px-2 sm:px-5 text-xs">
      {pair.whiteTime !== "-" && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex justify-end w-10 sm:w-16 h-1.5 overflow-hidden">
            <div
              className="h-full bg-white"
              style={{
                width: `${Math.min(
                  100,
                  (pair.whiteTimeRaw / pair.maxTime) * 100
                )}%`,
              }}
            />
          </div>
          <span className="min-w-[24px] sm:min-w-[30px] text-xs">
            {pair.whiteTime}s
          </span>
        </div>
      )}
      {pair.blackTime && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex justify-end w-10 sm:w-16 h-1.5 overflow-hidden">
            <div
              className="h-full bg-black"
              style={{
                width: `${Math.min(
                  100,
                  (pair.blackTimeRaw / pair.maxTime) * 100
                )}%`,
              }}
            />
          </div>
          <span className="min-w-[24px] sm:min-w-[30px] text-xs">
            {pair.blackTime}s
          </span>
        </div>
      )}
    </td>
  </tr>
);

const GameOverDialog = ({
  open,
  title,
  message,
  onNewGame,
}: {
  open: boolean;
  title: string;
  message: string;
  onNewGame: () => void;
}) => (
  <Dialog open={open} onOpenChange={(open) => !open && onNewGame()}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex justify-center text-xl sm:text-3xl">
          {title}
        </DialogTitle>
      </DialogHeader>
      <p className="text-center text-base sm:text-lg">{message}</p>
      <div className="flex justify-center space-x-4">
        <Button onClick={onNewGame} variant="destructive">
          New Game
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

const GameModeDialog = ({
  open,
  aiDifficulty,
  setAiDifficulty,
  difficultyLevels,
  handleStartSinglePlayer,
  handleStartTwoPlayer,
  isAiReady,
  onClose,
}: {
  open: boolean;
  aiDifficulty: StockfishLevel;
  setAiDifficulty: (level: StockfishLevel) => void;
  difficultyLevels: StockfishLevel[];
  handleStartSinglePlayer: (color: "w" | "b") => void;
  handleStartTwoPlayer: () => void;
  isAiReady: boolean;
  onClose: () => void;
}) => (
  <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex justify-center text-xl sm:text-3xl">
          Choose Game Mode
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg sm:text-xl font-medium">
            Play against Computer
          </h3>
          <div className="flex flex-col space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">
                Select AI difficulty:
              </p>
              <div className="flex flex-wrap gap-2">
                {difficultyLevels.map((level) => (
                  <Button
                    key={level}
                    variant={aiDifficulty === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAiDifficulty(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={() => handleStartSinglePlayer("w")}
                className="flex-1"
                disabled={!isAiReady}
              >
                Play as White
              </Button>
              <Button
                onClick={() => handleStartSinglePlayer("b")}
                className="flex-1"
                disabled={!isAiReady}
              >
                Play as Black
              </Button>
            </div>
            {!isAiReady && (
              <p className="text-yellow-500">Loading AI engine...</p>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg sm:text-xl font-medium">Two Player Mode</h3>
          <div className="flex flex-col space-y-2">
            <Button onClick={handleStartTwoPlayer}>
              Start Two Player Game
            </Button>
            <div className="text-xs sm:text-sm text-muted-foreground">
              <p>
                In two player mode, you can enable auto-rotate to flip the board
                automatically between turns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// --- Main Component ---

const OfflinePage = () => {
  const [mounted, setMounted] = useState(false);
  const [showGameModeDialog, setShowGameModeDialog] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<StockfishLevel>(5);
  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
  const [gameActive, setGameActive] = useState(false);
  const timerRef = useRef<TimeCounterHandle>(null);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(
    "white"
  );
  const [autoRotateBoard, setAutoRotateBoard] = useState(false);
  const [boardWidth, setBoardWidth] = useState(580);

  const {
    fen,
    history,
    moveTimings,
    capturedWhite,
    capturedBlack,
    selectedPiece,
    setSelectedPiece,
    customSquareStyles,
    gameState,
    makeMove,
    undoMove,
    currentTurn: gameTurn,
    isSinglePlayer,
    playerColor,
    isThinking,
    startSinglePlayerGame,
    startTwoPlayerGame,
    aiLevel,
    isAiReady,
  } = useOfflineGame();

  // Responsive board size
  useLayoutEffect(() => {
    const calculateBoardSize = () => {
      if (typeof window === "undefined") return 580;
      const width = window.innerWidth;
      if (width < 480) return Math.min(width - 48, 480);
      if (width < 768) return Math.min(width - 48, 580);
      return 580;
    };
    const handleResize = () => setBoardWidth(calculateBoardSize());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update current turn and orientation
  useEffect(() => {
    setCurrentTurn(gameTurn);
    if (!isSinglePlayer && autoRotateBoard) {
      setBoardOrientation(gameTurn === "w" ? "white" : "black");
    }
  }, [gameTurn, isSinglePlayer, autoRotateBoard]);

  useEffect(() => {
    setMounted(true);
    setShowGameModeDialog(true);
  }, []);

  useEffect(() => {
    setGameActive(!gameState.isGameOver && history.length > 0);
  }, [gameState.isGameOver, history.length]);

  useEffect(() => {
    if (isSinglePlayer) {
      setBoardOrientation(playerColor === "w" ? "white" : "black");
      setAutoRotateBoard(false);
    }
  }, [isSinglePlayer, playerColor]);

  // --- Handlers ---

  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece: string) => {
      if (
        isSinglePlayer &&
        ((playerColor === "w" && fen.includes(" b ")) ||
          (playerColor === "b" && fen.includes(" w ")))
      ) {
        toast.error("Not your turn", {
          description: "Wait for the AI to make its move.",
          duration: 1000,
        });
        return false;
      }
      const sourcePiece = piece.charAt(1).toLowerCase();
      const sourceColor = piece.charAt(0);
      const isPawnPromotion =
        sourcePiece === "p" &&
        ((sourceColor === "w" && targetSquare[1] === "8") ||
          (sourceColor === "b" && targetSquare[1] === "1"));
      let promotionPiece: "q" | "r" | "b" | "n" | undefined = undefined;
      if (piece.length === 2 && isPawnPromotion) return true;
      else if (
        piece.length === 2 &&
        piece.charAt(1).toLowerCase() !== "p" &&
        ((sourceColor === "w" && targetSquare[1] === "8") ||
          (sourceColor === "b" && targetSquare[1] === "1"))
      ) {
        const promo = piece.charAt(1).toLowerCase();
        if (promo === "q" || promo === "r" || promo === "b" || promo === "n") {
          promotionPiece = promo;
        }
      }
      const success = makeMove(sourceSquare as Square, targetSquare as Square, promotionPiece);
      if (!success) {
        toast.error("Invalid Move", {
          description: "That move is not allowed.",
          duration: 1000,
        });
      }
      return success;
    },
    [isSinglePlayer, playerColor, fen, makeMove]
  );

  const onPieceDragBegin = useCallback(
    (piece: string, sourceSquare: Square) => {
      if (isSinglePlayer) {
        const pieceColor = piece.charAt(0).toLowerCase();
        if (
          (playerColor === "w" && pieceColor !== "w") ||
          (playerColor === "b" && pieceColor !== "b")
        )
          return;
      }
      setSelectedPiece(sourceSquare);
    },
    [isSinglePlayer, playerColor, setSelectedPiece]
  );

  const onPieceClick = useCallback(
    (piece: string, sourceSquare: Square) => {
      if (isSinglePlayer) {
        const pieceColor = piece.charAt(0).toLowerCase();
        if (
          (playerColor === "w" && pieceColor !== "w") ||
          (playerColor === "b" && pieceColor !== "b")
        )
          return;
      }
      setSelectedPiece(selectedPiece === sourceSquare ? null : sourceSquare);
    },
    [isSinglePlayer, playerColor, selectedPiece, setSelectedPiece]
  );

  const onSquareClick = useCallback(
    (square: Square) => {
      if (selectedPiece && square !== selectedPiece) {
        const pieceOnSquare = fen
          .split(" ")[0]
          .split("/")
          .map((row, i) => {
            let colIndex = 0;
            const result: { [key: string]: string } = {};
            for (let j = 0; j < row.length; j++) {
              const char = row[j];
              if (/\d/.test(char)) colIndex += parseInt(char);
              else {
                const squareNotation = `${String.fromCharCode(
                  97 + colIndex
                )}${8 - i}`;
                result[squareNotation] = char;
                colIndex++;
              }
            }
            return result;
          })
          .reduce((acc, row) => ({ ...acc, ...row }), {});
        const piece = pieceOnSquare[selectedPiece];
        const isPawnPromotion =
          piece &&
          piece.toLowerCase() === "p" &&
          ((piece === "P" && square[1] === "8") ||
            (piece === "p" && square[1] === "1"));
        const promotionPiece = isPawnPromotion ? "q" : undefined;
        const success = makeMove(selectedPiece, square, promotionPiece);
        if (!success) setSelectedPiece(null);
      }
    },
    [selectedPiece, fen, makeMove, setSelectedPiece]
  );

  const handleStartSinglePlayer = useCallback(
    (color: "w" | "b") => {
      startSinglePlayerGame(color, aiDifficulty);
      setShowGameModeDialog(false);
      timerRef.current?.reset();
      setBoardOrientation(color === "w" ? "white" : "black");
      setAutoRotateBoard(false);
    },
    [startSinglePlayerGame, aiDifficulty]
  );

  const handleStartTwoPlayer = useCallback(() => {
    startTwoPlayerGame();
    setShowGameModeDialog(false);
    timerRef.current?.reset();
    setBoardOrientation("white");
  }, [startTwoPlayerGame]);

  const difficultyLevels: StockfishLevel[] = [1, 2, 3, 5, 8, 10, 15, 20];

  // --- Memoized Move History ---
  const moveHistoryPairs = useMemo(() => {
    const maxTimePerMove = 60;
    const formatTimeInSeconds = (time: string) => {
      if (!time || time === "-") return "-";
      const timeNum = parseFloat(time);
      return timeNum.toFixed(1);
    };
    const formattedHistory = [];
    for (let i = 0; i < history.length; i += 2) {
      const whiteMoveData = history[i];
      const blackMoveData = history[i + 1];
      const whiteMoveSan =
        typeof whiteMoveData === "string"
          ? whiteMoveData
          : (whiteMoveData as { san: string })?.san || "";
      const blackMoveSan =
        typeof blackMoveData === "string"
          ? blackMoveData
          : (blackMoveData as { san: string })?.san || "";
      formattedHistory.push({
        turn: Math.floor(i / 2) + 1,
        whiteMove: whiteMoveSan,
        blackMove: blackMoveSan || "",
        whiteTime: moveTimings[i] ? formatTimeInSeconds(moveTimings[i]) : "-",
        blackTime: moveTimings[i + 1]
          ? formatTimeInSeconds(moveTimings[i + 1])
          : "",
        whiteTimeRaw: moveTimings[i] ? parseFloat(moveTimings[i]) : 0,
        blackTimeRaw: moveTimings[i + 1] ? parseFloat(moveTimings[i + 1]) : 0,
        maxTime: maxTimePerMove,
      });
    }
    return formattedHistory;
  }, [history, moveTimings]);

  const toggleAutoRotate = useCallback(() => {
    if (!isSinglePlayer) {
      const newAutoRotate = !autoRotateBoard;
      setAutoRotateBoard(newAutoRotate);
      if (newAutoRotate) {
        setBoardOrientation(currentTurn === "w" ? "white" : "black");
      }
    }
  }, [isSinglePlayer, autoRotateBoard, currentTurn]);

  if (!mounted) return <p>Loading Chessboard...</p>;

  return (
    <div className="flex flex-col items-center w-full h-[calc(100dvh-var(--navbar-height))] py-1 px-2 md:px-4 justify-between overflow-hidden">
      <div className="w-full max-w-7xl flex flex-col flex-grow overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 p-2">
          <span className="text-sm sm:text-base font-medium text-white">
            {isSinglePlayer
              ? `Single Player (You: ${playerColor === "w" ? "White" : "Black"}, AI Level: ${aiLevel})`
              : "Two Players"}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {isThinking && (
              <span className="animate-pulse text-[#F7D27F] text-sm sm:text-base font-medium">
                AI thinking...
              </span>
            )}
            {!isSinglePlayer && (
              <Button
                variant={autoRotateBoard ? "default" : "outline"}
                size="sm"
                onClick={toggleAutoRotate}
                className={`text-xs sm:text-sm ${autoRotateBoard
                    ? "bg-[#F7D27F] text-black hover:bg-[#E6C26E]"
                    : "text-white border-white hover:text-[#F7D27F]"
                  }`}
              >
                {autoRotateBoard ? "Auto-rotate: ON" : "Auto-rotate: OFF"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGameModeDialog(true)}
              className="text-xs sm:text-sm text-white border-white hover:text-[#F7D27F]"
            >
              Change
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 w-full flex-1 max-h-[calc(100dvh-var(--navbar-height))] overflow-hidden">
          <div className="flex flex-col justify-between w-full flex-grow overflow-hidden">
            <div className="flex justify-center md:justify-start">
              <CapturedPieces color="Black" pieces={capturedBlack} />
            </div>

            <div className="flex flex-col md:flex-row gap-3 flex-grow overflow-hidden">
              <div className="flex justify-center items-center">
                <Chessboard
                  id="historyChessBoard"
                  position={fen}
                  onPieceDrop={handleDrop}
                  onPieceClick={onPieceClick}
                  onSquareClick={onSquareClick}
                  onPieceDragBegin={onPieceDragBegin}
                  boardWidth={boardWidth}
                  animationDuration={300}
                  customSquareStyles={customSquareStyles}
                  boardOrientation={boardOrientation}
                />
              </div>

              <div className="md:hidden flex justify-center md:justify-start">
                <CapturedPieces color="White" pieces={capturedWhite} />
              </div>

              {/* Right Side (Timer + History + Buttons) */}
              <div className="w-full text-black flex flex-col flex-grow overflow-hidden gap-3">
                {/* Timer */}
                <div>
                  <h2 className="text-white text-sm font-semibold px-2">
                    Time Remaining
                  </h2>
                  <div className="rounded shadow-md bg-[#3B3433]">
                    <TimeCounter
                      ref={timerRef}
                      initialTimeInSeconds={600}
                      currentTurn={currentTurn}
                      gameActive={gameActive}
                      isGameOver={gameState.isGameOver}
                      history={history.map((move) => move.san)}
                    />
                  </div>
                </div>

                {/* Move History */}
                <div className="flex flex-col flex-grow overflow-hidden">
                  <h3 className="text-white text-sm font-semibold px-2">
                    Move History
                  </h3>
                  <div className="rounded shadow-md bg-[#3B3433] flex-grow w-full overflow-hidden">
                    <ScrollArea className="h-full w-full overflow-y-auto">
                      <table className="w-full text-white">
                        <thead className="sticky top-0 z-10 bg-[#3B3433]">
                          <tr>
                            <th className="py-2 px-2 sm:px-5 text-left text-xs sm:text-sm font-semibold">
                              Turn
                            </th>
                            <th className="py-2 px-2 sm:px-5 text-left text-xs sm:text-sm font-semibold">
                              White
                            </th>
                            <th className="py-2 px-2 sm:px-5 text-left text-xs sm:text-sm font-semibold">
                              Black
                            </th>
                            <th className="py-2 px-2 sm:px-5 text-right text-xs sm:text-sm font-semibold">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {moveHistoryPairs.map((pair) => (
                            <MoveHistoryRow key={pair.turn} pair={pair} />
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      const lastTurn = fen.split(" ")[1] === "w" ? "b" : "w";
                      undoMove();
                      timerRef.current?.undoTime(lastTurn, isSinglePlayer);
                    }}
                    disabled={history.length === 0}
                    variant="default"
                    size="sm"
                    className="px-2 sm:px-4 py-3 sm:py-6 text-sm sm:text-lg"
                  >
                    Undo Move
                  </Button>
                  <Button
                    onClick={() => {
                      setShowGameModeDialog(true);
                      timerRef.current?.reset();
                    }}
                    size="sm"
                    className="px-2 sm:px-4 py-3 sm:py-6 bg-[#DBB968] text-sm sm:text-lg text-black hover:bg-[#C7A95D]"
                  >
                    New Game
                  </Button>
                </div>
              </div>
            </div>

            <div className="md:flex hidden justify-center md:justify-start">
              <CapturedPieces color="White" pieces={capturedWhite} />
            </div>
          </div>
        </div>
      </div>

      <GameOverDialog
        open={gameState.isGameOver}
        title={gameState.title}
        message={gameState.message}
        onNewGame={() => setShowGameModeDialog(true)}
      />
      <GameModeDialog
        open={showGameModeDialog}
        aiDifficulty={aiDifficulty}
        setAiDifficulty={setAiDifficulty}
        difficultyLevels={difficultyLevels}
        handleStartSinglePlayer={handleStartSinglePlayer}
        handleStartTwoPlayer={handleStartTwoPlayer}
        isAiReady={isAiReady}
        onClose={() => setShowGameModeDialog(false)}
      />
    </div>
  );
};

export default OfflinePage;