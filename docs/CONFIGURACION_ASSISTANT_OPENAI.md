# CONFIGURACIÓN DEL ASSISTANT EN OPENAI

Este documento explica cómo configurar el Assistant en OpenAI Dashboard para que funcione correctamente con el system prompt mejorado.

## 🔧 PASOS DE CONFIGURACIÓN

### Paso 1: Crear/Editar el Assistant

**URL**: https://platform.openai.com/assistants

**Detalles del Assistant:**

```
Nombre: Asesor Baremos (o tu nombre preferido)
ID: asst_ZRKOTi9BkuvF5vTyNgczTOu2
```

### Paso 2: Configurar System Prompt

En la sección **Instructions** del Assistant, coloca el siguiente system prompt:

```
ERES UN ESPECIALISTA EN BAREMOS DE HONORARIOS DE ABOGADOS

Tu misión es proporcionar respuestas PRECISAS, NUMÉRICAS y FUNDAMENTADAS sobre criterios de honorarios.

## REGLAS FUNDAMENTALES

1. **SIEMPRE cita el criterio exacto**
   - Ejemplo correcto: "Según Criterio 3.1..."
   - Ejemplo incorrecto: "probablemente depende..."

2. **PROPORCIONA CÁLCULOS DESGLOSADOS**
   - Base: €X
   - Incremento/Reducción: €Y
   - Total: €Z
   - Nunca solo un número sin explicación

3. **INCLUYE INCREMENTOS Y REDUCCIONES**
   - Criterio 5.X: Incrementos por complejidad (+5% a +25%)
   - Criterio 7.X: Reducciones por alegaciones (-10%), desistimiento (-15%), conformidad (-20%)
   - Las reducciones NO se acumulan, aplica la MAYOR

4. **USA ESTE FORMATO EXACTO**

   RESPUESTA DIRECTA:
   El honorario es de €XXXX según Criterio X.X
   
   CÁLCULO DETALLADO:
   1. Cuantía: €X
   2. Criterio base (X.X): €Y × Z% = €RESULTADO
   3. Incremento/Reducción: [si aplica]
   4. TOTAL: €FINAL
   
   FUNDAMENTACIÓN:
   [Explicación del criterio]
   
   CONDICIONES:
   [Cuándo aplica]
   
   FUENTE: [Criterio, página]

5. **MANTÉN PRECISIÓN NUMÉRICA**
   - Verifica cálculos matemáticos
   - No redondees arbitrariamente
   - Muestra decimales si es necesario

6. **CUANDO NO TENGAS INFORMACIÓN**
   - Responde: "No encontrado en el baremo disponible"
   - Sugiere qué información necesitas
   - No inventes criterios

## EJEMPLOS DE RESPUESTAS CORRECTAS

### Ejemplo 1: Pregunta Básica
Q: "¿Cuál es el honorario para un caso de €50.000?"
A: 
```
RESPUESTA: €2.000

CÁLCULO:
- Cuantía: €50.000
- Criterio 3.1 (Rango €30K-€60K): 4%
- Honorario: €50.000 × 4% = €2.000

FUENTE: Criterio 3.1
```

### Ejemplo 2: Con Incremento
Q: "¿Si es complejidad media?"
A:
```
RESPUESTA: €2.300

CÁLCULO:
- Base anterior: €2.000
- Criterio 5.2 (Complejidad media): +15%
- Incremento: €2.000 × 15% = €300
- TOTAL: €2.000 + €300 = €2.300

CONDICIONES:
- Complejidad media: múltiples cuestiones jurídicas
- Jurisprudencia compleja

FUENTE: Criterio 5.2
```

### Ejemplo 3: Con Reducción
Q: "¿Reducción por alegaciones?"
A:
```
RESPUESTA: €2.070

CÁLCULO:
- Base anterior: €2.300
- Criterio 7.1 (Alegaciones): -10%
- Reducción: €2.300 × 10% = €230
- TOTAL: €2.300 - €230 = €2.070

NOTA: La reducción se aplica sobre el total incluyendo incrementos.

FUENTE: Criterio 7.1
```

## 📋 TOOLS Y CARACTERÍSTICAS

### ✅ Habilita
- **File Search**: SÍ (para consultar PDFs del Vector Store)
- **Code Interpreter**: NO (no necesario)
- **Web Browser**: NO (no necesario)

### 📋 RESPONSE FORMAT (JSON Schema)

**IMPORTANTE**: Configura el Response Format en el Assistant con el siguiente JSON Schema:

```json
{
  "name": "calculo_honorarios",
  "description": "Respuesta estructurada para cálculos de honorarios",
  "schema": {
    "type": "object",
    "properties": {
      "resumen": {
        "type": "object",
        "properties": {
          "honorario_total": { "type": "number", "minimum": 0 },
          "moneda": { "type": "string", "enum": ["EUR"] },
          "estado": { "type": "string", "enum": ["calculado", "estimacion", "no_encontrado", "error"] }
        },
        "required": ["honorario_total", "moneda", "estado"]
      },
      "cuantia_proceso": {
        "type": "object",
        "properties": {
          "valor": { "type": "number", "minimum": 0 },
          "tipo": { "type": "string", "enum": ["determinada", "indeterminada"] },
          "rango_aplicable": { "type": "string" }
        },
        "required": ["valor", "tipo"]
      },
      "criterio_base": {
        "type": "object",
        "properties": {
          "codigo": { "type": "string" },
          "nombre": { "type": "string" },
          "porcentaje": { "type": "number", "minimum": 0, "maximum": 100 },
          "valor_calculado": { "type": "number", "minimum": 0 },
          "fundamentacion": { "type": "string" }
        },
        "required": ["codigo", "nombre", "porcentaje", "valor_calculado"]
      },
      "incrementos": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "criterio": { "type": "string" },
            "tipo": { "type": "string" },
            "nivel": { "type": "string" },
            "porcentaje": { "type": "number" },
            "valor_calculado": { "type": "number" },
            "aplicado": { "type": "boolean" },
            "motivo": { "type": "string" }
          },
          "required": ["criterio", "tipo", "porcentaje", "valor_calculado", "aplicado"]
        }
      },
      "reducciones": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "criterio": { "type": "string" },
            "tipo": { "type": "string" },
            "porcentaje": { "type": "number" },
            "valor_calculado": { "type": "number" },
            "aplicado": { "type": "boolean" },
            "motivo": { "type": "string" }
          },
          "required": ["criterio", "tipo", "porcentaje", "valor_calculado", "aplicado"]
        }
      },
      "desglose_calculos": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "paso": { "type": "integer", "minimum": 1 },
            "descripcion": { "type": "string" },
            "operacion": { "type": "string" },
            "resultado": { "type": "number" },
            "subtotal": { "type": "number" }
          },
          "required": ["paso", "descripcion", "operacion", "resultado"]
        }
      },
      "criterios_aplicables": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "codigo": { "type": "string" },
            "nombre": { "type": "string" },
            "descripcion": { "type": "string" },
            "aplicado": { "type": "boolean" },
            "razon_no_aplicado": { "type": "string" }
          },
          "required": ["codigo", "nombre", "aplicado"]
        }
      },
      "fuente": {
        "type": "object",
        "properties": {
          "baremo": { "type": "string" },
          "ccaa": { "type": "string" },
          "ano": { "type": "integer", "minimum": 2000 },
          "paginas": { "type": "string" }
        },
        "required": ["baremo", "ccaa"]
      },
      "observaciones": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "required": ["resumen", "cuantia_proceso", "criterio_base", "fuente"],
    "additionalProperties": false
  },
  "strict": true
}
```

**Pasos en OpenAI Dashboard:**
1. Ve a https://platform.openai.com/assistants
2. Abre el Assistant: `asst_ZRKOTi9BkuvF5vTyNgczTOu2`
3. En la sección inferior: **Response format** → Selecciona **JSON schema**
4. Copia y pega el JSON Schema anterior
5. Guarda cambios

**Resultado esperado:**
- El assistant SIEMPRE responderá en formato JSON válido
- El frontend puede parsear la respuesta y mostrar datos estructurados
- Mayor consistencia y confiabilidad en las respuestas

### Vector Store Configuración
```
ID: vs_68f8db9ce9808191ad733dd979c6af14
Estado: Conectado
Documentos: PDFs de baremos por CCAA
```

## 🎯 COMPORTAMIENTO ESPERADO

### Conversaciones Multi-turno
1. El usuario pregunta: "¿Honorario para €45.000?"
2. Assistant: Responde con Criterio 3.1
3. Usuario: "¿Y si hay complejidad?"
4. Assistant: Aplica Criterio 5.2 al resultado anterior
5. Usuario: "¿Si termina en alegaciones?"
6. Assistant: Aplica Criterio 7.1 al resultado anterior

El assistant DEBE recordar el contexto de mensajes anteriores en el mismo thread.

### Gestión de Errores
- Si pregunta sobre CCAA diferente a la contextualizada: Indicar "Necesito verificar baremo de [CCAA]"
- Si falta datos: "Necesito saber: [dato específico]"
- Si no está en documento: "No encontrado en baremo disponible"

## 🧪 PRUEBAS DE VALIDACIÓN

Antes de usar en producción, prueba estos casos:

### Test 1: Cálculo Básico
- **Input**: "¿Cuál es el honorario para €30.000 en [CCAA]?"
- **Validar**: Muestra Criterio 3.1 + fórmula + número final

### Test 2: Incremento
- **Input**: "¿Cuánto si es complejo?"
- **Validar**: Aplica Criterio 5.2, suma al anterior

### Test 3: Reducción
- **Input**: "¿Cuánto si termina en alegaciones?"
- **Validar**: Aplica Criterio 7.1, resta del anterior

### Test 4: Combinado
- **Input**: "€40.000, complejidad alta, desistimiento"
- **Validar**: Combina correctamente 3 criterios

### Test 5: Error Handling
- **Input**: "¿Criterio 99.99?"
- **Validar**: Indica "No encontrado"

## 📝 AJUSTES POR CCAA (Futuro)

Cuando agregues baremos de otras CCAA, documenta particularidades:

```
MADRID:
- Criterio 3.1: 4% para €30K-€60K
- Criterio 5.2: Incremento máximo 25%

CATALUÑA:
- Criterio 3.1: 3.5% para €30K-€60K
- Criterio 5.2: Incremento máximo 20%

VALENCIA:
- [Especificar...]
```

## 🔄 ACTUALIZACIÓN DEL SYSTEM PROMPT

Si necesitas modificar el system prompt:

1. **NO edites directamente en OpenAI Dashboard** (puede ser confuso)
2. **Edita** `docs/SYSTEM_PROMPT_BAREMOS.md`
3. **Copia y pega** el contenido mejorado en OpenAI
4. **Guarda** cambios en el Assistant
5. **Testa** con casos de uso
6. **Documenta** cambios en este archivo

## ✅ CHECKLIST DE CONFIGURACIÓN

```
□ Assistant creado con ID: asst_ZRKOTi9BkuvF5vTyNgczTOu2
□ System prompt actualizado (ver SYSTEM_PROMPT_BAREMOS.md)
□ Vector Store conectado: vs_68f8db9ce9808191ad733dd979c6af14
□ File Search habilitado
□ Probado con 5 casos de uso
□ Respuestas incluyen criterios específicos
□ Cálculos desglosados numéricamente
□ No hay alucinaciones sobre criterios
□ Maneja multi-turn conversations correctamente
□ Gestiona errores sin inventar información
```

## 🚀 IMPLEMENTACIÓN EN CÓDIGO

El BaremoChatbot.tsx envía el contexto de esta forma:

```typescript
const contextMsg = `CONTEXTO IMPORTANTE:
- Baremo aplicable: [CCAA] (Provincia: [PROVINCIA])
- Debes citar criterios específicos (ej: Criterio 3.1, 5.2, 7.1)
- Proporciona cálculos NUMÉRICOS desglosados
- Incluye incrementos/reducciones aplicables
- Ejemplo de formato: "Según Criterio 3.1: Base 4% de €50.000 = €2.000..."
- NUNCA respondas genéricamente, sé específico con números y criterios`

const userMsg = `${contextMsg}\n\n[PREGUNTA DEL USUARIO]\n${input}`
```

Esto se envía a OpenAI junto con el system prompt, el vector store y el historial del thread.

## 📞 SOPORTE Y DEBUGGING

**Si las respuestas no son precisas:**

1. Verifica console.log en BaremoChatbot.tsx:
   ```
   [BAREMO-RAG] 📤 Usuario envía mensaje: [pregunta]
   ```

2. Comprueba que el contexto incluye CCAA y provincia

3. Verifica en OpenAI Playground:
   - ¿El Vector Store tiene documentos?
   - ¿El Assistant tiene File Search habilitado?

4. Prueba con una pregunta simple en Playground:
   ```
   Q: "¿Cuál es el Criterio 3.1?"
   R: [Debe extraer del documento]
   ```

5. Si falla, revisa:
   - API Key válida
   - Assistant ID correcto
   - Vector Store conectado
   - Documentos indexados en Vector Store
