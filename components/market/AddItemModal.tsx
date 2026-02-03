"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketplaceItem } from "@/config/marketApi";

const DYNASTIES = [
    "Đinh", "Tiền Lê", "Lý", "Trần", "Hồ",
    "Hậu Trần", "Lê Sơ", "Mạc", "Hậu Lê", "Tây Sơn", "Nguyễn",
];

const CATEGORIES = ["Sword", "Shield", "Armor", "Hat", "Bracelet", "Effect", "Badge"];
const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"] as const;

// Rarity colors for visual indicator
const RARITY_COLORS = {
    COMMON: "text-gray-300",
    UNCOMMON: "text-emerald-400",
    RARE: "text-sky-400",
    EPIC: "text-violet-400",
    LEGENDARY: "text-amber-400",
};

interface AddItemFormData {
    name: string;
    description: string;
    imageUrl: string;
    rarity: typeof RARITIES[number];
    dynasty: string;
    price: number;
    quantity: number;
    category: string;
}

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<MarketplaceItem, "id" | "_id" | "soldCount" | "isActive" | "createdAt" | "transactionHash">) => Promise<void>;
}

export default function AddItemModal({ isOpen, onClose, onSubmit }: AddItemModalProps) {
    const [formData, setFormData] = useState<AddItemFormData>({
        name: "",
        description: "",
        imageUrl: "",
        rarity: "COMMON",
        dynasty: DYNASTIES[0],
        price: 100,
        quantity: 10,
        category: CATEGORIES[0],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: keyof AddItemFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                // For now, we'll use a data URL - in production, this would upload to a server
                setFormData(prev => ({ ...prev, imageUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, imageUrl: "" }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim()) {
            setError("Item name is required");
            return;
        }

        if (!formData.imageUrl.trim()) {
            setError("Image is required");
            return;
        }

        if (formData.price <= 0) {
            setError("Price must be greater than 0");
            return;
        }

        if (formData.quantity <= 0) {
            setError("Quantity must be greater than 0");
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
            // Reset form
            setFormData({
                name: "",
                description: "",
                imageUrl: "",
                rarity: "COMMON",
                dynasty: DYNASTIES[0],
                price: 100,
                quantity: 10,
                category: CATEGORIES[0],
            });
            setImagePreview(null);
        } catch (err: any) {
            setError(err.message || "Failed to add item");
        } finally {
            setLoading(false);
        }
    };

    // Common select styling class
    const selectClassName = "w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition-all cursor-pointer appearance-none";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        <div className="glass-card rounded-2xl border border-emerald-500/30 overflow-hidden">
                            {/* Header */}
                            <div className="relative p-6 bg-gradient-to-b from-emerald-500/20 to-transparent">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">📦</span>
                                    <div>
                                        <h2 className="font-display text-xl text-white">
                                            Add New Item
                                        </h2>
                                        <p className="text-sm text-emerald-300">
                                            Create a new marketplace listing
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 font-serif">
                                        Item Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        placeholder="e.g., Iron Armor"
                                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 font-serif">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        placeholder="Describe the item..."
                                        rows={3}
                                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Image Upload Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm text-gray-400 font-serif">
                                            Item Image *
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setUploadMethod("upload")}
                                                className={`text-xs px-3 py-1 rounded-lg transition-all ${uploadMethod === "upload"
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    : "bg-white/5 text-gray-400 border border-white/10"
                                                    }`}
                                            >
                                                Upload
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUploadMethod("url")}
                                                className={`text-xs px-3 py-1 rounded-lg transition-all ${uploadMethod === "url"
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    : "bg-white/5 text-gray-400 border border-white/10"
                                                    }`}
                                            >
                                                URL
                                            </button>
                                        </div>
                                    </div>

                                    {uploadMethod === "upload" ? (
                                        <div className="relative">
                                            {imagePreview ? (
                                                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-contain"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-white/20 bg-neutral-900 hover:border-emerald-500/50 transition-colors cursor-pointer">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <span className="text-4xl mb-2">📸</span>
                                                        <p className="text-sm text-gray-400 mb-1">
                                                            Click to upload image
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG, GIF up to 10MB
                                                        </p>
                                                    </div>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    ) : (
                                        <input
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={(e) => handleChange("imageUrl", e.target.value)}
                                            placeholder="https://example.com/image.png"
                                            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                        />
                                    )}
                                </div>

                                {/* Category and Rarity row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2 font-serif">
                                            Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.category}
                                                onChange={(e) => handleChange("category", e.target.value)}
                                                className={selectClassName}
                                                style={{ backgroundColor: "#171717" }}
                                            >
                                                {CATEGORIES.map((cat) => (
                                                    <option key={cat} value={cat} style={{ backgroundColor: "#171717", color: "white" }}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                ▼
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2 font-serif">
                                            Rarity
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.rarity}
                                                onChange={(e) => handleChange("rarity", e.target.value)}
                                                className={`${selectClassName} ${RARITY_COLORS[formData.rarity]}`}
                                                style={{ backgroundColor: "#171717" }}
                                            >
                                                {RARITIES.map((rarity) => (
                                                    <option
                                                        key={rarity}
                                                        value={rarity}
                                                        style={{ backgroundColor: "#171717", color: "white" }}
                                                    >
                                                        {rarity}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                ▼
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynasty */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 font-serif">
                                        Required Dynasty
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.dynasty}
                                            onChange={(e) => handleChange("dynasty", e.target.value)}
                                            className={selectClassName}
                                            style={{ backgroundColor: "#171717" }}
                                        >
                                            {DYNASTIES.map((dynasty) => (
                                                <option key={dynasty} value={dynasty} style={{ backgroundColor: "#171717", color: "white" }}>
                                                    {dynasty}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                {/* Price and Quantity row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2 font-serif">
                                            Price (coins) *
                                        </label>
                                        <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 focus-within:border-emerald-500/50 transition-all">
                                            <span className="text-lg shrink-0">🪙</span>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => handleChange("price", parseInt(e.target.value) || 0)}
                                                min={1}
                                                className="flex-1 bg-transparent text-white outline-none w-full min-w-0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2 font-serif">
                                            Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                                            min={1}
                                            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <p className="text-red-400 text-sm">{error}</p>
                                )}

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 rounded-xl font-sans font-semibold text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Adding Item..." : "Add Item to Marketplace"}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
