"use client"

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSocketContext } from "@/context/WebSocketContext";
import { useGlobalStorage } from '@/hooks/GlobalStorage';
import BackgroundEffects from "@/components/decor/BackgroundEffects";
import SelectionCard from "@/components/home/SelectionCard";
import { useEffect, useState } from "react";
import axiosInstance from "@/config/apiConfig";
import { Trophy, XCircle, Minus, ChevronRight } from "lucide-react";

// Chess wisdom quotes for daily tip section
const chessQuotes = [
    { quote: "In chess, as in life, forethought wins.", author: "Charles Buxton" },
    { quote: "The beauty of a move lies not in its appearance but in the thought behind it.", author: "Aron Nimzowitsch" },
    { quote: "Strategy requires thought; tactics require observation.", author: "Max Euwe" },
    { quote: "Every chess master was once a beginner.", author: "Irving Chernev" },
];

// Get random quote based on date (changes daily)
const getDailyQuote = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return chessQuotes[dayOfYear % chessQuotes.length];
};

interface UserStats {
    gamesPlayed: number;
    winRate: number;
    elo: number;
}

interface RecentMatch {
    id: string;
    opponent: string;
    result: string;
    date: string;
    avatarUrl?: string; // Optional avatar
    opponentId?: string;
}

interface ApiMatch {
    gameId: string;
    opponentName?: string;
    result: string;
    createdAt: string;
    opponentId?: string;
}

// Daily Challenge card component
const DailyChallengeCard = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card rounded-2xl p-6 border border-gold-500/20 bg-linear-to-br from-gold-500/10 to-transparent relative overflow-hidden"
    >
        {/* Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-gold-500/20 rounded-full text-gold-400 text-xs font-sans uppercase tracking-wider">
            Daily
        </div>

        <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/20 flex items-center justify-center shrink-0">
                <span className="text-3xl">🎯</span>
            </div>
            <div>
                <h3 className="font-display text-xl text-gold-100 mb-1">Daily Challenge</h3>
                <p className="text-gray-400 text-sm mb-3">Complete today&apos;s puzzle to earn bonus XP</p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/30 rounded-lg text-gold-400 text-sm font-sans transition-colors"
                >
                    Start Challenge →
                </motion.button>
            </div>
        </div>
    </motion.div>
);

// Stats overview component
const StatsOverview = ({ stats }: { stats: UserStats }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-3 gap-4"
    >
        {[
            { icon: '🎮', value: stats.gamesPlayed.toString(), label: 'Games Played' },
            { icon: '🏆', value: `${stats.winRate}%`, label: 'Win Rate' },
            { icon: '📈', value: stats.elo.toString(), label: 'ELO Rating' },
        ].map((stat) => (
            <div
                key={stat.label}
                className="glass-card rounded-xl p-4 text-center border border-white/5 hover:border-gold-500/20 transition-colors group"
            >
                <span className="text-2xl mb-2 block">{stat.icon}</span>
                <div className="font-display text-xl md:text-2xl text-gold-400 group-hover:text-gold-300 transition-colors">
                    {stat.value}
                </div>
                <div className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wider mt-1">
                    {stat.label}
                </div>
            </div>
        ))}
    </motion.div>
);

// Quick links section
const QuickLinks = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-wrap gap-3"
    >
        {[
            { icon: '📚', label: 'Learn', href: '/learn' },
            { icon: '📊', label: 'Leaderboard', href: '/leaderboard' },
            { icon: '⚙️', label: 'Settings', href: '/profile' }, // Redirect to profile tabs
        ].map((link) => (
            <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg border border-white/5 hover:border-gold-500/20 transition-colors flex-1 justify-center min-w-[100px]"
            >
                <span className="text-lg">{link.icon}</span>
                <span className="text-gray-300 text-sm">{link.label}</span>
            </motion.a>
        ))}
    </motion.div>
);

export default function HomePage() {
    const router = useRouter();
    const { socket } = useSocketContext();
    const { userId, accessToken, userName } = useGlobalStorage();
    const dailyQuote = getDailyQuote();

    const [stats, setStats] = useState<UserStats>({ gamesPlayed: 0, winRate: 0, elo: 800 });
    const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        if (!socket) return;

        const handleOnlineUsers = (users: string[]) => {
            // Deduplicate users just in case, though backend seems to send active userIds
            const uniqueUsers = new Set(users);
            setOnlineCount(uniqueUsers.size);
        };

        // Listen for updates
        socket.on('onlineUsers', handleOnlineUsers);

        // Request initial state
        socket.emit('getOnlineUsers');

        return () => {
            socket.off('onlineUsers', handleOnlineUsers);
        };
    }, [socket]);

    useEffect(() => {
        const fetchHomeData = async () => {
            if (!userId || !accessToken) return;

            try {
                // Fetch Profile for ELO
                const profileRes = await axiosInstance.get('/users/profile', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                // Fetch History for Stats & Recent Games
                const historyRes = await axiosInstance.get(`/game/history/${userId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                const matches = historyRes.data || [];
                const totalGames = matches.length;
                const victories = matches.filter((m: ApiMatch) => m.result === 'Victory').length;
                const winRate = totalGames > 0 ? Math.round((victories / totalGames) * 100) : 0;

                setStats({
                    elo: profileRes.data.elo || 800,
                    gamesPlayed: totalGames,
                    winRate: winRate
                });

                // Helper to fetch opponent avatar if needed. For now, we'll try to get it if available in history or skip.
                // Assuming history endpoint might be enriched later, but current 'ProfileMatches' had to fetch all users.
                // To keep Home page fast, we might skip avatar fetching or do a quick lookup if the API supports it.
                // For now, let's just map the recent 3 matches.
                const recent = matches.slice(0, 3).map((m: ApiMatch) => ({
                    id: m.gameId,
                    opponent: m.opponentName || 'Unknown',
                    result: m.result,
                    date: new Date(m.createdAt).toLocaleDateString(), // Assuming createdAt exists
                    opponentId: m.opponentId
                }));
                setRecentMatches(recent);

            } catch (error) {
                console.error("Failed to fetch home data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [userId, accessToken]);

    return (
        <main className="relative min-h-[calc(100vh-var(--navbar-height))] flex flex-col p-6 md:p-12 overflow-hidden">
            <BackgroundEffects />

            <div className="relative z-10 w-full max-w-7xl mx-auto">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">⚔️</span>
                        <h1 className="font-display text-3xl md:text-4xl text-gold-100">
                            Welcome Back, <span className="text-gold-400">{userName || 'Commander'}</span>
                        </h1>
                    </div>
                    <p className="text-gray-400 font-serif italic ml-12">
                        &quot;{dailyQuote.quote}&quot; — <span className="text-gold-500/70">{dailyQuote.author}</span>
                    </p>
                </motion.div>

                {/* Main content grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left column: Game mode cards */}
                    <div className="lg:col-span-2">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="font-display text-xl text-gold-200/70 mb-6 flex items-center gap-2"
                        >
                            <span className="text-2xl">🎯</span>
                            Choose Your Battle
                        </motion.h2>

                        <div className="flex flex-col md:flex-row gap-6">
                            <SelectionCard
                                title="Play Online"
                                description="Match and play with someone at your level"
                                image="/home/chessboard.svg"
                                onClick={() => router.push("/challenge")}
                                delay={0.2}
                                variant="online"
                                features={['Matchmaking', 'Ranked', 'Global']}
                                playerCount={onlineCount}
                            />

                            <SelectionCard
                                title="Conquest"
                                description="Embark on a historical conquest across eras"
                                image="/home/chessboard.svg"
                                onClick={() => router.push("/dynastyjourney")}
                                delay={0.4}
                                variant="dynasty"
                                features={['Campaign', 'Boss Battles', 'Rewards']}
                            />
                        </div>

                        {/* Recent Activity List */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="mt-10 glass-card rounded-2xl p-6 border border-white/5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-display text-lg text-gold-200/70 flex items-center gap-2">
                                    <span className="text-xl">📜</span>
                                    Recent Activity
                                </h3>
                                <button
                                    onClick={() => router.push('/profile')}
                                    className="text-xs text-gold-400 hover:text-gold-300 transition-colors uppercase tracking-wider"
                                >
                                    View All
                                </button>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : recentMatches.length > 0 ? (
                                <div className="space-y-3">
                                    {recentMatches.map((match, idx) => (
                                        <motion.div
                                            key={match.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.9 + (idx * 0.1) }}
                                            onClick={() => router.push(`/match/${match.id}?opponentName=${encodeURIComponent(match.opponent)}&result=${encodeURIComponent(match.result)}&opponentId=${match.opponentId || ''}`)}
                                            className="group flex items-center justify-between p-3 rounded-lg bg-surface-glass border border-white/5 hover:border-gold-royal/30 hover:bg-white/5 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${match.result === 'Victory' ? 'bg-green-500/10 border-green-500/20' :
                                                    match.result === 'Defeat' ? 'bg-red-500/10 border-red-500/20' :
                                                        'bg-yellow-500/10 border-yellow-500/20'
                                                    }`}>
                                                    {match.result === 'Victory' ? <Trophy className="w-4 h-4 text-green-400" /> :
                                                        match.result === 'Defeat' ? <XCircle className="w-4 h-4 text-red-400" /> :
                                                            <Minus className="w-4 h-4 text-yellow-400" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-200 group-hover:text-gold-100 transition-colors">
                                                        vs {match.opponent}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{match.result}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {/* <span className="text-xs text-gray-600 font-mono hidden sm:block">{match.date}</span> */}
                                                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gold-400 transition-colors" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-8 text-gray-500">
                                    <p className="font-serif italic">No recent battles found</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right column: Sidebar content */}
                    <div className="space-y-6">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="font-display text-xl text-gold-200/70 flex items-center gap-2"
                        >
                            <span className="text-2xl">📊</span>
                            Your Progress
                        </motion.h2>

                        {/* Stats Overview */}
                        <StatsOverview stats={stats} />

                        {/* Daily Challenge */}
                        <DailyChallengeCard />

                        {/* Quick Links */}
                        <div>
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.75 }}
                                className="text-gray-500 text-sm uppercase tracking-wider mb-3"
                            >
                                Quick Actions
                            </motion.h3>
                            <QuickLinks />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}