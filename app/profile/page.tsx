"use client";
import styles from "@/css/profile.module.css";
import { useRef, useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import CountUp from "react-countup";
import GamePadIcon from "@/components/ui/gamePadIcon";
import CupIcon from "@/components/ui/cupIcon";
import SettingIcon from "@/components/ui/settingIcon";
import OtherPlayers from "@/components/ui/otherPlayers";
import Matches from "@/components/ui/matches";
import AccountSettings from "@/components/ui/account_settings";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useGlobalStorage } from "@/components/GlobalStorage";

const ProfilePage = () => {
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [isProfileOpened, setIsProfileOpened] = useState<boolean>(true);
  const [profileMenu, setProfileMenu] = useState(1);
  const [user, setUser] = useState<{
    id: string;
    username: string;
    email: string;
    elo: number;
    avatarUrl: string | null;
    language: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { accessToken, clearAuth } = useGlobalStorage();

  const fetchProfile = useCallback(async () => {
    if (!accessToken) {
      toast.error("Please sign in to view your profile.");
      router.push("/sign_in");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/users/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(response.data.user);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Failed to load profile"
        : "Failed to load profile";
      toast.error(message);
      router.push("/sign_in");
    } finally {
      setLoading(false);
    }
  }, [router, accessToken]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleToggleProfile = useCallback(() => {
    setIsProfileOpened((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    toast.success("Logged out successfully!");
    router.push("/sign_in");
  }, [router, clearAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white font-poppins font-bold">
        <p className="text-[3vh]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-[90vw] md:w-[80vw] overflow-hidden flex flex-col py-[3vh] mx-[5vw] md:mx-[10vw] text-white relative h-[100dvh]">
      <div
        className={`w-full relative md:absolute ${
          isProfileOpened ? "md:top-[3vh]" : "md:top-[calc(-12vw-2px)]"
        } top-0 left-0 flex items-center rounded-[2vw] h-[15vw] md:h-[12vw] bg-[#1D1D1D] border border-solid border-[#77878B] mb-[3vh] transition-all duration-300`}
      >
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <div
              ref={profileRef}
              onClick={handleToggleProfile}
              className={`absolute w-[calc(2vw-2px)] aspect-square left-[calc(100%-2vw)] bottom-[calc(-3vw)] cursor-pointer bg-[#1D1D1D] border border-solid border-white rounded-[50%] hidden md:flex justify-center items-center`}
            >
              <FontAwesomeIcon
                icon={faArrowUp}
                className={`${
                  isProfileOpened ? "rotate-none" : "rotate-[180deg]"
                } text-[1vw]`}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="text-white bg-black rounded-lg px-2 py-1 shadow-lg"
          >
            {isProfileOpened ? "Close Profile" : "Open Profile"}
          </TooltipContent>
        </Tooltip>

        <div className="w-[35vw] md:w-[32vw] flex justify-between items-center">
          <div
            style={{
              backgroundImage: `url(${user?.avatarUrl || "https://i.imgur.com/RoRONDn.jpeg"})`,
            }}
            className="w-[10vw] md:w-[8vw] m-[2vw] aspect-square rounded-[50%] bg-center bg-cover bg-no-repeat border border-white border-solid"
          ></div>
          <div className="w-[23vw] md:w-[24vw] flex flex-col justify-between items-start">
            <p className="text-[2vw] font-bold w-full whitespace-nowrap overflow-hidden text-ellipsis">
              {user?.username || "Negic Legend"}
            </p>
            <p className="text-[1.2vw] font-thin my-[0.5vw] md:my-0">
              Global Ranking: #{user?.elo || 100}
            </p>
            <p className="text-[1.2vw] font-thin">
              Player ID: {user?.id || "31082007"}
            </p>
          </div>
        </div>
        <div className="w-[65vw] md:w-[48vw] flex justify-around items-center py-[2vw]">
          {[
            {
              icon: styles.profile_icon_1,
              content: "Level",
              number: 5,
            },
            {
              icon: styles.profile_icon_2,
              content: "Game Mode",
              number: "1vs1",
            },
            {
              icon: styles.profile_icon_3,
              content: "Wallet",
              number: 500,
              prefix: "K",
            },
            {
              icon: styles.profile_icon_4,
              content: "Won Matches",
              number: 120,
            },
          ].map((card, index) => (
            <div
              key={index}
              className="w-[10vw] md:w-[8vw] h-[11vw] md:h-[10vw] flex flex-col justify-center items-center bg-black rounded-[1vw] border border-solid border-[#77878B]"
            >
              <div
                className={`w-[2.5vw] aspect-square bg-center bg-contain bg-no-repeat ${card.icon}`}
              ></div>
              <p className="text-[1.2vw] md:text-[1vw] text-[#77878B] my-[0.5vh] md:my-[1vh]">
                {card.content}
              </p>
              <p className="text-[1.5vw] leading-[1vw]">
                {typeof card.number === "number" ? (
                  <CountUp
                    start={0}
                    end={card.number}
                    useEasing={false}
                    duration={2}
                  />
                ) : (
                  `${card.number}`
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div
        className={`w-full ${
          isProfileOpened ? "md:mt-[calc(12vw+2px+3vh)]" : "md:mt-0"
        } mt-0 ${
          isProfileOpened
            ? "h-[calc(100vh-3vh-12vw-2px-6vh)]"
            : "h-[calc(100vh-6vh)]"
        } transition-all duration-300 flex flex-col md:flex-row justify-start md:justify-between`}
      >
        <div className="md:w-[30%] w-full flex flex-col">
          <div className="px-0 md:px-[2vw] py-[1vw] md:py-[2vw] w-full flex flex-row md:flex-col bg-[#1D1D1D] rounded-[2vw] mb-[3vh] relative items-center justify-around">
            <div
              className={`absolute ${
                profileMenu === 0
                  ? "md:top-[2vw] md:left-0 top-0 left-0"
                  : `${
                      profileMenu === 1
                        ? "md:top-[6vw] md:left-0 top-0 left-[30vw]"
                        : "md:top-[10vw] md:left-0 top-0 left-[60vw]"
                    }`
              } left-0 md:h-[2vw] md:w-[calc(2vw/3)] w-1/3 h-[1vw] rounded-[0.5vw] md:rounded-[1vw] bg-[#DBB968] transition-all duration-200`}
            ></div>
            {[
              {
                icon: CupIcon,
                content: "Statistic",
              },
              {
                icon: GamePadIcon,
                content: "Matches",
              },
              {
                icon: SettingIcon,
                content: "Account Settings",
              },
            ].map((menu, index) => (
              <div
                key={index}
                className={`flex justify-center mr-0 md:mr-auto w-1/3 md:w-[max-content] max-w-[100%] cursor-pointer group ${
                  index % 2 === 1 ? "my-[2vw]" : ""
                }`}
                onClick={() => {
                  if (index !== profileMenu) setProfileMenu(index);
                }}
              >
                <div
                  className={`${
                    index === profileMenu
                      ? `${styles.profile_menu_icon} border-[#DBB968]`
                      : "border-white"
                  } h-[calc(4vw-2px)] md:h-[calc(2vw-2px)] aspect-square flex justify-center items-center border border-solid rounded-[50%]`}
                >
                  {
                    <menu.icon
                      width="60%"
                      fill={`${index === profileMenu ? "#DBB968" : "white"}`}
                    />
                  }
                </div>
                <p
                  className={`${
                    index === profileMenu
                      ? `text-[#DBB968]`
                      : "text-white group-hover:md:left-[0.3vw]"
                  } text-[2.5vw] leading-[4vw] md:text-[2vw] md:leading-[2vw] ml-[1vw] max-w-[100%] whitespace-nowrap overflow-hidden text-ellipsis relative left-0 group-hover:text-[#DBB968] transition-all duration-200`}
                >
                  {menu.content}
                </p>
              </div>
            ))}
          </div>
          {profileMenu === 1 && <OtherPlayers isOpen={isProfileOpened} />}
        </div>
        <div
          className={`w-full md:w-[60%] flex flex-col ${
            profileMenu === 2 ? `h-[calc(100vh-6vh)]` : ""
          }`}
        >
          {profileMenu === 1 && <Matches />}
          {profileMenu === 2 && <AccountSettings />}
          {/* {profileMenu === 2 && (
            <Button
              onClick={handleLogout}
              className="w-full bg-[#000000] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#FFFFFF] font-bold text-[3.5vh] py-[4vh] mt-[1.75vh] rounded-[1.5vh]"
            >
              Log Out
            </Button>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;