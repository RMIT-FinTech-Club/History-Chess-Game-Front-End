"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Receipt,
    Filter,
    ExternalLink,
    Coins,
    ShoppingCart,
    Gavel,
    Trophy,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    RefreshCw
} from "lucide-react"
import axiosInstance from "@/config/apiConfig"
import { useGlobalStorage } from "@/hooks/GlobalStorage"
import { toast } from "sonner"

// Transaction types with their icons and colors
const transactionTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
    'GAME_REWARD': { icon: Trophy, color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Game Reward' },
    'ITEM_PURCHASE': { icon: ShoppingCart, color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Item Purchase' },
    'SKIN_MINTING': { icon: Sparkles, color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Skin Minting' },
    'AUCTION_BID': { icon: Gavel, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Auction Bid' },
    'AUCTION_WIN': { icon: Gavel, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', label: 'Auction Win' },
    'AUCTION_SALE': { icon: Coins, color: 'text-gold-shimmer', bgColor: 'bg-gold-royal/20', label: 'Auction Sale' },
    'COIN_TRANSFER': { icon: Coins, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', label: 'Coin Transfer' },
}

// Status badge config
const statusConfig: Record<string, { color: string; bgColor: string }> = {
    'pending': { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/30' },
    'confirmed': { color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/30' },
    'failed': { color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30' },
}

interface Transaction {
    id: string;
    type: string;
    amount: number;
    currency: string;
    description: string;
    transactionHash?: string;
    status: string;
    metadata?: {
        itemName?: string;
        itemRarity?: string;
        matchType?: string;
        gameResult?: string;
    };
    createdAt: string;
    explorerUrl?: string;
}

interface TransactionHistoryProps {
    accessToken?: string;
}

export default function TransactionHistory({ accessToken: propAccessToken }: TransactionHistoryProps) {
    const { accessToken: globalAccessToken, userId } = useGlobalStorage()
    const accessToken = propAccessToken || globalAccessToken

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [filter, setFilter] = useState<string>('all')
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    // Pagination state
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false
    })

    const filterOptions = [
        { value: 'all', label: 'All Transactions' },
        { value: 'GAME_REWARD', label: 'Game Rewards' },
        { value: 'ITEM_PURCHASE', label: 'Purchases' },
        { value: 'AUCTION_BID', label: 'Auction Bids' },
        { value: 'AUCTION_WIN', label: 'Auction Wins' },
        { value: 'AUCTION_SALE', label: 'Auction Sales' },
        { value: 'SKIN_MINTING', label: 'Skin Minting' },
    ]

    const fetchTransactions = useCallback(async (reset = false) => {
        if (!accessToken || !userId) return

        if (reset) {
            setLoading(true)
        } else {
            setRefreshing(true)
        }

        try {
            // First, sync any pending transactions that may have been confirmed
            try {
                await axiosInstance.post('/wallet/sync-transactions', {}, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            } catch (syncError) {
                // Sync failure is not critical, continue fetching transactions
                console.warn('Transaction sync failed:', syncError)
            }

            const params = new URLSearchParams()
            params.append('limit', pagination.limit.toString())
            params.append('offset', reset ? '0' : pagination.offset.toString())
            if (filter !== 'all') {
                params.append('type', filter)
            }

            const response = await axiosInstance.get(`/wallet/transactions?${params.toString()}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })

            if (response.data.success) {
                setTransactions(response.data.data.transactions)
                setPagination({
                    total: response.data.data.pagination.total,
                    limit: response.data.data.pagination.limit,
                    offset: response.data.data.pagination.offset,
                    hasMore: response.data.data.pagination.hasMore
                })
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
            toast.error('Failed to load transaction history')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [accessToken, userId, filter, pagination.limit, pagination.offset])

    useEffect(() => {
        fetchTransactions(true)
    }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleNextPage = () => {
        if (pagination.hasMore) {
            setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))
        }
    }

    const handlePrevPage = () => {
        if (pagination.offset > 0) {
            setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))
        }
    }

    useEffect(() => {
        if (pagination.offset > 0) {
            fetchTransactions(false)
        }
    }, [pagination.offset]) // eslint-disable-line react-hooks/exhaustive-deps

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    const formatAmount = (amount: number) => {
        if (amount >= 0) {
            return `+${amount.toLocaleString()}`
        }
        return amount.toLocaleString()
    }

    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1
    const totalPages = Math.ceil(pagination.total / pagination.limit)

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
                    <Receipt className="w-6 h-6 text-gold-royal" />
                    <h2 className="font-display text-2xl text-gold-light">Transaction History</h2>
                </div>

                <div className="flex items-center gap-3">
                    {/* Refresh Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchTransactions(true)}
                        disabled={refreshing}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-gold-royal/30 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-gold-light ${refreshing ? 'animate-spin' : ''}`} />
                    </motion.button>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-royal/30 transition-colors"
                        >
                            <Filter className="w-4 h-4 text-gold-royal" />
                            <span className="font-serif text-sm text-gray-400">
                                {filterOptions.find(f => f.value === filter)?.label}
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
                                    {filterOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setFilter(option.value)
                                                setIsFilterOpen(false)
                                                setPagination(prev => ({ ...prev, offset: 0 }))
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm font-serif transition-colors ${filter === option.value
                                                ? 'text-gold-shimmer bg-gold-royal/20'
                                                : 'text-gray-400 hover:text-gold-light hover:bg-white/5'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-gold-royal animate-spin mb-4" />
                        <p className="text-gray-500 font-serif">Loading transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Receipt className="w-12 h-12 text-gray-600 mb-4" />
                        <p className="text-gray-500 font-serif text-lg mb-2">No transactions yet</p>
                        <p className="text-gray-600 font-sans text-sm">
                            Your transaction history will appear here
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 border-b border-white/5">
                            <div className="col-span-4 text-xs font-sans uppercase tracking-wider text-gray-500">Transaction</div>
                            <div className="col-span-2 text-xs font-sans uppercase tracking-wider text-gray-500">Type</div>
                            <div className="col-span-2 text-xs font-sans uppercase tracking-wider text-gray-500 text-right">Amount</div>
                            <div className="col-span-2 text-xs font-sans uppercase tracking-wider text-gray-500">Status</div>
                            <div className="col-span-2 text-xs font-sans uppercase tracking-wider text-gray-500 text-right">Date</div>
                        </div>

                        {/* Transaction Items */}
                        <div className="divide-y divide-white/5">
                            {transactions.map((tx, index) => {
                                const typeConfig = transactionTypeConfig[tx.type] || transactionTypeConfig['COIN_TRANSFER']
                                const TypeIcon = typeConfig.icon
                                const status = statusConfig[tx.status] || statusConfig['pending']

                                return (
                                    <motion.div
                                        key={tx.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group p-4 md:px-6 md:py-4 hover:bg-white/5 transition-colors"
                                    >
                                        {/* Mobile Layout */}
                                        <div className="md:hidden space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg ${typeConfig.bgColor} flex items-center justify-center`}>
                                                        <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-serif text-sm text-white">{tx.description}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className={`font-display text-lg ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {formatAmount(tx.amount)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-sans uppercase ${status.bgColor} ${status.color} border`}>
                                                    {tx.status}
                                                </span>
                                                {tx.explorerUrl && (
                                                    <a
                                                        href={tx.explorerUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-gold-light hover:text-gold-shimmer transition-colors"
                                                    >
                                                        <span>View on Explorer</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg ${typeConfig.bgColor} flex items-center justify-center shrink-0`}>
                                                    <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-serif text-sm text-white truncate">{tx.description}</p>
                                                    {tx.explorerUrl && (
                                                        <a
                                                            href={tx.explorerUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs text-gold-light/60 hover:text-gold-shimmer transition-colors"
                                                        >
                                                            <span className="truncate max-w-[150px]">
                                                                {tx.transactionHash?.slice(0, 10)}...{tx.transactionHash?.slice(-6)}
                                                            </span>
                                                            <ExternalLink className="w-3 h-3 shrink-0" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-sans ${typeConfig.bgColor} ${typeConfig.color}`}>
                                                    {typeConfig.label}
                                                </span>
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <span className={`font-display text-lg ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {formatAmount(tx.amount)}
                                                </span>
                                                <p className="text-xs text-gray-500">{tx.currency === 'NFT' ? 'NFT' : 'coins'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-sans uppercase ${status.bgColor} ${status.color} border`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <p className="text-sm text-gray-400 font-serif">{formatDate(tx.createdAt)}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        {pagination.total > pagination.limit && (
                            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-t border-white/5">
                                <p className="text-sm text-gray-500 font-sans">
                                    Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
                                </p>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handlePrevPage}
                                        disabled={pagination.offset === 0}
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-gold-royal/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-gold-light" />
                                    </motion.button>
                                    <span className="px-3 py-1 rounded-lg bg-gold-royal/20 text-gold-shimmer font-display text-sm">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleNextPage}
                                        disabled={!pagination.hasMore}
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-gold-royal/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-4 h-4 text-gold-light" />
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    )
}
