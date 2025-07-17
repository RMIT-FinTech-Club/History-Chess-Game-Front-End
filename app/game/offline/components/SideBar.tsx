import Link from "next/link";
import { Home, Package, Users } from "lucide-react";

const SideBar = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div
      className={`fixed top-0 right-0 z-40 h-[100dvh] min-w-[calc(6vw+5vh)] bg-black flex flex-col items-center transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="w-full my-auto flex flex-col items-center justify-center text-white space-y-[1vh]">
        <Link
          href="/home"
          className="flex items-center my-[2vh] gap-[1vh] font-bold text-[3vh] hover:text-[#DBB968] hover:scale-105 transition-all duration-200"
        >
          <Home size="4vh" />
          Home
        </Link>
        <Link
          href="/loadout"
          className="flex items-center my-[2vh] gap-[1vh] font-bold text-[3vh] hover:text-[#DBB968] hover:scale-105 transition-all duration-200"
        >
          <Package size="4vh" />
          Loadout
        </Link>
        <Link
          href="/players"
          className="flex items-center my-[2vh] gap-[1vh] font-bold text-[3vh] hover:text-[#DBB968] hover:scale-105 transition-all duration-200"
        >
          <Users size="4vh" />
          Players List
        </Link>
      </div>
      <Link
        href="/profile"
        className="py-[2vh] px-[2vh] rounded-t-[2vh] bg-[#B98F00] mt-auto flex items-center justify-between cursor-pointer hover:brightness-110 transition-all duration-200"
      >
        <div
          className="aspect-square h-[6vh] bg-center bg-cover bg-no-repeat rounded-[50%] border border-white"
          style={{ backgroundImage: `url('https://i.imgur.com/RoRONDn.jpeg')` }}
        ></div>
        <div className="ml-[1vh] flex flex-col items-start">
          <p className="text-[3vh] text-white font-bold max-w-[20vw] whitespace-nowrap overflow-hidden text-ellipsis">
            Negic Legend
          </p>
          <p className="text-[2vh] text-[#ccc] font-bold max-w-[20vw] whitespace-nowrap overflow-hidden text-ellipsis">
            (1000)
          </p>
        </div>
      </Link>
    </div>
  );
};

export default SideBar;