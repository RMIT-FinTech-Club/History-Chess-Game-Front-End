import { useState, useCallback, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { io, Socket } from "socket.io-client";

// Define interface for online game state received from server
interface ServerGameState {
  fen: string;
  history: string[];
  moveTimings: string[];
  capturedWhite: string[];
  capturedBlack: string[];
  currentTurn: "w" | "b";
  isGameOver: boolean;
  gameOverTitle: string;
  gameOverMessage: string;
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  lastMoveTime: number;
}

// Define interfaces for socket response types
interface BasicResponse {
  error?: string;
}

interface CreateGameResponse extends BasicResponse {
  gameId?: string;
  roomCode?: string;
  playerColor?: "w" | "b";
  gameState?: ServerGameState;
}

interface JoinGameResponse extends BasicResponse {
  gameId?: string;
  roomCode?: string;
  playerColor?: "w" | "b";
  opponentId?: string;
  gameState?: ServerGameState;
}

// Define type for the props
interface UseOnlineGameProps {
  apiUrl?: string;
  userId?: string;
  autoConnect?: boolean;
}

export function useOnlineGame({
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  userId = "",
  autoConnect = false,
}: UseOnlineGameProps = {}) {
  // Socket connection state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Game information
  const [gameId, setGameId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  
  // Game state from server
  const [serverGameState, setServerGameState] = useState<ServerGameState>({
    fen: new Chess().fen(),
    history: [],
    moveTimings: [],
    capturedWhite: [],
    capturedBlack: [],
    currentTurn: "w",
    isGameOver: false,
    gameOverTitle: "",
    gameOverMessage: "",
    whiteTimeRemaining: 600, // 10 minutes default
    blackTimeRemaining: 600,
    lastMoveTime: Date.now(),
  });
  
  // Local UI state
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  
  // Create local Chess instance for move validation
  const [gameValidator] = useState(new Chess());
  
  // Selected piece possible moves
  const possibleMoves = useCallback(() => {
    if (!selectedPiece) return [];
    
    try {
      // Update validator to current position
      gameValidator.load(serverGameState.fen);
      
      const moves = gameValidator.moves({ 
        square: selectedPiece, 
        verbose: true 
      });
      
      return moves.map((move) => ({
        to: move.to,
        isCapture: !!move.captured,
      }));
    } catch (error) {
      console.error("Error calculating possible moves:", error);
      return [];
    }
  }, [selectedPiece, serverGameState.fen, gameValidator]);
  
  // Calculate squares involved in check
  const checkSquares = useCallback(() => {
    try {
      // Update validator to current position
      gameValidator.load(serverGameState.fen);
      
      if (!gameValidator.isCheck()) return [];
      
      // Find the king square
      const kingSquare = (() => {
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            const p = gameValidator.board()[i][j];
            if (p && p.type === "k" && p.color === gameValidator.turn()) {
              return `${String.fromCharCode(97 + j)}${8 - i}` as Square;
            }
          }
        }
        return "" as Square;
      })();
      
      if (!kingSquare) return [];
      
      // Helper function to get path between squares
      const getPathBetween = (from: Square, to: Square): Square[] => {
        const path: Square[] = [];
        const fromFile = from.charCodeAt(0) - 97;
        const fromRank = 8 - parseInt(from[1]);
        const toFile = to.charCodeAt(0) - 97;
        const toRank = 8 - parseInt(to[1]);
      
        const fileDiff = toFile - fromFile;
        const rankDiff = toRank - fromRank;
      
        // Vertical movement
        if (fileDiff === 0) {
          const step = rankDiff > 0 ? 1 : -1;
          for (let i = 1; i < Math.abs(rankDiff); i++) {
            path.push(`${from[0]}${8 - (fromRank + i * step)}` as Square);
          }
        }
        // Horizontal movement
        else if (rankDiff === 0) {
          const step = fileDiff > 0 ? 1 : -1;
          for (let i = 1; i < Math.abs(fileDiff); i++) {
            path.push(
              `${String.fromCharCode(97 + fromFile + i * step)}${from[1]}` as Square
            );
          }
        }
        // Diagonal movement
        else if (Math.abs(fileDiff) === Math.abs(rankDiff)) {
          const steps = Math.abs(fileDiff);
          const fileStep = fileDiff > 0 ? 1 : -1;
          const rankStep = rankDiff > 0 ? 1 : -1;
          for (let i = 1; i < steps; i++) {
            path.push(
              `${String.fromCharCode(97 + fromFile + i * fileStep)}${8 - (fromRank + i * rankStep)}` as Square
            );
          }
        }
        return path;
      };
      
      const checkingSquares: Square[] = [];
      const opponentColor = gameValidator.turn() === "w" ? "b" : "w";
      const board = gameValidator.board();
      
      // Clone the game and flip the turn to simulate opponent's moves
      const tempGame = new Chess();
      const fenParts = serverGameState.fen.split(" ");
      fenParts[1] = opponentColor; // Opponent's turn
      tempGame.load(fenParts.join(" "));
      
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const piece = board[i][j];
          if (piece && piece.color === opponentColor) {
            const pieceSquare = `${String.fromCharCode(97 + j)}${8 - i}` as Square;
            const moves = tempGame.moves({ square: pieceSquare, verbose: true });
            if (moves.some(m => m.to === kingSquare)) {
              checkingSquares.push(pieceSquare);
              if (["r", "b", "q"].includes(piece.type)) {
                const path = getPathBetween(pieceSquare, kingSquare);
                checkingSquares.push(...path);
              }
            }
          }
        }
      }
      
      checkingSquares.push(kingSquare);
      return [...new Set(checkingSquares)];
    } catch (error) {
      console.error("Error calculating check squares:", error);
      return [];
    }
  }, [serverGameState.fen, gameValidator]);
  
  // Square styles for highlighting
  const customSquareStyles = useCallback(() => {
    const styles: { [square: string]: React.CSSProperties } = {};
    
    // Highlight check squares (red)
    checkSquares().forEach((square) => {
      styles[square] = {
        backgroundColor: "rgba(255, 0, 0, 0.4)",
      };
    });
    
    // Highlight possible moves for the selected piece
    possibleMoves().forEach(({ to, isCapture }) => {
      styles[to] = {
        backgroundColor: isCapture
          ? "rgba(255, 0, 0, 0.4)"
          : "rgba(0, 255, 0, 0.4)",
      };
    });
    
    return styles;
  }, [checkSquares, possibleMoves]);
  
  // Connect to server
  const connect = useCallback(() => {
    if (socket) {
      // Already connected or connecting
      return;
    }
    
    try {
      const newSocket = io(apiUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: userId ? { userId } : undefined,
      });
      
      setSocket(newSocket);
      
      // Set up event listeners
      newSocket.on("connect", () => {
        setIsConnected(true);
        setErrorMessage(null);
      });
      
      newSocket.on("disconnect", () => {
        setIsConnected(false);
      });
      
      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setErrorMessage("Failed to connect to game server.");
      });
      
      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
        setErrorMessage(error.message || "An error occurred with the game server.");
      });
      
      // Game-specific events
      newSocket.on("gameJoined", (data) => {
        setGameId(data.gameId);
        setRoomCode(data.roomCode);
        setPlayerColor(data.playerColor);
        setIsWaitingForOpponent(!data.opponentId);
        setOpponentId(data.opponentId || null);
        setServerGameState(data.gameState);
      });
      
      newSocket.on("gameState", (data) => {
        setServerGameState(data);
        setIsPlayerTurn(data.currentTurn === playerColor);
        setIsWaitingForOpponent(false);
      });
      
      newSocket.on("opponentJoined", (data) => {
        setOpponentId(data.opponentId);
        setIsWaitingForOpponent(false);
      });
      
      newSocket.on("opponentLeft", () => {
        setOpponentId(null);
        setIsWaitingForOpponent(true);
      });
      
      newSocket.on("invalidMove", (data) => {
        setErrorMessage(data.message || "Invalid move");
        // Revert to server state
        setServerGameState(data.gameState);
      });
      
    } catch (error) {
      console.error("Error initializing socket:", error);
      setErrorMessage("Failed to initialize connection to game server.");
    }
  }, [socket, apiUrl, userId, playerColor]);
  
  // Disconnect from server
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setGameId(null);
      setRoomCode(null);
      setPlayerColor(null);
      setOpponentId(null);
      setIsWaitingForOpponent(false);
    }
  }, [socket]);
  
  // Auto-connect if specified
  useEffect(() => {
    if (autoConnect && !socket) {
      connect();
    }
    
    return () => {
      // Clean up socket connection on unmount
      if (socket) {
        socket.disconnect();
      }
    };
  }, [autoConnect, socket, connect]);
  
  // Create a new game
  const createGame = useCallback(() => {
    if (!socket || !isConnected) {
      setErrorMessage("Not connected to server");
      return;
    }
    
    socket.emit("createGame", {}, (response: CreateGameResponse) => {
      if (response.error) {
        setErrorMessage(response.error);
      } else if (response.gameId && response.roomCode && response.playerColor && response.gameState) {
        setGameId(response.gameId);
        setRoomCode(response.roomCode);
        setPlayerColor(response.playerColor);
        setIsWaitingForOpponent(true);
        setServerGameState(response.gameState);
      } else {
        setErrorMessage("Invalid response from server on createGame.");
      }
    });
  }, [socket, isConnected]);
  
  // Join a game by room code
  const joinGame = useCallback((code: string) => {
    if (!socket || !isConnected) {
      setErrorMessage("Not connected to server");
      return;
    }
    
    socket.emit("joinGame", { roomCode: code }, (response: JoinGameResponse) => {
      if (response.error) {
        setErrorMessage(response.error);
      } else if (response.gameId && response.roomCode && response.playerColor && response.opponentId && response.gameState) {
        setGameId(response.gameId);
        setRoomCode(response.roomCode);
        setPlayerColor(response.playerColor);
        setOpponentId(response.opponentId);
        setIsWaitingForOpponent(false);
        setServerGameState(response.gameState);
      } else {
         // Handle case where opponent might not be present yet (optional opponentId)
         if (response.gameId && response.roomCode && response.playerColor && response.gameState) {
            setGameId(response.gameId);
            setRoomCode(response.roomCode);
            setPlayerColor(response.playerColor);
            setOpponentId(null); // Explicitly set opponentId to null
            setIsWaitingForOpponent(true); // Waiting for opponent
            setServerGameState(response.gameState);
         } else {
            setErrorMessage("Invalid response from server on joinGame.");
         }
      }
    });
  }, [socket, isConnected]);
  
  // Make a move
  const makeMove = useCallback((sourceSquare: string, targetSquare: string, promotionPiece?: string) => {
    if (!socket || !isConnected || !gameId) {
      setErrorMessage("Not connected to server");
      return false;
    }
    
    if (!isPlayerTurn) {
      setErrorMessage("Not your turn");
      return false;
    }
    
    socket.emit("move", {
      gameId,
      move: {
        from: sourceSquare,
        to: targetSquare,
        promotion: promotionPiece
      }
    });
    
    // We don't update the state here - wait for server confirmation
    // Server will send updated gameState via socket
    return true;
  }, [socket, isConnected, gameId, isPlayerTurn]);
  
  // Request a move undo
  const requestUndo = useCallback(() => {
    if (!socket || !isConnected || !gameId) {
      setErrorMessage("Not connected to server");
      return;
    }
    
    socket.emit("requestUndo", { gameId }, (response: BasicResponse) => {
      if (response.error) {
        setErrorMessage(response.error);
      }
      // Handle success case if needed, e.g., show a "Undo requested" message
    });
  }, [socket, isConnected, gameId]);
  
  // Forfeit the game
  const forfeitGame = useCallback(() => {
    if (!socket || !isConnected || !gameId) {
      setErrorMessage("Not connected to server");
      return;
    }
    
    socket.emit("forfeit", { gameId }, (response: BasicResponse) => {
      if (response.error) {
        setErrorMessage(response.error);
      }
      // Server should send updated gameState via 'gameState' event upon forfeit
    });
  }, [socket, isConnected, gameId]);
  
  // Offer a draw
  const offerDraw = useCallback(() => {
    if (!socket || !isConnected || !gameId) {
      setErrorMessage("Not connected to server");
      return;
    }
    
    socket.emit("offerDraw", { gameId }, (response: BasicResponse) => {
      if (response.error) {
        setErrorMessage(response.error);
      }
      // Handle success case if needed, e.g., show a "Draw offered" message
    });
  }, [socket, isConnected, gameId]);
  
  // Accept a draw offer
  const acceptDraw = useCallback(() => {
    if (!socket || !isConnected || !gameId) {
      setErrorMessage("Not connected to server");
      return;
    }
    
    socket.emit("acceptDraw", { gameId }, (response: BasicResponse) => {
      if (response.error) {
        setErrorMessage(response.error);
      }
      // Server should send updated gameState via 'gameState' event upon draw acceptance
    });
  }, [socket, isConnected, gameId]);
  
  // Decline a draw offer
  const declineDraw = useCallback(() => {
    if (!socket || !isConnected || !gameId) {
      setErrorMessage("Not connected to server");
      return;
    }
    
    socket.emit("declineDraw", { gameId }, (response: BasicResponse) => {
      if (response.error) {
        setErrorMessage(response.error);
      }
      // Handle success case if needed, e.g., show a "Draw declined" message
    });
  }, [socket, isConnected, gameId]);
  
  return {
    // Connection state
    isConnected,
    connect,
    disconnect,
    errorMessage,
    
    // Game setup
    createGame,
    joinGame,
    gameId,
    roomCode,
    playerColor,
    opponentId,
    isWaitingForOpponent,
    
    // Game state
    fen: serverGameState.fen,
    history: serverGameState.history,
    moveTimings: serverGameState.moveTimings,
    capturedWhite: serverGameState.capturedWhite,
    capturedBlack: serverGameState.capturedBlack,
    customSquareStyles: customSquareStyles(),
    selectedPiece,
    setSelectedPiece,
    currentTurn: serverGameState.currentTurn,
    isPlayerTurn,
    
    // Game progress
    gameState: {
      isGameOver: serverGameState.isGameOver,
      title: serverGameState.gameOverTitle,
      message: serverGameState.gameOverMessage
    },
    whiteTimeRemaining: serverGameState.whiteTimeRemaining,
    blackTimeRemaining: serverGameState.blackTimeRemaining,
    
    // Game actions
    makeMove,
    requestUndo,
    forfeitGame,
    offerDraw,
    acceptDraw,
    declineDraw
  };
}