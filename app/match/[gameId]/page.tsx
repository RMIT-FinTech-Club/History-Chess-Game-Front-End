"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { ChevronLeft, ChevronRight, Trophy, PlayCircle, PauseCircle, Star, Swords, Clock, X } from 'lucide-react';
import axiosInstance from '@/config/apiConfig';
import { useGlobalStorage } from '@/hooks/GlobalStorage';
import BackgroundEffects from '@/components/decor/BackgroundEffects';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

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
    move?: string;
    initialExpectedPoints?: number;
    moveExpectedPoints?: number;
    bestMoveExpectedPoints?: number;
    expectedPointsLost?: number;
    mate?: number;
    continuation?: string;
}

export default function MatchAnalysisPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { accessToken } = useGlobalStorage();

    const gameId = params.gameId as string;
    const opponentName = searchParams.get('opponentName') || 'Unknown Opponent';
    const result = searchParams.get('result') || 'Finished';
    const opponentId = searchParams.get('opponentId');

    const [loading, setLoading] = useState(true);
    const [moves, setMoves] = useState<Move[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [game, setGame] = useState(new Chess());
    const [isPlaying, setIsPlaying] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const boardPanelRef = useRef<HTMLDivElement>(null);
    const [boardWidth, setBoardWidth] = useState(400);

    // Strict Board Resizing Logic
    useEffect(() => {
        if (!boardPanelRef.current) return;

        const resizeBoard = () => {
            if (boardPanelRef.current) {
                const { width, height } = boardPanelRef.current.getBoundingClientRect();
                // Subtract padding (e.g. 64px = 32px top/bottom) and a safety margin
                const availableSize = Math.min(width, height) - 48;
                setBoardWidth(Math.max(200, availableSize));
            }
        };

        const resizeObserver = new ResizeObserver((entries) => {
            // Use requestAnimationFrame to avoid "ResizeObserver loop limit exceeded" errors
            window.requestAnimationFrame(() => {
                if (!Array.isArray(entries) || !entries.length) return;
                resizeBoard();
            });
        });

        resizeObserver.observe(boardPanelRef.current);
        window.addEventListener('resize', resizeBoard);
        resizeBoard(); // Initial sizing

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', resizeBoard);
        };
    }, []);

    // Fetch Match Details
    useEffect(() => {
        if (gameId && accessToken) {
            fetchMatchDetails();
        }
    }, [gameId, accessToken]);

    const fetchMatchDetails = async () => {
        try {
            setLoading(true);
            const analysisRes = await axiosInstance.get(`/game/analysis/${gameId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

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
            try {
                const movesRes = await axiosInstance.get(`/game/history/detail/${gameId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setMoves(movesRes.data.moves || []);
            } catch (fallbackError) {
                toast.error('Failed to load match details');
            }
        } finally {
            setLoading(false);
        }
    };

    // Replay Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                if (currentMoveIndex < moves.length - 1) {
                    handleMove(currentMoveIndex + 1);
                } else {
                    setIsPlaying(false);
                }
            }, 1000); // Slightly faster replay
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentMoveIndex, moves]);

    const handleMove = (index: number) => {
        if (index < -1 || index >= moves.length) return;

        const newGame = new Chess();
        try {
            for (let i = 0; i <= index; i++) {
                const moveData = moves[i];
                if (moveData.move) {
                    newGame.move(moveData.move);
                } else if (moveData.from && moveData.to) {
                    newGame.move({ from: moveData.from, to: moveData.to, promotion: moveData.promotion || 'q' });
                }
            }
        } catch (e) {
            // Silent catch for robustness
            if (index >= 0 && moves[index].fen) {
                newGame.load(moves[index].fen);
            }
        }

        setGame(newGame);
        setCurrentMoveIndex(index);
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
        // Full screen layout using fixed positioning to cover entire viewport and Body background
        <div className="fixed inset-0 w-full h-full bg-bg-app flex flex-col overflow-hidden font-sans text-text-primary pt-[var(--navbar-height)] z-0">
            {/* Header - Blending with Global Navbar */}
            <header className="shrink-0 h-[60px] flex items-center justify-between px-6 border-b border-border-glass bg-bg-app/80 backdrop-blur-md z-40 relative">
                {/* Top Ambient Glow - Reduced intensity */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-linear-to-r from-transparent via-gold-royal/30 to-transparent" />

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 group cursor-default">
                        <div className="p-1.5 rounded-lg bg-gold-royal/5 border border-gold-royal/10 group-hover:bg-gold-royal/10 transition-colors">
                            <Trophy className="w-4 h-4 text-gold-royal" />
                        </div>
                        <div>
                            <h1 className="font-display text-base text-gold-light tracking-widest leading-none">BATTLE REPORT</h1>
                            <p className="font-serif text-[9px] text-text-muted uppercase tracking-[0.2em] mt-0.5">Tactical Analysis</p>
                        </div>
                    </div>
                </div>

                {/* Match Info - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8 hidden md:flex">
                    <div className="text-right">
                        <div className="font-display text-sm text-gold-light tracking-wider">YOU</div>
                        <div className="text-[9px] text-text-secondary font-serif tracking-widest uppercase">Commanding White</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="px-2 py-0.5 bg-surface-glass rounded border border-border-glass text-[10px] font-serif text-text-muted">VS</div>
                    </div>
                    <div className="text-left">
                        <div
                            className={`font-display text-sm tracking-wider cursor-pointer transition-colors ${opponentId ? 'text-gold-light hover:text-white' : 'text-text-muted'}`}
                            onClick={() => opponentId && router.push(`/player_profile/${opponentId}`)}
                        >
                            {opponentName.toUpperCase()}
                        </div>
                        <div className="text-[9px] text-text-secondary font-serif tracking-widest uppercase">Commanding Black</div>
                    </div>
                </div>

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 group px-3 py-1.5"
                >
                    <span className="font-serif text-[10px] text-text-muted group-hover:text-gold-light transition-colors tracking-widest uppercase">Return to HQ</span>
                    <div className="p-1 rounded bg-surface-glass border border-border-glass group-hover:border-gold-royal/30 transition-colors text-text-muted group-hover:text-gold-royal">
                        <X className="w-3 h-3" />
                    </div>
                </button>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex w-full overflow-hidden relative">
                <BackgroundEffects />

                {/* Left Panel: Board Area */}
                <div ref={boardPanelRef} className="flex-1 relative z-10 flex items-center justify-center overflow-hidden p-4 lg:p-8">
                    {/* Board Container */}
                    <div
                        style={{ width: boardWidth, height: boardWidth }}
                        className="relative shadow-2xl"
                    >
                        {/* Border Frame */}
                        <div className="absolute -inset-4 border border-border-glass rounded pointer-events-none" />
                        <div className="absolute -inset-[1px] border border-gold-royal/10 rounded pointer-events-none z-20" />

                        <div className="w-full h-full rounded overflow-hidden bg-[#262421] shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)]">
                            <Chessboard
                                id="AnalysisBoard"
                                position={game.fen()}
                                arePiecesDraggable={false}
                                boardWidth={boardWidth}
                                customBoardStyle={{ borderRadius: '2px' }}
                                customDarkSquareStyle={{ backgroundColor: '#769656' }}
                                customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Sidebar - Consistent Background */}
                <div className="w-[350px] lg:w-[400px] shrink-0 flex flex-col border-l border-border-glass bg-bg-card z-20 relative shadow-xl backdrop-blur-xl">

                    {/* 1. Analysis Overview */}
                    <div className="p-5 border-b border-border-glass shrink-0 bg-transparent">
                        {loading ? (
                            <div className="flex items-center gap-3 text-gold-royal/50 animate-pulse">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-serif uppercase tracking-widest">Deciphering...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'White Accuracy', score: analysis?.whiteAccuracyPoint, color: analysis?.whiteAccuracyPoint >= 90 ? 'text-emerald-400' : 'text-gold-light' },
                                    { label: 'Black Accuracy', score: analysis?.blackAccuracyPoint, color: analysis?.blackAccuracyPoint >= 90 ? 'text-emerald-400' : 'text-gold-light' }
                                ].map((stat, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className="absolute inset-0 bg-surface-glass rounded border border-border-glass opacity-100" />
                                        <div className="relative p-3 text-center">
                                            <div className="text-[9px] text-text-muted font-serif uppercase tracking-widest mb-1">{stat.label}</div>
                                            <div className={`font-display text-2xl ${stat.color} drop-shadow-sm`}>
                                                {stat.score ? Math.round(stat.score) : '-'}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Move Analysis (Scrollable) */}
                    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-transparent">
                        {currentMove ? (
                            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                                {/* Move Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-baseline gap-3 relative">
                                            <span className="font-display text-4xl text-white">
                                                {Math.floor(currentMove.moveNumber / 2) + 1}
                                                <span className="text-gold-royal/50 text-2xl ml-0.5">
                                                    {currentMoveIndex % 2 === 0 ? '.' : '...'}
                                                </span>
                                            </span>
                                            <span className="font-serif text-lg text-gold-light italic tracking-wide">
                                                {currentMoveIndex % 2 === 0 ? 'White' : 'Black'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-sm border text-[9px] font-bold uppercase tracking-[0.15em] shadow-sm ${getClassificationStyles(
                                        currentMove.evaluation === 0 && currentMove.classification === 'Best' ? 'Normal' : currentMove.classification
                                    )}`}>
                                        {currentMove.classification === 'Analyzing...'
                                            ? 'Evaluating'
                                            : ((currentMove.evaluation === 0 && currentMove.classification === 'Best') ? 'Normal' : (currentMove.classification || 'Normal'))}
                                    </div>
                                </div>

                                {/* Engine Panel */}
                                <div className="rounded-xl bg-linear-to-b from-surface-glass to-bg-card border border-border-glass p-5 relative overflow-hidden group shadow-lg backdrop-blur-md">
                                    <div className="absolute top-0 left-0 w-[3px] h-full bg-linear-to-b from-gold-royal via-gold-royal/50 to-transparent" />
                                    <div className="absolute inset-0 bg-gold-royal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="flex justify-between items-center mb-4 relative z-10">
                                        <div className="flex items-center gap-2 text-gold-light/80">
                                            <Swords className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-serif uppercase tracking-widest text-shadow-sm">Engine Eval</span>
                                        </div>
                                        <span className={`font-mono text-xl font-bold ${getClassificationColor(currentMove.classification)} drop-shadow-md`}>
                                            {currentMove.mate
                                                ? `M${Math.abs(currentMove.mate)}`
                                                : (currentMove.evaluation !== null && currentMove.evaluation !== undefined ? currentMove.evaluation.toFixed(2) : '-.--')}
                                        </span>
                                    </div>

                                    {(currentMove.bestmove || currentMove.continuation) && (
                                        <div className="space-y-3 relative z-10">
                                            <div className="flex justify-between text-[10px] items-center">
                                                <span className="text-text-secondary font-serif tracking-in-widest uppercase">Best Line</span>
                                                <span className="text-emerald-400 font-mono text-shadow-sm">+{currentMove.bestMoveExpectedPoints?.toFixed(1) || '0.0'}</span>
                                            </div>
                                            <div className="font-mono text-sm text-gold-light/90 bg-black/40 px-3 py-2.5 rounded-lg border border-border-glass border-l-emerald-500/50 border-l-2 break-all whitespace-pre-wrap shadow-inner">
                                                {currentMove.bestmove || (currentMove.continuation ? currentMove.continuation.split(' ')[0] : '---')}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Impact Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg border border-border-glass bg-surface-glass backdrop-blur-sm">
                                        <div className="text-[9px] text-text-muted font-serif uppercase tracking-widest mb-1.5">Impact</div>
                                        <div className="text-lg font-display text-text-primary text-shadow-sm">{currentMove.moveExpectedPoints?.toFixed(2) || '-'}</div>
                                    </div>
                                    <div className="p-3 rounded-lg border border-border-glass bg-surface-glass backdrop-blur-sm">
                                        <div className="text-[9px] text-text-muted font-serif uppercase tracking-widest mb-1.5">Loss</div>
                                        <div className={`text-lg font-display text-shadow-sm ${currentMove.expectedPointsLost && currentMove.expectedPointsLost > 50 ? 'text-rose-400' : 'text-text-primary'}`}>
                                            -{currentMove.expectedPointsLost?.toFixed(1) || '0.0'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-disabled">
                                <Clock className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-serif uppercase tracking-widest text-[10px]">Select a move to analyze</p>
                            </div>
                        )}
                    </div>

                    {/* 3. Controls & History Footer - Consistent Background */}
                    <div className="shrink-0 bg-transparent border-t border-border-glass">
                        {/* Playback - Subtle separator */}
                        <div className="flex items-center justify-center gap-6 py-3 border-b border-border-glass bg-bg-card/30 backdrop-blur-sm">
                            <button onClick={() => handleMove(0)} className="text-text-secondary hover:text-white transition-colors" title="Start">
                                <span className="sr-only">Start</span>
                                <div className="flex gap-[2px]">
                                    <div className="w-px h-3 bg-current self-center" />
                                    <ChevronLeft className="w-4 h-4" />
                                </div>
                            </button>
                            <button onClick={() => handleMove(currentMoveIndex - 1)} disabled={currentMoveIndex < 0} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-glass text-text-muted hover:text-white transition-colors disabled:opacity-30">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => setIsPlaying(!isPlaying)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-gold-royal text-black shadow-lg shadow-gold-royal/20' : 'bg-surface-glass text-white hover:bg-white/20 ring-1 ring-white/10'}`}>
                                {isPlaying ? <PauseCircle className="w-5 h-5 fill-current" /> : <PlayCircle className="w-5 h-5 fill-current ml-0.5" />}
                            </button>
                            <button onClick={() => handleMove(currentMoveIndex + 1)} disabled={currentMoveIndex >= moves.length - 1} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-glass text-text-muted hover:text-white transition-colors disabled:opacity-30">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleMove(moves.length - 1)} className="text-text-secondary hover:text-white transition-colors" title="End">
                                <div className="flex gap-[2px]">
                                    <ChevronRight className="w-4 h-4" />
                                    <div className="w-px h-3 bg-current self-center" />
                                </div>
                            </button>
                        </div>

                        {/* Move List */}
                        <div className="h-[180px] bg-transparent">
                            <ScrollArea className="h-full">
                                <div className="grid grid-cols-2">
                                    {moves.map((move, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleMove(idx)}
                                            className={`
                                                relative px-4 py-3 text-left flex items-center justify-between border-b border-r border-border-glass
                                                transition-all duration-200 group
                                                ${currentMoveIndex === idx
                                                    ? 'bg-gold-royal/10 text-gold-light shadow-[inset_0_0_20px_rgba(212,175,55,0.05)]'
                                                    : 'hover:bg-surface-glass text-text-muted hover:text-text-primary hover:shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]'
                                                }
                                            `}
                                        >
                                            {currentMoveIndex === idx && (
                                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-royal shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                                            )}
                                            <div className="flex items-center gap-3">
                                                <span className="w-5 text-[9px] font-sans opacity-30 text-right group-hover:opacity-50 transition-opacity">{idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.` : ''}</span>
                                                <span className={`text-[11px] font-mono font-medium ${currentMoveIndex === idx ? 'text-gold-light' : ''}`}>{move.move || `${move.from}-${move.to}`}</span>
                                            </div>
                                            {(move.classification === 'Brilliant' || move.classification === 'Great') && (
                                                <Star className="w-2.5 h-2.5 text-gold-royal fill-gold-royal opacity-80 drop-shadow-sm" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
