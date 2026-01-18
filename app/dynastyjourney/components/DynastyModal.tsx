"use client";

import React from "react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/solid";
import type { Dynasty } from "../types";
import styles from "../DynastyJourney.module.css";

interface DynastyModalProps {
    dynasty: Dynasty | null;
    isOpen: boolean;
    isUnlocked: boolean;
    currentLevel: number;
    onClose: () => void;
    onPlay: (dynasty: Dynasty) => void;
}

const DynastyModal: React.FC<DynastyModalProps> = ({
    dynasty,
    isOpen,
    isUnlocked,
    currentLevel,
    onClose,
    onPlay,
}) => {
    if (!dynasty) return null;

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
                    <XMarkIcon className="w-5 h-5" />
                </button>

                <div className={styles.modalHeader}>
                    <Image
                        src={dynasty.imageUrl}
                        alt={dynasty.name}
                        width={80}
                        height={80}
                        className={styles.modalImage}
                    />
                    <div className={styles.modalTitleGroup}>
                        <h2 className={styles.modalTitle}>{dynasty.name}</h2>
                        <p className={styles.modalSubtitle}>
                            {dynasty.nameChinese} • Elo {dynasty.startElo} - {dynasty.endElo}
                        </p>
                    </div>
                </div>

                <p className={styles.modalDescription}>{dynasty.description}</p>

                <div className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}>Dynasty Reward</h3>
                    <div className={styles.rewardCard}>
                        <Image
                            src={dynasty.reward.skinImageUrl}
                            alt={dynasty.reward.skinName}
                            width={60}
                            height={60}
                            className={styles.rewardImage}
                        />
                        <div className={styles.rewardInfo}>
                            <p className={styles.rewardName}>{dynasty.reward.skinName}</p>
                            <p className={styles.rewardDescription}>
                                {dynasty.reward.skinDescription}
                            </p>
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
                            : "Locked - Reach Higher Elo"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DynastyModal;
