"use client";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Chessboard } from "react-chessboard";
import "@/css/chessboard.css";
import { useOfflineGame } from "@/app/game/offline/hooks/useOfflineGame";
import { useBoardSize } from "@/hooks/useBoardSize";
import { useMoveHistory } from "./component/useMoveHistory";
import { MoveHistoryTable } from "./component/MoveHistoryTable";
import { useChessHandlers } from "./component/useChessHandlers";
import { GameHeader } from "./component/GameHeader";
import { GameOverDialog } from "./component/GameOverDialog";
import { GameControls } from "./component/GameControls";
import type { StockfishLevel } from "./component/useStockfish";
import YellowLight from "@/components/decor/YellowLight";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import { useRouter, useSearchParams } from "next/navigation";

const OfflinePage = () => {
	const [mounted, setMounted] = useState(false);
	const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
	const [gameActive, setGameActive] = useState(false);
	const [gameStarted, setGameStarted] = useState(false);

	const boardWidth = useBoardSize();
	const { isAuthenticated } = useGlobalStorage();
	const router = useRouter();
	const searchParams = useSearchParams(); 

	useEffect(() => {
		if (!isAuthenticated) {
			toast.error("Please sign in to play game.");
			router.push("/sign_in");
		}
	}, [isAuthenticated, router]);

	const {
		fen,
		history,
		moveTimings,
		selectedPiece,
		setSelectedPiece,
		customSquareStyles,
		gameState,
		makeMove,
		undoMove,
		currentTurn: gameTurn,
		playerColor,
		isThinking,
		startSinglePlayerGame,
		aiLevel,
		isAiReady,
	} = useOfflineGame();

	const moveHistoryPairs = useMoveHistory(history, moveTimings);
	const isSinglePlayer = true;
	const chessHandlers = useChessHandlers({
		isSinglePlayer,
		playerColor,
		fen,
		selectedPiece,
		setSelectedPiece,
		makeMove,
	});

	const levelParam = searchParams.get("level");
	const eloParam = searchParams.get("elo");

	const stockfishDepth = levelParam ? parseInt(levelParam, 10) : 5; 

	const aiDifficulty: StockfishLevel = stockfishDepth as StockfishLevel;
	const playerColorDefault: "w" | "b" = "w";

	useEffect(() => {
		if (isAiReady && !gameStarted) {
			startSinglePlayerGame(playerColorDefault, aiDifficulty);
			setGameStarted(true);
		}
	}, [
		isAiReady,
		isAuthenticated,
		startSinglePlayerGame,
		playerColorDefault,
		aiDifficulty,
		isAuthenticated,
	]);

	useEffect(() => {
		setCurrentTurn(gameTurn);
	}, [gameTurn]);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		setGameActive(!gameState.isGameOver && history.length > 0);
	}, [gameState.isGameOver, history.length]);

	const handleNewGame = useCallback(() => {
		startSinglePlayerGame(playerColorDefault, aiDifficulty);
	}, [startSinglePlayerGame, playerColorDefault, aiDifficulty]);

	const handleUndo = useCallback(() => {
		undoMove();
	}, [undoMove]);

	if (!mounted) return <p>Loading Chessboard...</p>;

	return (
		<div className="!h-[100dvh] overflow-hidden flex flex-col items-center w-full">
			<YellowLight top={"30vh"} left={"55vw"} />
			<GameOverDialog
				open={gameState.isGameOver}
				title={gameState.title}
				message={gameState.message}
			/>

			<div className="flex flex-col lg:flex-row gap-3 w-[90vw] flex-1">
				<div className="flex flex-col justify-between w-full min-h-0">
					<div className="flex justify-center md:justify-start"></div>
					<div className="flex flex-col md:flex-row gap-3">
						<div className="flex justify-center items-center">
							<Chessboard
								id="historyChessBoard"
								position={fen}
								onPieceDrop={chessHandlers.handleDrop}
								onPieceClick={chessHandlers.onPieceClick}
								onSquareClick={chessHandlers.onSquareClick}
								onPieceDragBegin={chessHandlers.onPieceDragBegin}
								boardWidth={boardWidth}
								animationDuration={300}
								customSquareStyles={customSquareStyles}
								boardOrientation={"white"}
							/>
						</div>
						<div className="w-full h-[71dvh] text-black flex flex-col justify-between gap-3">
							<MoveHistoryTable moveHistoryPairs={moveHistoryPairs} />
							<GameControls
								onUndo={handleUndo}
								onNewGame={handleNewGame}
								canUndo={history.length > 0}
							/>
						</div>
					</div>
					<div className="flex justify-center md:justify-start"></div>
				</div>
			</div>
		</div>
	);
};

export default OfflinePage;
