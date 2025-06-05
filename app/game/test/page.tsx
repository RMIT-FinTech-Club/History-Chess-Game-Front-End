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
import { io, Socket } from "socket.io-client";
import { Chess } from "chess.js";

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

const OnlinePage = () => {
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
  const [userId, setUserId] = useState("");
  const [gameId, setGameId] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [customSquareStyles, setCustomSquareStyles] = useState({});
  const [moveHistory, setMoveHistory] = useState<Array<{
    moveNumber: number;
    move: string;
    color: string;
    time: number;
  }>>([]);

  const {
    fen,
    history,
    moveTimings,
    capturedWhite: offlineCapturedWhite,
    capturedBlack: offlineCapturedBlack,
    selectedPiece: offlineSelectedPiece,
    setSelectedPiece: setOfflineSelectedPiece,
    customSquareStyles: offlineCustomSquareStyles,
    gameState: offlineGameState,
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

  const [chess] = useState(new Chess());

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      toast.success("Connected to server");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      toast.error("Disconnected from server");
    });

    newSocket.on("gameState", (state) => {
      setGameState(state);
      if (state.players && userId) {
        const playerIndex = state.players.indexOf(userId);
        const newOrientation = playerIndex === 0 ? "white" : "black";
        setBoardOrientation(newOrientation);
        // Disable auto-rotate for online games
        setAutoRotateBoard(false);
      }
      if (state.move) {
        setMoveHistory(prev => [...prev, {
          moveNumber: state.moveNumber,
          move: state.move,
          color: state.color,
          time: state.time || 0
        }]);
      }
    });

    newSocket.on("timeUpdate", (data) => {
      setGameState(prev => ({
        ...prev,
        whiteTimeLeft: data.whiteTimeLeft,
        blackTimeLeft: data.blackTimeLeft
      }));
    });

    newSocket.on("error", (error) => {
      toast.error(error.message);
    });

    return () => {
      newSocket.close();
    };
  }, []);

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
    // Only apply auto-rotate for offline games
    if (!isSinglePlayer && autoRotateBoard && !gameId) {
      setBoardOrientation(gameTurn === "w" ? "white" : "black");
    }
  }, [gameTurn, isSinglePlayer, autoRotateBoard, gameId]);

  useEffect(() => {
    setMounted(true);
    setShowGameModeDialog(true);
  }, []);

  useEffect(() => {
    setGameActive(!offlineGameState.isGameOver && history.length > 0);
  }, [offlineGameState.isGameOver, history.length]);

  useEffect(() => {
    if (isSinglePlayer) {
      setBoardOrientation(playerColor === "w" ? "white" : "black");
      setAutoRotateBoard(false);
    }
  }, [isSinglePlayer, playerColor]);

  // Add this effect to calculate possible moves when a piece is selected
  useEffect(() => {
    if (selectedPiece && gameState?.fen) {
      chess.load(gameState.fen);
      const moves = chess.moves({ square: selectedPiece, verbose: true });
      const newStyles: Record<string, React.CSSProperties> = {};
      
      // Highlight the selected piece
      newStyles[selectedPiece] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      };
      
      // Highlight possible moves
      moves.forEach(move => {
        newStyles[move.to] = {
          backgroundColor: chess.get(move.to) ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 255, 0, 0.4)'
        };
      });
      
      setCustomSquareStyles(newStyles);
    } else {
      setCustomSquareStyles({});
    }
  }, [selectedPiece, gameState?.fen, chess]);

  // Add this effect to handle board orientation for online games
  useEffect(() => {
    if (gameState?.players && userId && gameId) {
      const playerIndex = gameState.players.indexOf(userId);
      const newOrientation = playerIndex === 0 ? "white" : "black";
      setBoardOrientation(newOrientation);
      // Disable auto-rotate for online games
      setAutoRotateBoard(false);
    }
  }, [gameState?.players, userId, gameId]);

  // --- Handlers ---

  const handleFindMatch = async () => {
    if (!userId) {
      toast.error("Please enter your user ID");
      return;
    }
    if (!socket) {
      toast.error("Not connected to server");
      return;
    }
    setIsSearching(true);

    try {
      // Updated endpoint to include /game prefix
      const response = await fetch('http://localhost:8000/game/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          playMode: 'blitz',
          colorPreference: 'random'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create game session');
      }

      const data = await response.json();
      
      if (data.gameId) {
        setGameId(data.gameId);
        // Join the game room
        socket.emit('joinGame', { gameId: data.gameId, userId });
        toast.success("Game session created! Waiting for opponent...");
      } else {
        throw new Error("No game ID received from server");
      }
    } catch (error) {
      console.error('Error finding match:', error);
      toast.error(error instanceof Error ? error.message : "Error finding match");
      setIsSearching(false);
    }
  };

  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece: string) => {
      if (!socket || !gameId || !userId) return false;

      const isWhiteTurn = gameState?.turn === "w";
      const isPlayerWhite = gameState?.players[0] === userId;

      if ((isWhiteTurn && !isPlayerWhite) || (!isWhiteTurn && isPlayerWhite)) {
        toast.error("Not your turn");
        return false;
      }

      socket.emit("move", {
        gameId,
        move: `${sourceSquare}${targetSquare}`,
        userId,
      });

      return true;
    },
    [socket, gameId, userId, gameState]
  );

  const onPieceDragBegin = useCallback(
    (piece: string, sourceSquare: Square) => {
      const pieceColor = piece.charAt(0).toLowerCase();
      const isWhiteTurn = gameState?.turn === "w";
      const isPlayerWhite = gameState?.players[0] === userId;

      if ((isWhiteTurn && pieceColor !== "w") || (!isWhiteTurn && pieceColor !== "b")) {
        return;
      }
      setSelectedPiece(sourceSquare);
    },
    [gameState, userId]
  );

  const onPieceClick = useCallback(
    (piece: string, sourceSquare: Square) => {
      const pieceColor = piece.charAt(0).toLowerCase();
      const isWhiteTurn = gameState?.turn === "w";
      const isPlayerWhite = gameState?.players[0] === userId;

      if ((isWhiteTurn && pieceColor !== "w") || (!isWhiteTurn && pieceColor !== "b")) {
        return;
      }
      setSelectedPiece(selectedPiece === sourceSquare ? null : sourceSquare);
    },
    [gameState, userId, selectedPiece]
  );

  const onSquareClick = useCallback(
    (square: Square) => {
      if (selectedPiece && square !== selectedPiece) {
        socket?.emit("move", {
          gameId,
          move: `${selectedPiece}${square}`,
          userId,
        });
        setSelectedPiece(null);
      }
    },
    [socket, gameId, userId, selectedPiece]
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

  // Format time helper function
  const formatTime = (ms?: number) => {
    if (typeof ms !== "number") return "-";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (!mounted) return <p>Loading Chessboard...</p>;

  return (
    <div className="flex flex-col items-center w-full py-1 px-2 md:px-4 justify-between">
      <h1 className="text-xl sm:text-2xl">Online Chess Game</h1>
      <div className="w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 p-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="p-2 border rounded text-black"
            />
            <Button
              onClick={handleFindMatch}
              disabled={!isConnected || isSearching}
              className="bg-[#DBB968] text-black hover:bg-[#C7A95D]"
            >
              {isSearching ? "Finding Match..." : "Find Match"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
              title={isConnected ? "Connected" : "Disconnected"}
            />
            <span className="text-sm text-white">
              {gameId ? `Game ID: ${gameId}` : "No game joined"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-3 w-full max-w-7xl flex-1 max-h-[calc(100vh-150px)]">
        <div className="flex flex-col justify-between w-full">
          <div className="flex justify-center md:justify-start">
            <CapturedPieces color="Black" pieces={capturedBlack} />
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex justify-center items-center">
              <Chessboard
                id="historyChessBoard"
                position={gameState?.fen || ""}
                onPieceDrop={handleDrop}
                onPieceClick={onPieceClick}
                onSquareClick={onSquareClick}
                onPieceDragBegin={onPieceDragBegin}
                boardWidth={boardWidth}
                animationDuration={300}
                customSquareStyles={customSquareStyles}
                boardOrientation={boardOrientation}
                arePiecesDraggable={!!gameId && !gameState?.gameOver}
              />
            </div>
            <div className="md:hidden flex justify-center md:justify-start">
              <CapturedPieces color="White" pieces={capturedWhite} />
            </div>
            <div className="w-full text-black flex flex-col flex-wrap justify-between gap-3">
              <div>
                <h2 className="text-white text-sm font-semibold px-2">
                  Time Remaining
                </h2>
                <div className="rounded shadow-md bg-[#3B3433] p-2">
                  <div className="flex justify-between">
                    <span className={`text-white ${currentTurn === 'w' ? 'font-bold' : ''}`}>
                      White: {formatTime(gameState?.whiteTimeLeft)}
                    </span>
                    <span className={`text-white ${currentTurn === 'b' ? 'font-bold' : ''}`}>
                      Black: {formatTime(gameState?.blackTimeLeft)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col flex-grow overflow-hidden">
                <h3 className="text-white text-sm font-semibold px-2">
                  Move History
                </h3>
                <div className="rounded shadow-md bg-[#3B3433] h-96 w-full">
                  <ScrollArea className="h-full w-full">
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
                        {moveHistory.map((move, index) => (
                          <tr key={index} className="hover:bg-[#4A4443] transition-colors duration-200">
                            <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">
                              {Math.floor(index / 2) + 1}.
                            </td>
                            <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">
                              {move.color === 'white' ? move.move : ''}
                            </td>
                            <td className="py-2 px-2 sm:px-5 text-xs sm:text-sm">
                              {move.color === 'black' ? move.move : ''}
                            </td>
                            <td className="py-2 px-2 sm:px-5 text-xs">
                              {formatTime(move.time)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
          <div className="md:block hidden flex justify-center md:justify-start">
            <CapturedPieces color="White" pieces={capturedWhite} />
          </div>
        </div>
      </div>
      <GameOverDialog
        open={gameState?.gameOver || false}
        title={gameState?.result || "Game Over"}
        message={gameState?.result || "The game has ended"}
        onNewGame={() => {
          setGameId("");
          setGameState(null);
          setIsSearching(false);
        }}
      />
    </div>
  );
};

export default OnlinePage;