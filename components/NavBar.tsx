import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaUser, FaPuzzlePiece, FaSignOutAlt, FaWallet } from 'react-icons/fa';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import Image from 'next/image';
import Toast from '././ui/Toast';
import ConfirmModal from './ui/ConfirmModal';
import { Button } from './ui/button';
import { useGlobalStorage } from '@/hooks/GlobalStorage';

export default function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const pathname = usePathname();

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const userAreaRef = useRef<HTMLDivElement | null>(null);

  // LẤY TỪ GLOBAL STORAGE (đúng như code ban đầu của bạn)
  const {
    userId,
    accessToken,
    userName,
    avatar,
    clearAuth
  } = useGlobalStorage();

  const isLoggedIn = !!userId && !!accessToken;
  const displayName = userName || 'User 1';
  const avatarUrl = avatar || '/img/DefaultUser.png';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (mobileDrawerRef.current && !mobileDrawerRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowDropdown(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (userAreaRef.current && !userAreaRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const navItems = [
    { label: 'Home', href: '/home' },
    { label: 'Our Market', href: '/market' },
    { label: 'Play Game', href: '/game/online' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Tournament', href: '/tournament' },
    { label: 'Settings', href: '/settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/home' && (pathname === '/' || pathname === '/home')) return true;
    return pathname?.startsWith(href);
  };

  return (
    <nav ref={navRef} className="w-full bg-black text-white px-6 py-4">
      <Toast type="success" message="Logged In" onClose={() => setToast(null)} />

      <ConfirmModal
        isOpen={showConfirmLogout}
        message="Are you sure you want to log out?"
        onConfirm={() => {
          clearAuth();
          router.push('/sign_in');
          setShowConfirmLogout(false);
        }}
        onCancel={() => setShowConfirmLogout(false)}
      />

      {/* RIGHT SIDEBAR — DESKTOP */}
      <nav className="hidden md:flex fixed right-0 top-0 h-screen w-[280px] bg-black text-white border-l border-neutral-700 z-50 px-7 py-7 flex-col">
        {/* Header to hơn */}
        <div className="shrink-0">
          <div className="flex items-center gap-4">
            <Image src="/img/FintechLogo.png" alt="logo" width={80} height={56} />
            <span className="font-extrabold text-[24px] leading-6">FTC Chess Game</span>
          </div>
        </div>

        {/* Menu giữa: to và đều */}
        <div className="flex-1 flex items-center">
          <ul className="flex flex-col gap-7">
            {navItems.map((it) => (
              <li
                key={it.href}
                onClick={() => router.push(it.href)}
                className={`cursor-pointer text-[20px] font-bold tracking-wide transition-colors ${isActive(it.href) ? 'text-[#E9B654]' : 'text-white hover:text-[#E9B654]'
                  }`}
              >
                {it.label}
              </li>
            ))}
          </ul>
        </div>

        {/* VÍ + USER Ở ĐÁY */}
        <div className="relative pb-2 pt-3 border-t border-white/10" ref={userAreaRef}>
          {/* Wallet chuyển xuống ngay trên user */}
          {isLoggedIn && (
            <div className="mb-3 flex items-center gap-2 text-[14px]">
              <FaWallet className="text-white text-[20px]" />
              <span>0</span>
            </div>
          )}

          {isLoggedIn ? (
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <div className="flex items-center gap-3">
                <Image src={avatarUrl} alt="avatar" width={50} height={48} className="rounded-full" />
                <div className="text-[20px] font-medium">{displayName}</div>
              </div>

              <Button className="h-9 px-3 text-sm bg-white text-black hover:bg-neutral-200">Menu</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push('/sign_in')}
                className="h-9 px-4 text-sm bg-gradient-to-b from-[#E8BB05] via-[#B98F00] to-[#7A651C] text-black hover:text-white"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/sign_up')}
                className="h-9 px-4 text-sm bg-white text-black hover:bg-black hover:text-white border border-white"
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Dropdown xuất hiện TRÊN user area */}
          {isLoggedIn && userMenuOpen && (
            <div className="absolute right-0 bottom-14 w-52 bg-black border border-white/20 rounded-md shadow-xl">
              <div
                onClick={() => { setUserMenuOpen(false); router.push('/profile'); }}
                className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-sm"
              >
                <FaUser /> <span>Profile</span>
              </div>
              <div
                onClick={() => { setUserMenuOpen(false); router.push('/skins'); }}
                className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-sm"
              >
                <FaPuzzlePiece /> <span>My Skins</span>
              </div>
              <div
                onClick={() => { setUserMenuOpen(false); setShowConfirmLogout(true); }}
                className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-sm"
              >
                <FaSignOutAlt /> <span>Log out</span>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* MOBILE giữ bố cục cũ, ví để cùng khu user */}
      <button
        aria-label="Open Menu"
        onClick={() => setMobileOpen((v) => !v)}
        className="md:hidden fixed right-4 top-4 z-50 p-2 rounded-md bg-black/80 border border-white/20"
      >
        {mobileOpen ? <HiX className="w-6 h-6 text-white" /> : <HiOutlineMenuAlt3 className="w-6 h-6 text-white" />}
      </button>

      <div
        className={`md:hidden fixed right-0 top-0 h-screen w-[78%] max-w-[300px] bg-black text-white border-l border-neutral-700 px-6 py-6 z-40 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center gap-3">
          <img src="/img/FintechLogo.png" alt="logo" className="w-9 h-9" />
          <span className="font-extrabold text-[18px]">FTC Chess Game</span>
        </div>

        <ul className="flex flex-col gap-6 mt-6">
          <li onClick={() => { router.push('/home'); setMobileOpen(false); }} className="text-[18px] font-semibold cursor-pointer hover:text-[#E9B654]">Home</li>
          <li onClick={() => { router.push('/market'); setMobileOpen(false); }} className="text-[18px] font-semibold cursor-pointer hover:text-[#E9B654]">Our Market</li>
          <li onClick={() => { router.push('/game/online'); setMobileOpen(false); }} className="text-[18px] font-semibold cursor-pointer hover:text-[#E9B654]">Play Game</li>
          <li onClick={() => { router.push('/leaderboard'); setMobileOpen(false); }} className="text-[18px] font-semibold cursor-pointer hover:text-[#E9B654]">Leaderboard</li>
          <li onClick={() => { router.push('/tournament'); setMobileOpen(false); }} className="text-[18px] font-semibold cursor-pointer hover:text-[#E9B654]">Tournament</li>
          <li onClick={() => { router.push('/settings'); setMobileOpen(false); }} className="text-[18px] font-semibold cursor-pointer hover:text-[#E9B654]">Settings</li>
        </ul>

        <div className="absolute left-0 right-0 bottom-4 px-6">
          <div className="flex items-center gap-3 mb-2">
            <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-full" />
            <div className="text-lg font-medium">{displayName}</div>
          </div>
          <div className="mb-3 flex items-center gap-2 text-[14px]">
            <FaWallet className="text-white text-[16px]" />
            <span>0</span>
          </div>
          <Button onClick={() => setShowConfirmLogout(true)} className="w-full h-10 bg-white text-black hover:bg-neutral-200">Log out</Button>
        </div>
      </div>
    </>
  );
}
