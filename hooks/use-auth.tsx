"use client"

import React, { useState, useEffect, createContext, useContext } from 'react'
import AuthService, { type AuthUser } from '@/lib/auth-service' // ✅ Importación corregida
import type { User } from '@/lib/supabase'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: any) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar usuario actual de Supabase únicamente
    AuthService.getCurrentUser().then(({ user: authUser, profile }) => {
      if (authUser && profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          nombre: profile.nombre,
          apellido: profile.apellido,
          rol: profile.rol,
          institucion: profile.institucion,
          orcid: profile.orcid,
          numero_documento: profile.numero_documento
        })
      }
      setLoading(false)
    }).catch((err) => {
      console.error('Error al obtener usuario actual:', err)
      setError('Error al cargar usuario')
      setLoading(false)
    })

    // Escuchar cambios de autenticación de Supabase
    const { data: { subscription } } = AuthService.onAuthStateChange((authUser, profile) => {
      if (authUser && profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          nombre: profile.nombre,
          apellido: profile.apellido,
          rol: profile.rol,
          institucion: profile.institucion,
          orcid: profile.orcid,
          numero_documento: profile.numero_documento
        })
      } else {
        setUser(null)
      }
      setLoading(false)
      setError(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      await AuthService.signIn(email, password)
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (userData: any) => {
    try {
      setError(null)
      setLoading(true)
      await AuthService.signUp(userData)
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await AuthService.signOut()
      setUser(null)
    } catch (err: any) {
      setError(err.message || 'Error al cerrar sesión')
      throw err
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No hay usuario autenticado')
    try {
      setError(null)
      await AuthService.updateProfile(user.id, updates)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil')
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}