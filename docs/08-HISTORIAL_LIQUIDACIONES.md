# 📊 Historial de Liquidaciones - Documentación Técnica

## 📑 Índice
- [Introducción](#introducción)
- [Componentes Principales](#componentes-principales)
- [Base de Datos](#base-de-datos)
- [Storage de Archivos](#storage-de-archivos)
- [Funcionalidades](#funcionalidades)
- [Estadísticas](#estadísticas)
- [Botones y Acciones](#botones-y-acciones)
- [Filtros Avanzados](#filtros-avanzados)
- [Visor de Detalles](#visor-de-detalles)
- [Integración con PDF](#integración-con-pdf)

---

## 📋 Introducción

El **Historial de Liquidaciones** es un módulo que permite a los usuarios:
- Visualizar un historial completo de todas las liquidaciones de intereses generadas
- Acceder a estadísticas consolidadas sobre intereses recuperados
- Descargar informes PDF previamente generados desde el storage
- Filtrar y buscar liquidaciones por múltiples criterios
- Exportar datos a Excel
- Eliminar liquidaciones del historial

**Ubicación en la UI:** Sección "Historial" → Pestaña "Historial Liquidaciones"

---

## 🏗️ Componentes Principales

### HistorialLiquidaciones.tsx
**Archivo:** `src/components/HistorialLiquidaciones.tsx`

**Responsabilidades:**
- Renderizar tabla de liquidaciones
- Gestionar filtros y búsqueda
- Mostrar estadísticas en tiempo real
- Controlador de modales (detalles, eliminación)
- Descarga de archivos y exportación Excel
- Paginación de resultados

**Dependencias:**
```typescript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RefreshCw, Download, Eye, Trash2, WifiOff, TrendingUp } from 'lucide-react'
import * as XLSX from 'xlsx'
```

**Estados Principales:**
```typescript
- liquidaciones: Liquidacion[]           // Todas las liquidaciones
- filteredLiquidaciones: Liquidacion[]   // Liquidaciones filtradas
- showDetailsModal: boolean              // Modal de detalles
- selectedLiquidacion: Liquidacion       // Liquidación seleccionada
- informesAsociados: InformeLiquidacion[] // PDFs asociados
- loading: boolean                       // Estado de carga
```

---

## 🗄️ Base de Datos

### Tabla: tasador_historial_liquidaciones

**Propósito:** Almacenar el historial de todas las liquidaciones de intereses calculadas

**Esquema SQL:**
```sql
CREATE TABLE tasador_historial_liquidaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios_personalizados(id) ON DELETE CASCADE,
  ref_aranzadi TEXT NOT NULL,
  intereses_legales DECIMAL(12, 2),
  interes_judicial DECIMAL(12, 2),
  tae_cto DECIMAL(12, 2),
  tae_mas_5 DECIMAL(12, 2),
  fecha_fin DATE,
  fecha_sentencia DATE,
  tae_porcentaje DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único de la liquidación |
| `user_id` | UUID | FK a usuarios_personalizados (usuario que la creó) |
| `ref_aranzadi` | TEXT | Referencia Aranzadi (búsqueda de duplicados) |
| `intereses_legales` | DECIMAL | Total de intereses legales calculados |
| `interes_judicial` | DECIMAL | Total de intereses judiciales calculados |
| `tae_cto` | DECIMAL | Total de intereses TAE contrato |
| `tae_mas_5` | DECIMAL | Total de intereses TAE + 5% |
| `fecha_fin` | DATE | Fecha fin del cálculo |
| `fecha_sentencia` | DATE | Fecha de sentencia (para intereses judiciales) |
| `tae_porcentaje` | DECIMAL | Porcentaje TAE aplicado |
| `created_at` | TIMESTAMP | Fecha de creación del registro |
| `updated_at` | TIMESTAMP | Última modificación |

**Índices:**
```sql
CREATE INDEX idx_liquidaciones_user_id ON tasador_historial_liquidaciones(user_id);
CREATE INDEX idx_liquidaciones_ref_aranzadi ON tasador_historial_liquidaciones(ref_aranzadi);
CREATE INDEX idx_liquidaciones_created_at ON tasador_historial_liquidaciones(created_at);
```

---

### Tabla: tasador_relacion_informes_liquidaciones

**Propósito:** Relacionar liquidaciones con sus PDFs almacenados en Storage

**Esquema SQL:**
```sql
CREATE TABLE tasador_relacion_informes_liquidaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_aranzadi TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES usuarios_personalizados(id) ON DELETE CASCADE,
  nombre_archivo TEXT NOT NULL,
  fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único de la relación |
| `ref_aranzadi` | TEXT | Referencia Aranzadi (búsqueda) |
| `user_id` | UUID | FK a usuarios_personalizados |
| `nombre_archivo` | TEXT | Nombre del archivo en Storage (timestamp_refaranzadi.pdf) |
| `fecha_generacion` | TIMESTAMP | Cuándo se generó el informe |
| `created_at` | TIMESTAMP | Fecha de creación del registro |

**Índices:**
```sql
CREATE INDEX idx_informes_ref_aranzadi ON tasador_relacion_informes_liquidaciones(ref_aranzadi);
CREATE INDEX idx_informes_user_id ON tasador_relacion_informes_liquidaciones(user_id);
```

---

## 💾 Storage de Archivos

### Bucket: informes_liquidaciones

**Propósito:** Almacenar archivos PDF de informes de liquidaciones generados

**Configuración:**
```javascript
{
  name: 'informes_liquidaciones',
  public: false,  // Privado, acceso solo con autenticación
  fileSizeLimit: 52428800,  // 50MB por archivo
  allowedMimeTypes: ['application/pdf']
}
```

**Formato de Nombres:**
```
{timestamp}_{ref_aranzadi}.pdf

Ejemplos:
- 1770369596840_123_2025.pdf
- 1770370123456_ABC_2026.pdf
```

**Estructura de Directorios:**
```
informes_liquidaciones/
├── 1770369596840_123_2025.pdf
├── 1770370123456_ABC_2026.pdf
└── ...
```

**Políticas RLS (Row Level Security):**
```sql
-- Permitir inserción de archivos
CREATE POLICY "Permitir subir archivos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'informes_liquidaciones');

-- Permitir lectura de archivos
CREATE POLICY "Permitir leer archivos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'informes_liquidaciones');
```

---

## 🎯 Funcionalidades

### 1. Guardar Liquidación en Historial

**Desencadenante:**
- Manual: Botón "Guardar Liquidación" en Calculador Avanzado
- Automático: Al exportar a PDF

**Flujo:**
```
Usuario genera cálculo
    ↓
Click "Guardar Liquidación" / "Exportar PDF"
    ↓
Sistema busca duplicados por ref_aranzadi
    ↓
Si duplicado:
  → Mostrar modal de duplicidad
  → Usuario elige: Actualizar, Crear nuevo, Cancelar
  ↓
Si no duplicado:
  → Insertar en tasador_historial_liquidaciones
  → Mostrar confirmación
```

**Validación de Duplicados:**
```typescript
const { data: existingLiquidacion } = await supabase
  .from('tasador_historial_liquidaciones')
  .select('*')
  .eq('ref_aranzadi', numeroProcedimiento.trim())
  .eq('user_id', user.id)
  .maybeSingle()
```

### 2. Auto-Guardado de PDF

**Desencadenante:** Cuando se genera un PDF en el calculador

**Flujo:**
```
PDF generado
    ↓
Convertir a blob
    ↓
Generar nombre: {timestamp}_{ref_aranzadi}.pdf
    ↓
Subir a Storage (informes_liquidaciones)
    ↓
Guardar relación en tasador_relacion_informes_liquidaciones
    ↓
Guardar/Actualizar liquidación en historial
```

**Código en InterestCalculatorAdvanced.tsx:**
```typescript
// Convertir el PDF a blob
const pdfBlob = pdf.output('blob')

// Crear nombre único para el archivo
const timestamp = new Date().getTime()
const storageFileName = `${timestamp}_${numeroProcedimiento.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

// Subir al bucket
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('informes_liquidaciones')
  .upload(storageFileName, pdfBlob, {
    contentType: 'application/pdf',
    cacheControl: '3600',
    upsert: false
  })

// Guardar relación
await supabase
  .from('tasador_relacion_informes_liquidaciones')
  .insert([{
    ref_aranzadi: numeroProcedimiento.trim(),
    user_id: user.id,
    nombre_archivo: storageFileName
  }])
```

---

## 📊 Estadísticas

### Tarjetas de Estadísticas

Se muestran **4 tarjetas** en la parte superior con estadísticas en tiempo real:

**1. Expedientes Liquidados** (Azul)
```
Valor: filteredLiquidaciones.length
Descripción: Cantidad total de liquidaciones registradas
```

**2. Total Int. Legales Recuperados** (Verde)
```
Cálculo: SUM(intereses_legales) para todas las liquidaciones filtradas
Fórmula: liquidaciones.reduce((sum, l) => sum + (l.intereses_legales || 0), 0)
```

**3. Total Int. Judiciales Recuperados** (Azul)
```
Cálculo: SUM(interes_judicial) para todas las liquidaciones filtradas
Fórmula: liquidaciones.reduce((sum, l) => sum + (l.interes_judicial || 0), 0)
```

**4. Total Intereses Recuperados** (Púrpura)
```
Cálculo: SUMA DE TODOS LOS INTERESES
Fórmula: totalInteresesLegales + totalInteresesJudiciales + 
         SUM(tae_cto) + SUM(tae_mas_5)
```

**Actualización Dinámicamente:**
Las estadísticas se recalculan automáticamente cuando:
- Se aplican/limpian filtros
- Se elimina una liquidación
- Se actualiza una liquidación
- Se carga la página

---

## 🔘 Botones y Acciones

### Tabla Principal

| Botón | Icono | Acción | Ubicación |
|-------|-------|--------|-----------|
| **Ver Detalles** | 👁️ Eye | Abre modal con información completa | Columna Acciones |
| **Eliminar** | 🗑️ Trash | Elimina liquidación con confirmación | Columna Acciones |
| **Descargar Excel** | 📥 Download | Exporta liquidaciones filtradas a Excel | Barra de herramientas |
| **Actualizar** | 🔄 RefreshCw | Recarga datos desde servidor | Barra de herramientas |
| **Limpiar Filtros** | ✕ | Resetea todos los filtros | Barra de filtros |

### Modal de Detalles

| Botón | Acción |
|-------|--------|
| **Cerrar (×)** | Cierra el modal |
| **Descargar** | Descarga el PDF del Storage |
| **Cerrar** (footer) | Cierra el modal |

---

## 🔍 Filtros Avanzados

### Filtros Disponibles

**1. Búsqueda por Ref. Aranzadi**
```typescript
matchSearch = !searchTerm || 
  (l.ref_aranzadi?.toLowerCase().includes(searchTerm.toLowerCase()))
```

**2. Búsqueda por Usuario**
```typescript
matchUsuario = !searchUsuario ||
  (l.usuarios_personalizados?.nombre.toLowerCase()
   .includes(searchUsuario.toLowerCase()))
```

**3. Filtro por Modalidad**
```typescript
- Todas: mostrar todas
- Con Int. Legales: (l.intereses_legales || 0) > 0
- Con Int. Judicial: (l.interes_judicial || 0) > 0
- Con TAE: ((l.tae_cto || 0) > 0 || (l.tae_mas_5 || 0) > 0)
```

**4. Rango de Fechas**
```typescript
matchDateFrom = !filterDateFrom || 
  new Date(l.created_at) >= new Date(filterDateFrom)

matchDateTo = !filterDateTo || 
  new Date(l.created_at) <= new Date(filterDateTo)
```

**5. Rango de Intereses**
```typescript
const totalIntereses = (l.intereses_legales || 0) + 
                      (l.interes_judicial || 0) + 
                      (l.tae_cto || 0) + 
                      (l.tae_mas_5 || 0)

matchInteresesMin = !filterInteresesMin || 
  totalIntereses >= parseFloat(filterInteresesMin)

matchInteresesMax = !filterInteresesMax || 
  totalIntereses <= parseFloat(filterInteresesMax)
```

---

## 👁️ Visor de Detalles

### Modal de Detalles (Grandes)

Se divide en **4 secciones principales:**

#### 1️⃣ Información Principal (Azul)
- Ref. Aranzadi
- Usuario (nombre de usuarios_personalizados)
- % TAE Aplicado

#### 2️⃣ Intereses Calculados (Verde)
Muestra en **tarjetas de colores:**
- **Intereses Legales** (Esmeralda): €X.XX
- **Interés Judicial** (Azul): €X.XX
- **TAE CTO** (Púrpura): €X.XX
- **TAE+5** (Rosa): €X.XX

**Total Intereses** (barra verde degradada): €TOTAL

#### 3️⃣ Fechas del Cálculo (Ámbar)
- Fecha Fin Cálculo
- Fecha Sentencia
- Creado (fecha y hora)
- Última Modificación (fecha y hora)

#### 4️⃣ Informes Generados (Púrpura) ⭐
Muestra lista de PDFs con:
- Nombre del archivo
- Fecha de generación
- **Botón Descargar** (color púrpura)

**Funcionalidad de Descarga:**
```typescript
onClick={async () => {
  const { data, error } = await supabase.storage
    .from('informes_liquidaciones')
    .download(informe.nombre_archivo)
  
  if (error) throw error
  
  // Crear URL y descargar
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = informe.nombre_archivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}}
```

---

## 📑 Integración con PDF

### Flujo de Generación y Almacenamiento

**En InterestCalculatorAdvanced.tsx:**

```
Usuario genera PDF en calculador
    ↓
Descargar PDF localmente (pdf.save())
    ↓
Convertir a blob
    ↓
Subir a Storage con nombre: timestamp_refaranzadi.pdf
    ↓
Guardar relación en tasador_relacion_informes_liquidaciones
    ↓
Verificar duplicados de liquidación
    ↓
Mostrar modal si existe duplicado
    ↓
Si actualizar/crear: guardar en tasador_historial_liquidaciones
    ↓
Mostrar alerta de éxito
```

### Descarga de PDFs

**Desde modal de detalles:**
```
Usuario hace click en "Descargar"
    ↓
Sistema obtiene archivo del Storage
    ↓
Crear blob URL
    ↓
Simular click de descarga
    ↓
Limpiar recursos
```

---

## 📈 Performance

### Optimizaciones Implementadas

1. **Índices en Base de Datos**
   - user_id para filtrado rápido
   - ref_aranzadi para búsqueda de duplicados
   - created_at para ordenamiento

2. **Paginación**
   - 10 elementos por página
   - Evita cargar toda la tabla de una vez

3. **Lazy Loading de Informes**
   - Solo se cargan al abrir modal de detalles
   - Consulta separada a `tasador_relacion_informes_liquidaciones`

4. **Filtrado en Cliente**
   - Aplicado después de obtener datos
   - Reduce carga del servidor

5. **Memoización**
   - Estadísticas se recalculan solo cuando cambian los datos filtrados

---

## 🐛 Manejo de Errores

### Errores Comunes

**Error: "No se pudo guardar la liquidación: RLS policy"**
- Causa: Políticas RLS mal configuradas
- Solución: Verificar políticas en Storage y tabla

**Error: "Error descargando informe"**
- Causa: Archivo no existe o sin permisos
- Solución: Verificar nombre de archivo en Storage

**Error: 401 Unauthorized**
- Causa: Usuario no autenticado
- Solución: Verificar conexión y autenticación

---

## 📱 Responsividad

La tabla y estadísticas son **totalmente responsivas:**
- **Móvil:** Estadísticas en 1 columna, tabla scrolleable
- **Tablet:** Estadísticas en 2 columnas
- **Desktop:** Estadísticas en 4 columnas, tabla expandida

---

## 🔗 Referencias Relacionadas

- [03-CALCULADORA_INTERESES.md](./03-CALCULADORA_INTERESES.md) - Cómo se generan las liquidaciones
- [04-HISTORIAL_TASACIONES.md](./04-HISTORIAL_TASACIONES.md) - Patrón similar de historial
- [06-CREAR_USUARIOS_SUPABASE.md](./06-CREAR_USUARIOS_SUPABASE.md) - Gestión de usuarios

---

## 📞 Soporte

Para problemas o dudas:
1. Revisar logs en consola del navegador
2. Verificar conexión a Supabase
3. Comprobar políticas RLS en Storage
4. Verificar que usuarios_personalizados sea accesible
