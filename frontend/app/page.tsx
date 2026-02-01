import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden w-full">
      <Header />
      <main className="flex-1 w-full min-w-0">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}
