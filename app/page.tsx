import BackgroundEffects from "@/components/decor/BackgroundEffects"
import Title from "@/components/landing/Title"
import ConquestIntro from "@/components/landing/ConquestIntro"
import DynastyShowcase from "@/components/landing/DynastyShowcase"
import MarketplaceShowcase from "@/components/landing/MarketplaceShowcase"
import ArenaIntro from "@/components/landing/ArenaIntro"
import Step1 from "@/components/landing/Step1"
import Step2 from "@/components/landing/Step2"
import Button from "@/components/landing/Button"
import RedirectIfAuthenticated from "@/components/auth/RedirectIfAuthenticated"

export default function LandingPage() {
  return (
    <>
      <RedirectIfAuthenticated />
      <BackgroundEffects />

      <div className="flex flex-col items-center justify-center relative w-full">
        {/* Hero Section */}
        <Title />

        {/* Narrative Flow: Campaign -> Dynasties -> Economy -> Gameplay -> Community */}
        <div className="w-full flex flex-col relative z-10 bg-linear-to-b from-transparent via-black/20 to-transparent">
          {/* The Campaign Experience */}
          <ConquestIntro />

          {/* The Historical Eras */}
          <DynastyShowcase />

          {/* The Competitive Arena */}
          <ArenaIntro />

          {/* Gameplay Modes (Functional) */}
          <Step1 />

          {/* The Rewards & Economy */}
          <MarketplaceShowcase />

          {/* The Community (Lobby) */}
          <Step2 />
        </div>

        <Button />
      </div>
    </>
  )
}