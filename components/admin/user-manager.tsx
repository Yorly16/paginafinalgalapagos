"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { User, Trash2, Search, Mail, MapPin, Calendar, Users } from "lucide-react"

interface Investigator {
  id: string
  name: string
  email: string
  institution: string
  specialization: string
  bio: string
  orcid: string
  documentType: string
  documentNumber: string
  role: string
  status: string
  createdAt: string
}

export function UserManager() {
  const [investigators, setInvestigators] = useState<Investigator[]>([])
  const [filteredInvestigators, setFilteredInvestigators] = useState<Investigator[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<Investigator | null>(null)

  useEffect(() => {
    loadInvestigators()
  }, [])

  useEffect(() => {
    // Filtrar investigadores por término de búsqueda
    if (searchTerm) {
      const filtered = investigators.filter(inv => 
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredInvestigators(filtered)
    } else {
      setFilteredInvestigators(investigators)
    }
  }, [searchTerm, investigators])

  const loadInvestigators = () => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const researchers = users.filter((user: any) => user.role === 'researcher')
      setInvestigators(researchers)
      setFilteredInvestigators(researchers)
    } catch (error) {
      console.error('Error loading investigators:', error)
      toast.error('Error al cargar los investigadores')
    }
  }

  const handleDeleteUser = async (user: Investigator) => {
    try {
      // Eliminar usuario de la lista de usuarios
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const updatedUsers = users.filter((u: any) => u.id !== user.id)
      localStorage.setItem('users', JSON.stringify(updatedUsers))

      // Eliminar credenciales del usuario
      const credentials = JSON.parse(localStorage.getItem('credentials') || '{}')
      delete credentials[user.email]
      localStorage.setItem('credentials', JSON.stringify(credentials))

      // Eliminar solicitudes de permisos del usuario
      const permissionRequests = JSON.parse(localStorage.getItem('permission-requests') || '[]')
      const updatedRequests = permissionRequests.filter((req: any) => req.userId !== user.id)
      localStorage.setItem('permission-requests', JSON.stringify(updatedRequests))

      // Actualizar la lista local
      loadInvestigators()
      
      // Emitir evento para actualizar otros componentes
      window.dispatchEvent(new CustomEvent('usersUpdated'))
      
      toast.success(`Cuenta de ${user.name} eliminada exitosamente`)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al eliminar la cuenta del usuario')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspendido</Badge>
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Gestión de Investigadores</h2>
        <p className="text-muted-foreground">
          Administra las cuentas de los investigadores registrados en el sistema.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investigadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investigators.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {investigators.filter(inv => inv.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspendidos</CardTitle>
            <User className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {investigators.filter(inv => inv.status === 'suspended').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Investigadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar por nombre, email, institución o especialización</Label>
              <Input
                id="search"
                placeholder="Escribe para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="mt-6"
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Investigadores */}
      <Card>
        <CardHeader>
          <CardTitle>
            Investigadores Registrados ({filteredInvestigators.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvestigators.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron investigadores</h3>
              <p className="text-muted-foreground">
                {investigators.length === 0 
                  ? "Aún no hay investigadores registrados en la plataforma."
                  : "Intenta ajustar el término de búsqueda."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvestigators.map((investigator) => (
                <div key={investigator.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{investigator.name}</h3>
                        {getStatusBadge(investigator.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {investigator.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {investigator.institution}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {investigator.specialization}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(investigator.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      
                      {investigator.bio && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {investigator.bio}
                        </p>
                      )}
                      
                      {investigator.orcid && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <strong>ORCID:</strong> {investigator.orcid}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setSelectedUser(investigator)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente la cuenta de <strong>{investigator.name}</strong> y todos sus datos asociados. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteUser(investigator)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar Cuenta
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}