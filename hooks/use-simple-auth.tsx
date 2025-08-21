'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { SimpleAuthService, SimpleUser } from '@/lib/simple-auth-service'

interface SimpleAuthContextType {
  user: SimpleUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (userData: {
    email: string
    password: string
    nombre: string
    apellido: string
    rol: 'administrador' | 'investigador'
    institucion?: string
    orcid?: string
    numero_documento?: string
  }) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  updateProfile: (updates: Partial<SimpleUser>) => Promise<{ success: boolean; error?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [loading, setLoading] = useState(false) // Cambiar a false por defecto

  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const loadUser = () => {
      try {
        if (typeof window === 'undefined') return

        const storedUser = localStorage.getItem('simple_auth_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          if (userData.id && userData.email && userData.rol) {
            setUser(userData)
          } else {
            localStorage.removeItem('simple_auth_user')
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('simple_auth_user')
        }
      }
    }

    loadUser()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await SimpleAuthService.signIn(email, password)
      
      if (result.success && result.user) {
        setUser(result.user)
        if (typeof window !== 'undefined') {
          localStorage.setItem('simple_auth_user', JSON.stringify(result.user))
        }
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Credenciales incorrectas' }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'Error de conexión' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (userData: {
    email: string
    password: string
    nombre: string
    apellido: string
    rol: 'administrador' | 'investigador'
    institucion?: string
    orcid?: string
    numero_documento?: string
  }) => {
    try {
      setLoading(true)
      const result = await SimpleAuthService.signUp(userData)
      
      if (result.success && result.user) {
        setUser(result.user)
        if (typeof window !== 'undefined') {
          localStorage.setItem('simple_auth_user', JSON.stringify(result.user))
        }
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Error en el registro' }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'Error interno del servidor' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('simple_auth_user')
      // También limpiar cualquier otro dato de sesión
      sessionStorage.clear()
    }
  }

  const updateProfile = async (updates: Partial<SimpleUser>) => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    try {
      setLoading(true)
      const result = await SimpleAuthService.updateProfile(user.id, updates)
      
      if (result.success && result.user) {
        setUser(result.user)
        if (typeof window !== 'undefined') {
          localStorage.setItem('simple_auth_user', JSON.stringify(result.user))
        }
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Error al actualizar perfil' }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: 'Error interno del servidor' }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    try {
      setLoading(true)
      const result = await SimpleAuthService.changePassword(user.id, currentPassword, newPassword)
      
      if (result.success) {
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Error al cambiar contraseña' }
      }
    } catch (error) {
      console.error('Change password error:', error)
      return { success: false, error: 'Error interno del servidor' }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword
  }

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  )
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext)
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider')
  }
  return context
}

// Hook de conveniencia para verificar roles
export function useAuthRole() {
  const { user } = useSimpleAuth()
  
  return {
    isAdmin: user?.rol === 'administrador',
    isResearcher: user?.rol === 'investigador',
    isAuthenticated: !!user,
    role: user?.rol || null
  }
}