"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import BackgroundEffects from "@/components/decor/BackgroundEffects";
import BidModal from "@/components/market/BidModal";
import AddItemModal from "@/components/market/AddItemModal";
import PurchaseSuccessModal from "@/components/ui/PurchaseSuccessModal";
import HistoricalTooltip from "@/components/ui/HistoricalTooltip";
import marketApi, {
  MarketplaceItem,
  AuctionListing,
} from "@/config/marketApi";

// Dynasty progression for filtering
const DYNASTIES = [
  "Đinh",
  "Tiền Lê",
  "Lý",
  "Trần",
  "Hồ",
  "Hậu Trần",
  "Lê Sơ",
  "Mạc",
  "Hậu Lê",
  "Tây Sơn",
  "Nguyễn",
];

const CATEGORIES = ["All", "Sword", "Shield", "Armor", "Hat", "Bracelet", "Effect", "Badge"];

// Rarity styles mapping
const RARITIES: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  COMMON: { color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", glow: "" },
  UNCOMMON: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/20" },
  RARE: { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", glow: "shadow-sky-500/20" },
  EPIC: { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "shadow-violet-500/20" },
  LEGENDARY: { color: "text-[#E8BB05]", bg: "bg-[#E8BB05]/10", border: "border-[#E8BB05]/20", glow: "shadow-[#E8BB05]/20" },
};

type TabType = "marketplace" | "auctions";

// =====================================
// Item Card Component
// =====================================
interface ItemCardProps {
  item: MarketplaceItem;
  onBuy: (item: MarketplaceItem) => void;
}

const ItemCard = ({ item, onBuy }: ItemCardProps) => {
  const rarityStyle = RARITIES[item.rarity] || RARITIES.COMMON;
  const isAvailable = item.quantity > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative h-full"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-b from-[#DBB968]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-md" />

      {/* Card Body */}
      <div className="relative h-full flex flex-col rounded-2xl border border-white/10 bg-[#121212]/80 backdrop-blur-md overflow-hidden transition-colors duration-500 group-hover:border-[#DBB968]/40">

        {/* Rarity & Status Bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-3 z-20">
          <div className={`px-2 py-0.5 rounded-full border bg-black/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest ${rarityStyle.color} ${rarityStyle.border}`}>
            {item.rarity}
          </div>
          {item.quantity < 5 && isAvailable && (
            <div className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wide animate-pulse">
              Low Stock
            </div>
          )}
        </div>

        {/* Image Container with Radial Glow */}
        <div className="relative h-48 flex items-center justify-center p-6 overflow-hidden">

          {/* Animated Radial Background */}
          <div
            className="absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-50"
            style={{
              background: `radial-gradient(circle at center, ${item.rarity === 'LEGENDARY' ? '#E8BB05' :
                item.rarity === 'EPIC' ? '#A78BFA' :
                  item.rarity === 'RARE' ? '#38BDF8' : '#ffffff'}40 0%, transparent 70%)`
            }}
          />

          <motion.img
            src={item.imageUrl || "/placeholder-item.png"}
            alt={item.name}
            className="relative z-10 w-fit h-full max-h-[140px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-500"
            whileHover={{ scale: 1.15, rotate: 3 }}
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-4 pt-0 bg-gradient-to-b from-transparent to-black/40">

          {/* Title & Dynasty */}
          <div className="mb-4">
            <h3 className="font-display text-lg leading-tight text-white group-hover:text-[#DBB968] transition-colors mb-1 truncate">
              {item.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#DBB968]/50" />
              <p className="text-xs text-white/50 font-serif tracking-wide uppercase">
                {item.dynasty} Dynasty
              </p>
            </div>
          </div>

          {/* Stats / Info - pushed to bottom of flex area */}
          <div className="mt-auto space-y-4">

            {/* Price Row */}
            <div className="flex items-end justify-between border-t border-white/5 pt-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Price</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg text-[#DBB968]">🪙</span>
                  <span className="font-display text-xl text-white tracking-wide">
                    {item.price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Stock</span>
                <span className={`font-mono text-sm ${item.quantity < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {item.quantity}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={isAvailable ? { scale: 1.02, filter: "brightness(1.1)" } : {}}
              whileTap={isAvailable ? { scale: 0.98 } : {}}
              disabled={!isAvailable}
              onClick={(e) => {
                e.stopPropagation();
                onBuy(item);
              }}
              className={`w-full relative py-3 rounded-lg font-sans font-bold text-xs uppercase tracking-[0.15em] transition-all bg-gradient-to-r overflow-hidden
                    ${isAvailable
                  ? "from-[#DBB968] to-[#B98F00] text-black shadow-[0_4px_15px_rgba(219,185,104,0.2)] hover:shadow-[0_4px_20px_rgba(219,185,104,0.4)] border border-[#FFE169]/30"
                  : "from-white/5 to-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                }`}
            >
              {isAvailable && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isAvailable ? "Acquire Relic" : "Out of Stock"}
              </span>
            </motion.button>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

// =====================================
// Auction Card Component
// =====================================
interface AuctionCardProps {
  auction: AuctionListing;
  onBid: (auction: AuctionListing) => void;
}

const AuctionCard = ({ auction, onBid }: AuctionCardProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const details = auction.nftDetails;

  useEffect(() => {
    if (!auction.endTime) return;

    const updateTimer = () => {
      const end = new Date(auction.endTime!).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div className="relative rounded-2xl border border-purple-500/20 bg-linear-to-b from-purple-500/10 to-transparent backdrop-blur-lg overflow-hidden">
        {/* Auction badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
          <span className="text-sm">🔨</span>
          <span className="text-xs text-purple-300 font-sans uppercase tracking-wider">
            Auction
          </span>
        </div>

        {/* Timer */}
        <div className="absolute top-3 right-3 z-20 px-3 py-1 bg-black/50 border border-border-glass rounded-full">
          <span className="text-xs text-white font-mono">⏳ {timeLeft}</span>
        </div>

        {/* Image */}
        <div className="relative h-44 flex items-center justify-center">
          <div className="absolute inset-0 bg-linear-to-b from-purple-500/10 to-transparent" />
          <img
            src={details?.imageUrl || "/placeholder-item.png"}
            alt={details?.name || "Auction Item"}
            className="relative z-10 w-28 h-28 object-contain"
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-display text-lg text-text-primary line-clamp-1">
              {details?.name || "Unknown Item"}
            </h3>
            <p className="text-xs text-text-muted font-serif">
              {details?.rarity} · {details?.dynasty}
            </p>
          </div>

          {/* Current Bid */}
          <div className="p-3 rounded-xl bg-surface-glass border border-border-glass">
            <p className="text-xs text-text-muted mb-1">Current Bid</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">🪙</span>
              <span className="font-display text-2xl text-gold-400">
                {(auction.currentBid || auction.price).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bid button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBid(auction)}
            className="w-full py-3 rounded-xl font-sans font-semibold text-sm uppercase tracking-wider bg-linear-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/20 transition-all"
          >
            Place Bid
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// =====================================
// Filter Sidebar Component
// =====================================
interface FilterSidebarProps {
  selectedDynasty: string;
  setSelectedDynasty: (d: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  isAdmin: boolean;
  onAddItem: () => void;
}

const FilterSidebar = ({
  selectedDynasty,
  setSelectedDynasty,
  selectedCategory,
  setSelectedCategory,
  isAdmin,
  onAddItem,
}: FilterSidebarProps) => (
  <motion.aside
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="w-full lg:w-64 shrink-0"
  >
    <div className="glass-card rounded-2xl p-5 border border-border-glass space-y-6">
      {/* Dynasty Filter */}
      <div>
        <h3 className="font-serif text-sm text-text-secondary uppercase tracking-wider mb-3">
          Dynasty
        </h3>
        <select
          value={selectedDynasty}
          onChange={(e) => setSelectedDynasty(e.target.value)}
          className="w-full bg-surface-glass border border-border-glass rounded-xl px-4 py-2.5 text-text-primary text-sm focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 outline-none transition-all [&>option]:bg-background [&>option]:text-foreground"
        >
          <option value="" className="bg-background text-foreground">All Dynasties</option>
          {DYNASTIES.map((d) => (
            <option key={d} value={d} className="bg-background text-foreground">
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="font-serif text-sm text-text-secondary uppercase tracking-wider mb-3">
          Category
        </h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat === "All" ? "" : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${(cat === "All" && !selectedCategory) || selectedCategory === cat
                ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                : "bg-surface-glass text-text-secondary border border-border-glass hover:border-border-glass/50"
                }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rarity Legend */}
      <div>
        <h3 className="font-serif text-sm text-text-secondary uppercase tracking-wider mb-3">
          Rarity
        </h3>
        <div className="space-y-2.5">
          {Object.entries(RARITIES).map(([rarity, style]) => (
            <div key={rarity} className="flex items-center gap-3 group cursor-default">
              <div className={`w-3 h-3 rounded-full ${style.bg} border ${style.border} ${style.glow} transition-transform group-hover:scale-125`} />
              <span className={`text-xs font-medium ${style.color} ${style.glow}`}>{rarity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin: Add Item Button */}
      {isAdmin && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddItem}
          className="w-full py-3 rounded-xl font-sans font-semibold text-sm bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          Add New Item
        </motion.button>
      )}
    </div>
  </motion.aside>
);

// =====================================
// Tab Button Component
// =====================================
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  count?: number;
}

const TabButton = ({ active, onClick, icon, label, count }: TabButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-sans text-sm transition-all ${active
      ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
      : "bg-surface-glass text-text-secondary border border-border-glass hover:border-border-glass/50"
      }`}
  >
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
    {count !== undefined && (
      <span
        className={`ml-2 px-2 py-0.5 rounded-full text-xs ${active ? "bg-gold-500/30 text-gold-300" : "bg-surface-glass text-text-muted"
          }`}
      >
        {count}
      </span>
    )}
  </motion.button>
);

// =====================================
// Main Marketplace Page
// =====================================
export default function MarketplacePage() {
  const { accessToken, role, walletBalance, setWalletBalance } = useGlobalStorage();
  const [activeTab, setActiveTab] = useState<TabType>("marketplace");
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDynasty, setSelectedDynasty] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAuction, setSelectedAuction] = useState<AuctionListing | null>(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [purchasedItem, setPurchasedItem] = useState<MarketplaceItem | null>(null);

  // Check if user is admin
  const isAdmin = role === "ADMIN";

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "marketplace") {
        const data = await marketApi.getItems({
          dynasty: selectedDynasty || undefined,
          category: selectedCategory || undefined,
        });
        setItems(data);
      } else {
        const data = await marketApi.getAuctions();
        setAuctions(data);
      }
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedDynasty, selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleBuy = async (item: MarketplaceItem) => {
    if (!accessToken) {
      alert("Please login to purchase items");
      return;
    }
    try {
      const result = await marketApi.buyItem(item.id || item._id!, 1, accessToken);
      if (result.success) {
        setPurchasedItem(item);
        setSuccessModalOpen(true);
        fetchData();

        // Optimistic update for wallet balance
        const currentBalance = parseFloat(walletBalance);
        const newBalance = currentBalance - item.price;
        if (!isNaN(newBalance)) {
          setWalletBalance(newBalance.toString());
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to purchase item");
    }
  };

  const handleBid = (auction: AuctionListing) => {
    setSelectedAuction(auction);
    setBidModalOpen(true);
  };

  const handleBidSubmit = async (listingId: string, amount: number) => {
    if (!accessToken) {
      throw new Error("Please login to place a bid");
    }
    await marketApi.placeBid(listingId, amount, accessToken);
    fetchData();
  };

  const handleAddItem = () => {
    setAddItemModalOpen(true);
  };

  const handleAddItemSubmit = async (data: Omit<MarketplaceItem, "id" | "_id" | "soldCount" | "isActive" | "createdAt" | "transactionHash">) => {
    if (!accessToken) {
      throw new Error("Please login to add items");
    }
    await marketApi.addItem(data, accessToken);
    fetchData();
  };

  // Filter items by search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="relative min-h-[calc(100vh-var(--navbar-height))] flex flex-col p-6 md:p-10 overflow-hidden">
      <BackgroundEffects />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏪</span>
              <h1 className="font-display text-3xl md:text-4xl gold-gradient-text">
                MARKETPLACE
              </h1>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 w-full md:w-72 bg-surface-glass border border-border-glass rounded-xl px-4 py-2.5 focus-within:border-gold-500/50 focus-within:ring-1 focus-within:ring-gold-500/50 transition-all">
              <span className="text-text-secondary text-lg shrink-0">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted min-w-0"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mt-6">
            <TabButton
              active={activeTab === "marketplace"}
              onClick={() => setActiveTab("marketplace")}
              icon="🛒"
              label="Shop"
              count={items.length}
            />
            <TabButton
              active={activeTab === "auctions"}
              onClick={() => setActiveTab("auctions")}
              icon="🔨"
              label="Auctions"
              count={auctions.length}
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <FilterSidebar
            selectedDynasty={selectedDynasty}
            setSelectedDynasty={setSelectedDynasty}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isAdmin={isAdmin}
            onAddItem={handleAddItem}
          />

          {/* Items Grid */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-20"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
                    <p className="text-text-muted font-serif">Loading treasures...</p>
                  </div>
                </motion.div>
              ) : activeTab === "marketplace" ? (
                <motion.div
                  key="marketplace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredItems.map((item, index) => (
                        <motion.div
                          key={item.id || item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <HistoricalTooltip
                            dynasty={item.dynasty}
                            context={item.historicalContext}
                            itemRarity={item.rarity}
                            side={(index + 1) % 4 === 0 ? "left" : "right"}
                          >
                            <ItemCard item={item} onBuy={handleBuy} />
                          </HistoricalTooltip>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <span className="text-5xl mb-4">📦</span>
                      <h3 className="font-display text-xl text-text-secondary mb-2">
                        No Items Found
                      </h3>
                      <p className="text-text-muted font-serif">
                        Try adjusting your filters or check back later
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="auctions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {auctions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {auctions.map((auction, index) => (
                        <motion.div
                          key={auction.id || auction._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <AuctionCard auction={auction} onBid={handleBid} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <span className="text-5xl mb-4">🔨</span>
                      <h3 className="font-display text-xl text-text-secondary mb-2">
                        No Active Auctions
                      </h3>
                      <p className="text-text-muted font-serif">
                        Be the first to list an item for auction!
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BidModal
        auction={selectedAuction}
        isOpen={bidModalOpen}
        onClose={() => {
          setBidModalOpen(false);
          setSelectedAuction(null);
        }}
        onSubmit={handleBidSubmit}
      />

      <AddItemModal
        isOpen={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        onSubmit={handleAddItemSubmit}
      />

      <PurchaseSuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        item={purchasedItem}
      />
    </main>
  );
}
