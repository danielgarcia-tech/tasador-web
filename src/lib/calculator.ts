// Calculator de costas judiciales - Nueva versión adaptada a base de datos
import { supabase } from './supabase';

// Función para calcular costas judiciales
export interface CalculoCostasParams {
  criterioICA: string;  // Solo necesitamos el criterio ICA de la BD
  tipoJuicio: 'Juicio Verbal' | 'Juicio Ordinario';
  faseTerminacion: string;
  instancia: 'PRIMERA INSTANCIA' | 'SEGUNDA INSTANCIA';
  fechaDemanda?: string; // Fecha de demanda para determinar si usar 18k o 24k
}

export interface ResultadoCalculo {
  costas: number;
  iva: number;
  total: number;
}

export async function calcularCostas(params: CalculoCostasParams): Promise<ResultadoCalculo> {
  const { criterioICA, tipoJuicio, faseTerminacion, instancia, fechaDemanda } = params;
  
  // Determinar qué tabla usar basado en la fecha de demanda
  // Fecha de corte: 3 de abril de 2025
  const fechaCorte = new Date('2025-04-03');
  const usar24k = fechaDemanda ? new Date(fechaDemanda) >= fechaCorte : false;
  const tablaCostas = usar24k ? 'costasxica24k' : 'costasxica';
  
  // Consultar los valores ICA desde la base de datos
  const { data: valoresCriterio, error } = await supabase
    .from(tablaCostas)
    .select('allanamiento, audiencia_previa, juicio, factor_apelacion, verbal_alegaciones, verbal_vista')
    .eq('ica', criterioICA)
    .single();

  if (error || !valoresCriterio) {
    throw new Error(`Criterio ICA no encontrado en la base de datos: ${criterioICA} (Tabla: ${tablaCostas})`);
  }

  let costas = 0;

  // Lógica de cálculo basada en el tipo de juicio y fase
  if (tipoJuicio === 'Juicio Ordinario') {
    switch (faseTerminacion) {
      case 'Allanamiento':
        costas = valoresCriterio.allanamiento;
        break;
      case 'Audiencia Previa':
        costas = valoresCriterio.audiencia_previa;
        break;
      case 'Juicio':
        costas = valoresCriterio.juicio;
        break;
      default:
        costas = valoresCriterio.juicio;
    }
  } else if (tipoJuicio === 'Juicio Verbal') {
    switch (faseTerminacion) {
      case 'Alegaciones':
        // Si verbal_alegaciones >= 1, usar valor directo, sino multiplicar por juicio_base
        if (valoresCriterio.verbal_alegaciones >= 1) {
          costas = valoresCriterio.verbal_alegaciones;
        } else {
          costas = valoresCriterio.juicio * valoresCriterio.verbal_alegaciones;
        }
        break;
      case 'Vista':
        // Si verbal_vista >= 1, usar valor directo, sino multiplicar por juicio_base
        if (valoresCriterio.verbal_vista >= 1) {
          costas = valoresCriterio.verbal_vista;
        } else {
          costas = valoresCriterio.juicio * valoresCriterio.verbal_vista;
        }
        break;
      default:
        // Por defecto usar Vista
        if (valoresCriterio.verbal_vista >= 1) {
          costas = valoresCriterio.verbal_vista;
        } else {
          costas = valoresCriterio.juicio * (valoresCriterio.verbal_alegaciones + valoresCriterio.verbal_vista);
        }
    }
  }

  // Aplicar factor de apelación si es segunda instancia
  if (instancia === 'SEGUNDA INSTANCIA') {
    costas *= valoresCriterio.factor_apelacion;
  }

  // Calcular IVA y total
  const iva = costas * 0.21;
  const total = costas + iva;

  return {
    costas: Math.round(costas * 100) / 100,
    iva: Math.round(iva * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

// Función para obtener las fases de terminación según el tipo de proceso
export function obtenerFasesTerminacion(tipoJuicio: 'Juicio Verbal' | 'Juicio Ordinario'): string[] {
  if (tipoJuicio === 'Juicio Ordinario') {
    return ['Allanamiento', 'Audiencia Previa', 'Juicio'];
  } else {
    return ['Alegaciones', 'Vista'];
  }
}