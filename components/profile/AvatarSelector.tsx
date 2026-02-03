
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Loader2, Image as ImageIcon } from "lucide-react"
import axiosInstance from "@/config/apiConfig"
import { useGlobalStorage } from "@/hooks/GlobalStorage"
import { toast } from "sonner"

interface AvatarSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    currentAvatar: string | null;
    onAvatarUpdate: (newAvatarUrl: string) => void;
}

interface AvatarItem {
    id: string;
    name: string;
    imageUrl: string;
    dynasty?: string;
}

export default function AvatarSelector({ isOpen, onClose, currentAvatar, onAvatarUpdate }: AvatarSelectorProps) {
    const { accessToken, userId, setAuthData, userName, email, role } = useGlobalStorage()
    const [scannedAvatars, setScannedAvatars] = useState<AvatarItem[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    // Fetch available avatars (Items)
    useEffect(() => {
        if (!isOpen || !userId) return;

        const fetchAvatars = async () => {
            setLoading(true);
            try {
                // Fetch user items
                const response = await axiosInstance.get(`/items/user/${userId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (response.data.success) {
                    // Filter items that are valid for avatars (e.g. category ITEM)
                    // We assume all unlocked ITEMs can be used as avatars for now
                    const items = response.data.data.items || [];
                    const avatars = items.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        imageUrl: item.imageUrl,
                        dynasty: item.dynasty
                    }));
                    setScannedAvatars(avatars);
                }
            } catch (error) {
                console.error("Failed to load avatars", error);
                toast.error("Failed to load available avatars");
            } finally {
                setLoading(false);
            }
        };

        fetchAvatars();
    }, [isOpen, userId, accessToken]);

    const handleSelectAvatar = async (avatarUrl: string) => {
        if (updating) return;
        setUpdating(true);

        try {
            const response = await axiosInstance.put('/users/profile',
                { avatarUrl },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            if (response.status === 200) {
                toast.success("Avatar updated successfully");
                onAvatarUpdate(avatarUrl);

                // Update global state
                setAuthData({
                    userId: userId!,
                    userName: userName!,
                    email: email!,
                    accessToken: accessToken!,
                    refreshToken: null, // Keep existing if managed by cookies/storage logic usually
                    role: role,
                    avatar: avatarUrl
                });

                onClose();
            }
        } catch (error) {
            console.error("Failed to update avatar", error);
            toast.error("Failed to update avatar");
        } finally {
            setUpdating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg bg-[#2A2524] border border-gold-royal/30 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <h3 className="font-display text-xl text-gold-light flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Select Avatar
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-gold-royal" />
                            <p>Loading avatars...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {/* Default Avatar Option could be added here if needed */}

                            {scannedAvatars.length === 0 ? (
                                <div className="col-span-full py-8 text-center text-gray-400">
                                    <p className="mb-2">No special avatars unlocked yet.</p>
                                    <p className="text-sm">Play Dynasty Journey to unlock items!</p>
                                </div>
                            ) : (
                                scannedAvatars.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => handleSelectAvatar(avatar.imageUrl)}
                                        disabled={updating}
                                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${currentAvatar === avatar.imageUrl
                                                ? 'border-gold-shimmer shadow-gold-royal/50 shadow-lg'
                                                : 'border-white/10 hover:border-gold-royal/50'
                                            }`}
                                    >
                                        <img
                                            src={avatar.imageUrl}
                                            alt={avatar.name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />

                                        {currentAvatar === avatar.imageUrl && (
                                            <div className="absolute inset-0 bg-gold-royal/20 flex items-center justify-center">
                                                <div className="bg-gold-royal rounded-full p-1">
                                                    <Check className="w-4 h-4 text-bg-dark" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 backdrop-blur-xs">
                                            <p className="text-[10px] text-center text-white truncate">{avatar.name}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
