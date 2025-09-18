import { supabase } from './supabase'

export interface MunicipioInfo {
  municipio: string;
  criterio_ica: string;
  provincia?: string;
}

// Función para buscar municipios desde Supabase con búsqueda optimizada
export async function buscarMunicipios(termino: string): Promise<MunicipioInfo[]> {
  try {
    if (!termino || termino.length < 2) {
      return []
    }

    const { data, error } = await supabase
      .from('municipios_ica')
      .select('pj, ica_aplicable')
      .ilike('pj', `%${termino}%`)
      .order('pj')
      .limit(20)

    if (error) throw error

    return data?.map(m => ({
      municipio: m.pj,
      criterio_ica: m.ica_aplicable,
      provincia: m.ica_aplicable
    })) || []
  } catch (error) {
    console.error('Error buscando municipios:', error)
    return []
  }
}

// Obtener todos los municipios desde Supabase
export async function obtenerTodosMunicipios(): Promise<MunicipioInfo[]> {
  try {
    const { data, error } = await supabase
      .from('municipios_ica')
      .select('pj, ica_aplicable')
      .order('ica_aplicable, pj')

    if (error) throw error

    return data?.map(m => ({
      municipio: m.pj,
      criterio_ica: m.ica_aplicable,
      provincia: m.ica_aplicable
    })) || []
  } catch (error) {
    console.error('Error obteniendo municipios:', error)
    return []
  }
}

// Función para buscar municipio por nombre exacto
export async function buscarMunicipioPorNombre(nombre: string): Promise<MunicipioInfo | null> {
  try {
    const { data, error } = await supabase
      .from('municipios_ica')
      .select('pj, ica_aplicable')
      .ilike('pj', nombre)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No encontrado
      }
      throw error
    }

    return {
      municipio: data.pj,
      criterio_ica: data.ica_aplicable,
      provincia: data.ica_aplicable
    }
  } catch (error) {
    console.error('Error buscando municipio por nombre:', error)
    return null
  }
}

// Función para obtener municipios por provincia
export async function obtenerMunicipiosPorProvincia(provincia: string): Promise<MunicipioInfo[]> {
  try {
    const { data, error } = await supabase
      .from('municipios_ica')
      .select('pj, ica_aplicable')
      .eq('ica_aplicable', provincia)
      .order('pj')

    if (error) throw error

    return data?.map(m => ({
      municipio: m.pj,
      criterio_ica: m.ica_aplicable,
      provincia: m.ica_aplicable
    })) || []
  } catch (error) {
    console.error('Error obteniendo municipios por provincia:', error)
    return []
  }
}

// Función para obtener criterios ICA disponibles
export async function obtenerCriteriosICA(): Promise<Array<{provincia: string, criterio_ica: string}>> {
  try {
    const { data, error } = await supabase
      .from('municipios_ica')
      .select('ica_aplicable')
      .order('ica_aplicable')

    if (error) throw error

    // Eliminar duplicados
    const uniqueCriterios = data?.reduce((acc, curr) => {
      const key = curr.ica_aplicable
      if (!acc.some(item => item.provincia === key)) {
        acc.push({
          provincia: curr.ica_aplicable,
          criterio_ica: curr.ica_aplicable
        })
      }
      return acc
    }, [] as Array<{provincia: string, criterio_ica: string}>)

    return uniqueCriterios || []
  } catch (error) {
    console.error('Error obteniendo criterios ICA:', error)
    return []
  }
}