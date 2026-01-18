"use client"

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSocketContext } from "@/context/WebSocketContext";
import { useGlobalStorage } from '@/hooks/GlobalStorage';
import BackgroundEffects from "@/components/decor/BackgroundEffects";
import SelectionCard from "@/components/home/SelectionCard";

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

// Daily Challenge card component
const DailyChallengeCard = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card rounded-2xl p-6 border border-gold-500/20 bg-gradient-to-br from-gold-500/10 to-transparent relative overflow-hidden"
    >
        {/* Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-gold-500/20 rounded-full text-gold-400 text-xs font-sans uppercase tracking-wider">
            Daily
        </div>

        <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🎯</span>
            </div>
            <div>
                <h3 className="font-display text-xl text-gold-100 mb-1">Daily Challenge</h3>
                <p className="text-gray-400 text-sm mb-3">Complete today's puzzle to earn bonus XP</p>
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
const StatsOverview = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-3 gap-4"
    >
        {[
            { icon: '🎮', value: '24', label: 'Games Played' },
            { icon: '🏆', value: '67%', label: 'Win Rate' },
            { icon: '📈', value: '1450', label: 'ELO Rating' },
        ].map((stat, index) => (
            <div
                key={stat.label}
                className="glass-card rounded-xl p-4 text-center border border-white/5 hover:border-gold-500/20 transition-colors group"
            >
                <span className="text-2xl mb-2 block">{stat.icon}</span>
                <div className="font-display text-2xl text-gold-400 group-hover:text-gold-300 transition-colors">
                    {stat.value}
                </div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mt-1">
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
            { icon: '📚', label: 'Learn to Play', href: '/learn' },
            { icon: '📊', label: 'Leaderboard', href: '/leaderboard' },
            { icon: '⚙️', label: 'Settings', href: '/settings' },
        ].map((link) => (
            <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg border border-white/5 hover:border-gold-500/20 transition-colors"
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
    const { userId, accessToken } = useGlobalStorage();
    const dailyQuote = getDailyQuote();

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
                            Welcome Back, <span className="text-gold-400">Commander</span>
                        </h1>
                    </div>
                    <p className="text-gray-400 font-serif italic ml-12">
                        "{dailyQuote.quote}" — <span className="text-gold-500/70">{dailyQuote.author}</span>
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
                                playerCount={127}
                            />

                            <SelectionCard
                                title="Play Offline"
                                description="Challenge yourself with our trained bot"
                                image="/home/chessboard.svg"
                                onClick={() => router.push("/game/offline")}
                                delay={0.4}
                                variant="offline"
                                features={['AI Opponents', 'Practice', 'Learn']}
                            />
                        </div>
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
                        <StatsOverview />

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

                {/* Recent Activity Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mt-10 glass-card rounded-2xl p-6 border border-white/5"
                >
                    <h3 className="font-display text-lg text-gold-200/70 mb-4 flex items-center gap-2">
                        <span className="text-xl">📜</span>
                        Recent Activity
                    </h3>
                    <div className="flex items-center justify-center py-8 text-gray-500">
                        <p className="font-serif italic">Your recent games will appear here</p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}