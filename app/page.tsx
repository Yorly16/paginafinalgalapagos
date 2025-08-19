import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { SpeciesPreview } from "@/components/species-preview"
import { MapSection } from "@/components/map-section"
import { Footer } from "@/components/footer"
import InteractiveMap from '@/components/interactive-map'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <SpeciesPreview />
        <MapSection />
        
        {/* ✅ Mover la sección del mapa aquí */}
        <section id="mapa-interactivo" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto max-w-7xl">
            <InteractiveMap />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
