"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { Dynasty } from "../types";
import { dynastyLoreData } from "../data/lore";
import styles from "../DynastyJourney.module.css";
import { useAchievements } from "@/context/AchievementContext";

interface DynastyModalProps {
    dynasty: Dynasty | null;
    isOpen: boolean;
    isUnlocked: boolean;
    currentLevel: number;
    nftStatus?: {
        txHash: string;
        isMinting: boolean;
        isConfirmed: boolean;
    };
    onClose: () => void;
    onPlay: (dynasty: Dynasty) => void;
}

const DynastyModal: React.FC<DynastyModalProps> = ({
    dynasty,
    isOpen,
    isUnlocked,
    currentLevel,
    nftStatus,
    onClose,
    onPlay,
}) => {
    const [mainImageSrc, setMainImageSrc] = useState<string>("");
    const [rewardImageSrc, setRewardImageSrc] = useState<string>("");

    // Achievement Tracking
    const { trackProgress } = useAchievements();

    useEffect(() => {
        if (dynasty) {
            setMainImageSrc(dynasty.imageUrl);
            setRewardImageSrc(dynasty.reward.skinImageUrl);
        }

        // Track progress when modal is opened and unlocked
        if (dynasty && isOpen && isUnlocked) {
            trackProgress('scholar');
        }
    }, [dynasty, isOpen, isUnlocked, trackProgress]);

    if (!dynasty) return null;

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("Transaction Hash copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const overlayClasses = [
        styles.modalOverlay,
        isOpen && styles.modalOverlayVisible,
    ]
        .filter(Boolean)
        .join(" ");

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={overlayClasses} onClick={handleOverlayClick}>
            <div className={styles.modalContent}>
                <button
                    className={styles.modalClose}
                    onClick={onClose}
                    type="button"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className={styles.modalHeader}>
                    <Image
                        src={mainImageSrc || dynasty.imageUrl}
                        alt={dynasty.name}
                        width={80}
                        height={80}
                        className={styles.modalImage}
                        onError={() => {
                            // Fallback for Ngô Dynasty specifically or generic placeholder
                            // if (dynasty.id === 1) setMainImageSrc("/dynasties/ngo_dynasty.png");
                            // else setMainImageSrc("/placeholder-item.png");
                            console.log("Image load error on S3 URL");
                        }}
                    />
                    <div className={styles.modalTitleGroup}>
                        <h2 className={styles.modalTitle}>{dynasty.name}</h2>
                        <p className={styles.modalSubtitle}>
                            Bot Level {dynasty.botLevel}
                        </p>
                    </div>
                </div>

                <p className={styles.modalDescription}>{dynasty.description}</p>

                {/* Dynasty Lore Section */}
                <div className={styles.modalSection}>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className={styles.modalSectionTitle}>📜 Dynasty Lore</h3>
                    </div>

                    <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                        {(() => {
                            const lore = dynastyLoreData[dynasty.id];
                            if (!lore) return <p className="text-sm text-gray-400">Lore to be discovered...</p>;

                            return (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                        <h4 className="font-display text-[#DBB968]">{lore.title}</h4>
                                        <span className="text-xs font-serif text-gray-400">{lore.period}</span>
                                    </div>

                                    <p className="text-sm text-gray-300 italic">&quot;{lore.description}&quot;</p>

                                    <div className="grid grid-cols-1 gap-2 mt-2">
                                        {lore.keyEvents.map((evt, i) => (
                                            <div key={i} className="flex gap-2 text-xs">
                                                <span className="text-[#DBB968] font-bold min-w-[35px]">{evt.year}</span>
                                                <span className="text-gray-400">{evt.event}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {lore.famousFigure && (
                                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-3">
                                            <div className="text-xs">
                                                <div className="text-[#DBB968] font-bold">{lore.famousFigure.name}</div>
                                                <div className="text-gray-500">{lore.famousFigure.title}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <div className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}>Dynasty Reward</h3>
                    <div className={styles.rewardCard}>
                        <Image
                            src={rewardImageSrc || dynasty.reward.skinImageUrl}
                            alt={dynasty.reward.skinName}
                            width={60}
                            height={60}
                            className={styles.rewardImage}
                            onError={() => {
                                // if (dynasty.id === 1) setRewardImageSrc("/dynasties/ngo_quyen_skin_king.png");
                                // else setRewardImageSrc("/placeholder-item.png");
                                console.log("Reward image load error on S3 URL");
                            }}
                        />
                        <div className={styles.rewardInfo}>
                            <p className={styles.rewardName}>{dynasty.reward.skinName}</p>
                            <p className={styles.rewardDescription}>
                                {dynasty.reward.skinDescription}
                            </p>
                            {/* NFT Status Badge */}
                            {isUnlocked && nftStatus && (
                                <div className={styles.nftStatusContainer}>
                                    {nftStatus.isMinting && (
                                        <span className={styles.mintingBadge}>
                                            <span className={styles.spinnerSmall}></span> Minting NFT...
                                        </span>
                                    )}
                                    {nftStatus.isConfirmed && (
                                        <button
                                            className={styles.verifiedBadge}
                                            onClick={() => copyToClipboard(nftStatus.txHash)}
                                            title="Click to copy Transaction Hash"
                                            type="button"
                                        >
                                            ✓ Blockchain Verified
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {dynasty.reward.items.length > 0 && (
                    <div className={styles.modalSection}>
                        <h3 className={styles.modalSectionTitle}>Unlockable Items</h3>
                        {dynasty.reward.items.map((item, idx) => (
                            <div key={idx} className={styles.rewardCard}>
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    width={60}
                                    height={60}
                                    className={styles.rewardImage}
                                />
                                <div className={styles.rewardInfo}>
                                    <p className={styles.rewardName}>{item.name}</p>
                                    <p className={styles.rewardDescription}>{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.modalActions}>
                    <button
                        className={styles.playButton}
                        onClick={() => onPlay(dynasty)}
                        disabled={!isUnlocked}
                        type="button"
                    >
                        {isUnlocked
                            ? `Play Level ${currentLevel}`
                            : "Locked - Reach Higher Level"}
                    </button>
                </div>
            </div>
        </div >
    );
};

export default DynastyModal;
