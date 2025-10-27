# 📖 Manual de Uso - TASADOR COSTAS v2.0

## Índice
1. [Introducción](#introducción)
2. [Acceso a la Aplicación](#acceso-a-la-aplicación)
3. [Tasaciones - Módulo Principal](#tasaciones---módulo-principal)
4. [Tablas de Costas por Fecha de Demanda](#tablas-de-costas-por-fecha-de-demanda)
5. [Cálculo de Intereses Simple](#cálculo-de-intereses-simple)
6. [Cálculo de Intereses Complejo (Lotes)](#cálculo-de-intereses-complejo-lotes)
7. [Historial de Tasaciones](#historial-de-tasaciones)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

**TASADOR COSTAS** es una aplicación web profesional diseñada para calcular automáticamente:
- **Costas judiciales** según el Índice de Costas de Aranceles (ICA)
- **Intereses legales, judiciales y TAE**
- **Informes personalizados en PDF y Excel**

La aplicación está optimizada para profesionales del ámbito legal y judicial que necesitan emitir tasaciones rápidas y precisas.

---

## Acceso a la Aplicación

### 1. Iniciar Sesión

- Abre la aplicación en tu navegador
- Introduce tu **email** y **contraseña**
- Haz clic en **"Iniciar Sesión"**

Si no tienes cuenta, contacta con el administrador de la aplicación.

### 2. Interfaz Principal

Una vez autenticado, verás la barra de navegación con 5 secciones:

```
┌──────────────────────────────────────────────────────┐
│  📄 TASADOR COSTAS  │  💰 CALCULO INTERÉS  │ ...   │
│  ⏱️ Cálculo Simple  │  ⏱️ Cálculo Complejo │ ...   │
└──────────────────────────────────────────────────────┘
```

---

## TASACIONES - Módulo Principal

### ¿Qué es una Tasación?

Una **tasación** es el cálculo automático de las **costas judiciales** (gastos asociados a un proceso judicial) basado en:
- El **Índice de Costas de Aranceles (ICA)** del municipio
- La **fase de terminación** (Audiencia Previa, Sentencia, etc.)
- La **instancia** (Primera o Segunda Instancia)

### Crear una Nueva Tasación

#### Paso 1: Acceder al Formulario
- Haz clic en la pestaña **"TASADOR COSTAS"**
- Verás un formulario con varios campos

#### Paso 2: Completar Información del Cliente

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Nombre Cliente** | Nombre de la parte que solicita la tasación | Juan García López |
| **Número Procedimiento** | Identificador único del juicio | 2024/12345 |
| **Nombre Juzgado** | (Opcional) Juzgado que conoce del caso | Juzgado de lo Civil nº 3 |
| **Entidad Demandada** | Organización demandada (búsqueda con autocomplete) | AEPD, Banco Santander |

#### Paso 3: Ubicación y Proceso

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Municipio** | Localidad donde se tramita el caso | Madrid, Barcelona |
| **Tipo Procedimiento** | Tipo de juicio | Juicio Verbal / Juicio Ordinario |
| **Fase Terminación** | Etapa en que finaliza el proceso | Audiencia Previa, Sentencia |
| **Instancia** | Nivel judicial | Primera Instancia / Segunda Instancia |

**✅ Nota:** El sistema calcular automáticamente el **Criterio ICA** según el municipio seleccionado.

#### Paso 4: Generar la Tasación

1. Revisa todos los datos completados
2. Haz clic en el botón **"GENERAR TASACIÓN"**
3. El sistema calculará automáticamente:
   - **Costas sin IVA** (€)
   - **IVA 21%** (€)
   - **Total a pagar** (€)

### Ver Detalles de la Tasación

Tras generar la tasación, verás un **resumen visual** con:
- Código único de referencia (Aranzadi)
- Desglose de costas (sin IVA, IVA, total)
- Fecha de generación
- Opciones de:
  - 👁️ Ver detalles completos
  - ✏️ Editar tasación
  - 🗑️ Eliminar tasación
  - 📥 Descargar minuta en Word

---

## TABLAS DE COSTAS POR FECHA DE DEMANDA

### ¿Por qué existen diferentes tablas de costas?

Debido a la **Ley 10/2023, de 6 de diciembre**, que modifica la cuantía indeterminada incrementándola de **18.000€ a 24.000€**, el sistema utiliza **dos tablas diferentes** de costas judiciales según la fecha de presentación de la demanda:

### Fecha de Corte: 3 de Abril de 2025

```
┌─────────────────────────────────────────────────────────────┐
│                    FECHA DE DEMANDA                          │
├─────────────────────────────────────────────────────────────┤
│        📅 ANTERIOR al 3 de abril de 2025                     │
│        💰 TABLA: 18k (Cuantía indeterminada: 18.000€)       │
│                                                             │
│        📅 POSTERIOR al 3 de abril de 2025                    │
│        💰 TABLA: 24k (Cuantía indeterminada: 24.000€)       │
└─────────────────────────────────────────────────────────────┘
```

### ¿Cómo funciona la selección automática?

1. **Campo "Fecha de Demanda"**: En el formulario de tasación, introduce la fecha exacta de presentación de la demanda
2. **Selección automática**: El sistema compara la fecha con el 3 de abril de 2025
3. **Tabla aplicada**: Se utiliza la tabla correspondiente (18k o 24k)
4. **Indicador visual**: En el resumen de cálculo verás "18k (pre-2025)" o "24k (2025+)"

### Ejemplos de aplicación

#### 📅 Demanda presentada el **15 de marzo de 2025**
- **Resultado**: Se aplica tabla **18k**
- **Motivo**: Fecha anterior al 3 de abril de 2025
- **Cuantía indeterminada**: 18.000€

#### 📅 Demanda presentada el **10 de abril de 2025**
- **Resultado**: Se aplica tabla **24k**
- **Motivo**: Fecha posterior al 3 de abril de 2025
- **Cuantía indeterminada**: 24.000€

### ¿Dónde veo qué tabla se aplicó?

#### En el Resumen de Tasación
Después de calcular, verás en el detalle:
```
💼 Tipo de costas aplicadas: 18k (pre-2025)
   o
💼 Tipo de costas aplicadas: 24k (2025+)
```

#### En el Historial de Tasaciones
La columna **"Tipo Costas"** muestra:
- **18k (Sin fecha)**: No se especificó fecha de demanda
- **18k (Pre-2025)**: Fecha anterior al 3 de abril de 2025
- **24k (2025+)**: Fecha posterior al 3 de abril de 2025

### Importancia de la fecha correcta

⚠️ **Es fundamental introducir la fecha exacta de la demanda** porque:
- Las cuantías pueden variar significativamente entre tablas
- Afecta directamente al cálculo de costas judiciales
- Puede cambiar el resultado final de la tasación

### ¿Qué pasa si no introduzco fecha?

Si dejas vacío el campo **"Fecha de Demanda"**:
- El sistema asume tabla **18k** por defecto
- Se mostrará como **"18k (Sin fecha)"** en el historial
- Recomendamos siempre especificar la fecha para precisión

---

## CÁLCULO DE INTERESES SIMPLE

### ¿Cuándo Usar el Cálculo Simple?

Cuando necesitas calcular intereses para:
- Una **única cantidad de dinero**
- Un **período específico** (fecha inicio → fecha fin)
- Sin necesidad de procesar múltiples casos a la vez

### Pasos para Calcular

#### 1. Acceder al Módulo

Haz clic en la pestaña **"CALCULO INTERÉS"** en la navegación principal.

#### 2. Completar los Datos

| Campo | Descripción | Formato |
|-------|-------------|---------|
| **Capital** | Cantidad sobre la que calcular intereses | 10.000,50 |
| **Fecha Inicio** | Inicio del período de cálculo | DD/MM/YYYY |
| **Fecha Fin** | Fin del período de cálculo | DD/MM/YYYY |
| **Modalidad** | Tipo de interés a aplicar | Véase tabla abajo |

#### 3. Seleccionar Modalidad de Interés

```
┌────────────────────────────────────────────────────────┐
│ MODALIDADES DISPONIBLES                                │
├────────────────────────────────────────────────────────┤
│ 🔹 LEGAL (Defecto)                                     │
│    Tasa anual según legislación                        │
│    Uso: Deudas ordinarias, intereses por mora          │
│                                                         │
│ 🔹 JUDICIAL                                            │
│    Tasa incrementada para sentencias judiciales        │
│    Requiere: Fecha de sentencia                        │
│    Uso: Sentencias condenatorias                       │
│                                                         │
│ 🔹 TAE                                                 │
│    Tasa Anual Equivalente del contrato                 │
│    Requiere: Valor TAE del contrato (%)               │
│    Uso: Créditos, hipotecas con TAE específica        │
│                                                         │
│ 🔹 TAE + 5%                                            │
│    TAE del contrato aumentado 5 puntos                 │
│    Requiere: Valor TAE del contrato (%)               │
│    Uso: Penalizaciones por incumplimiento              │
└────────────────────────────────────────────────────────┘
```

#### 4. Calcular

Haz clic en **"CALCULAR INTERESES"**

#### 5. Interpretar Resultados

Verás un **desglose por año** mostrando:
- **Año** del cálculo
- **Días** aplicados en ese año
- **Tasa** utilizada (%)
- **Intereses generados** (€)

**Ejemplo:**
```
Año 2024: 365 días × 3,00% = €300,00
Año 2025: 185 días × 3,00% = €152,05
─────────────────────────────
TOTAL INTERESES: €452,05
```

#### 6. Descargar Resultados (Opcional)

- **Excel**: Exporta la tabla para análisis posterior
- **PDF**: Genera informe profesional descargable

---

## CÁLCULO DE INTERESES COMPLEJO (Lotes)

### ¿Cuándo Usar Cálculo Complejo?

Cuando necesitas:
- Calcular **múltiples casos** a la vez
- Procesar datos de un **archivo Excel/CSV**
- Comparar **diferentes modalidades** de interés
- Generar **informes profesionales** por expediente

### Pasos para Procesar un Lote

#### 1. Acceder al Módulo

Haz clic en **"CÁLCULO INTERÉS AVANZADO"** en la navegación.

#### 2. Preparar tu Archivo Excel

Tu archivo Excel debe contener **como mínimo** estas columnas:

```
┌─────────────┬──────────────┬──────────────┐
│ Cuantía (€) │ Fecha Inicio │ Fecha Fin    │
├─────────────┼──────────────┼──────────────┤
│ 10000,00    │ 01/01/2023   │ 31/12/2024   │
│ 5500,50     │ 15/03/2023   │ 30/06/2024   │
│ 7250,75     │ 01/09/2023   │ 28/02/2024   │
└─────────────┴──────────────┴──────────────┘
```

**Columnas opcionales:**
- **Concepto**: Descripción del caso (para informes)
- Otras columnas serán ignoradas

#### 3. Cargar Archivo

1. Haz clic en **"Seleccionar Archivo"**
2. Elige tu archivo Excel (.xlsx, .xls, .csv)
3. El sistema detectará automáticamente las columnas

#### 4. Mapear Columnas

Si tu archivo tiene nombres diferentes, deberás indicar:
- ¿Cuál columna contiene el **capital**?
- ¿Cuál contiene la **fecha inicio**?
- ¿Cuál contiene la **fecha fin**?

```
Columna de Cuantía:        [Selecciona: Importe €]
Columna de Fecha Inicio:   [Selecciona: Desde]
Columna de Fecha Fin:      [Selecciona: Hasta]
```

#### 5. Configurar Parámetros Globales

| Parámetro | Descripción |
|-----------|-------------|
| **Fecha Fin Global** | Si todos los casos terminan en la misma fecha |
| **Modalidades** | Selecciona cuáles calcular (Legal, Judicial, TAE, etc.) |
| **TAE del Contrato** | Solo si usas modalidades TAE (%) |
| **Fecha de Sentencia** | Solo si usas modalidad Judicial |

#### 6. Procesar Lote

1. Haz clic en **"CALCULAR TODOS"**
2. El sistema procesará cada fila del Excel
3. Verás el progreso en pantalla

#### 7. Revisar Resultados

Para cada modalidad, verás una **tabla** con:

| Capital | Fecha Inicio | Fecha Fin | Intereses |
|---------|--------------|-----------|-----------|
| €10.000,00 | 01/01/2023 | 31/12/2024 | €600,00 |
| €5.500,50 | 15/03/2023 | 30/06/2024 | €275,00 |

#### 8. Descargar Informe

**Opciones de descarga:**

```
📊 Exportar a Excel
   └─ Tabla con todos los resultados tabulados

📄 Descargar PDF
   └─ Informe profesional con:
      ├─ Portada con datos del expediente
      ├─ Resumen ejecutivo
      ├─ Parámetros de cálculo utilizados
      ├─ Resultados por modalidad
      ├─ Gráficos comparativos
      ├─ Tablas detalladas año a año
      └─ Pie profesional
```

### Personalizar Informes PDF

Antes de descargar el PDF, puedes personalizarlo:

1. Haz clic en **"Personalizar Informe"**
2. Modifica:
   - **Título principal** del informe
   - **Subtítulo**
   - **Notas del expediente** (observaciones especiales)
   - **Información adicional** (referencias legales, etc.)
   - **Pie de página**

3. Guarda la configuración como **plantilla** para reutilizarla

---

## HISTORIAL DE TASACIONES

### ¿Qué es el Historial?

El **Historial** es un registro completo de todas las tasaciones generadas, con:
- Acceso rápido a cualquier tasación anterior
- Búsqueda y filtrado avanzado
- Exportación de datos en Excel
- Estadísticas y resúmenes

### Acceder al Historial

Haz clic en la pestaña **"Historial"** en la navegación principal.

### Vista General del Historial

Verás una **tabla completa** con todas tus tasaciones mostrando:

| Procedimiento | Cliente | Usuario | Ubicación | Procedimiento | Costas s/IVA | IVA 21% | Total | Fecha | Ref. Aranzadi | Acciones |
|---|---|---|---|---|---|---|---|---|---|---|
| 2024/12345 | García López | Admin | Madrid | Juicio Ordinario | €1.000,00 | €210,00 | €1.210,00 | 22/10/2025 | REF123 | 👁️ ✏️ 🗑️ 📥 |

### Filtrar Tasaciones

**Búsqueda rápida:**
- 🔍 **Buscador**: Busca por nombre cliente, procedimiento, ubicación

**Filtros avanzados:**
- 📅 **Fecha desde/hasta**: Rango de fechas
- 👤 **Usuario**: Filtrar por usuario que generó
- ⚖️ **Tipo Proceso**: Juicio Verbal / Ordinario
- 🏛️ **Instancia**: Primera / Segunda

### Acciones en el Historial

Para cada tasación tienes 4 opciones:

| Icono | Acción | Descripción |
|-------|--------|-------------|
| 👁️ | **Ver Detalles** | Abre modal con información completa |
| ✏️ | **Editar** | Modifica la tasación existente |
| 🗑️ | **Eliminar** | Borra la tasación (se pide confirmación) |
| 📥 | **Descargar Minuta** | Genera documento Word descargable |

### Exportar Datos a Excel

1. Aplica los filtros que desees
2. Haz clic en **"📊 Descargar Excel"**
3. Se descargará un archivo con:
   - Todas las tasaciones visibles (respetando filtros)
   - Columnas: fecha, usuario, cliente, municipio, tipo procedimiento, fase, instancia, costas sin IVA, IVA, total, referencia

**Uso:** Análisis posterior, reporting, auditoría

### Ver Estadísticas

Al principio del Historial verás un **panel de estadísticas**:

```
┌─────────────────────────────────────────┐
│ 📈 ESTADÍSTICAS                          │
├─────────────────────────────────────────┤
│ Total de tasaciones: 247                │
│ Capital total: €1.234.567,89            │
│ Costas totales: €154.321,43             │
│ Promedio por tasación: €625,00          │
└─────────────────────────────────────────┘
```

---

## PREGUNTAS FRECUENTES

### P: ¿Cómo sé qué "Fase de Terminación" debo seleccionar?

**R:** Las fases disponibles dependen del "Tipo de Procedimiento":

**Para Juicio Verbal:**
- Audiencia Previa
- Sentencia
- Apelación

**Para Juicio Ordinario:**
- Audiencia Previa
- Conclusiones
- Sentencia
- Apelación

Selecciona la fase en que **finalmente terminó** el procedimiento.

---

### P: ¿Cuál es la diferencia entre "Interés Legal" e "Interés Judicial"?

**R:**
- **Legal**: Se aplica automáticamente por ley (tasa fija anual: 3%)
  - Uso: Deudas ordinarias, impagos, mora
- **Judicial**: Se condena en sentencia con tasa incrementada (~5-6%)
  - Uso: Cuando hay sentencia condenatoria que lo específica

---

### P: ¿Puedo modificar una tasación después de crearla?

**R:** Sí. En el Historial, haz clic en el ícono ✏️ **"Editar"** y podrás:
- Cambiar datos del cliente
- Modificar municipio o tipo proceso
- Actualizar fase/instancia
- El sistema recalculará automáticamente

---

### P: ¿Cómo exporto múltiples tasaciones en un único PDF?

**R:** Usa el **"Cálculo de Intereses Complejo"**:
1. Carga un Excel con múltiples casos
2. Selecciona tus parámetros
3. Haz clic en "Descargar PDF"
4. Se genera un informe unificado con todos los casos

---

### P: ¿Qué formatos admite el Cálculo Complejo?

**R:** 
- ✅ Excel (.xlsx, .xls)
- ✅ CSV (valores separados por comas)
- ❌ Google Sheets (exporta primero como Excel)
- ❌ ODS (exporta primero como Excel)

---

### P: ¿Puedo personalizar los informes PDF generados?

**R:** Sí. En el Cálculo Complejo, antes de descargar:
1. Haz clic en **"Personalizar Informe"**
2. Modifica:
   - Títulos
   - Notas y observaciones
   - Información adicional
   - Pie de página
3. Opcionalmente, **guarda como plantilla** para reutilizar

---

### P: ¿Se pierden mis tasaciones si cierro la aplicación?

**R:** No. Todas tus tasaciones se guardan en la base de datos.
- Cada vez que inicies sesión, verás tu historial completo
- Puedes acceder a tasaciones de años anteriores

---

### P: ¿Qué pasa si hay un error en una tasación?

**R:**
1. **Editar**: Haz clic en ✏️ para corregir los datos
2. **Eliminar**: Si prefieres empezar de nuevo, borra con 🗑️
3. **Crear nueva**: Genera una nueva tasación con datos correctos

---

### P: ¿Cómo genero un informe en Word de una tasación?

**R:**
1. En el **Historial**, localiza la tasación
2. Haz clic en el ícono 📥 **"Descargar Minuta"**
3. Se descargará un documento Word profesional con:
   - Datos del cliente
   - Desglose de costas
   - Información legal
   - Referencia Aranzadi

---
