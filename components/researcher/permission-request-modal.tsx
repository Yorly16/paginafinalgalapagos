"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { usePermissions, getPermissionById } from "@/lib/permissions"

interface PermissionRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permissionId: string
}

export function PermissionRequestModal({ 
  open, 
  onOpenChange, 
  permissionId
}: PermissionRequestModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { currentUser, requestPermission } = usePermissions()
  
  const permission = getPermissionById(permissionId)
  const permissionName = permission?.name || 'Permiso desconocido'

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Por favor, proporciona una razón para la solicitud')
      return
    }

    if (!currentUser) {
      toast.error('Usuario no autenticado')
      return
    }

    setIsSubmitting(true)
    
    try {
      const success = await requestPermission(permissionId, reason)
      
      if (success) {
        toast.success('Solicitud enviada correctamente. El administrador la revisará pronto.')
        onOpenChange(false)
        setReason('')
      } else {
        toast.error('Error al enviar la solicitud')
      }
    } catch (error) {
      console.error('Error al solicitar permiso:', error)
      toast.error('Error al enviar la solicitud')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Permiso: {permissionName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Razón de la solicitud</Label>
            <Textarea
              id="reason"
              placeholder="Explica por qué necesitas este permiso y cómo lo utilizarás..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Proporciona una explicación detallada para ayudar al administrador a evaluar tu solicitud.
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}