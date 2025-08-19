'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Compass } from "lucide-react"

const scrollToMap = () => {
  const mapSection = document.getElementById('mapa-interactivo')
  if (mapSection) {
    mapSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}

export function MapSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Explora el Archipiélago Interactivamente</h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Navega por las 21 islas principales y descubre qué especies habitan en cada una. Nuestro mapa interactivo
              te permite explorar la distribución geográfica de la fauna y entender cómo el aislamiento ha influido en
              la evolución.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Ubicaciones Precisas</h3>
                  <p className="text-sm text-muted-foreground">
                    Coordenadas exactas de avistamientos y hábitats naturales
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Navigation className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Rutas de Investigación</h3>
                  <p className="text-sm text-muted-foreground">Senderos y zonas de estudio para investigadores</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Compass className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Datos en Tiempo Real</h3>
                  <p className="text-sm text-muted-foreground">
                    Información actualizada sobre poblaciones y conservación
                  </p>
                </div>
              </div>
            </div>

            <Button size="lg" onClick={scrollToMap}>
              Abrir Mapa Interactivo
            </Button>
          </div>

          {/* Map Preview */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Islas Galápagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg h-64 flex items-center justify-center">
                <img
                  src="/galapagos-archipelago-map.png"
                  alt="Mapa de las Islas Galápagos"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                  <Button variant="secondary" size="lg" onClick={scrollToMap}>
                    <MapPin className="h-5 w-5 mr-2" />
                    Ver Mapa Completo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
