import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { X, ChevronLeft, ChevronRight, Trophy, Target, Activity, PlayCircle, PauseCircle, Star, StopCircle, Award } from 'lucide-react';
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
    move?: string; // SAN notation
    // Points data
    initialExpectedPoints?: number;
    moveExpectedPoints?: number;
    bestMoveExpectedPoints?: number;
    expectedPointsLost?: number;
    continuation?: string;
}

interface MatchAnalysis {
    whiteAccuracyPoint: number;
    blackAccuracyPoint: number;
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
    const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);

    // Responsive board size
    const boardContainerRef = React.useRef<HTMLDivElement>(null);
    const [boardWidth, setBoardWidth] = useState(600);

    useEffect(() => {
        if (!boardContainerRef.current) return;

        const handleResize = () => {
            if (boardContainerRef.current) {
                // Determine the width based on the computed style or clientWidth of the aspect-ratio container
                // We want the inner width of the container that holds the board
                const { width, height } = boardContainerRef.current.getBoundingClientRect();
                const size = Math.min(width, height) - 20; // safe buffer
                if (size > 100) setBoardWidth(size);
            }
        };

        const resizeObserver = new ResizeObserver((entries) => {
            // Use requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
            window.requestAnimationFrame(() => {
                if (!Array.isArray(entries) || !entries.length) return;
                handleResize();
            });
        });

        resizeObserver.observe(boardContainerRef.current);
        handleResize(); // Initial size

        return () => resizeObserver.disconnect();
    }, []);

    const handleMove = useCallback((index: number) => {
        if (index < -1 || index >= moves.length) return;

        const newGame = new Chess();

        // Optimally: Just set the fen from the moves array at `index`.
        if (index === -1) {
            newGame.reset();
        } else {
            const move = moves[index];
            if (move.fen) {
                try {
                    newGame.load(move.fen);
                } catch (e) {
                    // Fallback: try to reconstruct if FEN fails (less reliable without full history)
                    console.warn("Invalid FEN, attempting reset", e);
                }
            }
        }

        setGame(newGame);
        setCurrentMoveIndex(index);
    }, [moves]);

    const fetchMatchDetails = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch analysis data which includes moves and accuracy
            const analysisRes = await axiosInstance.get(`/game/analysis/${gameId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            // The analysis endpoint returns { moves: [], whiteAccuracy, blackAccuracy }
            // The moves array contains the analysis data we need
            setMoves(analysisRes.data.moves || []);
            setAnalysis({
                whiteAccuracyPoint: analysisRes.data.whiteAccuracy,
                blackAccuracyPoint: analysisRes.data.blackAccuracy
            });

            const newGame = new Chess();
            setGame(newGame);
            setCurrentMoveIndex(-1);

        } catch (error) {
            console.error('Error fetching match details:', error);
            // Fallback to basic moves endpoint if analysis fails (though analysis is preferred)
            try {
                const movesRes = await axiosInstance.get(`/game/history/detail/${gameId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                // Map the detailed moves response structure if different
                setMoves(movesRes.data.moves || []);
            } catch (fallbackError) {
                console.error('Fallback fetch failed:', fallbackError);
                toast.error('Failed to load match details');
            }
        } finally {
            setLoading(false);
        }
    }, [gameId, accessToken]);

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
    }, [isOpen, gameId, accessToken, fetchMatchDetails]);

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
            }, 1500); // 1.5s per move for better viewing
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentMoveIndex, moves, handleMove]);

    const stopPlayback = () => {
        setIsPlaying(false);
        handleMove(-1);
    };

    const getAccuracyColor = (acc: number) => {
        if (acc >= 90) return 'text-green-400';
        if (acc >= 70) return 'text-yellow-400';
        return 'text-red-400';
    };

    const currentMove = currentMoveIndex >= 0 ? moves[currentMoveIndex] : null;

    const getClassificationStyles = (classification?: string) => {
        switch (classification) {
            case 'Brilliant': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10';
            case 'Checkmate': return 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-purple-500/10';
            case 'Great': return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/10';
            case 'Best': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10';
            case 'Excellent': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-emerald-500/5';
            case 'Good': return 'bg-lime-500/10 text-lime-400 border-lime-500/30 shadow-lime-500/10';
            case 'Inaccuracy': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-yellow-500/10';
            case 'Mistake': return 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-orange-500/10';
            case 'Blunder': return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-rose-500/10';
            case 'Analyzing...': return 'bg-white/5 text-gray-500 border-white/10 animate-pulse';
            case 'Analysis Error': return 'bg-red-500/5 text-red-400/60 border-red-500/10';
            case 'Unclassified': return 'bg-white/5 text-gray-400 border-white/10';
            default: return 'bg-white/5 text-gray-400 border-white/10';
        }
    };

    const getClassificationColor = (classification?: string) => {
        switch (classification) {
            case 'Brilliant': return 'text-cyan-400';
            case 'Checkmate': return 'text-purple-400';
            case 'Great': return 'text-amber-400';
            case 'Best': return 'text-emerald-400';
            case 'Excellent': return 'text-emerald-300';
            case 'Good': return 'text-lime-400';
            case 'Inaccuracy': return 'text-yellow-400';
            case 'Mistake': return 'text-orange-400';
            case 'Blunder': return 'text-rose-400';
            case 'Analyzing...': return 'text-gray-600';
            case 'Analysis Error': return 'text-red-400/50';
            default: return 'text-gray-400';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[1400px] w-[95vw] h-[90vh] p-0 overflow-hidden bg-bg-app border border-border-glass text-text-primary shadow-2xl shadow-black/50 flex flex-col">

                {/* Cinematic Header */}
                <DialogHeader className="p-4 border-b border-border-glass bg-bg-app/90 shrink-0 z-20 flex flex-row items-center justify-between backdrop-blur-sm">
                    <div>
                        <DialogTitle className="font-display text-2xl text-gold-light tracking-wide flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-gold-royal" />
                            Match Analysis
                        </DialogTitle>
                        <p className="text-sm text-text-muted font-serif mt-1 flex items-center gap-1">
                            vs
                            <span
                                className={`font-medium ${opponentId ? 'text-text-primary hover:text-gold-light cursor-pointer underline decoration-gold-royal/50' : 'text-text-primary'}`}
                                onClick={() => {
                                    if (opponentId) {
                                        onClose();
                                        router.push(`/player_profile/${opponentId}`);
                                    }
                                }}
                            >
                                {opponentName}
                            </span>
                            • <span className={result === 'Victory' ? 'text-green-400' : result === 'Defeat' ? 'text-red-400' : 'text-yellow-400'}>{result}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-glass transition-colors text-text-muted hover:text-text-primary border border-transparent hover:border-gold-royal/30"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-4">
                        <div className="w-12 h-12 border-2 border-gold-royal border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(212,175,55,0.3)]" />
                        <p className="text-gold-light font-serif tracking-widest text-sm">RETRIEVING BATTLE RECORDS...</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

                        {/* Left: Chessboard Area */}
                        <div className="flex-1 bg-bg-dark relative flex items-center justify-center p-4 overflow-hidden" ref={boardContainerRef}>
                            {/* Decorative background elements */}
                            <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-5 pointer-events-none" />

                            {/* Container dictates the Layout Size via CSS */}
                            <div
                                style={{
                                    width: '100%',
                                    maxWidth: 'min(100%, 75vh)'
                                }}
                                className="aspect-square shadow-[0_0_60px_rgba(0,0,0,0.7)] rounded-sm overflow-hidden border-4 border-[#3d2e1f] relative bg-[#3d2e1f]"
                            >
                                <div className="absolute inset-0">
                                    <Chessboard
                                        id="AnalysisBoard"
                                        position={game.fen()}
                                        arePiecesDraggable={false}
                                        boardWidth={boardWidth} // Fed by JS for SVG calculation
                                        customBoardStyle={{
                                            width: '100%', // Fills absolute parent
                                            height: '100%',
                                        }}
                                        customDarkSquareStyle={{ backgroundColor: '#779556' }}
                                        customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
                                    />
                                </div>
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] rounded-sm z-10" />
                            </div>
                        </div>

                        {/* Right: Analysis & Controls */}
                        <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col border-l border-border-glass bg-bg-card lg:h-full h-[45vh] shrink-0 backdrop-blur-md">

                            {/* Top Stats */}
                            <div className="p-3 grid grid-cols-2 gap-3 border-b border-border-glass bg-surface-glass shrink-0">
                                <div className="bg-bg-dark p-2 rounded-lg border border-border-glass flex flex-col items-center">
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">White Accuracy</p>
                                    <div className="flex items-center gap-1">
                                        <Target className="w-4 h-4 text-text-muted/60" />
                                        <span className={`text-2xl font-bold font-display ${getAccuracyColor(analysis?.whiteAccuracyPoint || 0)}`}>
                                            {analysis?.whiteAccuracyPoint?.toFixed(1) || '-'}%
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-bg-dark p-3 rounded-lg border border-border-glass flex flex-col items-center">
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Black Accuracy</p>
                                    <div className="flex items-center gap-1">
                                        <Target className="w-4 h-4 text-text-muted/60" />
                                        <span className={`text-2xl font-bold font-display ${getAccuracyColor(analysis?.blackAccuracyPoint || 0)}`}>
                                            {analysis?.blackAccuracyPoint?.toFixed(1) || '-'}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Move Evaluation */}
                            <div className="flex-1 overflow-y-auto p-4 relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-royal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                <h3 className="text-gold-light/80 font-serif text-xs uppercase tracking-widest mb-4 flex items-center gap-2 sticky top-0 bg-bg-card z-10 py-1">
                                    <Activity className="w-4 h-4" /> Move Analysis
                                </h3>

                                {currentMove ? (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold text-text-primary font-display text-shadow-sm">
                                                {Math.floor(currentMove.moveNumber / 2) + 1}. {currentMoveIndex % 2 === 0 ? 'White' : 'Black'}
                                            </span>
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg border ${getClassificationStyles(currentMove.classification)}`}>
                                                {currentMove.classification === 'Analyzing...' ? 'Evaluating' : (currentMove.classification || 'Normal')}
                                            </span>
                                        </div>

                                        {/* Points Display */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-bg-dark p-3 rounded-lg border border-border-glass">
                                                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <Award className="w-3 h-3 text-gold-royal" /> Move Points
                                                </p>
                                                <p className="font-display text-xl text-gold-shimmer">
                                                    {currentMove.moveExpectedPoints?.toFixed(1) || '0.0'}
                                                </p>
                                            </div>
                                            <div className="bg-bg-dark p-3 rounded-lg border border-border-glass">
                                                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Expected Loss</p>
                                                <p className={`font-display text-xl ${currentMove.expectedPointsLost && currentMove.expectedPointsLost > 50 ? 'text-red-400' : 'text-text-primary'}`}>
                                                    -{currentMove.expectedPointsLost?.toFixed(1) || '0.0'}
                                                </p>
                                            </div>
                                        </div>

                                        {currentMove.bestmove && (
                                            <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg">
                                                <p className="text-[10px] text-blue-300 uppercase tracking-widest mb-1">Best Continuation</p>
                                                <p className="font-mono text-lg text-blue-100">
                                                    {currentMove.bestmove ? currentMove.bestmove.split(' ')[0] : (currentMove.continuation ? currentMove.continuation.split(' ')[0] : '---')}
                                                </p>
                                                <p className="text-xs text-blue-400/60 mt-1">
                                                    Score: {currentMove.bestMoveExpectedPoints?.toFixed(1) || '0.0'} pts
                                                </p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="bg-surface-glass p-2 rounded border border-border-glass">
                                                <span className="text-text-muted block text-[10px] uppercase tracking-wider">Engine Eval</span>
                                                <span className={`font-mono ${getClassificationColor(currentMove.classification)}`}>
                                                    {currentMove.evaluation !== null && currentMove.evaluation !== undefined ? currentMove.evaluation.toFixed(2) : '-.--'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-2">
                                        <p className="italic font-serif">Select a move to begin analysis</p>
                                    </div>
                                )}
                            </div>

                            {/* Playback Controls */}
                            <div className="p-3 border-t border-b border-border-glass bg-bg-dark flex justify-center items-center gap-3">
                                <button
                                    onClick={stopPlayback}
                                    className="p-2 rounded-full hover:bg-surface-glass text-text-muted hover:text-red-400 transition-colors"
                                    title="Stop & Reset"
                                >
                                    <StopCircle className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => handleMove(currentMoveIndex - 1)}
                                    disabled={currentMoveIndex < 0}
                                    className="p-2 rounded-full hover:bg-surface-glass disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>

                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`
                                        w-12 h-12 rounded-full flex items-center justify-center
                                        transition-all duration-300 shadow-lg
                                        ${isPlaying
                                            ? 'bg-gold-royal/20 text-gold-shimmer border border-gold-royal/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                            : 'bg-gold-royal text-black hover:bg-gold-light hover:scale-105'
                                        }
                                    `}
                                >
                                    {isPlaying ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6 fill-current" />}
                                </button>

                                <button
                                    onClick={() => handleMove(currentMoveIndex + 1)}
                                    disabled={currentMoveIndex >= moves.length - 1}
                                    className="p-2 rounded-full hover:bg-surface-glass disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Move History List */}
                            <div className="flex-1 min-h-0 bg-bg-dark flex flex-col shrink-0 lg:shrink lg:h-auto">
                                <ScrollArea className="h-full p-2">
                                    <div className="grid grid-cols-2 gap-1">
                                        {moves.map((move, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleMove(idx)}
                                                className={`
                                            p-2 text-left text-sm font-mono rounded transition-colors flex justify-between group items-center
                                            ${currentMoveIndex === idx
                                                        ? 'bg-gold-royal/20 text-gold-light border border-gold-royal/30'
                                                        : 'hover:bg-surface-glass text-text-muted border border-transparent'
                                                    }
                                        `}
                                            >
                                                <div className="flex gap-2">
                                                    <span className="opacity-40 w-5 text-xs">
                                                        {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.` : ''}
                                                    </span>
                                                    <span className="font-bold">
                                                        {move.move || `${move.from}-${move.to}`}
                                                    </span>
                                                </div>

                                                {(move.classification === 'Brilliant' || move.classification === 'Great') && (
                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500/20" />
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
