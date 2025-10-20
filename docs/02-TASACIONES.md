# 📋 Funcionalidad de Tasaciones - Documentación Técnica

## Descripción General

La funcionalidad de tasaciones es el corazón de la aplicación. Permite a los usuarios calcular automáticamente las costas judiciales basándose en criterios del ICA (Índice de Costas de Aranceles), fase de terminación e instancia judicial.

## Flujo de Tasación

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INICIO: Usuario accede al formulario                    │
│    [CalculatorContainer → TasacionForm]                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. COMPLETAR FORMULARIO                                     │
│    Campos requeridos:                                       │
│    ├─ Nombre cliente                                        │
│    ├─ Número de procedimiento                               │
│    ├─ Nombre del juzgado (opcional)                         │
│    ├─ Entidad demandada (búsqueda autocomplete)            │
│    ├─ Municipio (búsqueda)                                  │
│    ├─ Tipo de proceso (Verbal/Ordinario)                    │
│    ├─ Fase de terminación (automática según tipo)           │
│    └─ Instancia (Primera/Segunda)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. VALIDACIÓN CON ZOD                                       │
│    ├─ Verificar campos obligatorios                         │
│    ├─ Validar formato de datos                              │
│    ├─ Comprobar existencia de municipio                     │
│    └─ Confirmar combinación fase/instancia válida           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. BÚSQUEDA DE CRITERIO ICA                                 │
│    ├─ Municipio → Criterio ICA (tabla municipios_ica)       │
│    └─ Si no existe → usar criterio general                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. CÁLCULO DE COSTAS (src/lib/calculator.ts)               │
│    ├─ Obtener datos de tabla costas_x_ica                  │
│    │  (criterio_ica, fase, instancia)                      │
│    │                                                         │
│    ├─ Aplicar fórmula de cálculo                           │
│    │  Costas Base = valor según ICA                        │
│    │                                                         │
│    ├─ Calcular IVA (21%)                                   │
│    │  IVA = Costas Base × 0.21                             │
│    │                                                         │
│    └─ Total Final                                           │
│       Total = Costas + IVA                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. INSERCIÓN EN BASE DE DATOS                              │
│    Tabla: tasaciones                                        │
│    INSERT INTO tasaciones (                                 │
│      user_id, cliente, numero_procedimiento,               │
│      juzgado, entidad_demandada, municipio,                │
│      tipo_proceso, fase_terminacion, instancia,            │
│      criterio_ica, costas, iva, total,                     │
│      created_at, updated_at                                │
│    ) VALUES (...)                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. MOSTRAR RESULTADOS CON ANIMACIÓN                         │
│    ├─ CountUp animation para costas                        │
│    ├─ CountUp animation para IVA                           │
│    ├─ CountUp animation para total                         │
│    └─ Botones: Generar Minuta, Guardar, Nuevo             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. OPCIONES POST-TASACIÓN                                  │
│    ├─ Generar Minuta (DOCX) → descargar                   │
│    ├─ Guardar tasación → BD                               │
│    ├─ Nueva tasación → limpiar formulario                 │
│    └─ Ver historial → HistorialTasaciones                 │
└─────────────────────────────────────────────────────────────┘
```

## Estructura de Datos

### Tabla: tasaciones
```sql
CREATE TABLE tasaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del caso
  cliente VARCHAR(255) NOT NULL,
  numero_procedimiento VARCHAR(100) NOT NULL,
  juzgado VARCHAR(255),
  entidad_demandada VARCHAR(255),
  
  -- Ubicación y tipo de proceso
  municipio VARCHAR(255) NOT NULL,
  tipo_proceso VARCHAR(50) NOT NULL, -- 'Juicio Verbal' | 'Juicio Ordinario'
  fase_terminacion VARCHAR(100) NOT NULL,
  instancia VARCHAR(50) NOT NULL, -- 'PRIMERA INSTANCIA' | 'SEGUNDA INSTANCIA'
  
  -- Criterio ICA
  criterio_ica VARCHAR(20),
  ref_aranzadi VARCHAR(255),
  
  -- Costos calculados
  costas DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices para búsquedas rápidas
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_numero_procedimiento (numero_procedimiento)
);

-- Row Level Security Policy
CREATE POLICY "Users can only see their own tasaciones"
  ON tasaciones FOR SELECT
  USING (auth.uid() = user_id);
```

### Tabla: costas_x_ica
```sql
CREATE TABLE costas_x_ica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  criterio_ica VARCHAR(20) NOT NULL,
  fase VARCHAR(100) NOT NULL,
  instancia VARCHAR(50) NOT NULL,
  costas DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (criterio_ica, fase, instancia)
);
```

### Tabla: municipios_ica
```sql
CREATE TABLE municipios_ica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_postal VARCHAR(5),
  municipio VARCHAR(255) NOT NULL,
  criterio_ica VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_municipio (municipio),
  INDEX idx_codigo_postal (codigo_postal)
);
```

## Componentes Principales

### TasacionForm.tsx

**Responsabilidades:**
- Renderizar formulario de tasación
- Manejar búsqueda de municipios y entidades
- Validar datos con Zod
- Llamar a función de cálculo
- Mostrar resultados con animación
- Generar documentos Word

**Estados principales:**
```typescript
- entidades: Array de entidades disponibles
- municipioSeleccionado: Municipio elegido con criterio ICA
- resultado: { costas, iva, total }
- generatingDoc: Boolean para estado de generación
- loading: Estado de carga
```

**Funciones clave:**
```typescript
- handleCalcular(): Realiza el cálculo
- handleGenerarMinuta(): Genera documento Word
- onMunicipioChange(): Busca municipio y criterio
- onEntidadChange(): Busca entidad
```

### calculator.ts

**Función Principal: `calcularCostas()`**

```typescript
export async function calcularCostas(
  criterioICA: string,
  faseterminacion: string,
  instancia: string
): Promise<{
  costas: number
  iva: number
  total: number
}> {
  // 1. Buscar en BD tabla costas_x_ica
  const { data, error } = await supabase
    .from('costas_x_ica')
    .select('*')
    .eq('criterio_ica', criterioICA)
    .eq('fase', faseterminacion)
    .eq('instancia', instancia)
    .single()

  if (error) {
    throw new Error(`No se encontró combinación válida`)
  }

  // 2. Retornar valores precalculados
  return {
    costas: data.costas,
    iva: data.iva,
    total: data.total
  }
}
```

**Función: `obtenerFasesTerminacion()`**

```typescript
export function obtenerFasesTerminacion(tipoProceso: string): string[] {
  // Retorna fases según tipo de proceso
  // - Juicio Verbal: Trámite, Sentencia, Ejecución
  // - Juicio Ordinario: Demanda, Contestación, Prueba, Sentencia, Ejecución
}
```

### Hooks Personalizados

#### useTasaciones.ts

```typescript
export function useTasaciones() {
  const { user } = useAuth()

  const {
    tasaciones,
    loading,
    error,
    guardarTasacion,
    obtenerHistorial,
    deleteTasacion,
    updateTasacion
  } = // ... lógica de Supabase

  return {
    tasaciones,
    loading,
    error,
    guardarTasacion,
    obtenerHistorial,
    deleteTasacion,
    updateTasacion
  }
}
```

## Flujo de Búsqueda de Municipios

```
Usuario escribe en campo "Municipio"
    ↓
[onMunicipioChange()]
    ↓
[buscarMunicipios(texto)] - municipios.ts
    ↓
Supabase.from('municipios_ica')
  .select('*')
  .ilike('municipio', '%texto%')
  .limit(10)
    ↓
Mostrar lista de 10 opciones
    ↓
Usuario selecciona municipio
    ↓
Obtener criterio_ica del municipio
    ↓
Disponible para cálculo
```

## Flujo de Búsqueda de Entidades

```
Usuario escribe en campo "Entidad demandada"
    ↓
[onEntidadChange()]
    ↓
[buscarEntidades(texto)] - entidades.ts
    ↓
Supabase.from('entidades')
  .select('*')
  .or(
    'nombre_corto.ilike.*texto*,
    nombre_completo.ilike.*texto*'
  )
  .limit(20)
    ↓
Mostrar lista de 20 opciones
    ↓
Usuario selecciona entidad
    ↓
Guardar código y nombre
```

## Generación de Documentos Word

Ver documento: `02-GENERACION_DOCUMENTOS_WORD.md`

## Validación de Datos

### Schema Zod
```typescript
const tasacionSchema = z.object({
  nombre_cliente: z.string().min(1, 'Requerido'),
  numero_procedimiento: z.string().min(1, 'Requerido'),
  nombre_juzgado: z.string().optional(),
  entidad_demandada: z.string().optional(),
  municipio: z.string().min(1, 'Requerido'),
  tipo_proceso: z.enum(['Juicio Verbal', 'Juicio Ordinario']),
  fase_terminacion: z.string().min(1, 'Requerida'),
  instancia: z.enum(['PRIMERA INSTANCIA', 'SEGUNDA INSTANCIA']),
  ref_aranzadi: z.string().optional(),
})
```

## Casos de Uso Principales

### Caso 1: Tasación Simple
1. Usuario completa formulario con todos los datos
2. Sistema obtiene criterio ICA del municipio
3. Busca valores en tabla costas_x_ica
4. Calcula total con IVA
5. Muestra resultado

### Caso 2: Generar Minuta
1. Después del cálculo, usuario hace clic en "Generar Minuta"
2. Sistema consulta datos de tasación
3. Rellena plantilla Word
4. Descarga archivo .docx

### Caso 3: Historial
1. Usuario accede a "Historial de Tasaciones"
2. Ve todas sus tasaciones previas
3. Puede filtrar por fecha, municipio, etc.
4. Puede editar o eliminar tasaciones

## Manejo de Errores

```typescript
try {
  const resultado = await calcularCostas(...)
  await guardarTasacion({...})
} catch (error) {
  if (error.message.includes('No se encontró')) {
    // Mostrar: "Combinación de ICA/Fase/Instancia no válida"
  } else if (error.message.includes('RLS')) {
    // Mostrar: "No tienes permisos para esta operación"
  } else {
    // Mostrar error genérico
  }
}
```

## Optimizaciones

1. **Caché de municipios**: Se cachean resultados de búsqueda
2. **Índices BD**: Índices en user_id, numero_procedimiento, created_at
3. **Lazy Loading**: Componentes cargados bajo demanda
4. **Memoización**: useMemo para cálculos pesados

## Seguridad

1. **RLS Policies**: Solo usuarios ven sus tasaciones
2. **Validación cliente**: Zod valida antes de enviar
3. **Validación servidor**: Supabase valida en BD
4. **JWT Auth**: Usuario debe estar autenticado
5. **Sanitización**: Inputs sanitizados para prevenir SQL injection

## Testing

Ver archivo: `tests/tasaciones.test.ts`

Casos a probar:
- Cálculo correcto de costas
- Validación de campos vacíos
- Búsqueda de municipios
- Inserción en BD
- Eliminación de tasaciones
- Edición de tasaciones
