# 📚 Historial de Tasaciones - Documentación Técnica

## Descripción General

El historial de tasaciones es el módulo que permite a los usuarios visualizar, filtrar, buscar y gestionar todas las tasaciones realizadas previamente. Proporciona una vista completa del histórico de trabajo y facilita la recuperación rápida de información.

## Flujo Principal

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ACCESO AL HISTORIAL                                      │
│    [Layout → Tab "Historial"]                               │
│    [HistorialTasaciones Component]                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. CARGAR TASACIONES DEL USUARIO                            │
│    useEffect() → useTasaciones().obtenerHistorial()         │
│    ├─ Supabase.from('tasaciones')                           │
│    ├─ .select('*')                                          │
│    ├─ .eq('user_id', usuarioActual.id)                      │
│    ├─ .order('created_at', { ascending: false })            │
│    └─ .limit(100)                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. MOSTRAR LISTA INICIAL                                    │
│    ├─ Tabla con últimas 20 tasaciones                       │
│    ├─ Columnas: Cliente, Procedimiento, Municipio           │
│    │            Costas, Fecha, Acciones                     │
│    ├─ Paginación: 20 elementos por página                   │
│    └─ Estado de carga con skeleton                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. OPCIONES DE FILTRADO Y BÚSQUEDA                          │
│    ├─ 🔍 Búsqueda: Cliente, Procedimiento                   │
│    ├─ 📅 Filtro por fecha (desde - hasta)                   │
│    ├─ 📍 Filtro por municipio (multiselect)                │
│    ├─ € Filtro por rango de costas                         │
│    ├─ 🏷️ Filtro por tipo de proceso                         │
│    ├─ 📊 Filtro por instancia                               │
│    └─ 🔄 Botón "Limpiar filtros"                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. APLICAR FILTROS EN TIEMPO REAL                           │
│    tasacionesFiltradas = tasaciones.filter(t => {           │
│      return (                                                │
│        cumpleBusqueda(t, textoBusqueda) &&                   │
│        cumpleRangoFechas(t, fechaDesde, fechaHasta) &&      │
│        cumpleMunicipios(t, municipios) &&                    │
│        cumpleRangoCostas(t, min, max) &&                    │
│        cumpleTipoProceso(t, tipos) &&                       │
│        cumpleInstancia(t, instancia)                        │
│      )                                                        │
│    })                                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. ACCIONES EN FILA                                         │
│    Por cada tasación disponible:                            │
│    ├─ 👁️ Ver detalles completos                            │
│    ├─ ✏️ Editar tasación                                    │
│    ├─ 📄 Generar minuta (DOCX)                              │
│    ├─ 🗑️ Eliminar tasación                                 │
│    ├─ 📋 Copiar datos                                       │
│    └─ 🖨️ Imprimir                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. ACCIONES MASIVAS (BULK)                                  │
│    ├─ Seleccionar múltiples tasaciones                      │
│    ├─ Exportar seleccionadas a Excel                        │
│    ├─ Eliminar múltiples                                    │
│    └─ Cambiar estado de múltiples                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. ESTADÍSTICAS Y RESUMEN                                   │
│    ├─ Total de tasaciones: X                                │
│    ├─ Costas totales: €X,XXX                                │
│    ├─ Promedio por tasación: €X,XXX                         │
│    ├─ Mayor costas: €X,XXX                                  │
│    ├─ Menor costas: €X,XXX                                  │
│    ├─ Municipio más usado: XXX                              │
│    └─ Tipo de proceso predominante: XXX                     │
└─────────────────────────────────────────────────────────────┘
```

## Estructura de Datos

### Interfaz: Tasacion
```typescript
interface Tasacion {
  id: string
  user_id: string
  
  // Información del caso
  cliente: string
  numero_procedimiento: string
  juzgado?: string
  entidad_demandada?: string
  
  // Ubicación y tipo
  municipio: string
  tipo_proceso: 'Juicio Verbal' | 'Juicio Ordinario'
  fase_terminacion: string
  instancia: 'PRIMERA INSTANCIA' | 'SEGUNDA INSTANCIA'
  
  // Criterio ICA
  criterio_ica?: string
  ref_aranzadi?: string
  
  // Costos
  costas: number
  iva: number
  total: number
  
  // Auditoría
  created_at: string
  updated_at: string
}
```

### Interfaz: FiltrosHistorial
```typescript
interface FiltrosHistorial {
  textoBusqueda: string
  fechaDesde: Date | null
  fechaHasta: Date | null
  municipios: string[]
  costasMin: number
  costasMax: number
  tiposProceso: string[]
  instancia: string | null
  ordenarPor: 'fecha_desc' | 'fecha_asc' | 'costas_desc' | 'costas_asc'
  pagina: number
  porPagina: number
}
```

## Componentes Principales

### HistorialTasaciones.tsx

**Responsabilidades:**
- Mostrar tabla de tasaciones
- Manejar filtros y búsqueda
- Renderizar opciones de acciones
- Mostrar estadísticas
- Gestionar paginación

**Estados principales:**
```typescript
interface Estado {
  tasaciones: Tasacion[]
  tasacionesFiltradas: Tasacion[]
  filtros: FiltrosHistorial
  loading: boolean
  seleccionadas: Set<string>
  mostrarDetalles: boolean
  tasacionSeleccionada: Tasacion | null
  estadisticas: Estadisticas
}
```

**Funciones clave:**
```typescript
- cargarTasaciones(): Carga del servidor
- filtrarTasaciones(): Aplica filtros
- buscar(texto): Búsqueda en tiempo real
- eliminarTasacion(id): Borra una tasación
- editarTasacion(id, datos): Actualiza datos
- generarExcel(): Exporta a Excel
- generarPDF(): Exporta a PDF
```

### TasacionesTable.tsx

Componente específico para la tabla:

```typescript
interface Props {
  tasaciones: Tasacion[]
  onEditar: (tasacion: Tasacion) => void
  onEliminar: (id: string) => void
  onGenerarMinuta: (id: string) => void
  onSeleccionar: (id: string, seleccionado: boolean) => void
  seleccionadas: Set<string>
  loading: boolean
}
```

Columnas renderizadas:
- Checkbox (selección)
- Nombre cliente
- Número procedimiento
- Municipio
- Tipo proceso
- Costas (€)
- Fecha
- Acciones

### TasacionesStats.tsx

Componente para mostrar estadísticas:

```typescript
interface Props {
  tasaciones: Tasacion[]
  filtrosActivos: FiltrosHistorial
}
```

Estadísticas mostradas:
- Contador de tasaciones
- Suma de costas
- Promedio por tasación
- Valores mín/máx
- Distribución por municipio
- Distribución por tipo

## Filtros Disponibles

### 1. Búsqueda por Texto
```typescript
const cumpleBusqueda = (tasacion: Tasacion, texto: string): boolean => {
  const textoBajo = texto.toLowerCase()
  return (
    tasacion.cliente.toLowerCase().includes(textoBajo) ||
    tasacion.numero_procedimiento.toLowerCase().includes(textoBajo) ||
    tasacion.juzgado?.toLowerCase().includes(textoBajo) ||
    tasacion.municipio.toLowerCase().includes(textoBajo)
  )
}
```

### 2. Filtro por Rango de Fechas
```typescript
const cumpleRangoFechas = (
  tasacion: Tasacion,
  desde: Date | null,
  hasta: Date | null
): boolean => {
  const fecha = new Date(tasacion.created_at)
  
  if (desde && fecha < desde) return false
  if (hasta && fecha > hasta) return false
  
  return true
}
```

### 3. Filtro por Municipios (Multiselect)
```typescript
const cumpleMunicipios = (
  tasacion: Tasacion,
  municipios: string[]
): boolean => {
  if (municipios.length === 0) return true
  return municipios.includes(tasacion.municipio)
}
```

### 4. Filtro por Rango de Costas
```typescript
const cumpleRangoCostas = (
  tasacion: Tasacion,
  min: number,
  max: number
): boolean => {
  return tasacion.costas >= min && tasacion.costas <= max
}
```

### 5. Ordenamiento
```typescript
const ordenarTasaciones = (
  tasaciones: Tasacion[],
  orden: string
): Tasacion[] => {
  const copia = [...tasaciones]
  
  switch (orden) {
    case 'fecha_desc':
      return copia.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    case 'costas_desc':
      return copia.sort((a, b) => b.costas - a.costas)
    case 'costas_asc':
      return copia.sort((a, b) => a.costas - b.costas)
    default:
      return copia
  }
}
```

## Paginación

```typescript
interface PaginacionState {
  pagina: number
  porPagina: number
  total: number
}

const calcularPaginacion = (
  tasaciones: Tasacion[],
  pagina: number,
  porPagina: number
): Tasacion[] => {
  const inicio = (pagina - 1) * porPagina
  const fin = inicio + porPagina
  return tasaciones.slice(inicio, fin)
}

// Calcular páginas totales
const paginasTotal = Math.ceil(tasaciones.length / porPagina)
```

## Acciones Disponibles

### Ver Detalles
```typescript
const verDetalles = (tasacion: Tasacion) => {
  // Mostrar modal con todos los detalles
  setTasacionSeleccionada(tasacion)
  setMostrarDetalles(true)
}
```

Modal muestra:
- Cliente
- Número procedimiento
- Juzgado y entidad
- Municipio y criterio ICA
- Tipo proceso y fase
- Instancia
- Costas, IVA y total
- Fechas de creación/actualización

### Editar Tasación
```typescript
const editarTasacion = async (
  id: string,
  datosActualizados: Partial<Tasacion>
) => {
  try {
    const { error } = await supabase
      .from('tasaciones')
      .update(datosActualizados)
      .eq('id', id)
    
    if (error) throw error
    
    // Actualizar lista local
    setTasaciones(prev => 
      prev.map(t => t.id === id ? { ...t, ...datosActualizados } : t)
    )
  } catch (error) {
    mostrarError(error.message)
  }
}
```

### Eliminar Tasación
```typescript
const eliminarTasacion = async (id: string) => {
  // Confirmar eliminación
  if (!window.confirm('¿Eliminar esta tasación?')) return
  
  try {
    const { error } = await supabase
      .from('tasaciones')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    // Actualizar lista
    setTasaciones(prev => prev.filter(t => t.id !== id))
    mostrarExito('Tasación eliminada')
  } catch (error) {
    mostrarError(error.message)
  }
}
```

### Generar Minuta
```typescript
const generarMinuta = async (tasacion: Tasacion) => {
  try {
    const docx = await generateMinutaDocx(tasacion)
    
    // Descargar
    const blob = new Blob([docx], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Minuta_${tasacion.numero_procedimiento}.docx`
    a.click()
  } catch (error) {
    mostrarError('Error generando minuta')
  }
}
```

## Acciones Masivas

### Seleccionar Múltiples
```typescript
const toggleSeleccionar = (id: string) => {
  const nuevas = new Set(seleccionadas)
  if (nuevas.has(id)) {
    nuevas.delete(id)
  } else {
    nuevas.add(id)
  }
  setSeleccionadas(nuevas)
}

const seleccionarTodas = () => {
  const ids = new Set(
    tasacionesFiltradas.map(t => t.id)
  )
  setSeleccionadas(ids)
}
```

### Exportar a Excel
```typescript
const exportarExcel = () => {
  const datos = tasacionesFiltradas.map(t => ({
    'Cliente': t.cliente,
    'Procedimiento': t.numero_procedimiento,
    'Municipio': t.municipio,
    'Tipo Proceso': t.tipo_proceso,
    'Costas': t.costas,
    'IVA': t.iva,
    'Total': t.total,
    'Fecha': new Date(t.created_at).toLocaleDateString('es-ES')
  }))
  
  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Tasaciones')
  XLSX.writeFile(wb, `Historial_Tasaciones_${new Date().toISOString().split('T')[0]}.xlsx`)
}
```

## Estadísticas

```typescript
interface Estadisticas {
  totalTasaciones: number
  costasTotal: number
  promedioCostas: number
  costasMaxima: number
  costasMinima: number
  municipioMasUsado: string
  tipoProcesoPredominante: string
}

const calcularEstadisticas = (tasaciones: Tasacion[]): Estadisticas => {
  if (tasaciones.length === 0) {
    return {
      totalTasaciones: 0,
      costasTotal: 0,
      promedioCostas: 0,
      costasMaxima: 0,
      costasMinima: 0,
      municipioMasUsado: '-',
      tipoProcesoPredominante: '-'
    }
  }
  
  const costasTotal = tasaciones.reduce((sum, t) => sum + t.costas, 0)
  const costasOrdenadas = tasaciones.map(t => t.costas).sort((a, b) => a - b)
  
  // Municipio más usado
  const municipioCount: { [key: string]: number } = {}
  tasaciones.forEach(t => {
    municipioCount[t.municipio] = (municipioCount[t.municipio] || 0) + 1
  })
  const municipioMasUsado = Object.keys(municipioCount)
    .reduce((a, b) => municipioCount[a] > municipioCount[b] ? a : b, '-')
  
  // Tipo de proceso predominante
  const tipoCount: { [key: string]: number } = {}
  tasaciones.forEach(t => {
    tipoCount[t.tipo_proceso] = (tipoCount[t.tipo_proceso] || 0) + 1
  })
  const tipoProcesoPredominante = Object.keys(tipoCount)
    .reduce((a, b) => tipoCount[a] > tipoCount[b] ? a : b, '-')
  
  return {
    totalTasaciones: tasaciones.length,
    costasTotal,
    promedioCostas: costasTotal / tasaciones.length,
    costasMaxima: costasOrdenadas[costasOrdenadas.length - 1],
    costasMinima: costasOrdenadas[0],
    municipioMasUsado,
    tipoProcesoPredominante
  }
}
```

## Performance y Optimizaciones

### 1. Lazy Loading
- Solo cargar primeros 100 registros
- Cargar más al hacer scroll
- Virtualización de tabla para miles de registros

### 2. Memoización
```typescript
const tasacionesFiltradas = useMemo(() => {
  return filtrarTasaciones(tasaciones, filtros)
}, [tasaciones, filtros])
```

### 3. Índices en Base de Datos
```sql
CREATE INDEX idx_user_id ON tasaciones(user_id);
CREATE INDEX idx_created_at ON tasaciones(created_at DESC);
CREATE INDEX idx_municipio ON tasaciones(municipio);
CREATE INDEX idx_cliente ON tasaciones(cliente);
```

### 4. Debounce en Búsqueda
```typescript
const handleBusqueda = useCallback(
  debounce((texto: string) => {
    setFiltros(prev => ({ ...prev, textoBusqueda: texto }))
  }, 300),
  []
)
```

## Integración con Otros Módulos

### Con TasacionForm
- Crear nueva tasación redirige a Form
- Form rellena con datos del historial (edit)

### Con AdminPanel
- Estadísticas visibles en dashboard
- Eliminación masiva desde admin

### Con Exportación
- Exportar seleccionadas a Excel
- Generar reportes mensuales/anuales

## Seguridad

1. **RLS**: Solo mostrar tasaciones del usuario actual
2. **Validación**: Validar filtros antes de aplicar
3. **Sanitización**: Escapar texto en búsqueda
4. **Límites**: Máximo 1000 registros por consulta

## Testing

Casos a probar:
- Carga de tasaciones
- Filtrado por cada criterio
- Búsqueda por texto
- Paginación
- Selección masiva
- Exportación a Excel
- Eliminación de tasaciones
- Editando tasaciones
- Generando minutas
