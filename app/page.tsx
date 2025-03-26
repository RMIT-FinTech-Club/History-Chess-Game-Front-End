"use client"

import YellowLight from "@/components/decor/YellowLight"
import Title from "@/components/landing/Title"
import Description from "@/components/landing/Description"
import Step1 from "@/components/landing/Step1"
import Step2 from "@/components/landing/Step2"
import Button from "@/components/landing/Button"

export default function LandingPage() {
  return (
    <>
      <YellowLight top={'20vh'} left={'60vw'} />
      <YellowLight top={'140vh'} left={'-30vw'} />
      <div className="flex flex-col items-center justify-center">
        <Title />
        <Description />
        <Step1 />
        <Step2 />
        <Button />
      </div>
    </>
  )
}