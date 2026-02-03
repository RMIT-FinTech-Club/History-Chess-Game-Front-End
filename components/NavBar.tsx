import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaUser, FaSignOutAlt, FaWallet, FaChevronDown } from 'react-icons/fa';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import { IoSettingsSharp, IoShirt } from "react-icons/io5";
import Image from 'next/image';
import { useGlobalStorage } from '@/hooks/GlobalStorage';
import ConfirmModal from './ui/ConfirmModal';
import { Button } from './ui/button';
import { GLOBAL_NAV_ITEMS } from './navigation/nav-config';
import Link from 'next/link';
import { useSocketContext } from '@/context/WebSocketContext';
import axiosInstance from '@/config/apiConfig';

export default function Navbar() {
	const [showDropdown, setShowDropdown] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [showConfirmLogout, setShowConfirmLogout] = useState(false);
	const pathname = usePathname();

	const mobileDrawerRef = useRef<HTMLDivElement | null>(null);
	const router = useRouter();

	const { userId, accessToken, userName, avatar, clearAuth, walletBalance, setWalletBalance } = useGlobalStorage();
	// Use default disconnect state if context is unavailable (i.e. rendered outside SocketProvider)
	const { isConnected } = useSocketContext();

	const isLoggedIn = !!userId && !!accessToken;
	const avatarUrl = avatar || "/img/DefaultUser.png";
	const navRef = useRef<HTMLDivElement | null>(null);

	// Helper function to format balance (consistent with Profile page)
	const formatBalance = (balance: string): string => {
		const num = parseFloat(balance);
		if (isNaN(num)) return "0";
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toFixed(0);
	};

	// Fetch wallet balance on mount or when auth changes
	useEffect(() => {
		const fetchBalance = async () => {
			if (!userId || !accessToken) return;
			try {
				const response = await axiosInstance.get('/wallet/balance', {
					headers: { Authorization: `Bearer ${accessToken}` }
				});
				if (response.data.success) {
					const balance = response.data.data.totalGameCoins || '0';
					setWalletBalance(balance);
				}
			} catch (error) {
				console.error("Failed to fetch wallet balance:", error);
			}
		};

		if (isLoggedIn) {
			fetchBalance();
		}
	}, [userId, accessToken, isLoggedIn, setWalletBalance]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (mobileDrawerRef.current && !mobileDrawerRef.current.contains(event.target as Node)) {
				setMobileOpen(false);
			}
			// Close user dropdown if clicking outside
			if (showDropdown && !(event.target as Element).closest('.user-dropdown-trigger')) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showDropdown]);

	useEffect(() => {
		setShowDropdown(false);
		setMobileOpen(false);
	}, [pathname]);

	const toggleDropdown = () => {
		setShowDropdown((prev) => !prev);
	};

	useEffect(() => {
		const setNavbarHeight = () => {
			if (navRef.current) {
				const rect = navRef.current.getBoundingClientRect();
				// Use the bottom position to account for top margin + height
				// Add a small buffer (16px) for spacing
				const heightWithMargin = rect.bottom + 16;
				document.documentElement.style.setProperty("--navbar-height", `${heightWithMargin}px`);
			}
		};

		setNavbarHeight();
		window.addEventListener("resize", setNavbarHeight);
		return () => window.removeEventListener("resize", setNavbarHeight);
	}, []);

	return (
		<nav
			ref={navRef}
			className="fixed top-0 left-0 right-0 z-50 glass-gold border-b-0 rounded-b-xl mx-2 mt-2 px-6 py-3 transition-all duration-300"
		>
			<ConfirmModal
				isOpen={showConfirmLogout}
				message="Are you sure you want to log out?"
				onConfirm={() => {
					clearAuth();
					router.push("/sign_in");
					setShowConfirmLogout(false);
				}}
				onCancel={() => setShowConfirmLogout(false)}
			/>

			{/* Desktop View */}
			<div className="hidden md:flex justify-between items-center">
				{/* Logo */}
				<Link href="/home" className="flex items-center gap-3 cursor-pointer group">
					<div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
						<Image src="/img/FintechLogo.png" alt="logo" fill className="object-contain" />
					</div>
					<span className="font-display font-bold text-2xl gold-gradient-text tracking-wide">
						FTC CHESS
					</span>
				</Link>

				{/* Primary Navigation */}
				<div className="flex items-center gap-8">
					{GLOBAL_NAV_ITEMS.map((item) => {
						const isActive = pathname === item.href;
						const Icon = item.icon;
						return (
							<Link
								key={item.label}
								href={item.href}
								className={`
									flex items-center gap-2 text-sm font-serif font-semibold tracking-wider transition-all duration-300
									${isActive ? 'text-gold-light scale-105' : 'text-white/70 hover:text-gold-shimmer hover:scale-105'}
								`}
							>
								{Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-gold-royal' : 'text-white/50'}`} />}
								{item.label}
							</Link>
						);
					})}
				</div>

				{/* Right Section: Auth & Profile */}
				<div className="flex items-center gap-6">
					{isLoggedIn ? (
						<>
							<div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-gold-deep/30">
								<FaWallet className="text-gold-royal text-sm" />
								<span className="font-serif font-bold text-gold-light text-sm">{formatBalance(walletBalance)}</span>
							</div>

							{/* Avatar Dropdown */}
							<div className="relative user-dropdown-trigger">
								<div
									onClick={toggleDropdown}
									className="flex items-center gap-2 cursor-pointer group"
								>
									<div className="relative w-9 h-9 rounded-full border border-gold-deep/50 overflow-hidden transition-all duration-300 group-hover:border-gold-light group-hover:shadow-[0_0_10px_rgba(212,175,55,0.3)]">
										<Image
											src={avatarUrl}
											alt="avatar"
											fill
											className="object-cover"
										/>
									</div>
									{/* Online Status Indicator */}
									{isConnected && (
										<div className="absolute bottom-0 right-3 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black shadow-[0_0_5px_rgba(34,197,94,0.6)] animate-pulse" title="Online" />
									)}
									<FaChevronDown className={`text-white/50 text-xs transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
								</div>

								{showDropdown && (
									<div className="absolute right-0 mt-3 w-56 glass-gold rounded-lg shadow-xl overflow-hidden animate-fade-in border border-gold-deep/30">
										<div className="px-4 py-3 border-b border-white/10 bg-black/40">
											<p className="text-sm font-serif text-white truncate">{userName}</p>
											<p className="text-xs font-sans text-white/50 truncate">Player</p>
										</div>

										<div className="py-1">
											<div onClick={() => router.push("/profile")} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gold-royal/10 cursor-pointer text-sm text-white/80 hover:text-gold-light transition-colors">
												<FaUser className="text-xs" /> <span>Profile</span>
											</div>
											<div onClick={() => router.push("/market")} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gold-royal/10 cursor-pointer text-sm text-white/80 hover:text-gold-light transition-colors">
												<IoShirt className="text-xs" /> <span>My Loadout</span>
											</div>
											<div onClick={() => router.push("/profile")} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gold-royal/10 cursor-pointer text-sm text-white/80 hover:text-gold-light transition-colors">
												<IoSettingsSharp className="text-xs" /> <span>Settings</span>
											</div>
											<div className="h-px bg-white/10 my-1 mx-2" />
											<div onClick={() => setShowConfirmLogout(true)} className="px-4 py-2.5 flex items-center gap-3 hover:bg-red-500/10 cursor-pointer text-sm text-red-400 hover:text-red-300 transition-colors">
												<FaSignOutAlt className="text-xs" /> <span>Log Out</span>
											</div>
										</div>
									</div>
								)}
							</div>
						</>
					) : (
						<div className="flex items-center gap-3">
							<Button
								onClick={() => router.push("/sign_in")}
								className="px-5 py-2 h-9 text-xs font-serif font-bold tracking-wide text-gold-light hover:text-white bg-transparent border border-gold-deep/50 hover:border-gold-royal hover:bg-gold-royal/10 transition-all duration-300 rounded-md"
							>
								SIGN IN
							</Button>

							<Button
								onClick={() => router.push("/sign_up")}
								className="px-5 py-2 h-9 text-xs font-serif font-bold tracking-wide text-black bg-gradient-to-r from-gold-main via-gold-royal to-gold-dark hover:from-gold-shimmer hover:via-gold-main hover:to-gold-royal transition-all duration-300 rounded-md shadow-[0_0_15px_rgba(232,187,5,0.2)] hover:shadow-[0_0_20px_rgba(232,187,5,0.4)]"
							>
								JOIN BATTLE
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Mobile Header */}
			<div className="md:hidden flex justify-between items-center">
				<div onClick={() => router.push("/home")} className="flex items-center gap-2 cursor-pointer">
					<Image src="/img/FintechLogo.png" alt="logo" width={40} height={40} />
					<span className="font-display font-bold text-xl gold-gradient-text">FTC CHESS</span>
				</div>
				<button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-2">
					{mobileOpen ? <HiX size={24} /> : <HiOutlineMenuAlt3 size={24} />}
				</button>
			</div>

			{/* Mobile Drawer */}
			{mobileOpen && (
				<div ref={mobileDrawerRef} className="md:hidden fixed inset-0 top-[60px] bg-black/95 backdrop-blur-xl z-40 p-6 flex flex-col gap-6 animate-fade-in border-t border-gold-deep/30">
					<div className="flex flex-col gap-4">
						{GLOBAL_NAV_ITEMS.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.label}
									href={item.href}
									onClick={() => setMobileOpen(false)}
									className="flex items-center gap-4 text-xl font-serif text-white/80 hover:text-gold-light py-2 border-b border-white/5"
								>
									{Icon && <Icon className="text-gold-muted" />}
									{item.label}
								</Link>
							);
						})}
					</div>

					<div className="mt-auto flex flex-col gap-4">
						{isLoggedIn ? (
							<Button
								onClick={() => setShowConfirmLogout(true)}
								className="w-full h-12 text-black font-bold font-serif bg-gradient-to-r from-gold-main to-gold-royal rounded-lg"
							>
								LOG OUT
							</Button>
						) : (
							<div className="grid grid-cols-2 gap-4">
								<Button onClick={() => router.push("/sign_in")} className="h-12 border border-gold-deep text-gold-light font-bold font-serif rounded-lg">
									SIGN IN
								</Button>
								<Button onClick={() => router.push("/sign_up")} className="h-12 bg-gold-royal text-black font-bold font-serif rounded-lg">
									JOIN
								</Button>
							</div>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}