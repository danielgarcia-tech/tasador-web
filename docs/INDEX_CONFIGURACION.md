# 📚 GUÍA COMPLETA - SISTEMA PROMPT Y RESPONSE FORMAT

## 📁 Archivos Creados

### Para Configurar en OpenAI

| Archivo | Propósito | Usar Para |
|---------|-----------|-----------|
| **ASSISTANT_CONFIG_JSON.json** | Configuración completa | Referencia general |
| **SYSTEM_PROMPT_PLAIN.txt** | System prompt solo | Copiar a OpenAI Dashboard (Instructions) |
| **RESPONSE_FORMAT_SCHEMA.json** | Response Format JSON | Copiar a OpenAI Dashboard (JSON schema) |
| **SETUP_OPENAI_ASSISTANT_README.md** | Instrucciones paso a paso | Guía de configuración |

### Documentación de Referencia

| Archivo | Contenido |
|---------|----------|
| **SYSTEM_PROMPT_BAREMOS.md** | Prompt completo con ejemplos y reglas |
| **RESPONSE_FORMAT_SCHEMA.md** | Explicación del schema JSON |
| **RESPUESTAS_ESPERADAS_RAG.md** | 7 casos de uso y respuestas esperadas |
| **CONFIGURACION_ASSISTANT_OPENAI.md** | Guía completa de configuración |
| **RESPUESTAS_ESPERADAS_RAG.md** | Ejemplos de respuestas correctas |

---

## 🚀 INICIO RÁPIDO (3 pasos)

### Paso 1: Copia el System Prompt
1. Abre: `SYSTEM_PROMPT_PLAIN.txt`
2. Selecciona TODO (Ctrl+A)
3. Copia (Ctrl+C)

### Paso 2: Pega en OpenAI Dashboard
1. Ve a: https://platform.openai.com/assistants
2. Abre Assistant: `asst_ZRKOTi9BkuvF5vTyNgczTOu2`
3. Sección **Instructions** → Pega (Ctrl+V)

### Paso 3: Configura Response Format
1. En OpenAI: busca **Response format**
2. Selecciona **JSON schema**
3. Abre: `RESPONSE_FORMAT_SCHEMA.json`
4. Selecciona TODO, copia, pega

---

## 📋 ESTRUCTURA DEL SYSTEM PROMPT

```
┌─────────────────────────────────┐
│ ERES UN ESPECIALISTA EN BAREMOS │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ REGLAS FUNDAMENTALES (7 reglas)         │
│ 1. Cita criterios exactos               │
│ 2. Cálculos desglosados                 │
│ 3. Incrementos/Reducciones              │
│ 4. Formato de respuesta exacto           │
│ 5. Precisión numérica                   │
│ 6. Responde siempre en JSON             │
│ 7. Cuando no tengas info, se honesto    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ ESTRUCTURA JSON REQUERIDA (Obligatorio) │
│ - resumen (total, moneda, estado)       │
│ - cuantia_proceso (valor, tipo)         │
│ - criterio_base (código, %, valor)      │
│ - incrementos (array)                   │
│ - reducciones (array)                   │
│ - desglose_calculos (paso a paso)       │
│ - criterios_aplicables                  │
│ - fuente (baremo, CCAA, año, páginas)   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ EJEMPLOS DE RESPUESTAS CORRECTAS        │
│ - Ejemplo 1: Pregunta básica            │
│ - Ejemplo 2: Con incremento y reducción │
└─────────────────────────────────────────┘
```

---

## 🎯 ESTRUCTURA DEL RESPONSE FORMAT JSON

```json
{
  "resumen": {
    "honorario_total": 1863,        // €
    "moneda": "EUR",
    "estado": "calculado"           // calculado|estimacion|no_encontrado|error
  },
  "cuantia_proceso": {
    "valor": 45000,
    "tipo": "determinada",          // determinada|indeterminada
    "rango_aplicable": "€30K-€60K"
  },
  "criterio_base": {
    "codigo": "3.1",
    "nombre": "Base de cálculo",
    "porcentaje": 4,
    "valor_calculado": 1800,
    "fundamentacion": "..."
  },
  "incrementos": [
    {
      "criterio": "5.2",
      "tipo": "complejidad",          // complejidad|diligencia|responsabilidad|otro
      "nivel": "media",              // baja|media|alta
      "porcentaje": 15,
      "valor_calculado": 270,
      "aplicado": true,
      "motivo": "..."
    }
  ],
  "reducciones": [
    {
      "criterio": "7.1",
      "tipo": "alegaciones",          // alegaciones|desistimiento|conformidad|otro
      "porcentaje": 10,
      "valor_calculado": -207,
      "aplicado": true,
      "motivo": "..."
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
    // ... más pasos
  ],
  "criterios_aplicables": [
    {
      "codigo": "3.1",
      "nombre": "Base de cálculo",
      "descripcion": "...",
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

## 📖 CRITERIOS PRINCIPALES

### Criterios 1.X - Cuantía
- €0-€6.000 → X%
- €6.000-€30.000 → Y%
- €30.000-€60.000 → Z%

### Criterios 3.X - Base de cálculo
- Concepto procesal específico
- Porcentaje aplicable

### Criterios 5.X - Incrementos
- Complejidad: +5% a +25%
- Diligencia: +10% a +30%
- Responsabilidad: +15% a +50%

### Criterios 7.X - Reducciones
- Alegaciones: -10%
- Conformidad: -15%
- Desistimiento: -20%

---

## ✅ CHECKLIST FINAL

```
□ System Prompt copiado a OpenAI
□ Response Format JSON Schema configurado
□ File Search habilitado
□ Vector Store conectado: vs_68f8db9ce9808191ad733dd979c6af14
□ Probado: Pregunta simple funciona
□ Probado: Respuesta incluye JSON válido
□ Probado: Criterios específicos se citan
□ Probado: Cálculos se desglosan
□ Probado: Multi-turn conversations funcionan
□ Probado: Errores se manejan correctamente
```

---

## 🧪 CASOS DE USO PARA PROBAR

### Test 1: Básico
```
P: "¿Cuál es el honorario para €50.000?"
R: Debe incluir Criterio 3.1, 50000×4%=2000, JSON válido
```

### Test 2: Con incremento
```
P: "¿Si es complejidad media?"
R: Debe aplicar Criterio 5.2, mostrar +15%, nuevo total
```

### Test 3: Con reducción
```
P: "¿Si termina en alegaciones?"
R: Debe aplicar Criterio 7.1, mostrar -10%, nuevo total
```

### Test 4: Combinado
```
P: "€45.000, complejidad media, alegaciones"
R: Combinar 3 criterios correctamente, desglose completo
```

### Test 5: Error handling
```
P: "¿Criterio 99.99?"
R: "No encontrado en baremo", no inventar información
```

---

## 🔗 ENLACES RÁPIDOS

**Archivos para Copiar:**
- System Prompt: `docs/SYSTEM_PROMPT_PLAIN.txt`
- Response Format: `docs/RESPONSE_FORMAT_SCHEMA.json`

**Documentación:**
- Setup: `docs/SETUP_OPENAI_ASSISTANT_README.md`
- Prompt Completo: `docs/SYSTEM_PROMPT_BAREMOS.md`
- Response Format: `docs/RESPONSE_FORMAT_SCHEMA.md`
- Respuestas Esperadas: `docs/RESPUESTAS_ESPERADAS_RAG.md`
- Configuración: `docs/CONFIGURACION_ASSISTANT_OPENAI.md`

**Config Completa:**
- JSON: `docs/ASSISTANT_CONFIG_JSON.json`

---

## 📊 ESTADÍSTICAS

| Métrica | Valor |
|---------|-------|
| Criterios principales | 5 tipos (1.X, 3.X, 5.X, 7.X) |
| Incrementos posibles | +5% a +50% |
| Reducciones posibles | -10% a -20% |
| Campos JSON requeridos | 4 (resumen, cuantia, criterio_base, fuente) |
| Campos JSON totales | 11 (incluyendo opcionales) |
| Ejemplos en system prompt | 3 ejemplos completos |
| Casos de uso documentados | 7 casos diferentes |

---

## 🎓 CÓMO FUNCIONA

```
Usuario pregunta:
"¿Honorario para €45.000, complejo, alegaciones?"
        ↓
Sistema identifica:
- Cuantía: €45.000
- Tipo: determinada
- Criterios aplicables: 3.1, 5.2, 7.1
        ↓
Calcula paso a paso:
1. Base 3.1: €45.000 × 4% = €1.800
2. Incremento 5.2: €1.800 × 15% = €270 → €2.070
3. Reducción 7.1: €2.070 × 10% = -€207 → €1.863
        ↓
Responde en texto LEGIBLE:
"RESPUESTA: €1.863
CÁLCULO: [desglose]
FUENTE: Criterios 3.1, 5.2, 7.1"
        ↓
Proporciona JSON ESTRUCTURADO:
{
  "resumen": { "honorario_total": 1863, ... },
  "desglose_calculos": [ { paso 1 }, { paso 2 }, { paso 3 } ],
  ...
}
        ↓
Frontend parsea JSON y muestra:
✅ Número final resaltado
✅ Tabla con pasos
✅ Criterios aplicables
✅ Referencias a páginas del baremo
```

---

## 🚨 IMPORTANTE

**El JSON es OBLIGATORIO en TODAS las respuestas.**

Sin importar si la pregunta es simple o compleja, el assistant DEBE responder SIEMPRE con:
1. Texto legible para humanos
2. JSON válido y estructurado

Esto permite que el frontend:
- Parsee y valide la respuesta
- Muestre datos de forma estructurada
- Audite cálculos
- Almacene resultados en base de datos

---

## 💡 TIPS

1. **Testing**: Prueba primero en OpenAI Playground, luego en el frontend
2. **Validación**: Verifica que el JSON es válido usando jsonlint.com
3. **Debug**: Si las respuestas no son correctas, revisa el System Prompt
4. **Actualizar**: Si cambias el prompt, GUARDA en OpenAI Dashboard
5. **Casos especiales**: Documenta cualquier excepción por CCAA

---

**Última actualización: 22 de octubre de 2025**
**Estado: ✅ Completo y listo para usar**
