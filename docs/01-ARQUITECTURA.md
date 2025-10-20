# 🏗️ Diagrama de Arquitectura - Tasador Web

## Visión General de la Arquitectura

Tasador Web es una aplicación web moderna construida con una arquitectura de tres capas: presentación, negocio y datos.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Frontend)                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript + Vite                               │  │
│  │  - App.tsx (Router principal)                               │  │
│  │  - Contexto de Autenticación                                │  │
│  │  - Componentes UI React                                     │  │
│  │  - Hooks personalizados                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│  ┌──────────────────────────▼──────────────────────────────────┐  │
│  │  Capas de Lógica (src/lib)                                  │  │
│  │  - calculator.ts: Cálculo de costas                         │  │
│  │  - interestCalculator.ts: Cálculo de intereses              │  │
│  │  - municipios.ts: Gestión de municipios                     │  │
│  │  - entidades.ts: Gestión de entidades                       │  │
│  │  - docx-generator.ts: Generación de documentos              │  │
│  │  - database-init.ts: Inicialización de BD                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│  ┌──────────────────────────▼──────────────────────────────────┐  │
│  │  Servicios (Supabase Client JS)                             │  │
│  │  - supabase.ts: Cliente Supabase configurado                │  │
│  │  - Autenticación JWT                                        │  │
│  │  - REST API Client                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Supabase)                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  API REST (PostgREST)                                        │  │
│  │  - Endpoints automáticos para todas las tablas               │  │
│  │  - Autenticación JWT                                        │  │
│  │  - RLS (Row Level Security) por usuario                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│  ┌──────────────────────────▼──────────────────────────────────┐  │
│  │  Autenticación & Autorización                               │  │
│  │  - Supabase Auth (JWT tokens)                                │  │
│  │  - Row Level Security (RLS)                                  │  │
│  │  - Gestión de sesiones                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│  ┌──────────────────────────▼──────────────────────────────────┐  │
│  │  Base de Datos (PostgreSQL)                                 │  │
│  │                                                              │  │
│  │  Tablas:                                                     │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ usuarios_personalizados                             │   │  │
│  │  │ - id, email, nombre, rol, created_at                │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ tasaciones                                          │   │  │
│  │  │ - id, user_id, cliente, procedimiento, municipio   │   │  │
│  │  │ - costas, iva, total, created_at, updated_at       │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ entidades                                           │   │  │
│  │  │ - id, codigo, nombre_corto, nombre_completo        │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ municipios_ica                                      │   │  │
│  │  │ - id, codigo_postal, municipio, criterio_ica        │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ costas_x_ica                                        │   │  │
│  │  │ - id, criterio_ica, fase, instancia, costas        │   │  │
│  │  │ - iva, total, created_at                           │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ intereses_legales                                   │   │  │
│  │  │ - id, tipo_interes, porcentaje, fecha_vigencia     │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ formulas_calculo                                    │   │  │
│  │  │ - id, nombre, descripcion, formula, activa          │   │  │
│  │  │ - created_at, updated_at                            │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ baremos_honorarios                                  │   │  │
│  │  │ - id, cantidad_minima, cantidad_maxima              │   │  │
│  │  │ - porcentaje, honorarios_minimos                    │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ word_template_settings                              │   │  │
│  │  │ - id, user_id, template_config, created_at          │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Edge Functions (Serverless)                                 │  │
│  │  - Funciones TypeScript personalizadas                        │  │
│  │  - Ejecutadas en Deno Runtime                                 │  │
│  │  - Lógica compleja del servidor                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Vercel                                                      │  │
│  │  - Hosting & CI/CD                                           │  │
│  │  - GitHub Integration                                        │  │
│  │  - Automatic Deployments                                     │  │
│  │  - Preview Deployments                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  GitHub                                                      │  │
│  │  - Control de versiones                                      │  │
│  │  - Repositorio principal                                     │  │
│  │  - Git workflows                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos Principales

### 1. Autenticación de Usuario

```
Usuario
    ↓
[Componente Login]
    ↓
[CustomAuthContext - useAuth()]
    ↓
[Supabase Auth.signInWithPassword()]
    ↓
[JWT Token]
    ↓
[LocalStorage + Cookie]
    ↓
[Contexto compartido en app]
```

### 2. Cálculo de Tasación

```
[TasacionForm] (Usuario completa formulario)
    ↓
[validate - Zod Schema]
    ↓
[useTasaciones Hook]
    ↓
[calcularCostas()] - src/lib/calculator.ts
    │
    ├─ Buscar municipio → obtener criterio ICA
    │
    ├─ Consultar tabla costas_x_ica
    │    (criterio_ica, fase, instancia)
    │
    ├─ Aplicar fórmula de cálculo
    │
    └─ Calcular IVA (21%)
    ↓
[Supabase - Insertar en tabla 'tasaciones']
    ↓
[Actualizar historial - HistorialTasaciones]
```

### 3. Cálculo de Intereses

```
[InterestCalculatorAdvanced] (Usuario ingresa datos)
    ↓
[Validación de formulario]
    ↓
[interestCalculator.ts]
    │
    ├─ Capital inicial
    ├─ Tasa de interés (desde BD o manual)
    ├─ Días de demora
    ├─ Fórmula: Interés = Capital × Tasa × Días / 36500
    │
    └─ Cálculo de IVA sobre intereses
    ↓
[Mostrar resultados animados]
    ↓
[Opción: Guardar / Exportar PDF]
```

### 4. Generación de Documentos Word

```
[TasacionForm - Botón "Generar Minuta"]
    ↓
[docx-generator.ts - generateMinutaDocx()]
    ↓
[Supabase - Obtener datos tasación]
    ↓
[DOCX library]
    │
    ├─ Plantilla base
    ├─ Reemplazar campos dinámicos
    ├─ Insertar tablas
    ├─ Insertar gráficos
    │
    └─ Formateo profesional
    ↓
[Descargar archivo .docx]
```

## Patrones y Tecnologías Clave

### Patrones de React
- **Hooks**: `useState`, `useEffect`, `useContext`, `useForm` (react-hook-form)
- **Context API**: Autenticación centralizada
- **Custom Hooks**: `useTasaciones`, `useBaremosHonorarios`, `useFormulasCalculo`, etc.

### Validación
- **Zod**: Validación de esquemas TypeScript
- **React Hook Form**: Gestión de formularios

### Estilo
- **Tailwind CSS**: Utilidades CSS
- **Lucide React**: Iconos SVG
- **Framer Motion**: Animaciones

### Exportación de Datos
- **DOCX**: Generación de documentos Word
- **PDF**: Exportación con jsPDF
- **Excel**: Lectura/escritura con xlsx

### Seguridad
- **Row Level Security (RLS)**: Políticas de Supabase por usuario
- **JWT Tokens**: Autenticación sin estado
- **CORS**: Control de acceso entre dominios
- **HTTPS**: Encriptación en tránsito

## Componentes Principales

### Nivel de Presentación (src/components)
- `AdminPanel`: Panel de administración
- `TasacionForm`: Formulario principal de tasación
- `InterestCalculatorAdvanced`: Calculadora de intereses
- `HistorialTasaciones`: Historial de tasaciones
- `Login`: Componente de autenticación
- `CalculatorContainer`: Contenedor principal
- `TasacionesTable`: Tabla de tasaciones
- `EntidadesTable`: Gestión de entidades
- `MunicipioICATable`: Gestión de municipios ICA

### Nivel de Negocio (src/lib)
- `calculator.ts`: Lógica de cálculo de costas
- `interestCalculator.ts`: Lógica de cálculo de intereses
- `municipios.ts`: Funciones de municipios
- `entidades.ts`: Funciones de entidades
- `docx-generator.ts`: Generación de documentos

### Nivel de Datos (src/lib)
- `supabase.ts`: Cliente Supabase
- `database-init.ts`: Inicialización de BD
- Hooks en `src/hooks/*`: Consultas a BD

## Despliegue

```
┌─────────────────────────────────────────┐
│  Git commit a master en GitHub          │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│  Webhook de GitHub → Vercel             │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│  Build & Optimización Vercel            │
│  - npm run build                        │
│  - TypeScript compilation               │
│  - Vite bundling                        │
│  - Asset optimization                   │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│  Deploy a CDN Global Vercel             │
│  - Edge caching                         │
│  - Geografic distribution               │
│  - SSL automático                       │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│  https://tasador-web.vercel.app/        │
│  [Listo para producción]                │
└─────────────────────────────────────────┘
```

## Variables de Entorno

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxx_anonkey_xxxxxx
```

## Notas de Seguridad

1. **RLS Policies**: Cada usuario solo ve sus propias tasaciones
2. **JWT Auth**: Tokens con expiración automática
3. **No datos sensibles en cliente**: Contraseñas y datos críticos en servidor
4. **CORS habilitado**: Solo dominios autorizados
5. **Validación en cliente y servidor**: Validación doble de datos
