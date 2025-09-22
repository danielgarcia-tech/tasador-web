// Calculator de costas judiciales - Nueva versión adaptada a base de datos

// Mapeo directo de criterios ICA a valores (extraído de valores_pordefecto.json)
const valoresCriteriosICA: Record<string, {
  allanamiento: number;
  audiencia_previa: number;
  juicio: number;
  factor_apelacion: number;
  verbal_alegaciones: number;
  verbal_vista: number;
}> = {
  "A Coruña": {
    allanamiento: 930.00,
    audiencia_previa: 1400.00,
    juicio: 2000.00,
    factor_apelacion: 0.6,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  },
  "Albacete": {
    allanamiento: 1105.50,
    audiencia_previa: 1658.25,
    juicio: 2211.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  },
  "Alicante": {
    allanamiento: 1440.00,
    audiencia_previa: 1920.00,
    juicio: 2880.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.75,
    verbal_vista: 0.25
  },
  "Almería": {
    allanamiento: 1328.40,
    audiencia_previa: 1881.90,
    juicio: 2214.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  },
  "Badajoz": {
    allanamiento: 1105.50,
    audiencia_previa: 1658.25,
    juicio: 2211.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  },
  "Barcelona": {
    allanamiento: 1800.00,
    audiencia_previa: 2400.00,
    juicio: 3600.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.75,
    verbal_vista: 0.25
  },
  "Cáceres": {
    allanamiento: 1105.50,
    audiencia_previa: 1658.25,
    juicio: 2211.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  },
  "Cádiz": {
    allanamiento: 1536.00,
    audiencia_previa: 2304.00,
    juicio: 3072.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.75,
    verbal_vista: 0.25
  },
  "Cantabria": {
    allanamiento: 1470.00,
    audiencia_previa: 1911.00,
    juicio: 2940.00,
    factor_apelacion: 0.6,
    verbal_alegaciones: 1176,
    verbal_vista: 2352
  },
  "Castellón": {
    allanamiento: 1440.00,
    audiencia_previa: 1920.00,
    juicio: 2880.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.75,
    verbal_vista: 0.25
  },
  "Córdoba": {
    allanamiento: 1326.60,
    audiencia_previa: 1437.15,
    juicio: 2211.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.75,
    verbal_vista: 0.25
  },
  "Granada": {
    allanamiento: 1326.60,
    audiencia_previa: 1437.15,
    juicio: 2211.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.75,
    verbal_vista: 0.25
  },
  "Huelva": {
    allanamiento: 1328.40,
    audiencia_previa: 1881.90,
    juicio: 2214.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.75,
    verbal_vista: 0.25
  },
  "Jaén": {
    allanamiento: 1658.25,
    audiencia_previa: 1437.15,
    juicio: 2211.0,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.75,
    verbal_vista: 0.25
  },
  "Jerez de la Frontera": {
    allanamiento: 1328.40,
    audiencia_previa: 1881.90,
    juicio: 2214.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.75,
    verbal_vista: 0.25
  },
  "Madrid": {
    allanamiento: 2900.00,
    audiencia_previa: 4350.00,
    juicio: 5800.00,
    factor_apelacion: 0.6,
    verbal_alegaciones: 2320,
    verbal_vista: 4640
  },
  "Málaga": {
    allanamiento: 1326.60,
    audiencia_previa: 1879.35,
    juicio: 2211.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.75,
    verbal_vista: 0.25
  },
  "Sevilla": {
    allanamiento: 1105.50,
    audiencia_previa: 1658.25,
    juicio: 2211.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  },
  "Valencia": {
    allanamiento: 1440.00,
    audiencia_previa: 1920.00,
    juicio: 2880.00,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.75,
    verbal_vista: 0.25
  },
  "Zaragoza": {
    allanamiento: 2782.50,
    audiencia_previa: 3617.25,
    juicio: 5565.00,
    factor_apelacion: 0.6,
    verbal_alegaciones: 0.4,
    verbal_vista: 0.6
  },
  // Valores adicionales basados en la BD
  "Ferrol": {
    allanamiento: 930.00,
    audiencia_previa: 1400.00,
    juicio: 2000.00,
    factor_apelacion: 0.6,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  },
  "Lugo": {
    allanamiento: 930.00,
    audiencia_previa: 1400.00,
    juicio: 2000.00,
    factor_apelacion: 0.6,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  },
  "Ourense": {
    allanamiento: 930.00,
    audiencia_previa: 1400.00,
    juicio: 2000.00,
    factor_apelacion: 0.6,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  },
  "Pontevedra": {
    allanamiento: 930.00,
    audiencia_previa: 1400.00,
    juicio: 2000.00,
    factor_apelacion: 0.6,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  },
  "Vigo": {
    allanamiento: 930.00,
    audiencia_previa: 1400.00,
    juicio: 2000.00,
    factor_apelacion: 0.6,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  },
  "Santiago": {
    allanamiento: 930.00,
    audiencia_previa: 1400.00,
    juicio: 2000.00,
    factor_apelacion: 0.6,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5
  }
};

// Función para calcular costas judiciales
export interface CalculoCostasParams {
  criterioICA: string;  // Solo necesitamos el criterio ICA de la BD
  tipoJuicio: 'Juicio Verbal' | 'Juicio Ordinario';
  faseTerminacion: string;
  instancia: 'PRIMERA INSTANCIA' | 'SEGUNDA INSTANCIA';
}

export interface ResultadoCalculo {
  costas: number;
  iva: number;
  total: number;
}

export function calcularCostas(params: CalculoCostasParams): ResultadoCalculo {
  const { criterioICA, tipoJuicio, faseTerminacion, instancia } = params;
  
  // Buscar los valores ICA para el criterio
  const valoresCriterio = valoresCriteriosICA[criterioICA];
  if (!valoresCriterio) {
    throw new Error(`Criterio ICA no encontrado: ${criterioICA}`);
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

// Función para verificar si un criterio ICA existe
export function existeCriterioICA(criterioICA: string): boolean {
  return criterioICA in valoresCriteriosICA;
}

// Función para obtener todos los criterios ICA disponibles
export function obtenerCriteriosICA(): string[] {
  return Object.keys(valoresCriteriosICA);
}