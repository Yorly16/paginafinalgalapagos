import { supabase } from './supabase'
import type { User } from './supabase'

export interface AuthUser {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: 'administrador' | 'investigador'
  institucion?: string
  orcid?: string
  numero_documento?: string
}

export class AuthService {
  // Registrar nuevo usuario
  static async signUp(userData: {
    email: string
    password: string
    nombre: string
    apellido: string
    numero_documento?: string
    orcid?: string
    institucion?: string
    rol: 'administrador' | 'investigador'
  }) {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })
  
      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')
  
      // 2. Crear perfil en la tabla users
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          nombre: userData.nombre,
          apellido: userData.apellido,
          numero_documento: userData.numero_documento,
          orcid: userData.orcid,
          institucion: userData.institucion,
          rol: userData.rol
        })
        .select()
        .single()

      if (profileError) {
        // Si falla la creación del perfil, eliminar el usuario de auth
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw profileError
      }

      return { user: authData.user, profile: userProfile }
    } catch (error) {
      console.error('Error en registro:', error)
      throw error
    }
  }

  // Iniciar sesión
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      if (!data.user) throw new Error('No se pudo iniciar sesión')

      const profile = await this.getUserProfile(data.user.id)
      if (!profile) throw new Error('No se encontró el perfil del usuario')

      return { user: data.user, profile }
    } catch (error) {
      console.error('Error en inicio de sesión:', error)
      throw error
    }
  }

  // Cerrar sesión
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      throw error
    }
  }

  // Obtener perfil de usuario
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al obtener perfil:', error)
      return null
    }
  }

  // Obtener usuario actual
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      if (!user) return { user: null, profile: null }

      const profile = await this.getUserProfile(user.id)
      return { user, profile }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error)
      return { user: null, profile: null }
    }
  }

  // Verificar si el usuario está autenticado
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    } catch {
      return false
    }
  }

  // Escuchar cambios de autenticación
  static onAuthStateChange(callback: (user: any, profile: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id)
        callback(session.user, profile)
      } else {
        callback(null, null)
      }
    })
  }

  // Actualizar perfil de usuario
  static async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      throw error
    }
  }

  // Cambiar contraseña
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      throw error
    }
  }
}

// ✅ Exportación por defecto para evitar problemas de importación
export default AuthService