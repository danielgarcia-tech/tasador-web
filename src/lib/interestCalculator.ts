// interestCalculator.ts - Módulo para cálculos de intereses legales y judiciales
// Adaptado de la calculadora Python CALCULADORA_INTERES_LEGAL.PY

export interface InterestRate {
  año: number;
  'porcentaje anual': number;
}

export interface InterestCalculationInput {
  capital: number;
  fechaInicio: Date;
  fechaFin: Date;
  modalidad: 'legal' | 'judicial' | 'tae' | 'tae_plus5';
  taeContrato?: number; // Solo para modalidades TAE
  fechaSentencia?: Date; // Para distinguir legal vs judicial
}

export interface InterestCalculationResult {
  totalInteres: number;
  detallePorAño: Array<{
    año: number;
    dias: number;
    tasa: number;
    interes: number;
    tipo: 'legal' | 'judicial' | 'tae' | 'tae_plus5';
  }>;
}

export class InterestCalculator {
  private tasasInteres: InterestRate[] = [];

  constructor(tasasData?: InterestRate[]) {
    if (tasasData) {
      this.tasasInteres = tasasData;
    }
  }

  /**
   * Carga las tasas de interés desde un array de datos
   */
  loadInterestRates(data: InterestRate[]): void {
    this.tasasInteres = data.sort((a, b) => a.año - b.año);
  }

  /**
   * Obtiene la tasa de interés legal para un año específico
   */
  private getTasaAnual(año: number): number | null {
    const tasaData = this.tasasInteres.find(t => t.año === año);
    if (tasaData) {
      return tasaData['porcentaje anual'] / 100; // Convertir de porcentaje a decimal
    }

    // Si no hay datos para el año, intentar completar con el último valor conocido
    if (this.tasasInteres.length > 0) {
      const ultimoAño = Math.max(...this.tasasInteres.map(t => t.año));
      if (año > ultimoAño) {
        const ultimoValor = this.tasasInteres.find(t => t.año === ultimoAño);
        return ultimoValor ? ultimoValor['porcentaje anual'] / 100 : null;
      }

      const primerAño = Math.min(...this.tasasInteres.map(t => t.año));
      if (año < primerAño) {
        const primerValor = this.tasasInteres.find(t => t.año === primerAño);
        return primerValor ? primerValor['porcentaje anual'] / 100 : null;
      }
    }

    return null;
  }

  /**
   * Determina si un año es bisiesto
   */
  private esBisiesto(año: number): boolean {
    return (año % 4 === 0 && año % 100 !== 0) || (año % 400 === 0);
  }

  /**
   * Calcula el número de días entre dos fechas
   */
  private calcularDias(fechaInicio: Date, fechaFin: Date): number {
    // Calcular la diferencia en días de forma precisa
    // Establecer ambas fechas a las 00:00:00 para evitar problemas de hora
    const inicio = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
    const fin = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());
    
    const diffTime = fin.getTime() - inicio.getTime();
    const dias = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // En cálculos de intereses legales, se incluye el día de inicio
    // Pero solo si es una diferencia válida (no negativa)
    return Math.max(1, dias + 1);
  }

  /**
   * Obtiene la tasa de interés según la modalidad
   */
  private getTasaSegunModalidad(año: number, modalidad: string, taeContrato?: number): number | null {
    switch (modalidad) {
      case 'legal':
        return this.getTasaAnual(año);

      case 'judicial':
        const tasaLegal = this.getTasaAnual(año);
        return tasaLegal ? tasaLegal + 0.02 : null; // Legal + 2%

      case 'tae':
        // Convert percentage to decimal (e.g., 5.25% -> 0.0525)
        return taeContrato ? taeContrato / 100 : null;

      case 'tae_plus5':
        // Convert percentage to decimal and add 5% (e.g., 5.25% -> 0.1025)
        return taeContrato ? (taeContrato + 5) / 100 : null;

      default:
        return null;
    }
  }

  /**
   * Calcula los intereses para una entrada específica
   */
  calcularIntereses(input: InterestCalculationInput): InterestCalculationResult {
    const { capital, fechaInicio, fechaFin, modalidad, taeContrato, fechaSentencia } = input;

    const resultado: InterestCalculationResult = {
      totalInteres: 0,
      detallePorAño: []
    };

    // Determinar años a procesar
    const años = [];
    for (let año = fechaInicio.getFullYear(); año <= fechaFin.getFullYear(); año++) {
      años.push(año);
    }

    for (const año of años) {
      let inicioAño: Date;
      let finAño: Date;

      // Determinar período del año
      if (año === fechaInicio.getFullYear()) {
        inicioAño = new Date(fechaInicio);
      } else {
        inicioAño = new Date(año, 0, 1); // 1 de enero
      }

      if (año === fechaFin.getFullYear()) {
        finAño = new Date(fechaFin);
      } else {
        finAño = new Date(año, 11, 31); // 31 de diciembre
      }

      // Para modalidades judiciales, solo calcular los intereses judiciales (sin los legales previos)
      if (modalidad === 'judicial' && fechaSentencia) {
        // Determinar el inicio del período judicial
        let inicioJudicial: Date;
        
        if (inicioAño >= fechaSentencia) {
          // El período comienza en o después de la sentencia, todo es judicial
          inicioJudicial = inicioAño;
        } else {
          // El período comienza antes de la sentencia, el período judicial comienza al día siguiente
          inicioJudicial = new Date(fechaSentencia);
          inicioJudicial.setDate(inicioJudicial.getDate() + 1);
        }

        // Solo calcular si hay días judiciales en este año
        if (inicioJudicial < finAño) {
          const tasa = this.getTasaSegunModalidad(año, 'judicial', taeContrato);
          if (tasa) {
            const dias = this.calcularDias(inicioJudicial, finAño);
            const diasAño = this.esBisiesto(año) ? 366 : 365;
            const interes = Math.round((capital * tasa * (dias / diasAño)) * 100) / 100;

            resultado.totalInteres += interes;
            resultado.detallePorAño.push({
              año,
              dias,
              tasa,
              interes,
              tipo: 'judicial'
            });
          }
        }
      } else {
        // Cálculo normal para otras modalidades
        const tasa = this.getTasaSegunModalidad(año, modalidad, taeContrato);
        if (tasa) {
          const dias = this.calcularDias(inicioAño, finAño);
          const diasAño = this.esBisiesto(año) ? 366 : 365;
          const interes = Math.round((capital * tasa * (dias / diasAño)) * 100) / 100;

          resultado.totalInteres += interes;
          resultado.detallePorAño.push({
            año,
            dias,
            tasa,
            interes,
            tipo: modalidad as any
          });
        }
      }
    }

    // Redondear el total de intereses a 2 decimales
    resultado.totalInteres = Math.round(resultado.totalInteres * 100) / 100;

    return resultado;
  }

  /**
   * Calcula intereses usando una fórmula personalizada
   */
  calcularFormulaPersonalizada(
    formula: string,
    variables: Record<string, number>
  ): number {
    try {
      // Función segura para evaluar expresiones matemáticas simples
      const safeEval = (expr: string, vars: Record<string, number>): number => {
        // Reemplazar variables en la expresión
        let expression = expr;
        for (const [key, value] of Object.entries(vars)) {
          expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
        }

        // Solo permitir operaciones matemáticas básicas
        const allowedChars = /^[0-9+\-*/().\s]+$/;
        if (!allowedChars.test(expression)) {
          throw new Error('Expresión contiene caracteres no permitidos');
        }

        // Evaluar la expresión
        return Function(`"use strict"; return (${expression})`)();
      };

      return safeEval(formula, variables);
    } catch (error) {
      console.error('Error en fórmula personalizada:', error);
      return 0;
    }
  }
}

// Instancia global del calculador
export const interestCalculator = new InterestCalculator();

// Función para inicializar el calculador con datos de Supabase
export async function initializeInterestCalculator(): Promise<void> {
  try {
    // Importar supabase de forma dinámica para evitar errores de inicialización
    const { supabase } = await import('./supabase');
    
    // Cargar datos desde Supabase
    const { data, error } = await supabase
      .from('tae_interes_legal')
      .select('año, interes_legal')
      .order('año', { ascending: true });

    if (error) {
      throw new Error(`Error de Supabase: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No hay datos de intereses legales en Supabase');
    }

    // Transformar datos de Supabase al formato esperado
    const ratesFromDB: InterestRate[] = data.map((row: any) => ({
      año: row.año,
      'porcentaje anual': row.interes_legal
    }));

    interestCalculator.loadInterestRates(ratesFromDB);
    console.log(`✓ Cargadas ${ratesFromDB.length} tasas de interés desde Supabase`);
  } catch (error) {
    console.warn('Advertencia al cargar tasas de Supabase:', error);
    console.log('Intentando cargar desde archivo JSON fallback...');
    
    try {
      const response = await fetch('/interest-rates.json');
      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo JSON fallback');
      }
      const data: InterestRate[] = await response.json();
      interestCalculator.loadInterestRates(data);
      console.log(`✓ Cargadas ${data.length} tasas de interés desde JSON fallback`);
    } catch (fallbackError) {
      console.error('Error al cargar tasas de interés (ambas fuentes fallaron):', fallbackError);
      // Usar datos por defecto mínimos si todo falla
      const defaultRates: InterestRate[] = [
        { año: 2020, 'porcentaje anual': 3.0 },
        { año: 2021, 'porcentaje anual': 3.0 },
        { año: 2022, 'porcentaje anual': 3.0 },
        { año: 2023, 'porcentaje anual': 3.25 },
        { año: 2024, 'porcentaje anual': 3.25 },
        { año: 2025, 'porcentaje anual': 3.25 }
      ];
      interestCalculator.loadInterestRates(defaultRates);
      console.log('⚠ Usando tasas de interés por defecto (datos no disponibles)');
    }
  }
}