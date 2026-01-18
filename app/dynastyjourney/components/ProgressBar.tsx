"use client";

import React from "react";
import styles from "../DynastyJourney.module.css";

interface ProgressBarProps {
    currentElo: number;
    levelStartElo: number;
    levelEndElo: number;
    progressPercentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    currentElo,
    levelStartElo,
    levelEndElo,
    progressPercentage,
}) => {
    return (
        <section className={styles.eloBarSection}>
            <div className={styles.eloBarContainer}>
                <div className={styles.eloBarHeader}>
                    <span className={styles.eloBarLabel}>Level Progress</span>
                    <span className={styles.eloBarValue}>
                        {currentElo} / {levelEndElo} Elo
                    </span>
                </div>

                <div className={styles.eloBarTrack}>
                    <div
                        className={styles.eloBarFill}
                        style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
                    />
                </div>

                <div className={styles.eloBarMarkers}>
                    <span className={styles.eloBarMarker}>{levelStartElo}</span>
                    <span className={styles.eloBarMarker}>{levelEndElo}</span>
                </div>
            </div>
        </section>
    );
};

export default ProgressBar;
