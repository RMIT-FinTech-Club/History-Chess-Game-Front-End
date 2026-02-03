"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import axiosInstance from "@/config/apiConfig";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

interface UnlockedSkin {
    id: string;
    name: string;
    imageUrl: string;
    dynastyName: string;
    type: string;
}

interface SkinSelectorProps {
    selectedSkin: string | null;
    onSelect: (skinUrl: string | null) => void;
}

export default function SkinSelector({ selectedSkin, onSelect }: SkinSelectorProps) {
    const { accessToken } = useGlobalStorage();
    const [open, setOpen] = useState(false);
    const [unlockedSkins, setUnlockedSkins] = useState<UnlockedSkin[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch unlock skins on mount
    useEffect(() => {
        const fetchSkins = async () => {
            if (!accessToken) return;
            setLoading(true);
            try {
                const response = await axiosInstance.get('/dynasty/skins', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (response.data.success) {
                    setUnlockedSkins(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch unlocked skins", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSkins();
    }, [accessToken]);

    const handleSelect = (skinUrl: string | null) => {
        onSelect(skinUrl);
        setOpen(false);
    };

    const currentSkinName = selectedSkin
        ? unlockedSkins.find(s => s.imageUrl === selectedSkin)?.name || "Custom Skin"
        : "Default King";

    return (
        <div className="relative inline-flex items-center space-x-2 w-full">
            <div className="relative w-full">
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between bg-surface-glass text-text-muted px-4 py-3 rounded-lg border border-border-glass hover:bg-white/5 transition-colors"
                >
                    <span className="font-serif truncate">{currentSkinName}</span>
                    <span className="ml-2 text-gold-highlight">▾</span>
                </button>

                {open && (
                    <div className="absolute z-50 mt-2 w-full bg-[#2A2524] backdrop-blur-xl rounded-lg shadow-2xl border border-border-glass overflow-hidden max-h-60 overflow-y-auto">
                        {/* Default Option */}
                        <div
                            onClick={() => handleSelect(null)}
                            className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${selectedSkin === null
                                ? "bg-gold-highlight/20 text-gold-highlight font-semibold"
                                : "text-text-secondary hover:bg-surface-glass"
                                }`}
                        >
                            <span className="font-serif text-sm">Default King</span>
                        </div>

                        {/* Unlocked Options */}
                        {unlockedSkins.map((skin) => (
                            <div
                                key={skin.id}
                                onClick={() => handleSelect(skin.imageUrl)}
                                className={`px-4 py-2 cursor-pointer transition-colors flex items-center gap-3 border-t border-white/5 ${selectedSkin === skin.imageUrl
                                    ? "bg-gold-highlight/20 text-gold-highlight font-semibold"
                                    : "text-text-secondary hover:bg-surface-glass"
                                    }`}
                            >
                                <div className="relative w-8 h-8 shrink-0 rounded bg-white/5 p-1">
                                    <Image src={skin.imageUrl} alt={skin.name} fill className="object-contain" sizes="32px" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-serif text-sm truncate">{skin.name}</span>
                                    <span className="text-[10px] text-white/40 truncate">{skin.dynastyName}</span>
                                </div>
                            </div>
                        ))}

                        {unlockedSkins.length === 0 && !loading && (
                            <div className="px-4 py-3 text-xs text-center text-white/30 italic">
                                No unlocked skins yet. play Dynasty Journey to unlock!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
