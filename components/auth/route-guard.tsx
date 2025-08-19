"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/lib/permissions'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'researcher'
  redirectTo?: string
}

export function RouteGuard({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: RouteGuardProps) {
  const { currentUser } = usePermissions()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      // Verificar si hay usuario autenticado
      if (!currentUser || !currentUser.isAuthenticated) {
        router.push(redirectTo)
        return
      }

      // Verificar rol si es requerido
      if (requiredRole && currentUser.role !== requiredRole) {
        // Redirigir al panel correcto según el rol del usuario
        if (currentUser.role === 'admin') {
          router.push('/admin')
        } else if (currentUser.role === 'researcher') {
          router.push('/researcher')
        } else {
          router.push(redirectTo)
        }
        return
      }

      // Usuario autorizado
      setIsAuthorized(true)
      setIsLoading(false)
    }

    // Pequeño delay para evitar flash de contenido
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [currentUser, requiredRole, router, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // El router.push ya redirigió
  }

  return <>{children}</>
}