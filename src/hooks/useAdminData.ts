import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface ValorICA {
  id: string
  provincia: string
  criterio_ica: string
  allanamiento: number
  audiencia_previa: number
  juicio: number
  factor_apelacion: number
  verbal_alegaciones: number
  verbal_vista: number
  created_at: string
}

export function useValoresICA() {
  const [valores, setValores] = useState<ValorICA[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchValores = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('criterios_ica')
        .select('*')
        .order('criterio_ica')

      if (error) throw error
      setValores(data || [])
    } catch (error) {
      console.error('Error fetching valores ICA:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const createValor = async (valor: Omit<ValorICA, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('criterios_ica')
        .insert([valor])
        .select()
        .single()

      if (error) throw error
      
      setValores(prev => [...prev, data].sort((a, b) => a.criterio_ica.localeCompare(b.criterio_ica)))
      return data
    } catch (error) {
      console.error('Error creating valor ICA:', error)
      throw error
    }
  }

  const updateValor = async (id: string, updates: Partial<ValorICA>) => {
    try {
      const { data, error } = await supabase
        .from('criterios_ica')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setValores(prev => 
        prev.map(v => v.id === id ? { ...v, ...data } : v)
      )
      return data
    } catch (error) {
      console.error('Error updating valor ICA:', error)
      throw error
    }
  }

  const deleteValor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('criterios_ica')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setValores(prev => prev.filter(v => v.id !== id))
    } catch (error) {
      console.error('Error deleting valor ICA:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchValores()
  }, [])

  return {
    valores,
    loading,
    error,
    refresh: fetchValores,
    create: createValor,
    update: updateValor,
    delete: deleteValor,
  }
}

export interface MunicipioAdmin {
  id: string
  pj: string
  ica_aplicable: string
}

export function useMunicipios() {
  const [municipios, setMunicipios] = useState<MunicipioAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMunicipios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('municipios_ica')
        .select('*')
        .order('pj')

      if (error) throw error
      setMunicipios(data || [])
    } catch (error) {
      console.error('Error fetching municipios:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const createMunicipio = async (municipio: Omit<MunicipioAdmin, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('municipios_ica')
        .insert([municipio])
        .select()
        .single()

      if (error) throw error
      
      setMunicipios(prev => [...prev, data].sort((a, b) => a.pj.localeCompare(b.pj)))
      return data
    } catch (error) {
      console.error('Error creating municipio:', error)
      throw error
    }
  }

  const updateMunicipio = async (id: string, updates: Partial<MunicipioAdmin>) => {
    try {
      const { data, error } = await supabase
        .from('municipios_ica')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setMunicipios(prev => 
        prev.map(m => m.id === id ? { ...m, ...data } : m)
      )
      return data
    } catch (error) {
      console.error('Error updating municipio:', error)
      throw error
    }
  }

  const deleteMunicipio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('municipios_ica')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setMunicipios(prev => prev.filter(m => m.id !== id))
    } catch (error) {
      console.error('Error deleting municipio:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchMunicipios()
  }, [])

  return {
    municipios,
    loading,
    error,
    refresh: fetchMunicipios,
    create: createMunicipio,
    update: updateMunicipio,
    delete: deleteMunicipio,
  }
}

export interface EntidadAdmin {
  id: string
  nombre_corto: string
  nombre_completo: string
}

export function useEntidades() {
  const [entidades, setEntidades] = useState<EntidadAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntidades = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('entidades')
        .select('*')
        .order('nombre_corto')

      if (error) throw error
      setEntidades(data || [])
    } catch (error) {
      console.error('Error fetching entidades:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const createEntidad = async (entidad: Omit<EntidadAdmin, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('entidades')
        .insert([entidad])
        .select()
        .single()

      if (error) throw error
      
      setEntidades(prev => [...prev, data].sort((a, b) => a.nombre_corto.localeCompare(b.nombre_corto)))
      return data
    } catch (error) {
      console.error('Error creating entidad:', error)
      throw error
    }
  }

  const updateEntidad = async (id: string, updates: Partial<EntidadAdmin>) => {
    try {
      const { data, error } = await supabase
        .from('entidades')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setEntidades(prev => 
        prev.map(e => e.id === id ? { ...e, ...data } : e)
      )
      return data
    } catch (error) {
      console.error('Error updating entidad:', error)
      throw error
    }
  }

  const deleteEntidad = async (id: string) => {
    try {
      const { error } = await supabase
        .from('entidades')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setEntidades(prev => prev.filter(e => e.id !== id))
    } catch (error) {
      console.error('Error deleting entidad:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchEntidades()
  }, [])

  return {
    entidades,
    loading,
    error,
    refresh: fetchEntidades,
    create: createEntidad,
    update: updateEntidad,
    delete: deleteEntidad,
  }
}