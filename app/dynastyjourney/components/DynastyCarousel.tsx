"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dynasty } from "../types";
import DynastyNode from "./DynastyNode";
import styles from "../DynastyJourney.module.css";

interface DynastyCarouselProps {
    dynasties: Dynasty[];
    unlockedDynastyIds: Set<number>;
    currentDynastyId: number;
    onDynastyClick: (dynasty: Dynasty) => void;
}

const DynastyCarousel: React.FC<DynastyCarouselProps> = ({
    dynasties,
    unlockedDynastyIds,
    currentDynastyId,
    onDynastyClick,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // Check scroll position and update arrow visibility
    const checkScrollPosition = useCallback(() => {
        const container = scrollRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    // Initialize scroll check and add event listener
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        checkScrollPosition();
        container.addEventListener("scroll", checkScrollPosition);

        // Scroll to current dynasty on mount
        const currentIndex = dynasties.findIndex((d) => d.id === currentDynastyId);
        if (currentIndex > 0) {
            const nodeWidth = 100; // approximate width of node + connector
            const scrollPosition = Math.max(0, currentIndex * nodeWidth - container.clientWidth / 2 + nodeWidth / 2);
            container.scrollTo({ left: scrollPosition, behavior: "smooth" });
        }

        return () => {
            container.removeEventListener("scroll", checkScrollPosition);
        };
    }, [checkScrollPosition, currentDynastyId, dynasties]);

    // Handle resize
    useEffect(() => {
        window.addEventListener("resize", checkScrollPosition);
        return () => window.removeEventListener("resize", checkScrollPosition);
    }, [checkScrollPosition]);

    const scroll = (direction: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;

        const scrollAmount = container.clientWidth * 0.6;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <div className={styles.carouselContainer}>
            {/* Left Arrow */}
            <button
                type="button"
                className={`${styles.carouselArrow} ${styles.carouselArrowLeft} ${!canScrollLeft ? styles.carouselArrowHidden : ""
                    }`}
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
            >
                <ChevronLeft className={styles.carouselArrowIcon} />
            </button>

            {/* Timeline scroll container */}
            <div className={styles.carouselScroll} ref={scrollRef}>
                <div className={styles.timeline}>
                    {dynasties.map((dynasty, index) => {
                        const isUnlocked = unlockedDynastyIds.has(dynasty.id);
                        const isCurrent = dynasty.id === currentDynastyId;
                        const prevIsUnlocked =
                            index === 0 || unlockedDynastyIds.has(dynasties[index - 1].id);

                        return (
                            <React.Fragment key={dynasty.id}>
                                {index > 0 && (
                                    <div
                                        className={`${styles.timelineConnector} ${prevIsUnlocked && isUnlocked
                                            ? styles.timelineConnectorActive
                                            : ""
                                            }`}
                                    />
                                )}
                                <DynastyNode
                                    dynasty={dynasty}
                                    isUnlocked={isUnlocked}
                                    isCurrent={isCurrent}
                                    onClick={() => onDynastyClick(dynasty)}
                                />
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Right Arrow */}
            <button
                type="button"
                className={`${styles.carouselArrow} ${styles.carouselArrowRight} ${!canScrollRight ? styles.carouselArrowHidden : ""
                    }`}
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
            >
                <ChevronRight className={styles.carouselArrowIcon} />
            </button>
        </div>
    );
};

export default DynastyCarousel;
