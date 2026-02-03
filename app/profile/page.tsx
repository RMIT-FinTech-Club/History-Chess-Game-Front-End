"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Gamepad2, Settings, Crown, Wallet, Target, ChevronUp, ChevronDown, Star, Receipt, Package, Edit, Award, Book } from "lucide-react"
import CountUp from "react-countup"
import { useRouter } from "next/navigation"
import axiosInstance from "@/config/apiConfig"
import { toast } from "sonner"

import BackgroundEffects from "@/components/decor/BackgroundEffects"
import ProfileMatches from "@/components/profile/profileMatches"
import AccountSettings from "@/components/profile/accountSettings"
import TransactionHistory from "@/components/profile/TransactionHistory"
import ItemInventory from "@/components/profile/ItemInventory"
import AvatarSelector from "@/components/profile/AvatarSelector"
import HistoricalAchievements from "@/components/profile/HistoricalAchievements"
import CollectorJournal from "@/components/profile/CollectorJournal"
import { useGlobalStorage } from "@/hooks/GlobalStorage"

// Types for API responses
interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    elo: number;
    walletAddress: string | null;
    language: string;
    createdAt: string;
}

interface WalletBalance {
    totalGameCoins: string;
    confirmedGameCoins: string;
    pendingGameCoins: string;
}

interface ProfileStats {
    level: number;
    totalGames: number;
    wonMatches: number;
    lostMatches: number;
    draws: number;
    globalRank: number;
    winRate: number;
    walletBalance: string;
    elo: number;
}

// Calculate level from ELO
const calculateLevel = (elo: number): number => {
    if (elo < 800) return 1;
    if (elo < 1000) return 2;
    if (elo < 1200) return 3;
    if (elo < 1400) return 4;
    if (elo < 1600) return 5;
    if (elo < 1800) return 6;
    if (elo < 2000) return 7;
    if (elo < 2200) return 8;
    if (elo < 2400) return 9;
    return 10;
};

// Format wallet balance
const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
};

// Stats Card Component
const StatCard = ({ icon: Icon, label, value, prefix = "", suffix = "", delay = 0 }: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    prefix?: string;
    suffix?: string;
    delay?: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="glass-card rounded-xl p-4 text-center border border-border-glass hover:border-gold-royal/30 transition-all duration-300 group card-hover"
    >
        <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gold-royal/20 flex items-center justify-center group-hover:bg-gold-royal/30 transition-colors">
            <Icon className="w-5 h-5 text-gold-royal" />
        </div>
        <p className="text-text-muted text-xs uppercase tracking-wider mb-1">{label}</p>
        <p className="font-display text-xl text-gold-light">
            {prefix}
            {typeof value === 'number' ? (
                <CountUp start={0} end={value} useEasing={true} duration={2} />
            ) : (
                value
            )}
            {suffix}
        </p>
    </motion.div>
);

// Navigation Tab Component
const NavTab = ({ icon: Icon, label, isActive, onClick, delay = 0 }: {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
    delay?: number;
}) => (
    <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.4 }}
        onClick={onClick}
        className={`
            flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300
            ${isActive
                ? 'bg-gold-royal/20 border border-gold-royal/40 text-gold-light gold-shadow'
                : 'hover:bg-surface-glass border border-transparent text-text-secondary hover:text-gold-light'
            }
        `}
    >
        <div className={`
            w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300
            ${isActive ? 'bg-gold-royal/30' : 'bg-surface-glass group-hover:bg-white/10'}
        `}>
            <Icon className={`w-5 h-5 ${isActive ? 'text-gold-shimmer' : 'text-text-secondary'}`} />
        </div>
        <span className={`font-serif text-sm ${isActive ? 'text-gold-light' : ''}`}>{label}</span>
        {isActive && (
            <motion.div
                layoutId="activeIndicator"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-shimmer"
            />
        )}
    </motion.button>
);

// Profile Statistics Section (for Statistic tab)
const ProfileStatistics = ({ stats, loading }: { stats: ProfileStats; loading: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
    >
        <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-gold-royal" />
            <h2 className="font-display text-2xl text-gold-light">Statistics</h2>
        </div>

        {loading ? (
            <div className="glass-card rounded-xl p-8 border border-border-glass flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gold-royal/30 border-t-gold-royal rounded-full animate-spin" />
                    <p className="text-text-muted font-serif">Loading statistics...</p>
                </div>
            </div>
        ) : (
            <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Crown} label="Global Rank" value={stats.globalRank} prefix="#" delay={0.1} />
                    <StatCard icon={Trophy} label="Victories" value={stats.wonMatches} delay={0.2} />
                    <StatCard icon={Target} label="Win Rate" value={stats.winRate} suffix="%" delay={0.3} />
                    <StatCard icon={Gamepad2} label="Total Games" value={stats.totalGames} delay={0.4} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ELO & Level Card */}
                    <div className="glass-card rounded-2xl p-6 border border-border-glass">
                        <h3 className="font-serif text-lg text-gold-200/70 mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-gold-royal" />
                            Rating & Level
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-gold-royal/10 rounded-xl">
                                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">ELO Rating</p>
                                <p className="font-display text-3xl text-gold-shimmer">
                                    <CountUp start={0} end={stats.elo} duration={2} />
                                </p>
                            </div>
                            <div className="text-center p-4 bg-gold-royal/10 rounded-xl">
                                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Level</p>
                                <p className="font-display text-3xl text-gold-shimmer">
                                    <CountUp start={0} end={stats.level} duration={2} />
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Game Results Card */}
                    <div className="glass-card rounded-2xl p-6 border border-border-glass">
                        <h3 className="font-serif text-lg text-gold-200/70 mb-4 flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5 text-gold-royal" />
                            Game Results
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                                <p className="text-green-400 text-xs uppercase tracking-wider mb-1">Wins</p>
                                <p className="font-display text-2xl text-green-400">
                                    <CountUp start={0} end={stats.wonMatches} duration={2} />
                                </p>
                            </div>
                            <div className="text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                <p className="text-red-400 text-xs uppercase tracking-wider mb-1">Losses</p>
                                <p className="font-display text-2xl text-red-400">
                                    <CountUp start={0} end={stats.lostMatches} duration={2} />
                                </p>
                            </div>
                            <div className="text-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                <p className="text-yellow-400 text-xs uppercase tracking-wider mb-1">Draws</p>
                                <p className="font-display text-2xl text-yellow-400">
                                    <CountUp start={0} end={stats.draws} duration={2} />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}
    </motion.div>
);

export default function ProfilePage() {
    const { userId, userName, avatar, accessToken, setAuthData, setWalletBalance } = useGlobalStorage()
    const router = useRouter()
    const [isProfileExpanded, setIsProfileExpanded] = useState<boolean>(true)
    const [activeTab, setActiveTab] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false)
    const [stats, setStats] = useState<ProfileStats>({
        level: 1,
        totalGames: 0,
        wonMatches: 0,
        lostMatches: 0,
        draws: 0,
        globalRank: 0,
        winRate: 0,
        walletBalance: '0',
        elo: 1200
    })

    // Fetch all profile data
    const fetchProfileData = useCallback(async () => {
        if (!userId || !accessToken) return;

        setLoading(true);
        try {
            // Fetch user profile (includes ELO)
            const profileResponse = await axiosInstance.get('/users/profile', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const profile: UserProfile = profileResponse.data;

            // Update global state with fresh profile data
            setAuthData({
                userId: profile.id,
                userName: profile.username,
                email: profile.email,
                accessToken,
                avatar: profile.avatarUrl,
                role: profile.role,
                refreshToken: null
            });

            // Fetch match history
            const historyResponse = await axiosInstance.get(`/game/history/${userId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const matches = historyResponse.data || [];

            // Calculate match statistics
            const victories = matches.filter((m: any) => m.result === 'Victory').length;
            const defeats = matches.filter((m: any) => m.result === 'Defeat').length;
            const draws = matches.filter((m: any) => m.result === 'Draw').length;
            const totalGames = matches.length;
            const winRate = totalGames > 0 ? Math.round((victories / totalGames) * 100) : 0;

            // Fetch all users for global ranking
            const usersResponse = await axiosInstance.get('/users?limit=1000&offset=0', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const users = usersResponse.data.users.sort((a: any, b: any) => b.elo - a.elo);
            const rank = users.findIndex((u: any) => u.id === userId) + 1;

            // Fetch wallet balance
            let walletBalance = '0';
            try {
                const walletResponse = await axiosInstance.get('/wallet/balance', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (walletResponse.data.success) {
                    walletBalance = walletResponse.data.data.totalGameCoins || '0';
                    setWalletBalance(walletBalance);
                }
            } catch (walletErr) {
                console.warn('Wallet data not available:', walletErr);
            }

            // Calculate level from ELO
            const level = calculateLevel(profile.elo);

            setStats({
                level,
                totalGames,
                wonMatches: victories,
                lostMatches: defeats,
                draws,
                globalRank: rank > 0 ? rank : 999,
                winRate,
                walletBalance,
                elo: profile.elo
            });

        } catch (err) {
            console.error('Error fetching profile data:', err);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    }, [userId, accessToken, setAuthData]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const tabs = [
        { icon: Trophy, label: 'Statistics' },
        { icon: Gamepad2, label: 'Matches' },
        { icon: Package, label: 'My Assets' },
        { icon: Award, label: 'Achievements' },
        { icon: Book, label: 'Journal' },
        { icon: Receipt, label: 'Transactions' },
        { icon: Settings, label: 'Account Settings' },
    ];


    return (
        <main className="relative min-h-[calc(100vh-var(--navbar-height))] flex flex-col p-4 md:p-8 overflow-hidden">
            <BackgroundEffects />

            <div className="relative z-10 w-full max-w-7xl mx-auto">
                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="glass-gold rounded-2xl p-6 mb-6 border border-gold-royal/20 relative overflow-hidden"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold-royal/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-royal/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="relative group cursor-pointer"
                            onClick={() => setIsAvatarSelectorOpen(true)}
                        >
                            <div
                                style={{ backgroundImage: `url(${avatar})` }}
                                className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-center bg-cover bg-no-repeat border-2 border-gold-royal/50 gold-shadow group-hover:border-gold-royal transition-colors"
                            />

                            {/* Hover Edit Overlay */}
                            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Edit className="w-6 h-6 text-white" />
                            </div>

                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold-royal rounded-full flex items-center justify-center border-2 border-bg-dark">
                                <Crown className="w-4 h-4 text-bg-dark" />
                            </div>
                        </motion.div>

                        {/* User Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="flex-1 text-center md:text-left"
                        >
                            <h1 className="font-display text-2xl md:text-3xl gold-gradient-text mb-1">
                                {userName}
                            </h1>
                            <p className="text-text-secondary font-serif text-sm mb-2">
                                Global Ranking: <span className="text-gold-light">#{stats.globalRank}</span>
                                {' • '}
                                ELO: <span className="text-gold-light">{stats.elo}</span>
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="px-3 py-1 bg-gold-royal/20 rounded-full text-gold-light text-xs font-sans uppercase tracking-wider">
                                    Level {stats.level}
                                </span>
                                <span className="px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-sans uppercase tracking-wider">
                                    {stats.winRate}% Win Rate
                                </span>
                            </div>
                        </motion.div>

                        {/* Quick Stats */}
                        <AnimatePresence>
                            {isProfileExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                                >
                                    {[
                                        { icon: Crown, label: 'Level', value: stats.level },
                                        { icon: Gamepad2, label: 'Games', value: stats.totalGames },
                                        { icon: Wallet, label: 'Coins', value: formatBalance(stats.walletBalance) },
                                        { icon: Trophy, label: 'Wins', value: stats.wonMatches },
                                    ].map((stat, index) => (
                                        <motion.div
                                            key={stat.label}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                            className="glass-card rounded-xl p-3 text-center border border-border-glass hover:border-gold-royal/20 transition-colors min-w-[80px]"
                                        >
                                            <stat.icon className="w-5 h-5 text-gold-royal mx-auto mb-1" />
                                            <p className="text-text-muted text-[10px] uppercase tracking-wider">{stat.label}</p>
                                            <p className="font-display text-lg text-gold-light">
                                                {typeof stat.value === 'number' ? (
                                                    <CountUp start={0} end={stat.value} useEasing={true} duration={2} />
                                                ) : stat.value}
                                            </p>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Toggle Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-auto md:right-4 w-8 h-8 rounded-full bg-bg-dark/80 border border-gold-royal/30 flex items-center justify-center text-gold-royal hover:bg-gold-royal/20 transition-colors"
                    >
                        {isProfileExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </motion.button>
                </motion.div>

                {/* Main Content Area */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Navigation Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="md:w-64 shrink-0"
                    >
                        <div className="glass-card rounded-2xl p-4 border border-border-glass space-y-2">
                            {tabs.map((tab, index) => (
                                <NavTab
                                    key={tab.label}
                                    icon={tab.icon}
                                    label={tab.label}
                                    isActive={activeTab === index}
                                    onClick={() => setActiveTab(index)}
                                    delay={0.5 + index * 0.1}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {activeTab === 0 && (
                                <ProfileStatistics key="statistics" stats={stats} loading={loading} />
                            )}
                            {activeTab === 1 && (
                                <motion.div
                                    key="matches"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ProfileMatches />
                                </motion.div>
                            )}
                            {activeTab === 2 && (
                                <motion.div
                                    key="assets"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ItemInventory />
                                </motion.div>
                            )}
                            {activeTab === 3 && (
                                <motion.div
                                    key="achievements"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <HistoricalAchievements />
                                </motion.div>
                            )}
                            {activeTab === 4 && (
                                <motion.div
                                    key="journal"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CollectorJournal />
                                </motion.div>
                            )}
                            {activeTab === 5 && (
                                <motion.div
                                    key="transactions"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <TransactionHistory />
                                </motion.div>
                            )}
                            {activeTab === 6 && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AccountSettings />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <AvatarSelector
                isOpen={isAvatarSelectorOpen}
                onClose={() => setIsAvatarSelectorOpen(false)}
                currentAvatar={avatar}
                onAvatarUpdate={(newUrl: string) => {
                    // State update logic is handled in selector via setAuthData
                    // But we can trigger a refetch if needed, though setAuthData should suffice
                    console.log("Avatar Updated:", newUrl);
                }}
            />
        </main>
    )
}