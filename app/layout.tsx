// layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "../components/ThemeProvider";
import { Toaster } from "sonner";
import ClientWrapper from "@/context/ClientWrapper";
import { AchievementProvider } from "@/context/AchievementContext";

import "@/app/globals.css"
import '@/css/styles.css'

import { UserProvider } from "@/context/UserContext"

// Import fonts
import { Cinzel, Poppins, Roboto_Mono } from 'next/font/google'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "History Chess Game",
  description: "A Chess Game created by RMIT Vietnam FinTech Club, influenced by Vietnamese Glory History",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // REMOVE 'className="light"' and 'style={{ colorScheme: "light" }}'
    // ADD 'suppressHydrationWarning' to prevent React from complaining during initial render
    <html lang="en" suppressHydrationWarning className={`${cinzel.variable} ${poppins.variable} ${roboto_mono.variable}`}>
      <body className="font-sans">
        <UserProvider>
          <AchievementProvider>
            <ThemeProvider
              defaultTheme="dark"
              attribute="class" // This tells the ThemeProvider to toggle 'dark'/'light' classes on the html tag
              enableSystem={true}
              disableTransitionOnChange={true}
            >
              <Toaster richColors position="top-center" />
              <ClientWrapper>{children}</ClientWrapper>
            </ThemeProvider>
          </AchievementProvider>
        </UserProvider>
      </body>
    </html>
  );
}