"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Content from "@/components/content";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { SocketProvider } from "@/context/WebSocketContext";
import { useLobby, LobbyProvider } from "@/context/LobbyContext";
import ChallengeModal from "@/app/challenge/ChallengeModal";
import GlobalGameRedirector from "@/context/GlobalGameRedirector";

const GlobalChallengeModalManager = () => {
  const { isChallengeModalOpen, incomingChallengeData, acceptChallenge, declineChallenge } = useLobby();
  return (
    <ChallengeModal
      isOpen={isChallengeModalOpen}
      challengeData={incomingChallengeData}
      onCloseAction={declineChallenge} // Closing the modal should decline the challenge
      onAcceptAction={acceptChallenge}
      onDeclineAction={declineChallenge}
    />
  );
};

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent rendering until the component is mounted
  }

  const noFooterRoutes = [
    '/challenge',
    '/loadout',
    '/players',
    '/profile',
    '/otp',
    '/sign_in',
    '/sign_up',
    '/game/offline',
    '/game/online',
    '/home'
  ];

  const noNavBarRoutes = [
    '/',
    '/sign_in',
    '/sign_up',
    '/game/offline',
    '/game/online'
  ];

  // Add the '/' route here as well
  const noSocketRoutes = [
    '/',
    '/otp',
    '/sign_in',
    '/sign_up'
  ];

  const showFooter = !noFooterRoutes.includes(pathname);
  const showNavBar = !noNavBarRoutes.includes(pathname);
  const applySocketProvider = !noSocketRoutes.includes(pathname); // Renamed for clarity

  return (
    <>
      {showNavBar && <NavBar />}
      {applySocketProvider ? (
        <SocketProvider>
          <LobbyProvider>
            <Content>{children}</Content>
            <GlobalChallengeModalManager />
            <GlobalGameRedirector />
          </LobbyProvider>
        </SocketProvider>
      ) : (
        // Render content without SocketProvider if it's one of the excluded routes
        // Note: Components like LobbyProvider, ChallengeModalManager, and GameRedirector
        // that depend on SocketProvider should not be rendered here.
        // If LobbyProvider itself doesn't strictly depend on SocketProvider for its
        // initial render or if it handles a disconnected socket gracefully, you might
        // consider its placement. For now, I'm assuming it's tightly coupled.
        <Content>{children}</Content>
      )}
      {showFooter && <Footer />}
    </>
  );
};

export default ClientWrapper;