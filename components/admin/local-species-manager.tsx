"use client"

import { useState, useEffect } from "react"
import { SpeciesSearch } from "./species-search"
import { SpeciesTable } from "./species-table"
import { Separator } from "@/components/ui/separator"
import { Database, Search, Table, Cloud, Wifi, WifiOff } from "lucide-react"
import { useGitHubData } from "@/hooks/use-github-data"
import { Badge } from "@/components/ui/badge"

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
  
  // Usar el nuevo hook híbrido GitHub + localStorage
  const { 
    species, 
    loading, 
    error, 
    syncStatus, 
    hasUnsyncedChanges,
    refreshData 
  } = useGitHubData()

  // Actualizar resultados cuando cambien las especies
  useEffect(() => {
    if (species) {
      setSearchResults(species)
    }
  }, [species])

  const handleSearchResults = (results: Species[]) => {
    setSearchResults(results)
  }

  const handleSpeciesUpdate = async () => {
    // Refrescar datos del sistema híbrido
    await refreshData()
    setRefreshKey(prev => prev + 1)
  }

  const getSyncStatusBadge = () => {
    switch (syncStatus) {
      case 'synced':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Wifi className="h-3 w-3 mr-1" />
            Sincronizado
          </Badge>
        )
      case 'syncing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Cloud className="h-3 w-3 mr-1 animate-pulse" />
            Sincronizando...
          </Badge>
        )
      case 'offline':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <WifiOff className="h-3 w-3 mr-1" />
            Modo offline
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <WifiOff className="h-3 w-3 mr-1" />
            Error de sincronización
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading && !species?.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Cloud className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-lg font-medium text-gray-700">Cargando especies...</p>
          <p className="text-sm text-gray-500">Sincronizando con GitHub</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header expandido con estado de sincronización */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Database className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Especies Híbrida</h1>
            <p className="text-lg text-gray-600 mt-1">Sistema híbrido GitHub + localStorage</p>
            <div className="flex items-center space-x-2 mt-2">
              {getSyncStatusBadge()}
              {hasUnsyncedChanges && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  Cambios pendientes
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="text-right bg-blue-50 p-4 rounded-xl">
          <div className="text-4xl font-bold text-blue-600">{species?.length || 0}</div>
          <div className="text-sm text-gray-500 font-medium">Especies registradas</div>
          {error && (
            <div className="text-xs text-red-500 mt-1">Error: {error}</div>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Sección de búsqueda */}
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

      {/* Sección de resultados */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Table className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Resultados de Búsqueda</h2>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <span className="text-green-700 font-medium">
              {searchResults.length} de {species?.length || 0} especies
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