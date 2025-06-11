'use client'

import { usePathname } from "next/navigation"
import { useGlobalStorage } from "@/components/GlobalStorage"
import { useEffect } from "react"

import Content from "@/components/content"
import Footer from "@/components/Footer"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { setAuthData } = useGlobalStorage()
    const pathname = usePathname()

    useEffect(() => {
        setAuthData(
          "f64ca2824-056b-4f52-b75e-9924fee71eef", // userId
          "Negic Legend",   // userName
          "https://i.imgur.com/RoRONDn.jpeg", // avatar
          "fake-access-token",
          "fake-refresh-token"
        )
      }, [setAuthData])

    const noFooterRoutes = [
        '/challenge',
        '/loadout',
        '/players',
        '/profile',
        '/otp'
    ]

    const showFooter = !noFooterRoutes.includes(pathname)

    return (
        <>
            <Content>{children}</Content>
            {showFooter && <Footer />}
        </>
    )
}