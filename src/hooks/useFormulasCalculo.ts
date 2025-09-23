import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface FormulaCalculo {
  id: string
  nombre: string
  formula: string
  descripcion?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export function useFormulasCalculo() {
  const [formulas, setFormulas] = useState<FormulaCalculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFormulas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('formulas_calculo')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFormulas(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const createFormula = async (formula: Omit<FormulaCalculo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('formulas_calculo')
        .insert([formula])
        .select()
        .single()

      if (error) throw error
      setFormulas(prev => [data, ...prev])
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al crear fórmula')
    }
  }

  const updateFormula = async (id: string, updates: Partial<FormulaCalculo>) => {
    try {
      const { data, error } = await supabase
        .from('formulas_calculo')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setFormulas(prev => prev.map(f => f.id === id ? data : f))
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar fórmula')
    }
  }

  const deleteFormula = async (id: string) => {
    try {
      const { error } = await supabase
        .from('formulas_calculo')
        .delete()
        .eq('id', id)

      if (error) throw error
      setFormulas(prev => prev.filter(f => f.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al eliminar fórmula')
    }
  }

  useEffect(() => {
    fetchFormulas()
  }, [])

  return {
    formulas,
    loading,
    error,
    createFormula,
    updateFormula,
    deleteFormula,
    refetch: fetchFormulas
  }
}