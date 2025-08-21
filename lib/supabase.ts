import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la base de datos
export interface Species {
  id: string
  nombre_cientifico: string
  nombre_comun: string
  familia: string
  categoria: string
  estado_conservacion: string
  descripcion: string
  habitat: string
  distribucion: string
  imagen_url?: string
  fecha_descubrimiento?: string
  investigador_responsable?: string
  notas_adicionales?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  cedula?: string
  orcid?: string
  institucion?: string
  rol: 'administrador' | 'investigador' // ✅ Cambiado de 'admin' a 'administrador'
  numero_documento?: string // ✅ Agregado para consistencia
  created_at?: string
  updated_at?: string
}