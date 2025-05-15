import { useState } from 'react';
import { FaUser, FaPuzzlePiece, FaSignOutAlt, FaWallet, FaChevronDown } from 'react-icons/fa';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleAvatarClick = () => setShowDropdown(prev => !prev);

  return (
    <nav className="w-full bg-black text-white flex justify-between items-center px-12 py-4 shadow-sm relative font-[Poppins]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full"></div>
        <span className="font-bold text-[25.2px] leading-[38px]">FTC Chess Game</span>
      </div>

      <div className="flex items-center gap-10 text-[18px] font-semibold">
        <a href="#" className="hover:text-[#E9B654] transition-colors">Home</a>
        <a href="#" className="hover:text-[#E9B654] transition-colors">Our Market</a>

        {isLoggedIn ? (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FaWallet className="text-white text-xl" />
              <span>1,500</span>
            </div>

            <div className="relative">
              <button onClick={handleAvatarClick} className="flex items-center gap-2">
                <img src="/avatar.png" alt="avatar" className="w-10 h-10 rounded-full" />
                <FaChevronDown className="text-white" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-black border border-white rounded-md shadow-lg z-50">
                  <div className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-[14px] font-medium font-[Poppins]">
                    <FaUser /> <span>Profile</span>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-[14px] font-medium font-[Poppins]">
                    <FaPuzzlePiece /> <span>My Skins</span>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-2 hover:bg-gray-800 cursor-pointer text-[14px] font-medium font-[Poppins]">
                    <FaSignOutAlt /> <span>Log out</span>
                  </div>
                </div>
              )}
            </div>

            {}
            <button className="px-4 py-2 bg-gradient-to-b from-[#E8BB05] via-[#9E7C00] to-[#605715] text-white rounded-md font-semibold">
              New Game
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gradient-to-b from-[#E8BB05] via-[#9E7C00] to-[#605715] text-white rounded-md font-semibold">
              Log In
            </button>
            <button className="px-4 py-2 border-2 border-[#E9B654] text-white rounded-md font-semibold">
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
