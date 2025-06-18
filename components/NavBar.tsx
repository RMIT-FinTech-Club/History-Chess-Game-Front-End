"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaPuzzlePiece, FaSignOutAlt, FaWallet, FaChevronDown } from 'react-icons/fa';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import { useGlobalStorage } from '@/hooks/GlobalStorage';
import Toast from '././ui/Toast';
import ConfirmModal from './ui/ConfirmModal';
import { Button } from './ui/button';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

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


    <nav className="w-full bg-black text-white px-6 py-4">
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
        <div className="flex items-center gap-[1vw]">
          <img onClick={() => router.push('/')} src="/img/FintechLogo.png" alt="logo" className="w-[8vw] max-w-[80px] h-[6vh] max-h-[50px]" />
          <span className="font-bold text-[3rem] md:text-[1.8rem] leading-[2.5rem]">FTC Chess Game</span>
        </div>

        <div className="flex items-center gap-6 text-[18px] font-semibold">
          <span onClick={() => router.push('/home')} className="cursor-pointer hover:text-[#E9B654]">Play Game</span>
          <span onClick={() => router.push('/market')} className="cursor-pointer hover:text-[#E9B654]">Our Market</span>

          {isLoggedIn ? (
            <div className="flex items-center gap-[2vw]">
              <div className="flex items-center gap-[0.5vw]">
                <FaWallet className="text-white text-[1.3rem]" />
                <span>0</span>
              </div>
              <div className="relative">
                <div onClick={handleAvatarClick} className="flex items-center gap-[0.5vw] cursor-pointer">
                  <img src={avatarUrl} alt="avatar" className="w-[2.5rem] h-[2.5rem] rounded-full" />
                  <FaChevronDown className="text-white" />
                </div>
                {showDropdown && (
                  <div className="absolute right-0 mt-[0.5vh] w-[14rem] bg-black border border-white rounded-md shadow-lg z-50">
                    <div onClick={() => router.push('/profile')} className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-[0.9rem] font-medium">
                      <FaUser /> <span>Profile</span>
                    </div>
                    <div onClick={() => router.push('/skins')} className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-[0.9rem] font-medium">
                      <FaPuzzlePiece /> <span>My Skins</span>
                    </div>
                    <div onClick={() => setShowConfirmLogout(true)} className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-[0.9rem] font-medium">
                      <FaSignOutAlt /> <span>Log out</span>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  router.push('/game/offline');
                }}
                className="px-4 py-2 w-[124px] h-[35px] text-black rounded-[6px] font-semibold bg-gradient-to-b from-[#E8BB05] via-[#B98F00] to-[#7A651C] hover:from-[#D6A900] hover:via-[#A68E3C] hover:to-[#8F7A2B] hover:text-white transition-colors cursor-pointer duration-300 flex justify-center items-center">
                AI Practice
              </Button>

            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button onClick={() => router.push('/sign_in')}
                className="px-4 py-2 w-[100px] h-[35px] text-white rounded-[6px] font-semibold bg-gradient-to-b from-[#E8BB05] via-[#B98F00] to-[#7A651C] hover:from-[#D6A900] hover:via-[#A68E3C] hover:to-[#8F7A2B] hover:text-black transition-colors duration-300 flex justify-center items-center">
                Sign In
              </Button>

              <Button onClick={() => router.push('/sign_up')}
                className=" w-[100px] h-[35px] text-black bg-white hover:bg-black hover:text-white rounded-[6px] font-semibold border border-white transition-colors duration-300 flex justify-center items-center">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex justify-between items-center">
        <div className="flex items-center gap-[1vw]">
          <img onClick={() => router.push('/')} src="/img/FintechLogo.png" alt="logo" className="w-[7vw]" />
          <span className="font-bold text-[3rem] md:text-[1.8rem]">FTC Chess Game</span>
        </div>
        <p onClick={() => setMobileOpen(!mobileOpen)} className="text-white text-[4vw]">
          {mobileOpen ? <HiX className="text-white text-[4vw]" /> : <HiOutlineMenuAlt3 className="text-white text-[3vw]" />}
        </p>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[9vh] left-0 w-full bg-black z-50 p-[2vw] flex flex-col items-center gap-[2vh] text-white">
          {isLoggedIn && (
            <div className="flex items-center justify-between w-full px-[1vw]">
              <div className="flex gap-[1vw] items-center">
                <img src={avatarUrl} alt="avatar" className="w-[3rem] h-[3rem] rounded-full" />
                <div>
                  <p className="font-semibold text-[1.1rem]">{displayName}</p>
                  <p onClick={() => router.push('/profile')} className="text-[#E9B654] text-[0.9rem] underline bg-transparent border-none px-0 py-0">
                    See more
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-[0.5vw]">
                <FaWallet className="text-white text-[1.3rem]" />
                <span>1,500</span>
              </div>
            </div>
          )}

          <span onClick={() => { router.push('/home'); setMobileOpen(false); }} className="text-[2rem] font-semibold cursor-pointer text-center w-full">
            Home
          </span>
          <span onClick={() => { router.push('/market'); setMobileOpen(false); }} className="text-[2rem] font-semibold cursor-pointer text-center w-full">
            Our Market
          </span>
          {isLoggedIn && (
            <span onClick={() => { router.push('/skins'); setMobileOpen(false); }} className="text-[2rem] font-semibold cursor-pointer text-center w-full">
              My Skins
            </span>
          )}

          <div className="w-full flex flex-col gap-[1.5vh] mt-[2vh] items-center">
            {isLoggedIn ? (
              <Button onClick={() => setShowConfirmLogout(true)} className="w-[352px] h-[40px] text-[3.5vh] text-black rounded-[6px] font-semibold bg-gradient-to-b from-[#E8BB05] via-[#9E7C00] to-[#605715] flex justify-center items-center">
                Log Out
              </Button>
            ) : (
              <>
                <Button onClick={() => router.push('/sign_in')} className="w-[200px] h-[40px] text-[3.5vh] text-black rounded-[6px] font-semibold bg-gradient-to-b from-[#F7D447] via-[#D6A900] to-[#A68E3C] flex justify-center items-center">
                  Sign In
                </Button>
                <Button onClick={() => router.push('/sign_up')} className="w-[200px] h-[40px] text-[3.5vh] text-black bg-white hover:bg-black hover:text-white rounded-[6px] font-semibold border border-white transition-colors duration-300 flex justify-center items-center">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
