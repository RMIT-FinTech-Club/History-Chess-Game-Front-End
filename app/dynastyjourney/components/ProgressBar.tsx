"use client";

import React from "react";
import styles from "../DynastyJourney.module.css";

interface ProgressBarProps {
    dynastyLevel: number;
    dynastyXp: number;
    xpToNextLevel: number;
    xpProgressPercentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    dynastyLevel,
    dynastyXp,
    xpToNextLevel,
    xpProgressPercentage,
}) => {
    return (
        <section className={styles.eloBarSection}>
            <div className={styles.eloBarContainer}>
                <div className={styles.eloBarHeader}>
                    <span className={styles.eloBarLabel}>Level {dynastyLevel} Progress</span>
                    <span className={styles.eloBarValue}>
                        {dynastyXp} / {xpToNextLevel} XP
                    </span>
                </div>

                <div className={styles.eloBarTrack}>
                    <div
                        className={styles.eloBarFill}
                        style={{ width: `${Math.min(100, Math.max(0, xpProgressPercentage))}%` }}
                    />
                </div>

                <div className={styles.eloBarMarkers}>
                    <span className={styles.eloBarMarker}>0 XP</span>
                    <span className={styles.eloBarMarker}>{xpToNextLevel} XP</span>
                </div>
            </div>
        </section>
    );
};

export default ProgressBar;

