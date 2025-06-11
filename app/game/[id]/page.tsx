"use client";

import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { io, Socket } from "socket.io-client";
import { Chess } from "chess.js";
import { useRouter } from "next/navigation";

// Add type definition for game state
type GameState = {
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
};

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

const GamePage = ({ params }: { params: { id: string } }) => {
  const [mounted, setMounted] = useState(false);
  const [boardWidth, setBoardWidth] = useState(580);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [customSquareStyles, setCustomSquareStyles] = useState({});
  const [moveHistory, setMoveHistory] = useState<Array<{
    moveNumber: number;
    move: string;
    color: string;
    time: number;
  }>>([]);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const router = useRouter();
  const [chess] = useState(new Chess());

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:8000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      toast.success("Connected to server");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      toast.error("Disconnected from server");
    });

    // Get game data from localStorage
    const gameData = localStorage.getItem("gameData");
    if (!gameData) {
      toast.error("No game data found");
      router.push("/game/find");
      return;
    }

    const { gameId, userId } = JSON.parse(gameData);

    // Join the game with verification
    newSocket.emit("joinGame", { gameId, userId });

    newSocket.on("gameState", (state) => {
      const storedGameData = JSON.parse(localStorage.getItem("gameData") || "{}");
      
      if (state.playerColor && storedGameData.playerColor && state.playerColor !== storedGameData.playerColor) {
        toast.error("Player color verification failed");
        router.push("/game/find");
        return;
      }
      
      // Set board orientation based on player color
      const playerColor = state.playerColor || storedGameData.playerColor;
      if (playerColor) {
        setBoardOrientation(playerColor);
      }
      
      // Update game state
      setGameState(prev => ({
        ...state,
        playerColor: prev?.playerColor || state.playerColor || storedGameData.playerColor
      }));
      
      // Update move history
      if (state.move) {
        setMoveHistory(prev => [...prev, {
          moveNumber: state.moveNumber,
          move: state.move,
          color: state.color,
          time: state.time || 0
        }]);
      }

      // Update captured pieces
      if (state.capturedPieces) {
        setCapturedWhite(state.capturedPieces.white || []);
        setCapturedBlack(state.capturedPieces.black || []);
      }
    });

    newSocket.on("timeUpdate", (data) => {
      setGameState((prev: any) => ({
        ...prev,
        whiteTimeLeft: data.whiteTimeLeft,
        blackTimeLeft: data.blackTimeLeft
      }));
    });

    newSocket.on("error", (error) => {
      toast.error(error.message);
    });

    // Add gameStart handler
    newSocket.on("gameStart", (data) => {
      const storedGameData = JSON.parse(localStorage.getItem("gameData") || "{}");
      
      // Set initial board orientation based on player color
      if (storedGameData.playerColor) {
        setBoardOrientation(storedGameData.playerColor);
      }
      
      // Set initial game state
      setGameState({
        fen: data.initialGameState,
        turn: "w",
        playerColor: storedGameData.playerColor,
        gameId: data.gameId,
        whiteTimeLeft: data.whiteTimeLeft,
        blackTimeLeft: data.blackTimeLeft
      });
    });

    return () => {
      if (newSocket) {
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("gameState");
        newSocket.off("timeUpdate");
        newSocket.off("error");
        newSocket.off("gameStart");
        newSocket.close();
      }
    };
  }, [params.id, router]);

 
  // Responsive board size (nay AI lam =))) )
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece: string) => {
      if (!socket || !gameState) return false;

      const gameData = localStorage.getItem("gameData");
      if (!gameData) return false;
      const { userId } = JSON.parse(gameData);

      // More detailed debug logging
      console.log("Move attempt details:", {
        piece,
        sourceSquare,
        targetSquare,
        currentTurn: gameState.turn,
        playerColor: gameState.playerColor,
        isWhiteTurn: gameState.turn === "w",
        isPlayerWhite: gameState.playerColor === "white",
        gameState: gameState
      });

      // Simplified turn validation
      const isWhiteTurn = gameState.turn === "w";
      const isPlayerWhite = gameState.playerColor === "white";

      // Debug turn validation


      // Only allow move if it's the player's turn
      if (isWhiteTurn !== isPlayerWhite) {
        toast.error("Not your turn");
        return false;
      }

      // Validate piece color matches player color
      const pieceColor = piece.charAt(0).toLowerCase();
      const isCorrectPieceColor = (pieceColor === "w" && isPlayerWhite) || (pieceColor === "b" && !isPlayerWhite);

      if (!isCorrectPieceColor) {
        toast.error("You can only move your own pieces");
        return false;
      }

      socket.emit("move", {
        gameId: params.id,
        move: `${sourceSquare}${targetSquare}`,
        userId,
      });

      return true;
    },
    [socket, gameState, params.id]
  );

  const onPieceDragBegin = useCallback(
    (piece: string, sourceSquare: Square) => {
      if (!gameState) return;

      const pieceColor = piece.charAt(0).toLowerCase();
      const isWhiteTurn = gameState.turn === "w";
      const isPlayerWhite = gameState.playerColor === "white";

      // Only allow selection if it's the player's turn and piece color matches
      if (isWhiteTurn !== isPlayerWhite) {
        return;
      }

      const isCorrectPieceColor = (pieceColor === "w" && isPlayerWhite) || (pieceColor === "b" && !isPlayerWhite);
      if (!isCorrectPieceColor) {
        return;
      }

      setSelectedPiece(sourceSquare);
    },
    [gameState]
  );

  const onPieceClick = useCallback(
    (piece: string, sourceSquare: Square) => {
      if (!gameState) return;

      const pieceColor = piece.charAt(0).toLowerCase();
      const isWhiteTurn = gameState.turn === "w";
      const isPlayerWhite = gameState.playerColor === "white";

      // Only allow selection if it's the player's turn and piece color matches
      if (isWhiteTurn !== isPlayerWhite) {
        return;
      }

      const isCorrectPieceColor = (pieceColor === "w" && isPlayerWhite) || (pieceColor === "b" && !isPlayerWhite);
      if (!isCorrectPieceColor) {
        return;
      }

      setSelectedPiece(selectedPiece === sourceSquare ? null : sourceSquare);
    },
    [gameState, selectedPiece]
  );

  const onSquareClick = useCallback(
    (square: Square) => {
      if (selectedPiece && square !== selectedPiece) {
        const gameData = localStorage.getItem("gameData");
        if (!gameData) return;
        const { userId } = JSON.parse(gameData);

        socket?.emit("move", {
          gameId: params.id,
          move: `${selectedPiece}${square}`,
          userId,
        });
        setSelectedPiece(null);
      }
    },
    [socket, params.id, selectedPiece]
  );

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
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
              title={isConnected ? "Connected" : "Disconnected"}
            />
            <span className="text-sm text-white">
              {gameState?.gameId ? `Game ID: ${gameState.gameId}` : "No game joined"}
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
                arePiecesDraggable={!!gameState && !gameState.gameOver}
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
                    <span className={`text-white ${gameState?.turn === 'w' ? 'font-bold' : ''}`}>
                      White: {formatTime(gameState?.whiteTimeLeft)}
                    </span>
                    <span className={`text-white ${gameState?.turn === 'b' ? 'font-bold' : ''}`}>
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
          localStorage.removeItem("gameData");
          router.push("/game/find");
        }}
      />
    </div>
  );
};

export default GamePage;
