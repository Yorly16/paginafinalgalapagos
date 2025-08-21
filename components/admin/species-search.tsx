"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, X, RefreshCw, Eye, Edit, Save, Cloud, Wifi } from "lucide-react"
import { useGitHubData } from "@/hooks/use-github-data"
import { toast } from "@/hooks/use-toast"

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

interface SpeciesSearchProps {
  onSearchResults: (results: Species[]) => void
  onViewSpecies?: (species: Species) => void
  onEditSpecies?: (species: Species) => void
}

export function SpeciesSearch({ onSearchResults, onViewSpecies, onEditSpecies }: SpeciesSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [filteredSpecies, setFilteredSpecies] = useState<Species[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<Species>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Usar el nuevo hook híbrido GitHub + localStorage
  const { 
    species, 
    updateSpecies, 
    loading, 
    error, 
    syncStatus,
    hasUnsyncedChanges 
  } = useGitHubData()

  // Actualizar especies filtradas cuando cambien los datos
  useEffect(() => {
    if (species) {
      setFilteredSpecies(species)
      onSearchResults(species)
    }
  }, [species, onSearchResults])

  const handleSearch = useCallback(() => {
    if (!species) return
    
    let results = [...species]
  
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      results = results.filter(speciesItem => 
        speciesItem.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speciesItem.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speciesItem.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
  
    // Filtrar por categoría
    if (selectedCategory && selectedCategory !== "all") {
      results = results.filter(speciesItem => 
        speciesItem.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }
  
    // Filtrar por estado de conservación
    if (selectedStatus && selectedStatus !== "all") {
      results = results.filter(speciesItem => 
        speciesItem.status.toLowerCase() === selectedStatus.toLowerCase()
      )
    }
  
    // Filtrar por ubicación
    if (selectedLocation) {
      results = results.filter(speciesItem => 
        speciesItem.location.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }
  
    setFilteredSpecies(results)
    onSearchResults(results)
  }, [searchTerm, selectedCategory, selectedStatus, selectedLocation, species, onSearchResults])

  // Ejecutar búsqueda automáticamente cuando cambien los filtros
  useEffect(() => {
    handleSearch()
  }, [searchTerm, selectedCategory, selectedStatus, selectedLocation, species])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedStatus("all")
    setSelectedLocation("")
    if (species) {
      setFilteredSpecies(species)
      onSearchResults(species)
    }
  }

  const handleViewSpecies = (speciesItem: Species) => {
    setSelectedSpecies(speciesItem)
    setIsViewDialogOpen(true)
    if (onViewSpecies) {
      onViewSpecies(speciesItem)
    }
  }

  const handleEditSpecies = (speciesItem: Species) => {
    setSelectedSpecies(speciesItem)
    setEditFormData(speciesItem)
    setIsEditDialogOpen(true)
    if (onEditSpecies) {
      onEditSpecies(speciesItem)
    }
  }

  const handleSaveChanges = async () => {
    if (!selectedSpecies || !editFormData) return
    
    setIsSaving(true)
    try {
      const updatedSpecies = { ...selectedSpecies, ...editFormData }
      await updateSpecies(updatedSpecies.id, updatedSpecies)
      
      toast({
        title: "Especie actualizada",
        description: `${updatedSpecies.commonName} ha sido actualizada exitosamente.`,
      })
      
      setIsEditDialogOpen(false)
      setSelectedSpecies(null)
      setEditFormData({})
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar la especie. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getSyncStatusIndicator = () => {
    if (syncStatus === 'syncing') {
      return <Cloud className="h-4 w-4 text-blue-500 animate-pulse" />
    }
    if (syncStatus === 'synced') {
      return <Wifi className="h-4 w-4 text-green-500" />
    }
    return null
  }

  if (loading && !species?.length) {
    return (
      <div className="w-full bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="text-center py-8">
          <Cloud className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-lg font-medium text-gray-700">Cargando especies...</p>
          <p className="text-sm text-gray-500">Sincronizando con GitHub</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-full bg-gray-50 rounded-xl p-6 border border-gray-200">
        {/* Header con estado de sincronización */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Buscar Especies Híbridas</h3>
            {getSyncStatusIndicator()}
            {hasUnsyncedChanges && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Cambios pendientes
              </Badge>
            )}
          </div>
          <p className="text-gray-600">
            Sistema híbrido GitHub + localStorage ({species?.length || 0} especies disponibles)
            {error && <span className="text-red-500 ml-2">• Error: {error}</span>}
          </p>
        </div>

        {/* Búsqueda Principal */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre común, científico o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <Button onClick={clearFilters} variant="outline" className="h-12 px-6">
            <RefreshCw className="h-5 w-5 mr-2" />
            Limpiar
          </Button>
        </div>

        {/* Filtros Avanzados */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-sm font-semibold mb-3 block text-gray-700">Categoría</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="mamifero">Mamífero</SelectItem>
                <SelectItem value="ave">Ave</SelectItem>
                <SelectItem value="reptil">Reptil</SelectItem>
                <SelectItem value="pez">Pez</SelectItem>
                <SelectItem value="invertebrado">Invertebrado</SelectItem>
                <SelectItem value="planta">Planta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-3 block text-gray-700">Estado de Conservación</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="estable">Estable</SelectItem>
                <SelectItem value="vulnerable">Vulnerable</SelectItem>
                <SelectItem value="en-peligro">En Peligro</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
                <SelectItem value="extinto">Extinto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-3 block text-gray-700">Ubicación</label>
            <Input
              placeholder="Filtrar por ubicación..."
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-base font-medium text-gray-700 mb-4">
            Mostrando {filteredSpecies.length} de {species?.length || 0} especies
          </div>
          
          {/* Tabla de resultados */}
          {filteredSpecies.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Especie</th>
                    <th className="text-left p-3 font-semibold">Categoría</th>
                    <th className="text-left p-3 font-semibold">Estado</th>
                    <th className="text-left p-3 font-semibold">Ubicación</th>
                    <th className="text-left p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSpecies.map((speciesItem) => (
                    <tr key={speciesItem.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{speciesItem.commonName}</div>
                          <div className="text-sm text-gray-500 italic">{speciesItem.scientificName}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{speciesItem.category}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={speciesItem.status === 'en-peligro' || speciesItem.status === 'critico' ? 'destructive' : 'secondary'}
                        >
                          {speciesItem.status}
                        </Badge>
                      </td>
                      <td className="p-3">{speciesItem.location}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewSpecies(speciesItem)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditSpecies(speciesItem)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {filteredSpecies.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron especies que coincidan con los criterios de búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* Dialog para ver especie */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Especie</DialogTitle>
            <DialogDescription>
              Información completa sobre {selectedSpecies?.commonName}
            </DialogDescription>
          </DialogHeader>
          {selectedSpecies && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Nombre Común</h4>
                  <p>{selectedSpecies.commonName}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Nombre Científico</h4>
                  <p className="italic">{selectedSpecies.scientificName}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Categoría</h4>
                  <Badge variant="outline">{selectedSpecies.category}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold">Estado de Conservación</h4>
                  <Badge variant={selectedSpecies.status === 'en-peligro' || selectedSpecies.status === 'critico' ? 'destructive' : 'secondary'}>
                    {selectedSpecies.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold">Ubicación</h4>
                  <p>{selectedSpecies.location}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold">Descripción</h4>
                <p>{selectedSpecies.description}</p>
              </div>
              <div>
                <h4 className="font-semibold">Hábitat</h4>
                <p>{selectedSpecies.habitat}</p>
              </div>
              <div>
                <h4 className="font-semibold">Dieta</h4>
                <p>{selectedSpecies.diet}</p>
              </div>
              <div>
                <h4 className="font-semibold">Amenazas</h4>
                <p>{selectedSpecies.threats}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar especie */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Especie</DialogTitle>
            <DialogDescription>
              Modifica la información de {selectedSpecies?.commonName}
            </DialogDescription>
          </DialogHeader>
          {selectedSpecies && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre Común</label>
                  <Input 
                    value={editFormData.commonName || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, commonName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nombre Científico</label>
                  <Input 
                    value={editFormData.scientificName || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, scientificName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <Select 
                    value={editFormData.category || ''}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mamifero">Mamífero</SelectItem>
                      <SelectItem value="ave">Ave</SelectItem>
                      <SelectItem value="reptil">Reptil</SelectItem>
                      <SelectItem value="pez">Pez</SelectItem>
                      <SelectItem value="invertebrado">Invertebrado</SelectItem>
                      <SelectItem value="planta">Planta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado de Conservación</label>
                  <Select 
                    value={editFormData.status || ''}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estable">Estable</SelectItem>
                      <SelectItem value="vulnerable">Vulnerable</SelectItem>
                      <SelectItem value="en-peligro">En Peligro</SelectItem>
                      <SelectItem value="critico">Crítico</SelectItem>
                      <SelectItem value="extinto">Extinto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Ubicación</label>
                  <Input 
                    value={editFormData.location || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea 
                  rows={3}
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Hábitat</label>
                <Textarea 
                  rows={2}
                  value={editFormData.habitat || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, habitat: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dieta</label>
                <Textarea 
                  rows={2}
                  value={editFormData.diet || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, diet: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amenazas</label>
                <Textarea 
                  rows={2}
                  value={editFormData.threats || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, threats: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Cloud className="h-4 w-4 mr-2 animate-pulse" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}