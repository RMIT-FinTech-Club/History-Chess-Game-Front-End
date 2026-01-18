import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trophy, Target, Activity, AlertCircle, PlayCircle, PauseCircle, Star } from 'lucide-react';
import axiosInstance from '@/config/apiConfig';
import { useGlobalStorage } from '@/hooks/GlobalStorage';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

interface MatchDetailsDialogProps {
    gameId: string | null;
    isOpen: boolean;
    onClose: () => void;
    opponentName: string;
    result: string;
    opponentId: string | null;
}

interface Move {
    from: string;
    to: string;
    promotion?: string;
    fen: string;
    moveNumber: number;
    playerColor: 'w' | 'b';
    evaluation?: number;
    bestmove?: string;
    classification?: string;
}

export const MatchDetailsDialog: React.FC<MatchDetailsDialogProps> = ({
    gameId,
    isOpen,
    onClose,
    opponentName,
    result,
    opponentId
}) => {
    const { accessToken } = useGlobalStorage();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [moves, setMoves] = useState<Move[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [game, setGame] = useState(new Chess());
    const [isPlaying, setIsPlaying] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    useEffect(() => {
        if (isOpen && gameId && accessToken) {
            fetchMatchDetails();
        } else {
            // Reset state when closed or invalid
            setGame(new Chess());
            setMoves([]);
            setCurrentMoveIndex(-1);
            setIsPlaying(false);
        }
    }, [isOpen, gameId, accessToken]);

    const fetchMatchDetails = async () => {
        try {
            setLoading(true);
            const [movesRes, analysisRes] = await Promise.all([
                axiosInstance.get(`/game/moves/${gameId}`, { headers: { Authorization: `Bearer ${accessToken}` } }),
                axiosInstance.get(`/game/analysis/${gameId}`, { headers: { Authorization: `Bearer ${accessToken}` } })
            ]);

            setMoves(movesRes.data);
            setAnalysis(analysisRes.data);

            // Initialize board to end state or start? 
            // Let's go to start.
            const newGame = new Chess();
            setGame(newGame);
            setCurrentMoveIndex(-1);

        } catch (error) {
            console.error('Error fetching match details:', error);
            toast.error('Failed to load match details');
        } finally {
            setLoading(false);
        }
    };

    // Replay functionality
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                if (currentMoveIndex < moves.length - 1) {
                    handleMove(currentMoveIndex + 1);
                } else {
                    setIsPlaying(false);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentMoveIndex, moves]);


    const handleMove = (index: number) => {
        if (index < -1 || index >= moves.length) return;

        const newGame = new Chess();
        for (let i = 0; i <= index; i++) {
            // We need to parse the move string or simpler, rely on FEN if available
            // Or re-apply moves. Backend sends `move` string (SAN?) and FEN.
            // Let's use FEN directly for reliability if available, OR apply moves.
            // Assuming backend stores detailed moves.
            // Wait, moves array from backend has `fen`.

            // Actually, just setting the FEN of the target move is easiest for visual.
            // But `Chessboard` needs a valid position.

            // Let's reconstruct the game state up to that point to ensure validity
            // Or just set the FEN if we trust it.
        }

        // Optimally: Just set the fen from the moves array at `index`.
        if (index === -1) {
            newGame.reset();
        } else {
            const move = moves[index];
            if (move.fen) {
                newGame.load(move.fen);
            }
        }

        setGame(newGame); // React-chessboard will update
        setCurrentMoveIndex(index);
    };

    const getAccuracyColor = (acc: number) => {
        if (acc >= 90) return 'text-green-400';
        if (acc >= 70) return 'text-yellow-400';
        return 'text-red-400';
    };

    const currentMove = currentMoveIndex >= 0 ? moves[currentMoveIndex] : null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-[#1a1614]/95 backdrop-blur-xl border border-white/10 text-white">

                {/* Cinematic Header */}
                <DialogHeader className="p-6 border-b border-white/10 bg-linear-to-r from-black/60 to-transparent absolute top-0 left-0 right-0 z-10 flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="font-display text-2xl text-gold-light tracking-wide flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-gold-royal" />
                            Match Analysis
                        </DialogTitle>
                        <p className="text-sm text-gray-400 font-serif mt-1 flex items-center gap-1">
                            vs
                            <span
                                className={`font-medium ${opponentId ? 'text-white hover:text-gold-light cursor-pointer underline decoration-gold-royal/50' : 'text-white'}`}
                                onClick={() => {
                                    if (opponentId) {
                                        onClose();
                                        router.push(`/player_profile/${opponentId}`);
                                    }
                                }}
                            >
                                {opponentName}
                            </span>
                            • {result}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="w-10 h-10 border-2 border-gold-royal border-t-transparent rounded-full animate-spin" />
                        <p className="text-gold-light font-serif">Retrieving Battle Records...</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row h-full pt-[88px]">

                        {/* Left: Chessboard */}
                        <div className="flex-1 flex items-center justify-center p-6 bg-black/20 relative">
                            <div className="w-full max-w-[60vh] aspect-square shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border-4 border-[#3d2e1f]">
                                <Chessboard
                                    id="AnalysisBoard"
                                    position={game.fen()}
                                    arePiecesDraggable={false}
                                    boardWidth={500} // Responsive wrapper handles actual size, this is base
                                    customDarkSquareStyle={{ backgroundColor: '#779556' }}
                                    customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
                                />
                            </div>
                        </div>

                        {/* Right: Analysis & Controls */}
                        <div className="w-full lg:w-[400px] flex flex-col border-l border-white/10 bg-[#1e1b1a]">

                            {/* Top Stats */}
                            <div className="p-4 grid grid-cols-2 gap-3 border-b border-white/10">
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Accuracy (White)</p>
                                    <div className="flex items-end gap-1">
                                        <Target className="w-4 h-4 text-white/40 mb-1" />
                                        <span className={`text-xl font-bold font-display ${getAccuracyColor(analysis?.whiteAccuracyPoint || 0)}`}>
                                            {analysis?.whiteAccuracyPoint?.toFixed(1) || '-'}%
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Accuracy (Black)</p>
                                    <div className="flex items-end gap-1">
                                        <Target className="w-4 h-4 text-white/40 mb-1" />
                                        <span className={`text-xl font-bold font-display ${getAccuracyColor(analysis?.blackAccuracyPoint || 0)}`}>
                                            {analysis?.blackAccuracyPoint?.toFixed(1) || '-'}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Move Evaluation */}
                            <div className="p-4 border-b border-white/10 flex-1 overflow-hidden flex flex-col">
                                <h3 className="text-gold-light font-serif text-sm mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Move Analysis
                                </h3>

                                {currentMove ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-white font-display">
                                                {Math.floor(currentMove.moveNumber / 2) + 1}. {currentMoveIndex % 2 === 0 ? 'White' : 'Black'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${currentMove.classification === 'Brilliant' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                                                currentMove.classification === 'Great' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                                                    currentMove.classification === 'Blunder' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                                                        'bg-white/10 text-gray-400'
                                                }`}>
                                                {currentMove.classification || 'Normal'}
                                            </span>
                                        </div>

                                        {currentMove.bestmove && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                                                <p className="text-xs text-blue-300 uppercase tracking-wider mb-1">Best Move</p>
                                                <p className="font-mono text-lg text-blue-100">{currentMove.bestmove}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="bg-white/5 p-2 rounded">
                                                <span className="text-gray-500 block text-xs">Eval</span>
                                                <span className={((currentMove.evaluation || 0) > 0) ? 'text-green-400' : 'text-red-400'}>
                                                    {currentMove.evaluation?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-gray-600 italic">
                                        Select a move to view analysis
                                    </div>
                                )}
                            </div>

                            {/* Move History List */}
                            <div className="h-[200px] bg-black/40 border-t border-white/10 flex flex-col">
                                <div className="flex items-center justify-between p-2 border-b border-white/5 bg-white/5">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="flex items-center gap-2 text-xs font-medium text-gold-royal hover:text-gold-light transition-colors"
                                    >
                                        {isPlaying ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                        {isPlaying ? 'Pause Replay' : 'Auto Replay'}
                                    </button>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleMove(currentMoveIndex - 1)}
                                            disabled={currentMoveIndex < 0}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleMove(currentMoveIndex + 1)}
                                            disabled={currentMoveIndex >= moves.length - 1}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <ScrollArea className="flex-1 p-2">
                                    <div className="grid grid-cols-2 gap-1">
                                        {moves.map((move, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleMove(idx)}
                                                className={`
                                            p-2 text-left text-sm font-mono rounded transition-colors flex justify-between group
                                            ${currentMoveIndex === idx
                                                        ? 'bg-gold-royal/20 text-gold-light border border-gold-royal/30'
                                                        : 'hover:bg-white/5 text-gray-400'
                                                    }
                                        `}
                                            >
                                                <span className="opacity-50 w-6">
                                                    {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.` : ''}
                                                </span>
                                                {/* Since we don't have SAN string in the minimalistic Move interface above, 
                                            we might just show 'Move' or try to parse 'from-to' to SAN if possible, 
                                            or check if 'move' string exists in real data. 
                                            Assuming 'move' property exists based on backend service. */}
                                                <span className="font-bold">
                                                    {(move as any).move || `${move.from}-${move.to}`}
                                                </span>

                                                {(move.classification === 'Brilliant' || move.classification === 'Great') && (
                                                    <Star className="w-3 h-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>

                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
