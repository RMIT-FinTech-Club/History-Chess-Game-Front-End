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

interface Transaction {
	transactionType: string;
	skinName?: string;
	description?: string;
	status: string;
	transactionHash: string;
}

// Fallback data for when API is not available or user is not logged in
const FALLBACK_DYNASTIES: Dynasty[] = [
	{
		id: 1,
		name: "Ngô Dynasty",
		startElo: 0,
		endElo: 199,
		imageUrl: "/dynasties/ngo_dynasty.png",
		description: "After a thousand years of Northern domination, Ngô Quyền defeated the Southern Han fleet at the Battle of Bạch Đằng, reclaiming Vietnamese independence.",
		reward: {
			skinName: "Ngô Quyền - The Tide Caller",
			skinDescription: "A warrior king in bronze armor, standing amidst waves. Features ancient corroded bronze with wave patterns.",
			skinImageUrl: "/dynasties/ngo_quyen_skin_king.png",
			items: [
				{ name: "Ironwood Stake", description: "A sharp wooden stake used to sink enemy ships at Bạch Đằng.", imageUrl: "/items/ironwood_stake.png" }
			],
		},
		botLevel: 1,
		boardTheme: {
			light: "#DECDBE",
			dark: "#8B4513",
			accent: "#4682B4"
		}
	},
	{
		id: 2,
		name: "Đinh Dynasty",

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
		boardTheme: {
			light: "#E8DCC8",
			dark: "#722F37",
			accent: "#B8860B"
		}
	},
	{
		id: 3,
		name: "Early Lê Dynasty",

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
		boardTheme: {
			light: "#C8D4B8",
			dark: "#4A5D23",
			accent: "#8B4513"
		}
	},
	{
		id: 4,
		name: "Lý Dynasty",

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
		boardTheme: {
			light: "#F5E6C8",
			dark: "#2F6B4F",
			accent: "#D4AF37"
		}
	},
	{
		id: 5,
		name: "Trần Dynasty",

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
		boardTheme: {
			light: "#D8D8D8",
			dark: "#4A4A4A",
			accent: "#8B0000"
		}
	},
	{
		id: 6,
		name: "Hồ Dynasty",

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
		boardTheme: {
			light: "#E8D4C4",
			dark: "#8B4513",
			accent: "#CD853F"
		}
	},
	{
		id: 7,
		name: "Later Lê Dynasty",

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
		boardTheme: {
			light: "#D4E8F0",
			dark: "#1E3A5F",
			accent: "#C0C0C0"
		}
	},
	{
		id: 8,
		name: "Mạc Dynasty",

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
		boardTheme: {
			light: "#E0D8E8",
			dark: "#3D2B47",
			accent: "#708090"
		}
	},
	{
		id: 9,
		name: "Tây Sơn Dynasty",

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
		boardTheme: {
			light: "#F5DEB3",
			dark: "#B22222",
			accent: "#FF4500"
		}
	},
	{
		id: 10,
		name: "Nguyễn Dynasty",

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
		boardTheme: {
			light: "#FFF8DC",
			dark: "#8B0000",
			accent: "#FFD700"
		}
	},
];

// Helper to calculate dynasty and level from dynastyLevel
function getDynastyFromLevel(level: number, dynasties: Dynasty[]): Dynasty {
	const LEVELS_PER_DYNASTY = 5;
	const dynastyId = Math.floor((level - 1) / LEVELS_PER_DYNASTY) + 1;
	const clampedId = Math.min(dynastyId, dynasties.length);
	return dynasties[clampedId - 1] || dynasties[0];
}

function getRankWithinDynasty(level: number): number {
	const LEVELS_PER_DYNASTY = 5;
	return ((level - 1) % LEVELS_PER_DYNASTY) + 1;
}

export default function DynastyJourney() {
	const router = useRouter();
	const { accessToken } = useGlobalStorage();

	const [dynasties, setDynasties] = useState<Dynasty[]>(FALLBACK_DYNASTIES);
	const [progress, setProgress] = useState<DynastyProgress | null>(null);
	const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
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

	// Fetch user transactions (for NFT status)
	const fetchTransactions = useCallback(async () => {
		if (!accessToken) return;
		try {
			const response = await axiosInstance.get("/wallet/transactions", {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			if (response.data.success) {
				setUserTransactions(response.data.data);
			}
		} catch (error) {
			console.warn("Failed to fetch transactions:", error);
		}
	}, [accessToken]);

	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			await fetchDynasties();
			await fetchProgress();
			await fetchTransactions();
			setIsLoading(false);
		};
		loadData();
	}, [fetchDynasties, fetchProgress, fetchTransactions]);

	// Compute current state from progress or defaults
	const currentState = useMemo(() => {
		if (progress) {
			return {
				dynastyLevel: progress.dynastyLevel ?? 1,
				dynastyXp: progress.dynastyXp ?? 0,
				xpToNextLevel: progress.xpToNextLevel ?? 500,
				xpProgressPercentage: progress.xpProgressPercentage ?? 0,
				currentDynasty: progress.currentDynasty,
				currentLevel: progress.currentLevel, // Rank within dynasty (1-5)
				unlockedDynastyIds: new Set(progress.unlockedDynasties.map((d) => d.id)),
			};
		}

		// Default for non-logged in users (Level 1)
		const defaultLevel = 1;
		const currentDynasty = getDynastyFromLevel(defaultLevel, dynasties);
		const currentRank = getRankWithinDynasty(defaultLevel);

		return {
			dynastyLevel: defaultLevel,
			dynastyXp: 0,
			xpToNextLevel: 500,
			xpProgressPercentage: 0,
			currentDynasty,
			currentLevel: currentRank,
			unlockedDynastyIds: new Set([1]), // Only first dynasty unlocked by default
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

	const handlePlay = (dynasty: Dynasty) => {
		const themeParams = dynasty.boardTheme
			? `&themeLight=${encodeURIComponent(dynasty.boardTheme.light)}&themeDark=${encodeURIComponent(dynasty.boardTheme.dark)}&themeAccent=${encodeURIComponent(dynasty.boardTheme.accent)}`
			: '';
		router.push(
			`/game/offline?mode=singleplayer&level=${dynasty.botLevel}&autostart=1&color=white${themeParams}`
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

	// Helper to find NFT status for a dynasty
	const getNftStatusForDynasty = (dynasty: Dynasty | null) => {
		if (!dynasty || !userTransactions.length) return undefined;

		// Find a transaction related to this dynasty's skin
		// WE assume the backend logs "Dynasty Skin (Level X)" or similar
		// Or we match based on approximate timestamp vs unlock time?
		// Ideally we'd have `nftId` or `metadataId` in the transaction log.
		// For now, let's filter by type "SKIN_MINTING" and try to match.
		// Or we just find ANY skin minting transaction that might be relevant.

		// BETTER: The backend `logSkinMinting` uses `transactionType: 'SKIN_MINTING'`
		// and puts details in description or metadata?
		// Let's assume the transaction list contains `transactionType` and `nftId`.

		// Simplest heuristic for now: Find latest "SKIN_MINTING" if recent?
		// No, that's flaky. 
		// Let's look for `nftId` matching the dynasty reward (if we knew it).
		// Since we don't have the token ID config here in frontend, 
		// we will check if ANY 'SKIN_MINTING' transaction exists.

		// If we want to be precise, we need `skinTokenId` in the Dynasty object from API.
		// Assuming userTransactions has a field `nftId` or similar from the log.

		const tx = userTransactions.find(t =>
			t.transactionType === 'SKIN_MINTING' &&
			(t.skinName?.includes(dynasty.name) || t.description?.includes('Skin')) // Loose match
		);

		if (tx) {
			return {
				txHash: tx.transactionHash,
				isMinting: tx.status === 'pending',
				isConfirmed: tx.status === 'confirmed' || tx.status === 'success'
			};
		}
		return undefined;
	};

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
					<span className={styles.progressLabel}>Dynasty Level</span>
					<span className={`${styles.progressValue} ${styles.progressValueLarge}`}>
						{currentState.dynastyLevel}
					</span>
				</div>
				<div className={styles.progressCard}>
					<span className={styles.progressLabel}>Dynasty</span>
					<span className={styles.progressValue}>
						{currentState.currentDynasty.name}
					</span>
				</div>
				<div className={styles.progressCard}>
					<span className={styles.progressLabel}>Rank</span>
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

			{/* XP Progress Bar */}
			<ProgressBar
				dynastyLevel={currentState.dynastyLevel}
				dynastyXp={currentState.dynastyXp}
				xpToNextLevel={currentState.xpToNextLevel}
				xpProgressPercentage={currentState.xpProgressPercentage}
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
				nftStatus={getNftStatusForDynasty(selectedDynasty)}
				onClose={handleCloseModal}
				onPlay={handlePlay}
			/>
		</div>
	);
}
