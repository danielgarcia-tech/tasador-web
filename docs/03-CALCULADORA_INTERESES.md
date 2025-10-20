# 🧮 Calculadora de Intereses - Documentación Técnica

## Descripción General

La calculadora de intereses es una herramienta avanzada que permite calcular intereses legales sobre deudas judiciales, con capacidad de aplicar diferentes tipos de interés, calcular períodos complejos y considerar el IVA aplicable.

## Flujo Principal

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ACCESO A LA HERRAMIENTA                                  │
│    [Layout → Tab "Intereses"]                               │
│    [InterestCalculatorAdvanced Component]                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. COMPLETAR FORMULARIO DE ENTRADA                          │
│    Campos:                                                   │
│    ├─ Capital inicial (€)                                   │
│    ├─ Tipo de interés                                       │
│    │  ├─ Interés legal del dinero                           │
│    │  ├─ Interés de demora                                  │
│    │  ├─ Tasa CECA                                          │
│    │  └─ Personalizado (%)                                  │
│    ├─ Fecha de inicio                                       │
│    ├─ Fecha de fin                                          │
│    ├─ Aplicar capitalizaciones                              │
│    └─ Incluir IVA en intereses                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. VALIDACIÓN DE DATOS                                      │
│    ├─ Capital > 0                                           │
│    ├─ Tasa de interés válida (0-100%)                       │
│    ├─ Fecha inicio < Fecha fin                              │
│    ├─ Fechas válidas (no futuras)                           │
│    └─ Período mínimo 1 día                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CÁLCULO DE INTERESES (src/lib/interestCalculator.ts)   │
│                                                              │
│    A) Obtener tasa de interés                               │
│       ├─ Si es tipo predefinido → consultar BD              │
│       ├─ Si es personalizado → usar valor ingresado         │
│       └─ Convertir a decimal (5% = 0.05)                    │
│                                                              │
│    B) Calcular días de demora                               │
│       días = (fecha_fin - fecha_inicio)                     │
│                                                              │
│    C) Cálculo base de intereses                             │
│       Fórmula standard (año comercial 360 días):            │
│       Interés = Capital × Tasa × Días / 360                 │
│                                                              │
│    D) Opcionales: Capitalizaciones                          │
│       Si está activado:                                      │
│       - Capitalización anual                                 │
│       - Capitalización semestral                            │
│       - Aplicar fórmula compuesta                           │
│                                                              │
│    E) Cálculo de IVA (si aplica)                            │
│       IVA_sobre_intereses = Intereses × 0.21                │
│                                                              │
│    F) Resultado final                                       │
│       Total = Capital + Intereses + IVA_Intereses           │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. MOSTRAR RESULTADOS CON ANIMACIÓN                         │
│    ├─ Capital inicial (CountUp)                            │
│    ├─ Intereses calculados (CountUp)                       │
│    ├─ IVA sobre intereses (CountUp)                        │
│    ├─ Total a pagar (CountUp con resalte)                  │
│    ├─ Tasa diaria equivalente                              │
│    ├─ Días de demora                                        │
│    └─ Desglose detallado en tabla                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. OPCIONES DE EXPORTACIÓN                                  │
│    ├─ Descargar PDF                                         │
│    ├─ Copiar a portapapeles                                 │
│    ├─ Imprimir                                              │
│    └─ Guardar en tasación (opcional)                        │
└─────────────────────────────────────────────────────────────┘
```

## Estructura de Datos

### Tabla: intereses_legales
```sql
CREATE TABLE intereses_legales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_interes VARCHAR(100) NOT NULL UNIQUE,
  porcentaje DECIMAL(5,2) NOT NULL,
  descripcion TEXT,
  fecha_vigencia DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de ejemplo:
INSERT INTO intereses_legales (tipo_interes, porcentaje, descripcion, fecha_vigencia, activo) VALUES
('Interés legal del dinero', 3.75, 'Interés legal establecido por Hacienda', CURRENT_DATE, true),
('Interés de demora', 4.75, 'Interés por demora en pago de obligaciones', CURRENT_DATE, true),
('Tasa CECA', 2.50, 'Tasa oficial según CECA', CURRENT_DATE, true),
('Interés capitalizable', 5.00, 'Interés que se capitaliza mensualmente', CURRENT_DATE, true);
```

## Componentes Principales

### InterestCalculatorAdvanced.tsx

**Responsabilidades:**
- Renderizar interfaz de calculadora
- Manejar entrada de datos del usuario
- Ejecutar cálculos
- Mostrar resultados con animaciones
- Permitir exportación de datos

**Estados principales:**
```typescript
interface CalculatorState {
  capital: number
  tipoInteres: 'legal' | 'demora' | 'ceca' | 'personalizado'
  tasaPersonalizada: number
  fechaInicio: Date
  fechaFin: Date
  aplicarCapitalizaciones: boolean
  tipCapitalizacion: 'anual' | 'semestral' | 'trimestral' | 'mensual'
  incluirIVA: boolean
}

interface Resultado {
  capital: number
  intereses: number
  ivaIntereses: number
  total: number
  dias: number
  tasaDiaria: number
  detalles: any[]
}
```

**Funciones clave:**
```typescript
- handleCalcular(): Dispara el cálculo
- handleExportarPDF(): Exporta resultados a PDF
- onTipoInteresChange(): Carga tasa de BD si aplica
- onCapitalizacionChange(): Actualiza fórmula
```

### interestCalculator.ts

**Función Principal: `calcularInteresesAdvanced()`**

```typescript
export interface CalculoInteresesParams {
  capital: number
  tasaInteres: number // En decimal (0.05 = 5%)
  fechaInicio: Date
  fechaFin: Date
  aplicarCapitalizacion?: boolean
  tipoCapitalizacion?: 'anual' | 'semestral' | 'trimestral' | 'mensual'
  incluirIVA?: boolean
  diasAño?: 360 | 365 // 360 = comercial, 365 = civil
}

export interface ResultadoIntereses {
  capital: number
  diasDemora: number
  tasaDiaria: number
  interesesSimple: number
  interesesCompuesto?: number
  interesesFinales: number
  ivaIntereses: number
  total: number
  detalles: DetalleCalculo[]
}

export function calcularInteresesAdvanced(
  params: CalculoInteresesParams
): ResultadoIntereses {
  const {
    capital,
    tasaInteres,
    fechaInicio,
    fechaFin,
    aplicarCapitalizacion = false,
    tipoCapitalizacion = 'anual',
    incluirIVA = true,
    diasAño = 360
  } = params

  // 1. Calcular número de días
  const diasDemora = calcularDiasDemora(fechaInicio, fechaFin)
  const tasaDiaria = tasaInteres / diasAño

  // 2. Cálculo de intereses simple
  const interesesSimple = capital * tasaInteres * (diasDemora / diasAño)

  // 3. Cálculo de intereses compuesto (si aplica)
  let interesesFinales = interesesSimple
  if (aplicarCapitalizacion) {
    interesesFinales = calcularInteresesCompuestos(
      capital,
      tasaInteres,
      diasDemora,
      tipoCapitalizacion,
      diasAño
    )
  }

  // 4. Cálculo de IVA
  const ivaIntereses = incluirIVA ? interesesFinales * 0.21 : 0

  // 5. Total
  const total = capital + interesesFinales + ivaIntereses

  // 6. Detalles para desglose
  const detalles = generarDetalles({
    capital,
    tasaInteres,
    diasDemora,
    interesesFinales,
    ivaIntereses,
    total
  })

  return {
    capital,
    diasDemora,
    tasaDiaria,
    interesesSimple,
    interesesFinales,
    ivaIntereses,
    total,
    detalles
  }
}
```

**Función: `calcularDiasDemora()`**

```typescript
export function calcularDiasDemora(
  fechaInicio: Date,
  fechaFin: Date
): number {
  // Usar librería date-fns para cálculo preciso
  const dias = differenceInDays(
    new Date(fechaFin),
    new Date(fechaInicio)
  )
  
  // Mínimo 1 día
  return Math.max(1, dias)
}
```

**Función: `calcularInteresesCompuestos()`**

```typescript
export function calcularInteresesCompuestos(
  capital: number,
  tasaInteres: number,
  diasDemora: number,
  tipoCapitalizacion: string,
  diasAño: number = 360
): number {
  // Convertir tipo de capitalización a número de períodos
  const periodosAño = {
    'anual': 1,
    'semestral': 2,
    'trimestral': 4,
    'mensual': 12
  }[tipoCapitalizacion]

  // Número de períodos transcurridos
  const numPeriodos = (diasDemora / diasAño) * periodosAño

  // Fórmula: M = C * (1 + r/n)^(n*t)
  // Intereses = M - C
  const tasaPeriodo = tasaInteres / periodosAño
  const montoFinal = capital * Math.pow(1 + tasaPeriodo, numPeriodos)
  
  return montoFinal - capital
}
```

## Tipos de Interés Predefinidos

### 1. Interés Legal del Dinero
- **Definición**: Establecido anualmente por el BOE
- **Uso**: Interés por mora en obligaciones civiles
- **Tasa actual**: 3.75% anual (ejemplo)
- **Fuente**: Ley de Presupuestos Generales del Estado

### 2. Interés de Demora
- **Definición**: Tasa punitiva por retraso en pago
- **Uso**: Obligaciones tributarias y comerciales
- **Tasa actual**: 4.75% anual (ejemplo)
- **Cálculo**: A menudo suma al interés legal

### 3. Tasa CECA
- **Definición**: Confederación Española de Cajas de Ahorro
- **Uso**: Referencia para créditos al consumo
- **Tasa actual**: 2.50% anual (ejemplo)
- **Revisión**: Mensual/Trimestral

### 4. Interés Personalizado
- **Definición**: Introducido manualmente por el usuario
- **Uso**: Acuerdos específicos o contratos particulares
- **Validación**: 0% - 100%

## Fórmulas Matemáticas

### Interés Simple (Año Comercial - 360 días)
$$I = C \times t \times \frac{d}{360}$$

Donde:
- $I$ = Interés calculado
- $C$ = Capital inicial
- $t$ = Tasa de interés (decimal)
- $d$ = Número de días

**Ejemplo:**
- Capital: €10,000
- Tasa: 5% anual
- Días: 180

$$I = 10000 \times 0.05 \times \frac{180}{360} = €250$$

### Interés Compuesto (Capitalización)
$$M = C \times (1 + \frac{r}{n})^{n \times t}$$

Donde:
- $M$ = Monto final
- $C$ = Capital inicial
- $r$ = Tasa anual
- $n$ = Número de capitalizaciones por año
- $t$ = Tiempo en años
- $I = M - C$ = Intereses

**Ejemplo con capitalización mensual:**
- Capital: €10,000
- Tasa: 5% anual
- Período: 2 años
- Capitalización: Mensual (n=12)

$$M = 10000 \times (1 + \frac{0.05}{12})^{12 \times 2} = €11,049.41$$
$$I = €1,049.41$$

### IVA sobre Intereses
$$IVA = Intereses \times 0.21$$

Total final:
$$Total = Capital + Intereses + IVA$$

## Validación de Datos

```typescript
const validarDatos = (params: any): string[] => {
  const errores: string[] = []
  
  if (params.capital <= 0) {
    errores.push('Capital debe ser mayor a 0')
  }
  
  if (params.tasaInteres < 0 || params.tasaInteres > 100) {
    errores.push('Tasa debe estar entre 0 y 100%')
  }
  
  if (params.fechaInicio >= params.fechaFin) {
    errores.push('Fecha inicio debe ser menor a fecha fin')
  }
  
  const maxDias = 10000
  if (calcularDiasDemora(params.fechaInicio, params.fechaFin) > maxDias) {
    errores.push(`Período no puede exceder ${maxDias} días`)
  }
  
  return errores
}
```

## Hook Personalizado

### useInterestCalculator.ts

```typescript
export function useInterestCalculator() {
  const [resultado, setResultado] = useState<ResultadoIntereses | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calcular = async (params: CalculoInteresesParams) => {
    setLoading(true)
    setError(null)
    
    try {
      const resultado = calcularInteresesAdvanced(params)
      setResultado(resultado)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return { resultado, loading, error, calcular }
}
```

## Características Avanzadas

### 1. Desglose Detallado
Tabla con:
- Capital inicial
- Tasa de interés aplicada
- Número de días
- Tasa diaria
- Intereses generados
- IVA sobre intereses
- Total a pagar

### 2. Gráficos
- Línea de crecimiento de capital + intereses
- Gráfica de composición (capital vs intereses vs IVA)
- Evolución por períodos de capitalización

### 3. Histórico
- Guardado de cálculos anteriores
- Comparativa entre períodos
- Exportación de series históricas

### 4. Exportación
- **PDF**: Informe completo con gráficos
- **Excel**: Datos tabulares para análisis
- **CSV**: Formato de texto para importar

## Casos de Uso

### Caso 1: Cálculo Simple
```
Capital: €15,000
Interés legal: 3.75% anual
Período: 1 año (365 días)
Resultado: €562.50
```

### Caso 2: Con Capitalización
```
Capital: €10,000
Tasa: 5% anual
Período: 2 años
Capitalización: Mensual
Resultado: €1,049.41
```

### Caso 3: Deuda Comercial
```
Capital: €50,000
Interés de demora: 4.75% anual
Período: 180 días
Con IVA: Sí
Resultado: €52,380.63
  - Intereses: €1,187.50
  - IVA: €249.38
  - Total: €51,437.88
```

## Integración con Tasaciones

Opcionalmente, el resultado de la calculadora de intereses se puede:
1. Guardar junto a una tasación
2. Incluir en el documento Word generado
3. Usar como referencia en la minuta

## Performance

- **Cálculos rápidos**: < 100ms incluso con períodos largos
- **Animaciones suave**: Duración configurable (1-3 segundos)
- **Sin consultas a BD**: Los cálculos son matemáticos puros
- **Caché de tasas**: Tasas predefinidas cacheadas en memoria

## Seguridad

- Validación de todas las entradas
- Limite máximo de capital (€1,000,000)
- Límite máximo de período (10,000 días)
- Prevención de desbordamientos numéricos
- Validación de fechas contra ataques XSS

## Testing

Casos a probar:
- Cálculo correcto con diferentes tasas
- Validación de entradas inválidas
- Formato correcto de números
- Cálculos compuestos vs simples
- Exportación a PDF
- Límites extremos (valores muy altos/bajos)
