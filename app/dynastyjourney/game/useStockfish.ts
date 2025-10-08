import { useEffect, useRef, useState } from 'react';

export type StockfishLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 15 | 20;

interface UseStockfishOptions {
  level?: StockfishLevel;
  timeForMove?: number;
}

export function useStockfish({ level = 5, timeForMove = 1000 }: UseStockfishOptions = {}) {
  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [engineLevel, setEngineLevel] = useState<StockfishLevel>(level);
  const engineRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize the Stockfish engine
    const stockfishWorker = new Worker('/stockfish.js');
    engineRef.current = stockfishWorker;

    stockfishWorker.onmessage = (e) => {
      const message = e.data;

      // When engine outputs 'readyok', it's ready for commands
      if (message === 'readyok') {
        setIsReady(true);
        setupEngine();
      }

      // Parse best move from engine response
      if (message.includes('bestmove')) {
        const moveMatch = message.match(/bestmove\s+(\w+)/);
        if (moveMatch && moveMatch[1]) {
          const bestMove = moveMatch[1];
          if (onMoveCallback.current) {
            onMoveCallback.current(bestMove);
          }
          setIsThinking(false);
        }
      }
    };

    // Initialize the engine
    stockfishWorker.postMessage('uci');
    stockfishWorker.postMessage('isready');

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stockfishWorker.terminate();
    };
  }, []);

  // Update engine level when it changes
  useEffect(() => {
    if (isReady && engineRef.current) {
      setupEngine();
    }
  }, [engineLevel, isReady]);

  // Setup engine with appropriate skill level
  const setupEngine = () => {
    if (!engineRef.current) return;

    // Configure engine based on level
    engineRef.current.postMessage('ucinewgame');
    engineRef.current.postMessage(`setoption name Skill Level value ${engineLevel}`);
  };

  const onMoveCallback = useRef<(move: string) => void | null>(null);

  // Find best move for a given FEN position
  const findBestMove = (fen: string, callback: (move: string) => void) => {
    if (!engineRef.current || !isReady) return;

    setIsThinking(true);
    onMoveCallback.current = callback;

    engineRef.current.postMessage(`position fen ${fen}`);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a timeout to ensure the engine responds within a reasonable time
    timeoutRef.current = setTimeout(() => {
      engineRef.current?.postMessage(`go movetime ${timeForMove}`);
    }, 100);
  };

  // Change the engine difficulty level
  const setLevel = (newLevel: StockfishLevel) => {
    setEngineLevel(newLevel);
  };

  return {
    isReady,
    isThinking,
    findBestMove,
    setLevel,
    engineLevel
  };
}
