'use client'

import { Button } from "@/components/ui/button"
import { MapPin, Search } from "lucide-react"
import Link from "next/link"

const scrollToMap = () => {
  const mapSection = document.getElementById('mapa-interactivo')
  if (mapSection) {
    mapSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Explora la Biodiversidad de las
            <span className="text-primary block mt-2">Islas Galápagos</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Descubre las especies únicas que habitan en este laboratorio natural de la evolución. Una plataforma
            científica para investigadores y conservacionistas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild>
              <Link href="/especies" className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Explorar Especies
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={scrollToMap} className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ver Mapa Interactivo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Especies Registradas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">21</div>
              <div className="text-muted-foreground">Islas Principales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">97%</div>
              <div className="text-muted-foreground">Especies Endémicas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
