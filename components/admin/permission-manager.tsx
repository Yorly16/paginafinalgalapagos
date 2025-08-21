"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { PermissionRequest, getPermissionById } from "@/lib/permissions"
import { Clock, Check, X, User, Wifi, WifiOff, CheckCircle, AlertCircle } from "lucide-react"
import { useGitHubData } from "@/hooks/use-github-data"

export function PermissionManager() {
  const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())

  // Usar el hook para gestionar solicitudes de permisos
  const {
    data: requests,
    loading: requestsLoading,
    error: requestsError,
    syncStatus: requestsSyncStatus,
    updateData: updateRequests,
    refetch: refetchRequests
  } = useGitHubData<PermissionRequest[]>('permissions', [])

  // Usar el hook para gestionar usuarios
  const {
    data: users,
    updateData: updateUsers,
    refetch: refetchUsers
  } = useGitHubData<any[]>('users', [])

  const handleApprove = async (request: PermissionRequest) => {
    if (processingRequests.has(request.id)) return
    
    setProcessingRequests(prev => new Set([...prev, request.id]))
    
    try {
      // Actualizar solicitud
      const updatedRequests = requests.map(r => 
        r.id === request.id 
          ? { 
              ...r, 
              status: 'approved' as const, 
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'admin'
            }
          : r
      )
      
      await updateRequests(updatedRequests)
      
      // Actualizar permisos del usuario
      const permission = getPermissionById(request.permissionId)
      
      if (permission) {
        const updatedUsers = users.map((user: any) => {
          if (user.id === request.userId) {
            const userPermissions = user.permissions || []
            // Evitar duplicados
            if (!userPermissions.some((p: any) => p.id === permission.id)) {
              return {
                ...user,
                permissions: [...userPermissions, permission]
              }
            }
          }
          return user
        })
        
        await updateUsers(updatedUsers)
        
        // También actualizar el usuario actual si está logueado
        const currentUser = JSON.parse(localStorage.getItem('current-user') || '{}')
        if (currentUser.id === request.userId) {
          const currentUserPermissions = currentUser.permissions || []
          if (!currentUserPermissions.some((p: any) => p.id === permission.id)) {
            const updatedCurrentUser = {
              ...currentUser,
              permissions: [...currentUserPermissions, permission]
            }
            localStorage.setItem('current-user', JSON.stringify(updatedCurrentUser))
          }
        }
      }
      
      toast.success('Solicitud aprobada correctamente')
    } catch (error) {
      console.error('Error al aprobar solicitud:', error)
      toast.error('Error al aprobar la solicitud')
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(request.id)
        return newSet
      })
    }
  }

  const handleDeny = async (request: PermissionRequest) => {
    if (processingRequests.has(request.id)) return
    
    setProcessingRequests(prev => new Set([...prev, request.id]))
    
    try {
      const updatedRequests = requests.map(r => 
        r.id === request.id 
          ? { 
              ...r, 
              status: 'denied' as const, 
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'admin'
            }
          : r
      )
      
      await updateRequests(updatedRequests)
      toast.success('Solicitud denegada')
    } catch (error) {
      console.error('Error al denegar solicitud:', error)
      toast.error('Error al denegar la solicitud')
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(request.id)
        return newSet
      })
    }
  }

  const getSyncStatusIcon = () => {
    switch (requestsSyncStatus) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'syncing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />
    }
  }

  const getSyncStatusText = () => {
    switch (requestsSyncStatus) {
      case 'synced':
        return 'Sincronizado'
      case 'syncing':
        return 'Sincronizando...'
      case 'offline':
        return 'Sin conexión'
      case 'error':
        return 'Error de sincronización'
      default:
        return 'Conectando...'
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const reviewedRequests = requests.filter(r => r.status !== 'pending')

  if (requestsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Gestión de Permisos</h2>
            <p className="text-muted-foreground">
              Revisa y gestiona las solicitudes de permisos de los investigadores.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 animate-spin" />
            Cargando...
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Gestión de Permisos</h2>
          <p className="text-muted-foreground">
            Revisa y gestiona las solicitudes de permisos de los investigadores.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {getSyncStatusIcon()}
          {getSyncStatusText()}
        </div>
      </div>

      {requestsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Error al cargar solicitudes: {requestsError}</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => refetchRequests()}
                className="ml-auto"
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solicitudes Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Solicitudes Pendientes ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay solicitudes pendientes
            </p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => {
                const permission = getPermissionById(request.permissionId)
                const isProcessing = processingRequests.has(request.id)
                
                return (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{permission?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Solicitado el {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        <User className="h-3 w-3 mr-1" />
                        {request.userId}
                      </Badge>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Razón:</Label>
                      <p className="text-sm mt-1 p-2 bg-muted rounded">{request.reason}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(request)}
                        disabled={isProcessing}
                        className="flex items-center gap-1"
                      >
                        {isProcessing ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {isProcessing ? 'Procesando...' : 'Aprobar'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeny(request)}
                        disabled={isProcessing}
                        className="flex items-center gap-1"
                      >
                        {isProcessing ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        {isProcessing ? 'Procesando...' : 'Denegar'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de Solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewedRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay solicitudes revisadas
            </p>
          ) : (
            <div className="space-y-3">
              {reviewedRequests.map((request) => {
                const permission = getPermissionById(request.permissionId)
                return (
                  <div key={request.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{permission?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.userId} - {new Date(request.reviewedAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                      {request.status === 'approved' ? 'Aprobado' : 'Denegado'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}