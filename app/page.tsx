"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useGlobalStorage } from "@/hooks/GlobalStorage"
import BackgroundEffects from "@/components/decor/BackgroundEffects"
import Title from "@/components/landing/Title"
import Description from "@/components/landing/Description"
import Step1 from "@/components/landing/Step1"
import Step2 from "@/components/landing/Step2"
import Button from "@/components/landing/Button"

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated } = useGlobalStorage()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/home")
    }
  }, [isAuthenticated, router])

  return (
    <>
      {/* Premium background effects replacing YellowLight */}
      <BackgroundEffects />

      <div className="flex flex-col items-center justify-center relative">
        <Title />
        <Description />
        <Step1 />
        <Step2 />
        <Button />
      </div>
    </>
  )
}