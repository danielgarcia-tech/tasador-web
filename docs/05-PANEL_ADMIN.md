# ⚙️ Panel de Configuración Admin - Documentación Técnica

## Descripción General

El panel administrativo es una interfaz completa para la gestión de todos los datos y configuraciones del sistema. Solo usuarios con rol de administrador pueden acceder a este módulo. Proporciona herramientas para:

- Gestión de usuarios
- Administración de datos maestros (entidades, municipios, etc.)
- Configuración de templates Word
- Gestión de fórmulas de cálculo
- Configuración de intereses legales
- Visualización de estadísticas

## Arquitectura del Panel

```
┌─────────────────────────────────────────────────────────────┐
│           AdminPanel.tsx (Contenedor Principal)             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┬─────────┬─────────┐
        │            │            │            │         │         │
        ↓            ↓            ↓            ↓         ↓         ↓
   Dashboard    Entidades   Municipios    Costas    Templates  Users
   (Stats)         ICA         ICA         x ICA       Word      Mgmt
        │            │            │            │         │         │
        ├─ Tabla    ├─ CRUD       ├─ CRUD      ├─ CRUD  ├─ Form   ├─ CRUD
        ├─ Tarjetas ├─ Import     ├─ Import    └─ View  ├─ Editor └─ Roles
        ├─ Gráficos ├─ Export     └─ Búsqueda      │    └─ Preview │
        └─ KPIs     └─ Búsqueda                    └─ Búsqueda    └─ Permisos

                            ↓ (Todo comunica con)

                      src/lib/supabase.ts
                      (Cliente Supabase)
```

## Flujo Principal

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ACCESO AL PANEL                                          │
│    [AdminPanel disponible solo si rol = 'admin']            │
│    [CustomAuthContext verifica permisos]                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. MOSTRAR DASHBOARD INICIAL                                │
│    Cargar estadísticas:                                      │
│    ├─ Total de tasaciones                                   │
│    ├─ Total de usuarios                                     │
│    ├─ Total de municipios                                   │
│    ├─ Total de entidades                                    │
│    ├─ Total de fórmulas de cálculo                          │
│    └─ Últimas tasaciones (top 10)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. NAVEGACIÓN A SECCIONES                                   │
│    Usuario selecciona sección:                               │
│    ├─ Gestión de Entidades                                  │
│    ├─ Gestión de Municipios ICA                            │
│    ├─ Gestión de Costas x ICA                              │
│    ├─ Gestión de Intereses Legales                         │
│    ├─ Gestión de Fórmulas de Cálculo                       │
│    ├─ Gestión de Baremos de Honorarios                     │
│    ├─ Configuración de Templates Word                      │
│    └─ Gestión de Usuarios                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. REALIZAR ACCIONES EN LA SECCIÓN                          │
│    (Ver detalles en cada subsección)                        │
└─────────────────────────────────────────────────────────────┘
```

## Secciones del Panel

### 1. Dashboard (Panel Principal)

**Componente:** Dashboard renderizado en AdminPanel

**Elementos:**
```typescript
interface DashboardStats {
  totalTasaciones: number
  totalUsuarios: number
  totalMunicipios: number
  totalEntidades: number
  totalFormulas: number
  tasacionesRecientes: Tasacion[]
}
```

**Mostrado:**
- 5 tarjetas grandes con métricas principales
- Gráfico de línea: tasaciones por mes
- Gráfico circular: distribución por tipo de proceso
- Tabla: últimas 10 tasaciones

**Código:**
```typescript
const [stats, setStats] = useState({
  totalTasaciones: 0,
  totalUsuarios: 0,
  totalMunicipios: 0,
  totalEntidades: 0,
  totalFormulas: 0
})

useEffect(() => {
  const loadStats = async () => {
    const [tasaciones, usuarios, municipios, entidades, formulas] = 
      await Promise.all([
        supabase.from('tasaciones').select('id', { count: 'exact', head: true }),
        supabase.from('usuarios_personalizados').select('id', { count: 'exact', head: true }),
        supabase.from('municipios_ica').select('id', { count: 'exact', head: true }),
        supabase.from('entidades').select('id', { count: 'exact', head: true }),
        supabase.from('formulas_calculo').select('id', { count: 'exact', head: true })
      ])
    
    setStats({
      totalTasaciones: tasaciones.count || 0,
      totalUsuarios: usuarios.count || 0,
      totalMunicipios: municipios.count || 0,
      totalEntidades: entidades.count || 0,
      totalFormulas: formulas.count || 0
    })
  }
  loadStats()
}, [])
```

### 2. Gestión de Entidades

**Componente:** `EntidadesTable.tsx`

**Tabla: entidades**
```sql
CREATE TABLE entidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50),
  nombre_corto VARCHAR(100) NOT NULL,
  nombre_completo VARCHAR(500),
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nombre_corto ON entidades(nombre_corto);
CREATE INDEX idx_codigo ON entidades(codigo);
```

**Operaciones CRUD:**
```typescript
// CREATE
const crearEntidad = async (datos: EntidadNueva) => {
  const { error } = await supabase.from('entidades').insert([datos])
  if (error) throw error
}

// READ
const cargarEntidades = async () => {
  const { data, error } = await supabase.from('entidades').select('*')
  if (error) throw error
  return data
}

// UPDATE
const actualizarEntidad = async (id: string, datos: Partial<Entidad>) => {
  const { error } = await supabase.from('entidades')
    .update(datos)
    .eq('id', id)
  if (error) throw error
}

// DELETE
const eliminarEntidad = async (id: string) => {
  const { error } = await supabase.from('entidades')
    .delete()
    .eq('id', id)
  if (error) throw error
}
```

**Funciones especiales:**
- **Importar desde Excel**: Cargar múltiples entidades desde archivo
- **Exportar a Excel**: Descargar lista completa
- **Búsqueda en vivo**: Filtrar mientras se escribe
- **Activar/Desactivar**: Sin eliminar

### 3. Gestión de Municipios ICA

**Componente:** `MunicipioICATable.tsx`

**Tabla: municipios_ica**
```sql
CREATE TABLE municipios_ica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_postal VARCHAR(5),
  municipio VARCHAR(255) NOT NULL,
  criterio_ica VARCHAR(20) NOT NULL,
  region VARCHAR(100),
  provincia VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_municipio ON municipios_ica(municipio);
CREATE INDEX idx_criterio_ica ON municipios_ica(criterio_ica);
CREATE INDEX idx_codigo_postal ON municipios_ica(codigo_postal);
```

**Operaciones:**
- Crear nuevo municipio con criterio ICA
- Editar municipio y su criterio
- Eliminar municipio
- Buscar por nombre o código postal
- Importar desde CSV/Excel
- Exportar listado completo

**Validaciones:**
```typescript
const validarMunicipio = (datos: MunicipioNuevo): string[] => {
  const errores: string[] = []
  
  if (!datos.municipio.trim()) {
    errores.push('El nombre del municipio es requerido')
  }
  
  if (!datos.criterio_ica.trim()) {
    errores.push('El criterio ICA es requerido')
  }
  
  if (datos.codigo_postal && !/^\d{5}$/.test(datos.codigo_postal)) {
    errores.push('Código postal debe ser 5 dígitos')
  }
  
  return errores
}
```

### 4. Gestión de Costas x ICA

**Componente:** `CostasXICATable.tsx`

**Tabla: costas_x_ica**
```sql
CREATE TABLE costas_x_ica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  criterio_ica VARCHAR(20) NOT NULL,
  fase VARCHAR(100) NOT NULL,
  instancia VARCHAR(50) NOT NULL,
  costas DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  vigencia_desde DATE,
  vigencia_hasta DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(criterio_ica, fase, instancia)
);
```

**Operaciones:**
- Vista de matriz: Criterios ICA vs Fases vs Instancias
- Editar valores de costas
- Agregar nuevas combinaciones
- Versioning automático (vigencia desde/hasta)
- Validación de cambios

**Modo de edición:**
```typescript
const [modoEdicion, setModoEdicion] = useState(false)
const [celdasModificadas, setCeldasModificadas] = useState(new Map())

const guardarCambios = async () => {
  for (const [key, valor] of celdasModificadas) {
    const [id, campo] = key.split('_')
    await supabase.from('costas_x_ica')
      .update({ [campo]: valor })
      .eq('id', id)
  }
  setCeldasModificadas(new Map())
  setModoEdicion(false)
}
```

### 5. Gestión de Intereses Legales

**Componente:** `InteresesLegalesTable.tsx`

**Tabla: intereses_legales**
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
```

**Operaciones:**
- Crear nuevos tipos de interés
- Editar porcentajes
- Activar/Desactivar tipos
- Historial de cambios de tasas
- Validación de cambios porcentuales

**Interfaz:**
```typescript
interface TipoInteres {
  id: string
  tipo_interes: string
  porcentaje: number
  descripcion: string
  fecha_vigencia: Date
  activo: boolean
}
```

### 6. Gestión de Fórmulas de Cálculo

**Componente:** `FormulasCalculoTable.tsx`

**Tabla: formulas_calculo**
```sql
CREATE TABLE formulas_calculo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  formula TEXT NOT NULL,
  tipo_formula VARCHAR(50), -- 'simple', 'compuesta', 'personalizada'
  variables_requeridas TEXT[], -- Array de variables
  ejemplo_calculo TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Operaciones:**
- Crear nueva fórmula
- Editar fórmula existente
- Probar fórmula con valores
- Activar/Desactivar
- Historial de versiones

**Editor de fórmulas:**
```typescript
interface FormulaEditor {
  nombre: string
  descripcion: string
  formula: string // Sintaxis: {variable_name} + operadores
  variablesRequeridas: string[]
  ejemploValores: { [key: string]: number }
}

const ejemploFormula = "{costas} + ({costas} * 0.21)"
// Resultado: costas + 21% de IVA
```

### 7. Gestión de Baremos de Honorarios

**Componente:** `BaremosHonorarios.tsx`

**Tabla: baremos_honorarios**
```sql
CREATE TABLE baremos_honorarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cantidad_minima DECIMAL(12,2) NOT NULL,
  cantidad_maxima DECIMAL(12,2) NOT NULL,
  porcentaje DECIMAL(5,2),
  honorarios_minimos DECIMAL(12,2),
  honorarios_maximos DECIMAL(12,2),
  descripcion TEXT,
  vigencia_desde DATE,
  vigencia_hasta DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Uso:**
- Tabla de escalas de honorarios
- Búsqueda de baremo por cantidad
- Edición de rangos
- Importar nuevos baremos

### 8. Configuración de Templates Word

**Componente:** `WordTemplateSettings.tsx`

**Tabla: word_template_settings**
```sql
CREATE TABLE word_template_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  nombre_template VARCHAR(255),
  configuracion JSONB,
  plantilla_por_defecto BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Configuración guardable:**
```typescript
interface TemplateConfig {
  encabezado: {
    imagenLogo?: string
    nombreEmpresa: string
    direccion: string
    telefonos: string
    email: string
  }
  cuerpo: {
    fuentePrincipal: string
    tamanoFuente: number
    interlineado: number
    alineacion: 'izquierda' | 'derecha' | 'centro' | 'justificado'
  }
  pie: {
    numeroFooter: boolean
    fechaFooter: boolean
    textoPersonalizado: string
  }
  secciones: {
    incluirIntroduccion: boolean
    incluirTasacionDetallada: boolean
    incluirConclusiones: boolean
    incluirAnexos: boolean
  }
}
```

**Funcionalidades:**
- Editor visual de templates
- Preview en tiempo real
- Guardar plantillas personalizadas
- Establecer plantilla por defecto
- Importar/Exportar configuración

### 9. Gestión de Usuarios

**Componente:** `UsersManagement.tsx`

**Tabla: usuarios_personalizados**
```sql
CREATE TABLE usuarios_personalizados (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE,
  nombre VARCHAR(255),
  apellidos VARCHAR(255),
  rol VARCHAR(50) DEFAULT 'user', -- 'admin', 'user', 'readonly'
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Operaciones:**
- Crear nuevo usuario (invitation)
- Cambiar contraseña de usuario
- Asignar/cambiar rol
- Activar/Desactivar usuario
- Ver último acceso
- Eliminar usuario
- Resetear contraseña

**Roles disponibles:**
```typescript
type UserRole = 'admin' | 'user' | 'readonly'

interface RolePermissions {
  admin: {
    gestiono: ['users', 'data', 'settings', 'tasaciones'],
    puede: ['crear', 'editar', 'eliminar', 'ver_todo'],
  },
  user: {
    gestiono: ['tasaciones', 'settings_personales'],
    puede: ['crear', 'editar', 'eliminar_propios'],
  },
  readonly: {
    gestiono: [],
    puede: ['ver'],
  }
}
```

**Crear nuevo usuario:**
```typescript
const crearUsuario = async (email: string, nombre: string, rol: UserRole) => {
  // 1. Crear en auth
  const { data, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: generarPasswordTemporal(),
    email_confirm: true
  })
  
  if (authError) throw authError
  
  // 2. Crear registro en usuarios_personalizados
  const { error: dbError } = await supabase.from('usuarios_personalizados').insert({
    id: data.user.id,
    email,
    nombre,
    rol,
    activo: true
  })
  
  if (dbError) throw dbError
  
  // 3. Enviar email de bienvenida
  await enviarEmailBienvenida(email, nombre)
}
```

## Hook Personalizado

### useAdminData.ts

```typescript
export function useAdminData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [entidades, setEntidades] = useState<Entidad[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [costas, setCostas] = useState<CostasXICA[]>([])
  const [intereses, setIntereses] = useState<InteresCobrador[]>([])
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  
  const cargarDatos = async (seccion: AdminSection) => {
    setLoading(true)
    try {
      const datos = await obtenerDatos(seccion)
      switch(seccion) {
        case 'entidades':
          setEntidades(datos)
          break
        case 'municipio_ica':
          setMunicipios(datos)
          break
        // ... etc
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return {
    loading,
    error,
    entidades,
    municipios,
    costas,
    intereses,
    formulas,
    usuarios,
    cargarDatos
  }
}
```

## Flujos de Datos Comunes

### Importar desde Excel
```
Usuario selecciona archivo Excel
    ↓
Validar estructura
    ↓
Mapear columnas a campos
    ↓
Validar cada fila
    ↓
Inserción masiva en BD
    ↓
Mostrar reporte: X insertadas, Y errores
```

### Exportar a Excel
```
Usuario hace click en "Exportar"
    ↓
Preparar datos filtrados
    ↓
Crear workbook con XLSX library
    ↓
Estilo y formato
    ↓
Descargar archivo .xlsx
```

## Seguridad

1. **Roles y Permisos**: Solo admin puede acceder
2. **RLS Policies**: 
   ```sql
   CREATE POLICY "Only admins can modify admin tables"
     ON entidades FOR ALL
     USING (auth.jwt()->>'role' = 'admin')
   ```
3. **Auditoria**: Log de cambios en tabla separate
4. **Validación**: Doble validación (cliente + servidor)

## Performance

- Lazy loading de secciones
- Paginación en tablas grandes
- Índices en búsquedas frecuentes
- Caché local de datos

## Testing

Casos a probar:
- Acceso denegado para no-admins
- CRUD en todas las tablas
- Importación de archivos Excel
- Exportación de datos
- Filtros y búsquedas
- Validación de datos
- Gestión de errores
