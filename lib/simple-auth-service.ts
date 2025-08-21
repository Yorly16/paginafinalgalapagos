import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

export interface SimpleUser {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: 'administrador' | 'investigador'
  institucion?: string
  orcid?: string
  numero_documento?: string
}

export interface AuthResult {
  success: boolean
  user?: SimpleUser
  error?: string
}

export class SimpleAuthService {
  static async signUp(userData: {
    email: string
    password: string
    nombre: string
    apellido: string
    rol?: 'administrador' | 'investigador'
    institucion?: string
    orcid?: string
    numero_documento?: string
  }): Promise<AuthResult> {
    try {
      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(userData.password, 10)
      
      // Insertar usuario en la tabla
      const { data, error } = await supabase
        .from('usuarios_auth')
        .insert({
          email: userData.email.toLowerCase(),
          password_hash: passwordHash,
          nombre: userData.nombre,
          apellido: userData.apellido,
          rol: userData.rol || 'investigador',
          institucion: userData.institucion,
          orcid: userData.orcid,
          numero_documento: userData.numero_documento
        })
        .select()
        .single()
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          return { success: false, error: 'El email ya está registrado' }
        }
        return { success: false, error: `Error al registrar usuario: ${error.message}` }
      }
      
      return { success: true, user: this.mapToUser(data) }
    } catch (error: any) {
      console.error('Error en signUp:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Buscar usuario por email
      const { data, error } = await supabase
        .from('usuarios_auth')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()
      
      if (error || !data) {
        return { success: false, error: 'Usuario no encontrado' }
      }
      
      // Verificar contraseña
      const isValid = await bcrypt.compare(password, data.password_hash)
      if (!isValid) {
        return { success: false, error: 'Contraseña incorrecta' }
      }
      
      return { success: true, user: this.mapToUser(data) }
    } catch (error: any) {
      console.error('Error en signIn:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  static async updateProfile(userId: number, updates: Partial<Omit<SimpleUser, 'id' | 'email'>>): Promise<AuthResult> {
    try {
      const { data, error } = await supabase
        .from('usuarios_auth')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) {
        return { success: false, error: `Error al actualizar perfil: ${error.message}` }
      }
      
      return { success: true, user: this.mapToUser(data) }
    } catch (error: any) {
      console.error('Error en updateProfile:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      // Verificar contraseña actual
      const { data: userData, error: fetchError } = await supabase
        .from('usuarios_auth')
        .select('password_hash')
        .eq('id', userId)
        .single()
      
      if (fetchError || !userData) {
        return { success: false, error: 'Usuario no encontrado' }
      }
      
      const isCurrentValid = await bcrypt.compare(currentPassword, userData.password_hash)
      if (!isCurrentValid) {
        return { success: false, error: 'Contraseña actual incorrecta' }
      }
      
      // Hash de la nueva contraseña
      const newPasswordHash = await bcrypt.hash(newPassword, 10)
      
      // Actualizar contraseña
      const { error: updateError } = await supabase
        .from('usuarios_auth')
        .update({ 
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (updateError) {
        return { success: false, error: `Error al cambiar contraseña: ${updateError.message}` }
      }
      
      return { success: true }
    } catch (error: any) {
      console.error('Error en changePassword:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  private static mapToUser(data: any): SimpleUser {
    return {
      id: data.id,
      email: data.email,
      nombre: data.nombre,
      apellido: data.apellido,
      rol: data.rol,
      institucion: data.institucion,
      orcid: data.orcid,
      numero_documento: data.numero_documento
    }
  }
}

export default SimpleAuthService