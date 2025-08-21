"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Eye, MoreHorizontal, ChevronLeft, ChevronRight, Save, Search, Wifi, WifiOff, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { useGitHubData } from "@/hooks/use-github-data"

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

interface SpeciesTableProps {
  species: Species[]
  onSpeciesUpdate: () => void
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "estable": return "bg-green-100 text-green-800"
    case "vulnerable": return "bg-yellow-100 text-yellow-800"
    case "en-peligro": return "bg-red-100 text-red-800"
    case "critico": return "bg-red-200 text-red-900"
    case "extinto": return "bg-gray-200 text-gray-900"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "mamifero": return "bg-blue-100 text-blue-800"
    case "ave": return "bg-purple-100 text-purple-800"
    case "reptil": return "bg-green-100 text-green-800"
    case "pez": return "bg-cyan-100 text-cyan-800"
    case "invertebrado": return "bg-orange-100 text-orange-800"
    case "planta": return "bg-emerald-100 text-emerald-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getSyncStatusIcon = (status: string) => {
  switch (status) {
    case 'synced': return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'syncing': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
    case 'offline': return <WifiOff className="h-4 w-4 text-gray-600" />
    case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
    default: return <Wifi className="h-4 w-4 text-gray-600" />
  }
}

const getSyncStatusText = (status: string) => {
  switch (status) {
    case 'synced': return 'Sincronizado'
    case 'syncing': return 'Sincronizando...'
    case 'offline': return 'Sin conexión'
    case 'error': return 'Error de sincronización'
    default: return 'Desconocido'
  }
}

export function SpeciesTable({ species, onSpeciesUpdate }: SpeciesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [editingSpecies, setEditingSpecies] = useState<Species | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Usar el hook de GitHub Data para especies
  const {
    data: githubSpecies,
    updateItem,
    deleteItem,
    syncStatus,
    error: syncError,
    pendingChanges
  } = useGitHubData<Species>('species')

  const totalPages = Math.ceil(species.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSpecies = species.slice(startIndex, endIndex)

  const handleEdit = (speciesData: Species) => {
    setEditingSpecies({ ...speciesData })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingSpecies || isUpdating) return

    setIsUpdating(true)
    try {
      await updateItem(editingSpecies.id, editingSpecies)
      
      setIsEditDialogOpen(false)
      setEditingSpecies(null)
      onSpeciesUpdate() // Notificar al componente padre para refrescar
      
      toast({
        title: "Especie actualizada",
        description: `${editingSpecies.commonName} ha sido actualizada exitosamente.`,
      })
    } catch (error) {
      console.error('Error updating species:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la especie. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string, commonName: string) => {
    if (isDeleting) return

    setIsDeleting(id)
    try {
      await deleteItem(id)
      
      onSpeciesUpdate() // Notificar al componente padre para refrescar
      
      toast({
        title: "Especie eliminada",
        description: `${commonName} ha sido eliminada del catálogo.`,
      })
    } catch (error) {
      console.error('Error deleting species:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la especie. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleInputChange = (field: keyof Species, value: string | string[]) => {
    if (editingSpecies) {
      setEditingSpecies({
        ...editingSpecies,
        [field]: value
      })
    }
  }

  return (
    <>
      <div className="w-full h-full flex flex-col bg-white rounded-xl border border-gray-200">
        {/* Header con estado de sincronización */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Especies Encontradas</h3>
              <p className="text-gray-600 mt-1">
                {species.length} especies en tu catálogo
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getSyncStatusIcon(syncStatus)}
              <span className="text-sm text-gray-600">
                {getSyncStatusText(syncStatus)}
              </span>
            </div>
          </div>
          
          {/* Mostrar cambios pendientes */}
          {pendingChanges > 0 && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                📝 {pendingChanges} cambio{pendingChanges !== 1 ? 's' : ''} pendiente{pendingChanges !== 1 ? 's' : ''} de sincronizar
              </p>
            </div>
          )}
          
          {/* Mostrar errores de sincronización */}
          {syncError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                ⚠️ Error de sincronización: {syncError}
              </p>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-h-0 p-6">
          {species.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <p className="text-xl text-gray-600 mb-2">No se encontraron especies</p>
                <p className="text-gray-500">Intenta ajustar los filtros o agregar nuevas especies.</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base font-semibold">Especie</TableHead>
                      <TableHead className="text-base font-semibold">Categoría</TableHead>
                      <TableHead className="text-base font-semibold">Estado</TableHead>
                      <TableHead className="text-base font-semibold">Ubicación</TableHead>
                      <TableHead className="text-base font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSpecies.map((species) => (
                      <TableRow key={species.id} className="h-16">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={species.image} alt={species.commonName} />
                              <AvatarFallback>
                                {species.commonName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{species.commonName}</div>
                              <div className="text-sm text-muted-foreground italic">
                                {species.scientificName}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(species.category)}>
                            {species.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(species.status)}>
                            {species.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{species.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(species)}
                              disabled={isUpdating}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled={isDeleting === species.id}
                                >
                                  {isDeleting === species.id ? (
                                    <Clock className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar especie?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente "{species.commonName}" del catálogo.
                                    Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(species.id, species.commonName)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isDeleting === species.id}
                                  >
                                    {isDeleting === species.id ? 'Eliminando...' : 'Eliminar'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, species.length)} de {species.length} especies
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="text-sm font-medium">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Especie</DialogTitle>
            <DialogDescription>
              Modifica la información de {editingSpecies?.commonName}
            </DialogDescription>
          </DialogHeader>
          
          {editingSpecies && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commonName">Nombre Común</Label>
                  <Input
                    id="commonName"
                    value={editingSpecies.commonName}
                    onChange={(e) => handleInputChange('commonName', e.target.value)}
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <Label htmlFor="scientificName">Nombre Científico</Label>
                  <Input
                    id="scientificName"
                    value={editingSpecies.scientificName}
                    onChange={(e) => handleInputChange('scientificName', e.target.value)}
                    disabled={isUpdating}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={editingSpecies.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                    disabled={isUpdating}
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
                  <Label htmlFor="status">Estado de Conservación</Label>
                  <Select
                    value={editingSpecies.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                    disabled={isUpdating}
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
              </div>
              
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={editingSpecies.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={editingSpecies.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  disabled={isUpdating}
                />
              </div>
              
              <div>
                <Label htmlFor="habitat">Hábitat</Label>
                <Textarea
                  id="habitat"
                  value={editingSpecies.habitat}
                  onChange={(e) => handleInputChange('habitat', e.target.value)}
                  rows={2}
                  disabled={isUpdating}
                />
              </div>
              
              <div>
                <Label htmlFor="diet">Dieta</Label>
                <Textarea
                  id="diet"
                  value={editingSpecies.diet}
                  onChange={(e) => handleInputChange('diet', e.target.value)}
                  rows={2}
                  disabled={isUpdating}
                />
              </div>
              
              <div>
                <Label htmlFor="threats">Amenazas</Label>
                <Textarea
                  id="threats"
                  value={editingSpecies.threats}
                  onChange={(e) => handleInputChange('threats', e.target.value)}
                  rows={2}
                  disabled={isUpdating}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}