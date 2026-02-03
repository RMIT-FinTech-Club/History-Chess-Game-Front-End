"use client";

import { useState } from "react";
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
    const [imageSrc, setImageSrc] = useState<string | null>(null);

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
                    src={imageSrc || dynasty.imageUrl}
                    alt={dynasty.name}
                    fill
                    className={styles.dynastyNodeImage}
                    sizes="110px"
                    onError={() => {
                        // if (dynasty.id === 1) setImageSrc("/dynasties/ngo_dynasty.png");
                        // else setImageSrc("/placeholder-item.png");
                        console.log("Timeline image load error on S3 URL");
                    }}
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
                    Level {(dynasty.id - 1) * 5 + 1} - {dynasty.id * 5}
                </p>
            </div>
        </div>
    );
};

export default DynastyNode;
