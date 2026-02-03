
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gamepad2, Clock, User, Swords, Trophy, XCircle, Minus, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/config/apiConfig"
import { useGlobalStorage } from "@/hooks/GlobalStorage"


interface Match {
    gameId: string;
    opponentId: string | null;
    opponent: string;
    avt: string;
    playMode: string;
    totalTime: number;
    result: string;
}

// Result Badge Component
const ResultBadge = ({ result }: { result: string }) => {
    const config = {
        Victory: {
            icon: Trophy,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            glow: 'shadow-[0_0_15px_rgba(74,222,128,0.1)]'
        },
        Defeat: {
            icon: XCircle,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            glow: 'shadow-[0_0_15px_rgba(248,113,113,0.1)]'
        },
        Draw: {
            icon: Minus,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
            glow: 'shadow-[0_0_15px_rgba(250,204,21,0.1)]'
        }
    }[result] || {
        icon: Minus,
        color: 'text-text-muted',
        bg: 'bg-surface-glass',
        border: 'border-border-glass',
        glow: ''
    };

    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg} ${config.border} border ${config.glow}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`font-serif text-sm font-semibold ${config.color}`}>{result}</span>
        </div>
    );
};

// Match Card Component
const MatchCard = ({ match, index, onClick }: { match: Match; index: number; onClick: () => void }) => {
    const router = useRouter();

    const handleProfileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (match.opponentId) {
            router.push(`/player_profile/${match.opponentId}`);
        }
    };

    const resultBorderColor = {
        Victory: 'border-green-500/20 hover:border-green-500/40',
        Defeat: 'border-red-500/20 hover:border-red-500/40',
        Draw: 'border-yellow-500/20 hover:border-yellow-500/40'
    }[match.result] || 'border-border-glass';

    const resultGlow = {
        Victory: 'hover:shadow-[0_0_30px_rgba(74,222,128,0.05)]',
        Defeat: 'hover:shadow-[0_0_30px_rgba(248,113,113,0.05)]',
        Draw: 'hover:shadow-[0_0_30px_rgba(250,204,21,0.05)]'
    }[match.result] || '';

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className={`
                glass-card rounded-xl p-4 border ${resultBorderColor} ${resultGlow}
                transition-all duration-300 group relative overflow-hidden cursor-pointer
            `}
            onClick={onClick}
        >
            {/* Background glow effect based on result */}
            <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                ${match.result === 'Victory' ? 'bg-linear-to-r from-green-500/5 to-transparent' : ''}
                ${match.result === 'Defeat' ? 'bg-linear-to-r from-red-500/5 to-transparent' : ''}
                ${match.result === 'Draw' ? 'bg-linear-to-r from-yellow-500/5 to-transparent' : ''}
            `} />

            <div className="relative flex flex-col md:flex-row items-center gap-4">
                {/* Opponent Avatar */}
                <div
                    className="relative shrink-0 cursor-pointer group/avatar"
                    onClick={handleProfileClick}
                >
                    <div
                        style={{ backgroundImage: `url(${match.avt})` }}
                        className="w-14 h-14 rounded-full bg-center bg-cover bg-no-repeat border-2 border-gold-royal/30 group-hover/avatar:border-gold-royal transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-bg-dark rounded-full flex items-center justify-center border border-gold-royal/30">
                        <User className="w-3 h-3 text-gold-royal" />
                    </div>
                </div>

                {/* Match Info */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 text-center md:text-left">
                    {/* Opponent */}
                    <div
                        className="cursor-pointer group/name"
                        onClick={handleProfileClick}
                    >
                        <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">Opponent</p>
                        <p className="text-text-primary font-serif font-medium truncate max-w-[150px] group-hover/name:text-gold-light transition-colors">{match.opponent}</p>
                    </div>

                    {/* Game Mode */}
                    <div>
                        <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">Game Mode</p>
                        <div className="flex items-center justify-center md:justify-start gap-1.5">
                            <Swords className="w-3.5 h-3.5 text-gold-muted" />
                            <p className="text-text-primary font-serif">{match.playMode}</p>
                        </div>
                    </div>

                    {/* Time */}
                    <div>
                        <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">Duration</p>
                        <div className="flex items-center justify-center md:justify-start gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gold-muted" />
                            <p className="text-text-primary font-serif">{formatTime(match.totalTime)}</p>
                        </div>
                    </div>
                </div>

                {/* Result Badge */}
                <div className="flex items-center gap-3">
                    <ResultBadge result={match.result} />
                    <ChevronRight className="w-5 h-5 text-text-muted opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </div>
            </div>
        </motion.div>
    );
};

export default function ProfileMatches({ playerId }: { playerId?: string }) {
    const router = useRouter();
    const { userId, accessToken } = useGlobalStorage()
    // Use the passed playerId or fall back to the logged-in userId
    const targetUserId = playerId || userId;

    const [matches, setMatches] = useState<Match[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)



    const handleMatchClick = (match: Match) => {
        router.push(`/match/${match.gameId}?opponentName=${encodeURIComponent(match.opponent)}&result=${encodeURIComponent(match.result)}&opponentId=${match.opponentId || ''}`);
    };

    useEffect(() => {
        const fetchMatchHistory = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/game/history/${targetUserId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    }
                })

                // Fetch all users to get avatars
                const usersResponse = await axiosInstance.get(`/users?limit=1000&offset=0`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    }
                });

                const avatarsMap: { [key: string]: string } = {};
                usersResponse.data.users.forEach((user: any) => {
                    avatarsMap[user.username.toLowerCase()] = user.avatarUrl || '';
                });

                const formattedMatches = response.data.map((match: any) => {
                    const opponentLower = (match.opponentName || 'Unknown').toLowerCase();
                    return {
                        opponent: match.opponentName || 'Unknown',
                        avt: avatarsMap[opponentLower] || '',
                        playMode: match.gameMode,
                        totalTime: match.totalTime,
                        result: match.result,
                        gameId: match.gameId,
                        opponentId: match.opponentId || null
                    };
                });

                setMatches(formattedMatches);
                setError(null);
            } catch (err) {
                console.error('Error fetching match history:', err)
                setError('Failed to load match history')
                setMatches([])
            } finally {
                setLoading(false);
            }
        }

        if (targetUserId && accessToken) {
            fetchMatchHistory();
        }
    }, [targetUserId, accessToken])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gold-royal/20 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-gold-royal" />
                </div>
                <div>
                    <h2 className="font-display text-2xl text-gold-light">Match History</h2>
                    <p className="text-text-muted text-sm">{matches.length} games played</p>
                </div>
            </div>

            {/* Matches List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gold-royal/30 scrollbar-track-transparent">
                {loading ? (
                    <div className="glass-card rounded-xl p-8 border border-border-glass flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-gold-royal/30 border-t-gold-royal rounded-full animate-spin" />
                            <p className="text-text-muted font-serif">Loading matches...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="glass-card rounded-xl p-8 border border-red-500/20 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <XCircle className="w-10 h-10 text-red-400" />
                            <p className="text-red-400 font-serif">{error}</p>
                        </div>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="glass-card rounded-xl p-12 border border-border-glass flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <Gamepad2 className="w-12 h-12 text-text-secondary" />
                            <p className="text-text-muted font-serif italic">No match history found</p>
                            <p className="text-text-secondary text-sm">Start playing to see your matches here!</p>
                        </div>
                    </div>
                ) : (
                    matches.map((match, index) => (
                        <MatchCard
                            key={index}
                            match={match}
                            index={index}
                            onClick={() => handleMatchClick(match)}
                        />
                    ))
                )}
            </div>


        </motion.div>
    )
}