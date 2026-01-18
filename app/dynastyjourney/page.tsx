"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/config/apiConfig";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import type {
	Dynasty,
	DynastyProgress,
	DynastyAPIResponse,
	AllDynastiesData,
} from "./types";
import styles from "./DynastyJourney.module.css";
import DynastyCarousel from "./components/DynastyCarousel";
import DynastyModal from "./components/DynastyModal";
import ProgressBar from "./components/ProgressBar";

// Fallback data for when API is not available or user is not logged in
const FALLBACK_DYNASTIES: Dynasty[] = [
	{
		id: 1,
		name: "Ngô Dynasty",
		nameChinese: "吳朝",
		startElo: 0,
		endElo: 199,
		imageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		description: "The first independent dynasty after 1000 years of Chinese rule.",
		reward: {
			skinName: "Bronze Warrior King",
			skinDescription: "A chess skin inspired by the legendary Ngô Quyền",
			skinImageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg",
			items: [],
		},
		botLevel: 1,
	},
	{
		id: 2,
		name: "Đinh Dynasty",
		nameChinese: "丁朝",
		startElo: 200,
		endElo: 399,
		imageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		description: "The dynasty that unified the country as Đại Cồ Việt.",
		reward: {
			skinName: "Imperial Unifier",
			skinDescription: "A chess skin inspired by Emperor Đinh Tiên Hoàng",
			skinImageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg",
			items: [],
		},
		botLevel: 3,
	},
	{
		id: 3,
		name: "Early Lê Dynasty",
		nameChinese: "前黎朝",
		startElo: 400,
		endElo: 599,
		imageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		description: "A short but significant dynasty.",
		reward: {
			skinName: "Defender General",
			skinDescription: "A chess skin inspired by Lê Đại Hành",
			skinImageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg",
			items: [],
		},
		botLevel: 5,
	},
	{
		id: 4,
		name: "Lý Dynasty",
		nameChinese: "李朝",
		startElo: 600,
		endElo: 799,
		imageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		description: "The golden age that moved the capital to Thăng Long.",
		reward: {
			skinName: "Golden Dragon Emperor",
			skinDescription: "A chess skin inspired by the Lý Dynasty's prosperity",
			skinImageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg",
			items: [],
		},
		botLevel: 8,
	},
	{
		id: 5,
		name: "Trần Dynasty",
		nameChinese: "陳朝",
		startElo: 800,
		endElo: 999,
		imageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		description: "The dynasty that defeated the Mongol Empire three times.",
		reward: {
			skinName: "Mongol Slayer",
			skinDescription: "A chess skin inspired by General Trần Hưng Đạo",
			skinImageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg",
			items: [],
		},
		botLevel: 10,
	},
	{
		id: 6,
		name: "Hồ Dynasty",
		nameChinese: "胡朝",
		startElo: 1000,
		endElo: 1199,
		imageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		description: "A brief dynasty known for reforms.",
		reward: {
			skinName: "Reform Chancellor",
			skinDescription: "A chess skin inspired by Hồ Quý Ly's innovations",
			skinImageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg",
			items: [],
		},
		botLevel: 12,
	},
	{
		id: 7,
		name: "Later Lê Dynasty",
		nameChinese: "後黎朝",
		startElo: 1200,
		endElo: 1399,
		imageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		description: "The longest dynasty that liberated Vietnam from Ming occupation.",
		reward: {
			skinName: "Liberation Hero",
			skinDescription: "A chess skin inspired by Emperor Lê Thái Tổ",
			skinImageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg",
			items: [],
		},
		botLevel: 15,
	},
	{
		id: 8,
		name: "Mạc Dynasty",
		nameChinese: "莫朝",
		startElo: 1400,
		endElo: 1599,
		imageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		description: "A dynasty during the period of civil war.",
		reward: {
			skinName: "Shadow Emperor",
			skinDescription: "A chess skin inspired by the Mạc Dynasty's complex era",
			skinImageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg",
			items: [],
		},
		botLevel: 17,
	},
	{
		id: 9,
		name: "Tây Sơn Dynasty",
		nameChinese: "西山朝",
		startElo: 1600,
		endElo: 1799,
		imageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		description: "The peasant uprising that unified Vietnam and defeated Qing China.",
		reward: {
			skinName: "Peasant Emperor",
			skinDescription: "A chess skin inspired by Emperor Quang Trung",
			skinImageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg",
			items: [],
		},
		botLevel: 19,
	},
	{
		id: 10,
		name: "Nguyễn Dynasty",
		nameChinese: "阮朝",
		startElo: 1800,
		endElo: 2000,
		imageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		description: "The last imperial dynasty, ruling a unified Vietnam from Huế.",
		reward: {
			skinName: "Imperial Sovereign",
			skinDescription: "A chess skin inspired by the Nguyễn Dynasty's grandeur",
			skinImageUrl: "https://ik.imagekit.io/historygame/ngoquyen.jpg",
			items: [],
		},
		botLevel: 20,
	},
];

// Helper to calculate dynasty and level from Elo
function getDynastyFromElo(elo: number, dynasties: Dynasty[]): Dynasty {
	return dynasties.find((d) => elo >= d.startElo && elo <= d.endElo) || dynasties[0];
}

function getLevelFromElo(elo: number, dynasty: Dynasty): number {
	const eloPerLevel = 40;
	const eloWithinDynasty = elo - dynasty.startElo;
	return Math.min(5, Math.floor(eloWithinDynasty / eloPerLevel) + 1);
}

function getLevelEloRange(elo: number, dynasty: Dynasty): { start: number; end: number } {
	const eloPerLevel = 40;
	const level = getLevelFromElo(elo, dynasty);
	const start = dynasty.startElo + (level - 1) * eloPerLevel;
	const end = start + eloPerLevel - 1;
	return { start, end };
}

export default function DynastyJourney() {
	const router = useRouter();
	const { accessToken } = useGlobalStorage();

	const [dynasties, setDynasties] = useState<Dynasty[]>(FALLBACK_DYNASTIES);
	const [progress, setProgress] = useState<DynastyProgress | null>(null);
	const [selectedDynasty, setSelectedDynasty] = useState<Dynasty | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch dynasties data
	const fetchDynasties = useCallback(async () => {
		try {
			const response = await axiosInstance.get<DynastyAPIResponse<AllDynastiesData>>(
				"/dynasty/all"
			);
			if (response.data.success) {
				setDynasties(response.data.data.dynasties);
			}
		} catch (error) {
			console.warn("Failed to fetch dynasties, using fallback data:", error);
		}
	}, []);

	// Fetch user progress
	const fetchProgress = useCallback(async () => {
		if (!accessToken) return;

		try {
			const response = await axiosInstance.get<DynastyAPIResponse<DynastyProgress>>(
				"/dynasty/progress",
				{
					headers: { Authorization: `Bearer ${accessToken}` },
				}
			);
			if (response.data.success) {
				setProgress(response.data.data);
			}
		} catch (error) {
			console.warn("Failed to fetch progress:", error);
		}
	}, [accessToken]);

	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			await fetchDynasties();
			await fetchProgress();
			setIsLoading(false);
		};
		loadData();
	}, [fetchDynasties, fetchProgress]);

	// Compute current state from progress or defaults
	const currentState = useMemo(() => {
		if (progress) {
			return {
				currentElo: progress.currentElo,
				currentDynasty: progress.currentDynasty,
				currentLevel: progress.currentLevel,
				levelEloRange: progress.levelEloRange,
				progressPercentage: progress.progressPercentage,
				unlockedDynastyIds: new Set(progress.unlockedDynasties.map((d) => d.id)),
			};
		}

		// Default for non-logged in users
		const defaultElo = 400;
		const currentDynasty = getDynastyFromElo(defaultElo, dynasties);
		const currentLevel = getLevelFromElo(defaultElo, currentDynasty);
		const levelEloRange = getLevelEloRange(defaultElo, currentDynasty);
		const progressPercentage =
			((defaultElo - levelEloRange.start) / (levelEloRange.end - levelEloRange.start + 1)) * 100;

		return {
			currentElo: defaultElo,
			currentDynasty,
			currentLevel,
			levelEloRange,
			progressPercentage,
			unlockedDynastyIds: new Set(
				dynasties.filter((d) => d.startElo <= defaultElo).map((d) => d.id)
			),
		};
	}, [progress, dynasties]);

	const handleDynastyClick = (dynasty: Dynasty) => {
		setSelectedDynasty(dynasty);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedDynasty(null);
	};

	const handlePlay = (botLevel: number) => {
		router.push(
			`/game/offline?mode=singleplayer&level=${botLevel}&autostart=1&color=white`
		);
	};

	if (isLoading) {
		return (
			<div className={styles.pageContainer}>
				<div className={styles.loadingContainer}>
					<div className={styles.loadingSpinner} />
					<p className={styles.loadingText}>Loading your dynasty journey...</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.pageContainer}>
			{/* Header */}
			<header className={styles.header}>
				<h1 className={styles.pageTitle}>Dynasty Journey</h1>
				<p className={styles.pageSubtitle}>
					Conquer the ages, unlock legendary rewards
				</p>
			</header>

			{/* Progress Cards */}
			<section className={styles.progressSection}>
				<div className={styles.progressCard}>
					<span className={styles.progressLabel}>Current Elo</span>
					<span className={`${styles.progressValue} ${styles.progressValueLarge}`}>
						{currentState.currentElo}
					</span>
				</div>
				<div className={styles.progressCard}>
					<span className={styles.progressLabel}>Dynasty</span>
					<span className={styles.progressValue}>
						{currentState.currentDynasty.name}
					</span>
				</div>
				<div className={styles.progressCard}>
					<span className={styles.progressLabel}>Level</span>
					<span className={styles.progressValue}>
						{currentState.currentLevel} / 5
					</span>
				</div>
			</section>

			{/* Dynasties Timeline */}
			<section className={styles.timelineSection}>
				<DynastyCarousel
					dynasties={dynasties}
					unlockedDynastyIds={currentState.unlockedDynastyIds}
					currentDynastyId={currentState.currentDynasty.id}
					onDynastyClick={handleDynastyClick}
				/>
			</section>

			{/* ELO Progress Bar */}
			<ProgressBar
				currentElo={currentState.currentElo}
				levelStartElo={currentState.levelEloRange.start}
				levelEndElo={currentState.levelEloRange.end}
				progressPercentage={currentState.progressPercentage}
			/>

			{/* Dynasty Detail Modal */}
			<DynastyModal
				dynasty={selectedDynasty}
				isOpen={isModalOpen}
				isUnlocked={
					selectedDynasty
						? currentState.unlockedDynastyIds.has(selectedDynasty.id)
						: false
				}
				currentLevel={
					selectedDynasty?.id === currentState.currentDynasty.id
						? currentState.currentLevel
						: 1
				}
				onClose={handleCloseModal}
				onPlay={handlePlay}
			/>
		</div>
	);
}
