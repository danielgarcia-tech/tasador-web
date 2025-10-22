# INSTRUCCIONES PARA CONFIGURAR OPENAI ASSISTANT

Este directorio contiene los archivos JSON listos para copiar y pegar en OpenAI Dashboard.

## 📋 ARCHIVOS INCLUIDOS

1. **OPENAI_SYSTEM_PROMPT.json** - System Prompt del Assistant
2. **OPENAI_RESPONSE_FORMAT.json** - JSON Schema para respuestas

## 🔧 CÓMO CONFIGURAR EN OPENAI DASHBOARD

### Paso 1: Abrir el Assistant

1. Ve a https://platform.openai.com/assistants
2. Busca y abre: `asst_ZRKOTi9BkuvF5vTyNgczTOu2`

### Paso 2: Configurar System Prompt

1. En la sección **Instructions**, borra el contenido actual
2. Abre `OPENAI_SYSTEM_PROMPT.json`
3. Copia TODO el contenido del campo `"content"` (sin las comillas)
4. Pega en OpenAI Dashboard → Instructions
5. Guarda cambios

**Contenido que debes copiar:**
```
ERES UN ESPECIALISTA EN BAREMOS DE HONORARIOS DE ABOGADOS.

Tu misión es proporcionar respuestas PRECISAS, NUMÉRICAS y FUNDAMENTADAS...
[completo, ver archivo JSON]
```

### Paso 3: Configurar Response Format

1. Desplázate hacia abajo en la página del Assistant
2. Busca la sección **Response format**
3. Selecciona **JSON schema**
4. Abre `OPENAI_RESPONSE_FORMAT.json`
5. Copia TODO el contenido (es un JSON completo)
6. Pega en el campo de JSON schema de OpenAI
7. Guarda cambios

### Paso 4: Verificar Configuración

✅ Checklist final:

```
□ Nombre del Assistant: "Asesor Baremos"
□ Model: gpt-4-turbo (o versión más nueva)
□ Tools habilitadas:
  □ File Search: SÍ
  □ Code Interpreter: NO
  □ Web Browser: NO
□ Vector Store conectado: vs_68f8db9ce9808191ad733dd979c6af14
□ System Prompt completamente configurado
□ Response Format (JSON schema) completamente configurado
```

## 📝 ESTRUCTURA DEL RESPONSE FORMAT

El JSON Schema que configuraste define respuestas con esta estructura:

```json
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
    "valor_calculado": 1800
  },
  "incrementos": [...],
  "reducciones": [...],
  "desglose_calculos": [...],
  "criterios_aplicables": [...],
  "fuente": {
    "baremo": "ICA Madrid",
    "ccaa": "MADRID",
    "ano": 2020,
    "paginas": "8-12"
  }
}
```

## 🧪 PRUEBA DE CONFIGURACIÓN

Después de configurar, haz una prueba:

1. En OpenAI Dashboard, abre "Test" o "Preview"
2. Escribe: "¿Cuál es el honorario para un caso de €50.000 en Madrid?"
3. El Assistant debe responder en formato JSON
4. Verifica que:
   - ✅ Responde con JSON válido
   - ✅ Incluye `resumen.honorario_total`
   - ✅ Cita Criterio 3.1
   - ✅ Desglose numérico completo

## ⚙️ SI ALGO FALLA

### Problema: "Response format inválido"
**Solución**: 
- Asegúrate de que el JSON es válido (sin espacios faltantes)
- Copia TODO el archivo, no parcialmente
- Verifica que no haya comillas mal cerradas

### Problema: "Assistant no responde en JSON"
**Solución**:
- Guarda cambios después de añadir el Response Format
- Espera 30 segundos
- Prueba con una pregunta nueva

### Problema: "Vector Store no conectado"
**Solución**:
- Ve a Tools > File Search
- Conecta el Vector Store: `vs_68f8db9ce9808191ad733dd979c6af14`
- Guarda cambios

## 📚 CONTEXTO ENVIADO DESDE FRONTEND

El BaremoChatbot.tsx envía este contexto adicional con cada pregunta:

```
CONTEXTO IMPORTANTE:
- Baremo aplicable: [CCAA] (Provincia: [PROVINCIA])
- Debes citar criterios específicos (ej: Criterio 3.1, 5.2, 7.1)
- Proporciona cálculos NUMÉRICOS desglosados
- Incluye incrementos/reducciones aplicables
- NUNCA respondas genéricamente, sé específico con números y criterios
```

Esto se suma al System Prompt, mejorando las respuestas.

## 🔄 ACTUALIZAR CONFIGURACIÓN

Si necesitas cambiar algo:

1. **System Prompt**: Edita `OPENAI_SYSTEM_PROMPT.json` → copia a OpenAI
2. **Response Format**: Edita `OPENAI_RESPONSE_FORMAT.json` → copia a OpenAI
3. Guarda cambios en OpenAI
4. Espera 30 segundos
5. Prueba nuevamente

## 📊 RESULTADOS ESPERADOS

Con esta configuración, el Assistant responderá como:

**Pregunta:**
```
¿Cuál es el honorario para un caso de €45.000 en Madrid con complejidad media que termina en alegaciones?
```

**Respuesta (JSON):**
```json
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
    "nombre": "Base de cálculo - Cuantía ordinaria",
    "porcentaje": 4,
    "valor_calculado": 1800,
    "fundamentacion": "Cuantía de €45.000 se ubica en el rango €30.000-€60.000, al cual le corresponde el 4%"
  },
  "incrementos": [
    {
      "criterio": "5.2",
      "tipo": "complejidad",
      "nivel": "media",
      "porcentaje": 15,
      "valor_calculado": 270,
      "aplicado": true,
      "motivo": "El caso presenta múltiples cuestiones jurídicas y jurisprudencia compleja"
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
      "descripcion": "Aumento por dificultad del caso (5-25%)",
      "aplicado": true
    },
    {
      "codigo": "7.1",
      "nombre": "Reducción por alegaciones",
      "descripcion": "Disminución cuando termina en alegaciones (-10%)",
      "aplicado": true
    }
  ],
  "fuente": {
    "baremo": "ICA Madrid",
    "ccaa": "MADRID",
    "ano": 2020,
    "paginas": "8-12"
  },
  "observaciones": [
    "Se aplicó la reducción por alegaciones como es más favorable que desistimiento",
    "El cálculo es exacto según los criterios indicados"
  ]
}
```

## 🎯 PRÓXIMOS PASOS

1. ✅ Copiar y pegar System Prompt en OpenAI
2. ✅ Copiar y pegar Response Format en OpenAI
3. ✅ Probar con 3-5 preguntas diferentes
4. ✅ Verificar que las respuestas son JSON válido
5. ✅ Usar en producción desde BaremoChatbot.tsx

---

**Última actualización:** 22 de octubre de 2025
**Compatible con:** OpenAI API, Assistants API v2, JSON Schema mode
