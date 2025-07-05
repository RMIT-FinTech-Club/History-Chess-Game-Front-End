"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"
import Content from "@/components/content"
import Footer from "@/components/Footer"
import NavBar from "@/components/NavBar"
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
}


const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname()

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
    '/reset_password',
    '/game/offline',
    '/game/online',
    '/home'
  ]

  const noNavRoutes = [
    '/',
    '/sign_in',
    '/sign_up'
  ]

  const noNavBarRoutes = [
    '/otp',
    '/sign_in',
    '/sign_up',
    '/reset_password',
    '/game/offline',
    '/game/online',
    '/home'
  ]

  const noNavRoutes = [
    '/',
    '/sign_in',
    '/sign_up'
  ]

  const showFooter = !noFooterRoutes.includes(pathname)
  const showNav = !noNavRoutes.includes(pathname)

  return (
    <SocketProvider>
      <LobbyProvider> {/* NEST THE LOBBY PROVIDER INSIDE SOCKET PROVIDER */}
        {showNavBar && <NavBar />}
        <Content>{children}</Content>
        {showFooter && <Footer />}
        <GlobalChallengeModalManager /> {/* Render the modal manager globally */}
        <GlobalGameRedirector />
      </LobbyProvider>
    </SocketProvider>
  )
}

export default ClientWrapper;