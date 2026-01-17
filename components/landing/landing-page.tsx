"use client"

import { Navbar } from "./navbar"
import { HeroSection } from "./hero-section"
import { HowItWorksSection } from "./how-it-works-section"
import { Footer } from "./footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <Footer />
    </div>
  )
}
