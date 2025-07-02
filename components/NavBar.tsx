"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaPuzzlePiece, FaSignOutAlt, FaWallet, FaChevronDown } from 'react-icons/fa';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import { useGlobalStorage } from '@/hooks/GlobalStorage';
import Toast from '././ui/Toast';
import ConfirmModal from './ui/ConfirmModal';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const setNavbarHeight = () => {
      const height = navRef.current?.offsetHeight || 0;
      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
    };

    setNavbarHeight();
    window.addEventListener('resize', setNavbarHeight);

    return () => window.removeEventListener('resize', setNavbarHeight);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const router = useRouter();

  const {
    userId,
    accessToken,
    userName,
    avatar,
    clearAuth
  } = useGlobalStorage();

  const isLoggedIn = !!userId && !!accessToken;

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const handleAvatarClick = () => setShowDropdown(prev => !prev);
  const displayName = userName || "User 1";
  const avatarUrl = avatar || "/img/DefaultUser.png";

  return (
    <nav ref={navRef} className="w-full bg-black text-white font-[Poppins] px-6 py-4">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

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

      {/* Desktop */}
      <div className="hidden md:flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img onClick={() => router.push('/')} src="/img/FintechLogo.png" alt="logo" className="w-[80px] h-[50px]" />
          <span className="font-bold text-[25.2px] leading-[38px]">FTC Chess Game</span>
        </div>

        <div className="flex items-center gap-6 text-[18px] font-semibold">
          <span onClick={() => router.push('/home')} className="cursor-pointer hover:text-[#E9B654]">Home</span>
          <span onClick={() => router.push('/market')} className="cursor-pointer hover:text-[#E9B654]">Our Market</span>

          {isLoggedIn ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FaWallet className="text-white text-xl" />
                <span>0</span>
              </div>
              <div className="relative" ref={dropdownRef}>
                <div onClick={handleAvatarClick} className="flex items-center gap-2 cursor-pointer">
                  <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full" />
                  <FaChevronDown className="text-white" />
                </div>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-black border border-white rounded-md shadow-lg z-50">
                    <div onClick={() => router.push('/profile')} className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-[14px] font-medium">
                      <FaUser /> <span>Profile</span>
                    </div>
                    <div onClick={() => router.push('/skins')} className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-[14px] font-medium">
                      <FaPuzzlePiece /> <span>My Skins</span>
                    </div>
                    <div onClick={() => setShowConfirmLogout(true)} className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-[14px] font-medium">
                      <FaSignOutAlt /> <span>Log out</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  router.push('/game/offline');
                }}
                className="px-4 py-2 w-[124px] h-[35px] text-black rounded-[6px] font-semibold bg-gradient-to-b from-[#E8BB05] via-[#B98F00] to-[#7A651C] hover:from-[#D6A900] hover:via-[#A68E3C] hover:to-[#8F7A2B] hover:text-white transition-colors duration-300 flex justify-center items-center">
                New Game
              </button>

            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/sign_in')}
                className="px-4 py-2 w-[100px] h-[35px] text-white rounded-[6px] font-semibold bg-gradient-to-b from-[#E8BB05] via-[#B98F00] to-[#7A651C] hover:from-[#D6A900] hover:via-[#A68E3C] hover:to-[#8F7A2B] hover:text-black transition-colors duration-300 flex justify-center items-center">
                Sign In
              </button>

              <button onClick={() => router.push('/sign_up')}
                className=" w-[100px] h-[35px] text-black bg-white hover:bg-black hover:text-white rounded-[6px] font-semibold border border-white transition-colors duration-300 flex justify-center items-center">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img onClick={() => router.push('/')} src="/img/FintechLogo.png" alt="logo" className="w-[70px] h-[45px]" />
          <span className="font-bold text-xl">FTC Chess Game</span>
        </div>
        <p onClick={() => setMobileOpen(!mobileOpen)} className="text-white text-[34px]">
          {mobileOpen ? <HiX className="text-white text-[34px]" /> : <HiOutlineMenuAlt3 className="text-white text-[30px]" />}
        </p>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[72px] left-0 w-full bg-black z-50 p-6 flex flex-col items-center gap-6 text-white">
          {isLoggedIn && (
            <div className="flex items-center justify-between w-full px-2">
              <div className="flex gap-3 items-center">
                <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-semibold text-lg">{displayName}</p>
                  <p onClick={() => router.push('/profile')} className="text-[#E9B654] text-sm underline bg-transparent border-none px-0 py-0">
                    See more
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaWallet className="text-white text-xl" />
                <span>1,500</span>
              </div>
            </div>
          )}

          <span onClick={() => { router.push('/home'); setMobileOpen(false); }} className="text-[3.5vh] font-semibold cursor-pointer text-center w-full">
            Home
          </span>
          <span onClick={() => { router.push('/market'); setMobileOpen(false); }} className="text-[3.5vh] font-semibold cursor-pointer text-center w-full">
            Our Market
          </span>
          {isLoggedIn && (
            <span onClick={() => { router.push('/skins'); setMobileOpen(false); }} className="text-[3.5vh] font-semibold cursor-pointer text-center w-full">
              My Skins
            </span>
          )}

          <div className="w-full flex flex-col gap-3 mt-4 items-center">
            {isLoggedIn ? (
              <button onClick={() => setShowConfirmLogout(true)} className="w-[352px] h-[40px] text-[3.5vh] text-black rounded-[6px] font-semibold bg-gradient-to-b from-[#E8BB05] via-[#9E7C00] to-[#605715] flex justify-center items-center">
                Log Out
              </button>
            ) : (
              <>
                <button onClick={() => router.push('/sign_in')} className="w-[200px] h-[40px] text-[3.5vh] text-black rounded-[6px] font-semibold bg-gradient-to-b from-[#F7D447] via-[#D6A900] to-[#A68E3C] flex justify-center items-center">
                  Sign In
                </button>
                <button onClick={() => router.push('/sign_up')} className="w-[200px] h-[40px] text-[3.5vh] text-black bg-white hover:bg-black hover:text-white rounded-[6px] font-semibold border border-white transition-colors duration-300 flex justify-center items-center">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}