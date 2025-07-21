import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaUser, FaPuzzlePiece, FaSignOutAlt, FaWallet, FaChevronDown } from 'react-icons/fa';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import Image from 'next/image';
import { useGlobalStorage } from '@/hooks/GlobalStorage';
import Toast from '././ui/Toast';
import ConfirmModal from './ui/ConfirmModal';
import { Button } from './ui/button';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const pathname = usePathname();

  const dropdownRef = useRef<HTMLDivElement | null>(null);  
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null); 

  const router = useRouter();

  const {
    userId,
    accessToken,
    userName,
    avatar,
    clearAuth
  } = useGlobalStorage();

  const isLoggedIn = !!userId && !!accessToken;
  const displayName = userName || "User 1";
  const avatarUrl = avatar || "/img/DefaultUser.png";
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

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
    const setNavbarHeight = () => {
      const height = navRef.current?.offsetHeight || 0;
      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
    };

    setNavbarHeight();
    window.addEventListener('resize', setNavbarHeight);

    return () => window.removeEventListener('resize', setNavbarHeight);
  }, []);

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

      {/* Desktop View */}
      <div className="hidden md:flex justify-between items-center">
        <div onClick={() => router.push('/home')} className="flex items-center gap-[1vw] cursor-pointer">
          <Image src="/img/FintechLogo.png" alt="logo" width={80} height={80} />
          <span className="font-bold text-[3rem] md:text-[1.8rem] leading-[2.5rem]">FTC Chess Game</span>
        </div>

        <div className="flex items-center gap-6 text-[18px] font-semibold">
          <span onClick={() => router.push('/game/offline')} className="cursor-pointer hover:text-[#E9B654]">AI Practice</span>
          <span onClick={() => router.push('/market')} className="cursor-pointer hover:text-[#E9B654]">Our Market</span>

          {isLoggedIn ? (
            <div className="flex items-center gap-[2vw]">
              <div className="flex items-center gap-[0.5vw]">
                <FaWallet className="text-white text-[1.3rem]" />
                <span>0</span>
              </div>

              {/* Avatar Dropdown */}
              <div className="relative">
                <div onClick={() => setShowDropdown((prev) => !prev)} className="flex items-center gap-[0.5vw] cursor-pointer">
                  <Image src={avatarUrl} alt="avatar" className="w-[2.5rem] h-[2.5rem] rounded-full" width={25} height={25} />
                  <FaChevronDown className="text-white" />
                </div>

                {showDropdown && (
                  <div ref={dropdownRef} className="absolute right-0 mt-[0.5vh] w-[14rem] bg-black border border-white rounded-md shadow-lg z-50">
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
                onClick={() => router.push('/game/online')}
                className="px-4 py-2 w-[124px] h-[35px] text-black rounded-[6px] font-semibold bg-gradient-to-b from-[#E8BB05] via-[#B98F00] to-[#7A651C] hover:from-[#D6A900] hover:via-[#A68E3C] hover:to-[#8F7A2B] hover:text-white transition-colors cursor-pointer duration-300 flex justify-center items-center" >
                Play Game
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button onClick={() => router.push('/sign_in')} className="px-4 py-2 w-[100px] h-[35px] text-white rounded-[6px] font-semibold bg-gradient-to-b from-[#E8BB05] via-[#B98F00] to-[#7A651C] hover:from-[#D6A900] hover:via-[#A68E3C] hover:to-[#8F7A2B] hover:text-black transition-colors duration-300 flex justify-center items-center hover:cursor-pointer">
                Sign In
              </Button>

              <Button onClick={() => router.push('/sign_up')} className="w-[100px] h-[35px] text-black bg-white hover:bg-black hover:text-white rounded-[6px] font-semibold border border-white transition-colors duration-300 flex justify-center items-center hover:cursor-pointer">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex justify-between items-center">
        <div onClick={() => router.push('/home')} className="flex items-center gap-[1vw] cursor-pointer">
          <img src="/img/FintechLogo.png" alt="logo" className="w-[7vw]" />
          <span className="font-bold text-[3rem] md:text-[1.8rem]">FTC Chess Game</span>
        </div>
        <p onClick={() => setMobileOpen(!mobileOpen)} className="text-white text-[4vw]">
          {mobileOpen ? <HiX className="text-white text-[4vw]" /> : <HiOutlineMenuAlt3 className="text-white text-[3vw]" />}
        </p>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div ref={mobileDrawerRef} className="md:hidden absolute top-[9vh] left-0 w-full bg-black z-50 p-[2vw] flex flex-col items-center gap-[2vh] text-white">
          <span onClick={() => { router.push('/home'); setMobileOpen(false); }} className="text-[2rem] font-semibold cursor-pointer text-center w-full">
            Home
          </span>
          <span onClick={() => { router.push('/market'); setMobileOpen(false); }} className="text-[2rem] font-semibold cursor-pointer text-center w-full">
            Our Market
          </span>

          {isLoggedIn && (
            <>
              <span onClick={() => { router.push('/game/online'); setMobileOpen(false); }} className="text-[2rem] font-semibold cursor-pointer text-center w-full hover:text-[#E9B654]">
                Play Game
              </span>
              <span onClick={() => { router.push('/game/offline'); setMobileOpen(false); }} className="text-[2rem] font-semibold cursor-pointer text-center w-full hover:text-[#E9B654]">
                AI Practice
              </span>
            </>
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