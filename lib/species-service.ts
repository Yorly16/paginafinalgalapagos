import { supabase } from './supabase'
import type { Species } from './supabase'

export class SpeciesService {
  // Obtener todas las especies
  static async getAllSpecies(): Promise<Species[]> {
    const { data, error } = await supabase
      .from('species')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching species:', error)
      throw error
    }
    
    return data || []
  }

  // Obtener especie por ID
  static async getSpeciesById(id: string): Promise<Species | null> {
    const { data, error } = await supabase
      .from('species')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching species:', error)
      return null
    }
    
    return data
  }

  // Crear nueva especie
  static async createSpecies(speciesData: Omit<Species, 'id' | 'created_at' | 'updated_at'>): Promise<Species> {
    const { data, error } = await supabase
      .from('species')
      .insert([speciesData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating species:', error)
      throw error
    }
    
    return data
  }

  // Actualizar especie
  static async updateSpecies(id: string, updates: Partial<Species>): Promise<Species> {
    const { data, error } = await supabase
      .from('species')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating species:', error)
      throw error
    }
    
    return data
  }

  // Eliminar especie
  static async deleteSpecies(id: string): Promise<void> {
    const { error } = await supabase
      .from('species')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting species:', error)
      throw error
    }
  }

  // Buscar especies
  static async searchSpecies(searchTerm: string, filters?: {
    category?: string
    status?: string
    location?: string
  }): Promise<Species[]> {
    let query = supabase
      .from('species')
      .select('*')
    
    // Búsqueda por término
    if (searchTerm) {
      query = query.or(`common_name.ilike.%${searchTerm}%,scientific_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }
    
    // Filtros adicionales
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error searching species:', error)
      throw error
    }
    
    return data || []
  }

  // Migrar datos desde localStorage
  static async migrateFromLocalStorage(): Promise<{ success: number; errors: number }> {
    try {
      const localData = localStorage.getItem('galapagos-species')
      if (!localData) {
        return { success: 0, errors: 0 }
      }

      const localSpecies = JSON.parse(localData)
      let success = 0
      let errors = 0

      for (const species of localSpecies) {
        try {
          // Mapear campos de localStorage a Supabase
          const supabaseSpecies = {
            common_name: species.commonName,
            scientific_name: species.scientificName,
            category: species.category,
            status: species.status,
            location: species.location,
            description: species.description,
            habitat: species.habitat,
            diet: species.diet,
            threats: species.threats,
            image_url: species.image,
            tags: species.tags || [],
            is_endemic: species.tags?.includes('endémica') || false
          }

          await this.createSpecies(supabaseSpecies)
          success++
        } catch (error) {
          console.error(`Error migrating species ${species.commonName}:`, error)
          errors++
        }
      }

      return { success, errors }
    } catch (error) {
      console.error('Error during migration:', error)
      throw error
    }
  }

  // Obtener estadísticas
  static async getStats(): Promise<{
    total: number
    endemic: number
    endangered: number
    byCategory: Record<string, number>
    byStatus: Record<string, number>
  }> {
    const { data, error } = await supabase
      .from('species')
      .select('category, status, is_endemic')
    
    if (error) {
      console.error('Error fetching stats:', error)
      throw error
    }

    const total = data.length
    const endemic = data.filter(s => s.is_endemic).length
    const endangered = data.filter(s => 
      ['critico', 'en-peligro', 'vulnerable'].includes(s.status)
    ).length

    const byCategory = data.reduce((acc, species) => {
      acc[species.category] = (acc[species.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byStatus = data.reduce((acc, species) => {
      acc[species.status] = (acc[species.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      endemic,
      endangered,
      byCategory,
      byStatus
    }
  }
}