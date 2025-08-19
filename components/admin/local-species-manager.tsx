"use client"

import { useState, useEffect } from "react"
import { SpeciesSearch } from "./species-search"
import { SpeciesTable } from "./species-table"
import { Separator } from "@/components/ui/separator"
import { Database, Search, Table } from "lucide-react"

interface Species {
  id: string
  commonName: string
  scientificName: string
  category: string
  status: string
  location: string
  description: string
  habitat: string
  diet: string
  threats: string
  image?: string
  tags: string[]
}

export function LocalSpeciesManager() {
  const [searchResults, setSearchResults] = useState<Species[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [allSpecies, setAllSpecies] = useState<Species[]>([])

  // Cargar especies al montar el componente
  useEffect(() => {
    const loadSpecies = () => {
      try {
        const savedSpecies = localStorage.getItem('galapagos-species')
        if (savedSpecies) {
          const species = JSON.parse(savedSpecies)
          setAllSpecies(species)
          setSearchResults(species)
        }
      } catch (error) {
        console.error('Error loading species:', error)
      }
    }
    
    loadSpecies()
  }, [refreshKey])

  const handleSearchResults = (results: Species[]) => {
    setSearchResults(results)
  }

  const handleSpeciesUpdate = () => {
    // Forzar actualización incrementando la key
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header expandido */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Database className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Especies Locales</h1>
            <p className="text-lg text-gray-600 mt-1">Administra tu catálogo personal de especies de Galápagos</p>
          </div>
        </div>
        <div className="text-right bg-blue-50 p-4 rounded-xl">
          <div className="text-4xl font-bold text-blue-600">{allSpecies.length}</div>
          <div className="text-sm text-gray-500 font-medium">Especies registradas</div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Sección de búsqueda - Sin Card, completamente expandida */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Buscar y Filtrar</h2>
        </div>
        <SpeciesSearch 
          key={refreshKey} 
          onSearchResults={handleSearchResults} 
        />
      </div>

      <Separator className="mb-6" />

      {/* Sección de resultados - Ocupa todo el espacio restante */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Table className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Resultados de Búsqueda</h2>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <span className="text-green-700 font-medium">
              {searchResults.length} de {allSpecies.length} especies
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <SpeciesTable 
            species={searchResults} 
            onSpeciesUpdate={handleSpeciesUpdate}
          />
        </div>
      </div>
    </div>
  )
}