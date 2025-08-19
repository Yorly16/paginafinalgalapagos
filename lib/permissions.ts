"use client"

import { useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'researcher'
  permissions: Permission[]
  status: 'active' | 'pending' | 'suspended'
  createdAt: string
}

export interface Permission {
  id: string
  name: string
  description: string
  category: 'species' | 'data' | 'admin'
}

export interface PermissionRequest {
  id: string
  userId: string
  permissionId: string
  reason: string
  status: 'pending' | 'approved' | 'denied'
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

// Permisos disponibles
export const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: 'add-species',
    name: 'Añadir Especies',
    description: 'Permite añadir nuevas especies al sistema',
    category: 'species'
  },
  {
    id: 'edit-species',
    name: 'Editar Especies',
    description: 'Permite modificar especies existentes',
    category: 'species'
  },
  {
    id: 'delete-species',
    name: 'Eliminar Especies',
    description: 'Permite eliminar especies del sistema',
    category: 'species'
  },
  {
    id: 'local-search',
    name: 'Búsqueda Local',
    description: 'Acceso a la búsqueda en base de datos local',
    category: 'data'
  },
  {
    id: 'export-data',
    name: 'Exportar Datos',
    description: 'Permite exportar datos del sistema',
    category: 'data'
  }
]

// Hook para manejo de permisos
export const usePermissions = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  useEffect(() => {
    // Cargar usuario actual desde localStorage
    const loadCurrentUser = () => {
      try {
        // Usar 'current-user' consistentemente
        const userData = localStorage.getItem('current-user')
        if (userData) {
          const user = JSON.parse(userData)
          // Verificar que el usuario esté autenticado
          if (user.isAuthenticated) {
            setCurrentUser(user)
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
        setCurrentUser(null)
      }
    }

    loadCurrentUser()
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      loadCurrentUser()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  const hasPermission = (permissionId: string): boolean => {
    if (!currentUser) return false
    if (currentUser.role === 'admin') return true
    return currentUser.permissions.some(p => p.id === permissionId)
  }
  
  const requestPermission = async (permissionId: string, reason: string) => {
    if (!currentUser) return false
    
    try {
      const requests = JSON.parse(localStorage.getItem('permission-requests') || '[]')
      const newRequest: PermissionRequest = {
        id: Date.now().toString(),
        userId: currentUser.id,
        permissionId,
        reason: reason.trim(),
        status: 'pending',
        requestedAt: new Date().toISOString()
      }
      
      requests.push(newRequest)
      localStorage.setItem('permission-requests', JSON.stringify(requests))
      return true
    } catch (error) {
      console.error('Error requesting permission:', error)
      return false
    }
  }

  const updateUserPermissions = (newPermissions: Permission[]) => {
    if (!currentUser) return
    
    const updatedUser = { ...currentUser, permissions: newPermissions }
    setCurrentUser(updatedUser)
    localStorage.setItem('current-user', JSON.stringify(updatedUser))
  }
  
  return { 
    currentUser, 
    user: currentUser, // Añadir alias para compatibilidad
    hasPermission, 
    requestPermission, 
    updateUserPermissions,
    setCurrentUser 
  }
}

// Funciones utilitarias
export const getPermissionById = (id: string): Permission | undefined => {
  return AVAILABLE_PERMISSIONS.find(p => p.id === id)
}

export const getPermissionsByCategory = (category: Permission['category']): Permission[] => {
  return AVAILABLE_PERMISSIONS.filter(p => p.category === category)
}