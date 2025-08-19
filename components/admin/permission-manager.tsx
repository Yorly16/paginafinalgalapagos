"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { PermissionRequest, getPermissionById } from "@/lib/permissions"
import { Clock, Check, X, User } from "lucide-react"

export function PermissionManager() {
  const [requests, setRequests] = useState<PermissionRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null)
  const [reviewComment, setReviewComment] = useState('')

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = () => {
    try {
      const storedRequests = JSON.parse(localStorage.getItem('permission-requests') || '[]')
      setRequests(storedRequests)
    } catch (error) {
      console.error('Error loading requests:', error)
    }
  }

  const handleApprove = async (request: PermissionRequest) => {
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
      
      localStorage.setItem('permission-requests', JSON.stringify(updatedRequests))
      
      // Actualizar permisos del usuario en la lista de usuarios registrados
      const users = JSON.parse(localStorage.getItem('users') || '[]')
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
        
        localStorage.setItem('users', JSON.stringify(updatedUsers))
        
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
      
      setRequests(updatedRequests)
      toast.success('Solicitud aprobada correctamente')
    } catch (error) {
      toast.error('Error al aprobar la solicitud')
    }
  }

  const handleDeny = async (request: PermissionRequest) => {
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
      
      localStorage.setItem('permission-requests', JSON.stringify(updatedRequests))
      setRequests(updatedRequests)
      toast.success('Solicitud denegada')
    } catch (error) {
      toast.error('Error al denegar la solicitud')
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const reviewedRequests = requests.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Gestión de Permisos</h2>
        <p className="text-muted-foreground">
          Revisa y gestiona las solicitudes de permisos de los investigadores.
        </p>
      </div>

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
                        className="flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeny(request)}
                        className="flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        Denegar
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