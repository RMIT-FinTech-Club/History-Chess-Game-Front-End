'use client'

import { usePathname } from 'next/navigation'

import Content from "@/components/content"
import Footer from "@/components/Footer"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const noFooterRoutes = [
        '/loadout',
        '/online_players',
        '/profile'
    ]

    console.clear()
    console.log(pathname)

    const showFooter = !noFooterRoutes.includes(pathname)

    return (
        <>
            <Content>{children}</Content>
            {showFooter && <Footer />}
        </>
    )
}