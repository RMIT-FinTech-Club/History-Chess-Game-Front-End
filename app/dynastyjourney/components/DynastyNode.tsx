"use client";

import React from "react";
import Image from "next/image";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import type { Dynasty } from "../types";
import styles from "../DynastyJourney.module.css";

interface DynastyNodeProps {
    dynasty: Dynasty;
    isUnlocked: boolean;
    isCurrent: boolean;
    onClick: () => void;
}

const DynastyNode: React.FC<DynastyNodeProps> = ({
    dynasty,
    isUnlocked,
    isCurrent,
    onClick,
}) => {
    const nodeClasses = [
        styles.dynastyNode,
        isUnlocked && styles.dynastyNodeUnlocked,
        isCurrent && styles.dynastyNodeCurrent,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={nodeClasses} onClick={onClick}>
            {isCurrent && (
                <span className={styles.currentIndicator}>Current</span>
            )}

            <div className={styles.dynastyNodeInner}>
                <Image
                    src={dynasty.imageUrl}
                    alt={dynasty.name}
                    fill
                    className={styles.dynastyNodeImage}
                    sizes="110px"
                />

                <div className={styles.dynastyNodeOverlay}>
                    {!isUnlocked ? (
                        <LockClosedIcon className={styles.lockIcon} />
                    ) : (
                        <span className={styles.dynastyNumber}>{dynasty.id}</span>
                    )}
                </div>
            </div>

            <div className={styles.dynastyLabel}>
                <p className={styles.dynastyName}>{dynasty.name}</p>
                <p className={styles.dynastyElo}>
                    {dynasty.startElo} - {dynasty.endElo} Elo
                </p>
            </div>
        </div>
    );
};

export default DynastyNode;
