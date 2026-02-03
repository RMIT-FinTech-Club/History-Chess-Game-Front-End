"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Package,
    Sparkles,
    Filter,
    ExternalLink,
    Loader2,
    RefreshCw,
    Crown,
    Sword,
    Shield,
    Gem
} from "lucide-react"
import axiosInstance from "@/config/apiConfig"
import { useGlobalStorage } from "@/hooks/GlobalStorage"
import { toast } from "sonner"
import HistoricalTooltip from "@/components/ui/HistoricalTooltip"
import { HistoricalContext } from "@/config/marketApi"
import { useAchievements } from "@/context/AchievementContext"

// Rarity color configurations
const rarityConfig: Record<string, { color: string; bgColor: string; borderColor: string; glow: string }> = {
    'COMMON': {
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500/30',
        glow: ''
    },
    'UNCOMMON': {
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        glow: 'shadow-green-500/20'
    },
    'RARE': {
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        glow: 'shadow-blue-500/30'
    },
    'EPIC': {
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/30',
        glow: 'shadow-purple-500/40'
    },
    'LEGENDARY': {
        color: 'text-gold-shimmer',
        bgColor: 'bg-gold-royal/20',
        borderColor: 'border-gold-royal/50',
        glow: 'shadow-gold-royal/50'
    },
}

// Category icons
const categoryIcons: Record<string, React.ElementType> = {
    'SKIN': Sparkles,
    'ITEM': Package,
}

interface UserItem {
    id: string;
    tokenId: string;
    name: string;
    description: string;
    imageUrl: string;
    rarity: string;
    dynasty: string;
    category: 'SKIN' | 'ITEM';
    mintedTime: string;
    historicalContext?: HistoricalContext;
}

interface ItemInventoryProps {
    userId?: string;
}

export default function ItemInventory({ userId: propUserId }: ItemInventoryProps) {
    const { accessToken, userId: globalUserId } = useGlobalStorage()
    const userId = propUserId || globalUserId

    const [skins, setSkins] = useState<UserItem[]>([])
    const [items, setItems] = useState<UserItem[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState<'SKIN' | 'ITEM'>('SKIN')
    const [rarityFilter, setRarityFilter] = useState<string>('all')
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const rarityOptions = [
        { value: 'all', label: 'All Rarities' },
        { value: 'COMMON', label: 'Common' },
        { value: 'UNCOMMON', label: 'Uncommon' },
        { value: 'RARE', label: 'Rare' },
        { value: 'EPIC', label: 'Epic' },
        { value: 'LEGENDARY', label: 'Legendary' },
    ]

    const { checkCollection } = useAchievements()

    const fetchItems = useCallback(async (showRefresh = false) => {
        if (!userId) return

        if (showRefresh) {
            setRefreshing(true)
        } else {
            setLoading(true)
        }

        try {
            const response = await axiosInstance.get(`/items/user/${userId}`, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            })

            if (response.data.success) {
                const userSkins = response.data.data.skins || []
                const userItems = response.data.data.items || []
                setSkins(userSkins)
                setItems(userItems)

                // Achievement Check: Collect dynasties
                const allDynasties = [...userSkins, ...userItems].map((i: UserItem) => i.dynasty).filter(Boolean);
                if (allDynasties.length > 0) {
                    checkCollection(allDynasties);
                }
            }
        } catch (error) {
            console.error('Error fetching items:', error)
            toast.error('Failed to load inventory')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [userId, accessToken])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    // Filter items by rarity
    const filteredItems = (activeTab === 'SKIN' ? skins : items).filter(item => {
        if (rarityFilter === 'all') return true
        return item.rarity === rarityFilter
    })

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date)
    }

    const totalCount = skins.length + items.length

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-gold-royal" />
                    <h2 className="font-display text-2xl text-gold-light">My Assets</h2>
                    <span className="px-2 py-0.5 rounded-full bg-gold-royal/20 text-gold-shimmer text-xs font-sans">
                        {totalCount} items
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Refresh Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchItems(true)}
                        disabled={refreshing}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-gold-royal/30 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-gold-light ${refreshing ? 'animate-spin' : ''}`} />
                    </motion.button>

                    {/* Rarity Filter */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-royal/30 transition-colors"
                        >
                            <Filter className="w-4 h-4 text-gold-royal" />
                            <span className="font-serif text-sm text-gray-400">
                                {rarityOptions.find(r => r.value === rarityFilter)?.label}
                            </span>
                        </motion.button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute right-0 top-12 z-50 w-48 py-2 rounded-xl bg-bg-dark/95 backdrop-blur-sm border border-gold-royal/20 shadow-xl"
                                >
                                    {rarityOptions.map((option) => {
                                        const rarity = rarityConfig[option.value] || rarityConfig['COMMON']
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setRarityFilter(option.value)
                                                    setIsFilterOpen(false)
                                                }}
                                                className={`w-full px-4 py-2 text-left text-sm font-serif transition-colors flex items-center gap-2 ${rarityFilter === option.value
                                                    ? 'text-gold-shimmer bg-gold-royal/20'
                                                    : 'text-gray-400 hover:text-gold-light hover:bg-white/5'
                                                    }`}
                                            >
                                                {option.value !== 'all' && (
                                                    <Gem className={`w-3 h-3 ${rarity.color}`} />
                                                )}
                                                {option.label}
                                            </button>
                                        )
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-6">
                {(['SKIN', 'ITEM'] as const).map((tab) => {
                    const Icon = categoryIcons[tab]
                    const count = tab === 'SKIN' ? skins.length : items.length
                    return (
                        <motion.button
                            key={tab}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-serif text-sm transition-all ${activeTab === tab
                                ? 'bg-gold-royal/20 border border-gold-royal/40 text-gold-shimmer'
                                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-gold-light hover:border-gold-royal/20'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab === 'SKIN' ? 'Skins' : 'Items'}</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === tab ? 'bg-gold-royal/30' : 'bg-white/10'
                                }`}>
                                {count}
                            </span>
                        </motion.button>
                    )
                })}
            </div>

            {/* Items Grid */}
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-gold-royal animate-spin mb-4" />
                        <p className="text-gray-500 font-serif">Loading inventory...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Package className="w-12 h-12 text-gray-600 mb-4" />
                        <p className="text-gray-500 font-serif text-lg mb-2">
                            {activeTab === 'SKIN' ? 'No skins found' : 'No items found'}
                        </p>
                        <p className="text-gray-600 font-sans text-sm">
                            {rarityFilter !== 'all' ? 'Try changing the rarity filter' : 'Start collecting to fill your inventory'}
                        </p>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.05 } }
                        }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    >
                        {filteredItems.map((item, index) => {
                            const rarity = rarityConfig[item.rarity] || rarityConfig['COMMON']
                            return (
                                <HistoricalTooltip
                                    key={item.id}
                                    dynasty={item.dynasty}
                                    context={item.historicalContext}
                                    itemRarity={item.rarity}
                                    side={(index + 1) % 5 === 0 ? "left" : "right"}
                                >
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0 }
                                        }}
                                        whileHover={{ scale: 1.03, y: -4 }}
                                        className={`group relative rounded-xl overflow-hidden bg-white/5 border ${rarity.borderColor} transition-all hover:shadow-lg ${rarity.glow}`}
                                    >
                                        {/* Item Image */}
                                        <div className="aspect-square bg-linear-to-b from-white/5 to-transparent p-3">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-contain rounded-lg"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/placeholder-item.png'
                                                }}
                                            />
                                        </div>

                                        {/* Rarity Badge */}
                                        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-sans uppercase tracking-wider ${rarity.bgColor} ${rarity.color} border ${rarity.borderColor}`}>
                                            {item.rarity}
                                        </div>

                                        {/* Item Info */}
                                        <div className="p-3 border-t border-white/5">
                                            <p className="font-serif text-sm text-white truncate mb-1">
                                                {item.name}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500 font-sans">
                                                    {item.dynasty}
                                                </span>
                                                <span className="text-[10px] text-gray-600 font-sans">
                                                    {formatDate(item.mintedTime)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </HistoricalTooltip>
                            )
                        })}
                    </motion.div>
                )}
            </div>

            {/* Summary Footer */}
            {!loading && totalCount > 0 && (
                <div className="mt-4 flex items-center justify-between px-2">
                    <p className="text-sm text-gray-500 font-sans">
                        Showing {filteredItems.length} of {activeTab === 'SKIN' ? skins.length : items.length} {activeTab.toLowerCase()}s
                    </p>
                    <p className="text-xs text-gray-600 font-sans">
                        All assets are verified on blockchain
                    </p>
                </div>
            )}
        </motion.div>
    )
}
