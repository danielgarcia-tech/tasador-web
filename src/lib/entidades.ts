import { supabase } from './supabase'

// Función para buscar entidades desde Supabase con búsqueda optimizada
export async function buscarEntidades(termino: string): Promise<Array<{codigo: string, nombre: string}>> {
  try {
    if (!termino || termino.length < 2) {
      return []
    }

    const { data, error } = await supabase
      .from('entidades')
      .select('nombre_corto, nombre_completo')
      .or(`nombre_corto.ilike.%${termino}%,nombre_completo.ilike.%${termino}%`)
      .order('nombre_corto')
      .limit(20)

    if (error) throw error

    return data?.map(entidad => ({
      codigo: entidad.nombre_corto,
      nombre: entidad.nombre_completo
    })) || []
  } catch (error) {
    console.error('Error buscando entidades:', error)
    return []
  }
}

// Obtener todas las entidades desde Supabase
export async function obtenerTodasEntidades(): Promise<Array<{codigo: string, nombre: string}>> {
  try {
    const { data, error } = await supabase
      .from('entidades')
      .select('nombre_corto, nombre_completo')
      .order('nombre_corto')

    if (error) throw error

    return data?.map(entidad => ({
      codigo: entidad.nombre_corto,
      nombre: entidad.nombre_completo
    })) || []
  } catch (error) {
    console.error('Error obteniendo entidades:', error)
    return []
  }
}

// Función para buscar entidades por código específico
export async function buscarEntidadPorCodigo(codigo: string): Promise<{codigo: string, nombre: string} | null> {
  try {
    const { data, error } = await supabase
      .from('entidades')
      .select('nombre_corto, nombre_completo')
      .eq('nombre_corto', codigo.toUpperCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No encontrado
      }
      throw error
    }

    return {
      codigo: data.nombre_corto,
      nombre: data.nombre_completo
    }
  } catch (error) {
    console.error('Error buscando entidad por código:', error)
    return null
  }
}