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
import { User, Trash2, Search, Mail, MapPin, Calendar, Users, Wifi, WifiOff, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useGitHubData } from "@/hooks/use-github-data"

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

interface UserCredentials {
  [email: string]: {
    password: string
    salt?: string
  }
}

interface PermissionRequest {
  id: string
  userId: string
  requestType: string
  status: string
  createdAt: string
  [key: string]: any
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

export function UserManager() {
  const [filteredInvestigators, setFilteredInvestigators] = useState<Investigator[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<Investigator | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Hooks para manejar datos con GitHub
  const {
    data: users,
    deleteItem: deleteUser,
    syncStatus: usersSyncStatus,
    error: usersError,
    pendingChanges: usersPendingChanges,
    isLoading: usersLoading
  } = useGitHubData<Investigator>('users')

  const {
    data: credentials,
    deleteItem: deleteCredential,
    syncStatus: credentialsSyncStatus,
    error: credentialsError
  } = useGitHubData<UserCredentials>('credentials')

  const {
    data: permissionRequests,
    updateItem: updatePermissionRequest,
    deleteItem: deletePermissionRequest,
    syncStatus: permissionsSyncStatus,
    error: permissionsError
  } = useGitHubData<PermissionRequest>('permissions')

  // Filtrar solo investigadores
  const investigators = users.filter(user => user.role === 'researcher')

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

  const handleDeleteUser = async (user: Investigator) => {
    if (isDeleting) return

    setIsDeleting(user.id)
    try {
      // Eliminar usuario
      await deleteUser(user.id)

      // Eliminar credenciales del usuario si existen
      if (credentials[user.email]) {
        await deleteCredential(user.email)
      }

      // Eliminar solicitudes de permisos del usuario
      const userPermissionRequests = permissionRequests.filter(req => req.userId === user.id)
      for (const request of userPermissionRequests) {
        await deletePermissionRequest(request.id)
      }
      
      toast.success(`Cuenta de ${user.name} eliminada exitosamente`)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al eliminar la cuenta del usuario')
    } finally {
      setIsDeleting(null)
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

  // Determinar el estado de sincronización general
  const overallSyncStatus = () => {
    const statuses = [usersSyncStatus, credentialsSyncStatus, permissionsSyncStatus]
    if (statuses.includes('error')) return 'error'
    if (statuses.includes('syncing')) return 'syncing'
    if (statuses.includes('offline')) return 'offline'
    if (statuses.every(status => status === 'synced')) return 'synced'
    return 'unknown'
  }

  const overallPendingChanges = usersPendingChanges + (permissionRequests.length > 0 ? 1 : 0)
  const overallError = usersError || credentialsError || permissionsError

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Gestión de Investigadores</h2>
          <p className="text-muted-foreground">
            Administra las cuentas de los investigadores registrados en el sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getSyncStatusIcon(overallSyncStatus())}
          <span className="text-sm text-gray-600">
            {getSyncStatusText(overallSyncStatus())}
          </span>
        </div>
      </div>

      {/* Mostrar cambios pendientes */}
      {overallPendingChanges > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            📝 {overallPendingChanges} cambio{overallPendingChanges !== 1 ? 's' : ''} pendiente{overallPendingChanges !== 1 ? 's' : ''} de sincronizar
          </p>
        </div>
      )}
      
      {/* Mostrar errores de sincronización */}
      {overallError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            ⚠️ Error de sincronización: {overallError}
          </p>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investigadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usersLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
              ) : (
                investigators.length
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {usersLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
              ) : (
                investigators.filter(inv => inv.status === 'active').length
              )}
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
              {usersLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
              ) : (
                investigators.filter(inv => inv.status === 'suspended').length
              )}
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
                disabled={usersLoading}
              />
            </div>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="mt-6"
                disabled={usersLoading}
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
          {usersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredInvestigators.length === 0 ? (
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
                            disabled={isDeleting === investigator.id}
                          >
                            {isDeleting === investigator.id ? (
                              <Clock className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-1" />
                            )}
                            {isDeleting === investigator.id ? 'Eliminando...' : 'Eliminar'}
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
                            <AlertDialogCancel disabled={isDeleting === investigator.id}>
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteUser(investigator)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={isDeleting === investigator.id}
                            >
                              {isDeleting === investigator.id ? 'Eliminando...' : 'Eliminar Cuenta'}
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