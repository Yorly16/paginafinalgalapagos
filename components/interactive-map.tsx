'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Importación dinámica de Leaflet para evitar problemas de SSR
const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Cargando mapa interactivo...</p>
      </div>
    </div>
  )
})

export default function InteractiveMap() {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Mapa Interactivo de las Islas Galápagos
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Explora las diferentes islas del archipiélago y descubre las especies únicas que habitan en cada una.
          Haz clic en los marcadores para obtener información detallada.
        </p>
      </div>
      <LeafletMap />
    </div>
  )
}