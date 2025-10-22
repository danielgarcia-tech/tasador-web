# 🎯 RESUMEN EJECUTIVO - CONFIGURACIÓN DEL ASSISTANT

## 📦 Qué Necesitas Copiar a OpenAI

### 1. System Prompt (Instrucciones del Assistant)

**Archivo**: `SYSTEM_PROMPT_PLAIN.txt`

**Pasos**:
1. Abre `docs/SYSTEM_PROMPT_PLAIN.txt`
2. Selecciona TODO (Ctrl+A)
3. Copia (Ctrl+C)
4. Ve a https://platform.openai.com/assistants
5. Abre: `asst_ZRKOTi9BkuvF5vTyNgczTOu2`
6. Sección **Instructions** → Pega (Ctrl+V)
7. Guarda

---

### 2. Response Format (Estructura de Respuestas en JSON)

**Archivo**: `RESPONSE_FORMAT_SCHEMA.json`

**Pasos**:
1. Abre `docs/RESPONSE_FORMAT_SCHEMA.json`
2. Selecciona TODO (Ctrl+A)
3. Copia (Ctrl+C)
4. Ve a https://platform.openai.com/assistants
5. En el mismo Assistant: busca **Response format**
6. Selecciona **JSON schema**
7. Pega el contenido
8. Guarda

---

## ✨ Resultado Después de Configurar

El assistant responderá de esta forma a cada pregunta:

```
PREGUNTA:
"¿Cuál es el honorario para €45.000, complejidad media, termina en alegaciones?"

RESPUESTA COMPLETA:
---

RESPUESTA FINAL: €1.863

CÁLCULO DETALLADO:

1️⃣ Honorario Base (Criterio 3.1)
   Cuantía: €45.000
   Rango: €30.000-€60.000
   Porcentaje: 4%
   Resultado: €45.000 × 4% = €1.800

2️⃣ Incremento por Complejidad Media (Criterio 5.2)
   Porcentaje: 15%
   Incremento: €1.800 × 15% = €270
   Subtotal: €1.800 + €270 = €2.070

3️⃣ Reducción por Alegaciones (Criterio 7.1)
   Porcentaje: 10%
   Reducción: €2.070 × 10% = €207
   TOTAL: €2.070 - €207 = €1.863

FUNDAMENTACIÓN:
Según el baremo ICA Madrid 2020:
- Criterio 3.1 establece una base del 4% para cuantías entre €30K-€60K
- Criterio 5.2 permite incremento del 15% por complejidad media
- Criterio 7.1 aplica reducción del 10% por alegaciones

JSON ESTRUCTURADO (para frontend):

{
  "resumen": {
    "honorario_total": 1863,
    "moneda": "EUR",
    "estado": "calculado"
  },
  "cuantia_proceso": {
    "valor": 45000,
    "tipo": "determinada",
    "rango_aplicable": "€30.000-€60.000"
  },
  "criterio_base": {
    "codigo": "3.1",
    "nombre": "Base de cálculo",
    "porcentaje": 4,
    "valor_calculado": 1800,
    "fundamentacion": "Cuantía de €45.000 en rango €30K-€60K"
  },
  "incrementos": [
    {
      "criterio": "5.2",
      "tipo": "complejidad",
      "nivel": "media",
      "porcentaje": 15,
      "valor_calculado": 270,
      "aplicado": true,
      "motivo": "Múltiples cuestiones jurídicas y jurisprudencia compleja"
    }
  ],
  "reducciones": [
    {
      "criterio": "7.1",
      "tipo": "alegaciones",
      "porcentaje": 10,
      "valor_calculado": -207,
      "aplicado": true,
      "motivo": "El procedimiento termina en fase de alegaciones"
    }
  ],
  "desglose_calculos": [
    {
      "paso": 1,
      "descripcion": "Honorario base",
      "operacion": "45000 × 4%",
      "resultado": 1800,
      "subtotal": 1800
    },
    {
      "paso": 2,
      "descripcion": "Incremento por complejidad media",
      "operacion": "1800 × 15%",
      "resultado": 270,
      "subtotal": 2070
    },
    {
      "paso": 3,
      "descripcion": "Reducción por alegaciones",
      "operacion": "2070 × 10%",
      "resultado": -207,
      "subtotal": 1863
    }
  ],
  "criterios_aplicables": [
    {
      "codigo": "3.1",
      "nombre": "Base de cálculo",
      "descripcion": "Porcentaje según rango de cuantía",
      "aplicado": true
    },
    {
      "codigo": "5.2",
      "nombre": "Incremento por complejidad",
      "descripcion": "Aumento por dificultad del caso",
      "aplicado": true
    },
    {
      "codigo": "7.1",
      "nombre": "Reducción por alegaciones",
      "descripcion": "Disminución cuando termina en alegaciones",
      "aplicado": true
    }
  ],
  "fuente": {
    "baremo": "ICA Madrid",
    "ccaa": "MADRID",
    "ano": 2020,
    "paginas": "8-12"
  }
}
```

---

## 🎬 Cómo Funciona

```
┌─────────────────────────────────┐
│  Usuario Pregunta en Chatbot     │
│  "¿Honorario para €45.000...?"   │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  BaremoChatbot.tsx               │
│  - Envía pregunta al thread      │
│  - Incluye contexto CCAA/provincia│
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  OpenAI Assistant                │
│  - Aplica system prompt          │
│  - Consulta Vector Store         │
│  - Ejecuta cálculos              │
│  - Responde con JSON             │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  Respuesta Estructurada          │
│  - Texto legible                 │
│  - JSON válido                   │
│  - Cálculos paso a paso          │
│  - Referencias a criterios       │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  Frontend Parsea JSON            │
│  - Extrae honorario_total        │
│  - Muestra desglose_calculos     │
│  - Lista criterios_aplicables    │
│  - Valida fuente                 │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  Usuario Ve Resultado            │
│  ✅ €1.863 (número destacado)    │
│  ✅ Tabla con pasos del cálculo  │
│  ✅ Criterios aplicables         │
│  ✅ Referencias a baremo         │
└─────────────────────────────────┘
```

---

## 📋 Archivo de Configuración por Componentes

| Componente | Archivo | Contenido |
|-----------|---------|----------|
| **System Prompt** | `SYSTEM_PROMPT_PLAIN.txt` | Instrucciones del assistant (para copiar) |
| **Response Format** | `RESPONSE_FORMAT_SCHEMA.json` | Schema JSON (para copiar) |
| **Referencia System Prompt** | `SYSTEM_PROMPT_BAREMOS.md` | Versión markdown con explicaciones |
| **Referencia Response Format** | `RESPONSE_FORMAT_SCHEMA.md` | Explicación del schema |
| **Guía Paso a Paso** | `SETUP_OPENAI_ASSISTANT_README.md` | Instrucciones detalladas |
| **Config Completa JSON** | `ASSISTANT_CONFIG_JSON.json` | Todo en un archivo JSON |
| **Índice General** | `INDEX_CONFIGURACION.md` | Guía completa de recursos |

---

## 🔍 Verificación

Después de configurar, prueba esto:

1. **Verifica System Prompt**:
   ```
   P: "¿Qué es el Criterio 3.1?"
   R: Debe explicar con números específicos, no genéricamente
   ```

2. **Verifica Response Format**:
   ```
   P: "¿Honorario para €50.000?"
   R: Debe incluir JSON válido con estructura completa
   ```

3. **Verifica JSON Schema**:
   ```
   P: Cualquier pregunta
   R: Valida que el JSON sea parseabale (sin errores de sintaxis)
   ```

---

## 💾 Guardado

**Sistema Prompt**: Se guarda en OpenAI Assistant (texto en "Instructions")
**Response Format**: Se guarda en OpenAI Assistant (JSON Schema)

---

## 🚀 Uso en Frontend

El `BaremoChatbot.tsx` ya está listo para:
1. Parsear la respuesta JSON
2. Mostrar el resultado de forma visual
3. Actualizar el thread para multi-turn

No necesitas hacer cambios en el código.

---

## 📞 Próximos Pasos

1. ✅ Copia `SYSTEM_PROMPT_PLAIN.txt` a OpenAI
2. ✅ Copia `RESPONSE_FORMAT_SCHEMA.json` a OpenAI
3. ✅ Guarda cambios
4. ✅ Prueba en OpenAI Playground
5. ✅ Prueba en el navegador (npm run dev)
6. ✅ Verifica que el JSON se parsea correctamente

---

**Creado**: 22 de octubre de 2025
**Estado**: ✅ Listo para usar
**Versión**: 1.0 Final
