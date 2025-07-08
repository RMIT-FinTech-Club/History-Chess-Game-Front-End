// layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "../components/ThemeProvider";
import { Toaster } from "sonner";
import ClientWrapper from "@/context/ClientWrapper";

import "@/app/globals.css"
import '@/css/styles.css'

import { UserProvider } from "@/context/UserContext"

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <UserProvider>
          <ThemeProvider
            defaultTheme="system"
            attribute="class" // This tells the ThemeProvider to toggle 'dark'/'light' classes on the html tag
            enableSystem={true}
            disableTransitionOnChange={true}
          >
            <Toaster richColors position="top-center" />
            <ClientWrapper>{children}</ClientWrapper>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}