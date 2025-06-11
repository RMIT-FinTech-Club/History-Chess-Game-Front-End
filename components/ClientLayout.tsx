'use client'

import { usePathname } from "next/navigation"
import Content from "@/components/content"
import Footer from "@/components/Footer"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

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