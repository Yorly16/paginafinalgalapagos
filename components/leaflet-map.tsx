'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface IslandData {
  name: string
  coordinates: [number, number]
  description: string
  species?: string[]
  facts?: string[]
}

const galapagosIslands: IslandData[] = [
  {
    name: 'Isla San Cristóbal',
    coordinates: [-0.739, -90.313],
    description: 'Capital: Puerto Baquerizo Moreno',
    species: ['Lobos marinos', 'Iguanas marinas', 'Tortugas gigantes'],
    facts: ['Primera isla visitada por Darwin', 'Aeropuerto internacional']
  },
  {
    name: 'Isla Santa Cruz',
    coordinates: [-0.743, -91.129],
    description: 'Ciudad: Puerto Ayora - Centro de investigación',
    species: ['Tortugas gigantes', 'Pinzones de Darwin', 'Iguanas terrestres'],
    facts: ['Estación Científica Charles Darwin', 'Mayor población humana']
  },
  {
    name: 'Isla Baltra',
    coordinates: [0.366, -90.55],
    description: 'Aeropuerto principal del archipiélago',
    species: ['Iguanas terrestres', 'Fragatas'],
    facts: ['Base militar histórica', 'Puerta de entrada turística']
  },
  {
    name: 'Isla Isabela',
    coordinates: [0.0, -91.6],
    description: 'La isla más grande del archipiélago',
    species: ['Pingüinos de Galápagos', 'Cormoranes no voladores', 'Tortugas gigantes'],
    facts: ['6 volcanes activos', '60% del área total del archipiélago']
  },
  {
    name: 'Isla Floreana',
    coordinates: [-1.2869, -90.4425],
    description: 'Conocida por su historia y biodiversidad única',
    species: ['Flamingos', 'Pinzones de Darwin', 'Tortugas gigantes'],
    facts: ['Primera oficina postal del Pacífico', 'Misterios históricos']
  },
  {
    name: 'Isla Española',
    coordinates: [-1.3833, -89.6167],
    description: 'La isla más antigua y sureña',
    species: ['Albatros de Galápagos', 'Iguanas marinas coloridas', 'Mockingbirds'],
    facts: ['Única colonia de albatros', 'Formación rocosa más antigua']
  },
  {
    name: 'Isla Fernandina',
    coordinates: [-0.3667, -91.55],
    description: 'La isla más joven y volcánicamente activa',
    species: ['Cormoranes no voladores', 'Iguanas marinas', 'Pingüinos'],
    facts: ['Volcán más activo', 'Ecosistema más prístino']
  }
]

export default function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const initMap = async () => {
      // Importación dinámica de Leaflet
      const L = (await import('leaflet')).default
      
      // Fix para los iconos de Leaflet en Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      if (!mapRef.current || mapInstanceRef.current) return

      // Crear el mapa
      const map = L.map(mapRef.current, {
        center: [-0.9538, -90.9656],
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
      })

      // Agregar tiles de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        tileSize: 256,
        zoomOffset: 0
      }).addTo(map)

      // Crear iconos personalizados
      const createCustomIcon = (color: string) => {
        return L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: 12px;
            ">${color === '#e74c3c' ? '🦎' : color === '#3498db' ? '🐧' : '🐢'}</div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }

      // Agregar marcadores para cada isla
      galapagosIslands.forEach((island, index) => {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e']
        const color = colors[index % colors.length]
        
        const marker = L.marker(island.coordinates, {
          icon: createCustomIcon(color)
        }).addTo(map)

        // Crear contenido del popup
        const popupContent = `
          <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 18px; font-weight: bold;">${island.name}</h3>
            <p style="margin: 0 0 12px 0; color: #7f8c8d; font-size: 14px;">${island.description}</p>
            
            ${island.species ? `
              <div style="margin-bottom: 12px;">
                <h4 style="margin: 0 0 6px 0; color: #27ae60; font-size: 14px; font-weight: 600;">🦎 Especies Destacadas:</h4>
                <ul style="margin: 0; padding-left: 16px; color: #34495e; font-size: 13px;">
                  ${island.species.map(species => `<li>${species}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${island.facts ? `
              <div>
                <h4 style="margin: 0 0 6px 0; color: #e67e22; font-size: 14px; font-weight: 600;">💡 Datos Curiosos:</h4>
                <ul style="margin: 0; padding-left: 16px; color: #34495e; font-size: 13px;">
                  ${island.facts.map(fact => `<li>${fact}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        })

        // Agregar evento hover
        marker.on('mouseover', () => {
          marker.openPopup()
        })
      })

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="w-full">
      <div 
        ref={mapRef} 
        className="w-full h-[600px] rounded-lg border border-border shadow-lg"
        style={{ minHeight: '600px' }}
      />
      
      {/* Estilos personalizados para el mapa */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </div>
  )
}