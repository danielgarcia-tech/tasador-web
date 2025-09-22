import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Tasacion {
  id: string
  created_at: string
  updated_at: string
  user_id?: string
  nombre_cliente: string
  numero_procedimiento: string
  nombre_juzgado?: string
  entidad_demandada?: string
  municipio: string
  criterio_ica?: string
  tipo_proceso: 'Juicio Verbal' | 'Juicio Ordinario'
  fase_terminacion: string
  instancia: 'PRIMERA INSTANCIA' | 'SEGUNDA INSTANCIA'
  costas_sin_iva: number
  iva_21: number
  total: number
  nombre_usuario: string
  ref_aranzadi?: string
}

export interface Municipio {
  id: string
  nombre: string
  provincia: string
  criterio_ica: string
}

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
}

export interface Entidad {
  id: string
  nombre_corto: string
  nombre_completo: string
  created_at?: string
}