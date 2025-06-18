"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"
import Content from "@/components/content"
import Footer from "@/components/Footer"
import NavBar from "@/components/NavBar"
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent rendering until the component is mounted
  }

  const pathname = usePathname()

  const noFooterRoutes = [
    '/challenge',
    '/loadout',
    '/players',
    '/profile',
    '/otp',
    '/sign_in',
    '/sign_up'
  ]

  const noNavBarRoutes = [
    '/otp',
    '/sign_in',
    '/sign_up'
  ]

  const showFooter = !noFooterRoutes.includes(pathname)
  const showNavBar = !noNavBarRoutes.includes(pathname)

  return (
    <>
      {showNavBar && <NavBar />}
      <Content>{children}</Content>
      {showFooter && <Footer />}
    </>
  )
}