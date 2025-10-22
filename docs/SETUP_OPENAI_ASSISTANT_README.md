# 📋 CÓMO CONFIGURAR EL ASSISTANT EN OPENAI

## Archivos Disponibles

He creado tres archivos para facilitar la configuración:

1. **`ASSISTANT_CONFIG_JSON.json`** - Configuración completa en un archivo JSON
2. **`SYSTEM_PROMPT_PLAIN.txt`** - Solo el system prompt (copiar directamente)
3. **`RESPONSE_FORMAT_SCHEMA.json`** - Solo el JSON schema (copiar directamente)

---

## 🚀 MÉTODO 1: Opción Rápida (Recomendado)

### Paso 1: Abre el archivo `SYSTEM_PROMPT_PLAIN.txt`
- Selecciona TODO el contenido (Ctrl+A)
- Cópialo (Ctrl+C)

### Paso 2: Ve a OpenAI Dashboard
- URL: https://platform.openai.com/assistants
- Selecciona el Assistant: `asst_ZRKOTi9BkuvF5vTyNgczTOu2`

### Paso 3: Configura el System Prompt
- En la sección **Instructions** (arriba)
- Borra el contenido existente
- Pega el contenido (Ctrl+V)

### Paso 4: Abre el archivo `RESPONSE_FORMAT_SCHEMA.json`
- Selecciona TODO el contenido (Ctrl+A)
- Cópialo (Ctrl+C)

### Paso 5: Configura el Response Format
- En OpenAI Dashboard, busca **Response format**
- Selecciona **JSON schema**
- Si hay un campo de texto/editor, pega aquí
- Si hay un editor visual, copia el contenido del json_schema

### Paso 6: Verifica las herramientas
- **File Search**: Habilita ✓
- **Code Interpreter**: Deshabilita ✗
- **Web Browser**: Deshabilita ✗

### Paso 7: Verifica el Vector Store
- Debe estar conectado: `vs_68f8db9ce9808191ad733dd979c6af14`
- Estado: **Connected**

### Paso 8: Guarda
- Click en **Save** o **Update**

---

## 🔧 MÉTODO 2: Opción Manual (Si el Método 1 no funciona)

### Paso 1: System Prompt
1. Ve a https://platform.openai.com/assistants
2. Abre `asst_ZRKOTi9BkuvF5vTyNgczTOu2`
3. En **Instructions**, copia el contenido de `SYSTEM_PROMPT_PLAIN.txt`
4. Pega y guarda

### Paso 2: Response Format (JSON Schema)
1. En el mismo Assistant, busca **Response format**
2. Selecciona **JSON schema**
3. Abre `RESPONSE_FORMAT_SCHEMA.json`
4. Copia SOLO el contenido dentro de `json_schema` (desde `"name"` hasta el final)
5. Pégalo en OpenAI

### Paso 3: Alternativa si el editor es visual
Si OpenAI tiene un editor visual y no texto:
1. Copia el contenido de `RESPONSE_FORMAT_SCHEMA.json`
2. Pégalo en el editor
3. Valida que sea JSON válido (sin errores de rojo)

---

## ✅ CHECKLIST DE CONFIGURACIÓN

```
□ System Prompt actualizado (SYSTEM_PROMPT_PLAIN.txt)
□ Response Format JSON Schema configurado (RESPONSE_FORMAT_SCHEMA.json)
□ File Search habilitado
□ Code Interpreter deshabilitado
□ Web Browser deshabilitado
□ Vector Store conectado: vs_68f8db9ce9808191ad733dd979c6af14
□ Cambios guardados en OpenAI
□ Probado: Envía un mensaje al assistant
```

---

## 🧪 PRUEBA RÁPIDA

Después de configurar, prueba en OpenAI Playground:

### Test 1: Cálculo Simple
```
Pregunta: "¿Cuál es el honorario para €50.000 en Madrid?"
Respuesta esperada: 
- Debe incluir Criterio 3.1
- Debe mostrar: 50000 × 4% = 2000
- Debe incluir JSON estructurado
```

### Test 2: Con Incremento
```
Pregunta: "¿Si es complejidad media?"
Respuesta esperada:
- Debe aplicar Criterio 5.2
- Debe mostrar: 2000 × 15% = 300
- Subtotal: 2300
```

### Test 3: Respuesta en JSON
```
Verifica que TODAS las respuestas incluyan JSON válido.
Si ves errores de JSON, significa que no se aplicó bien el Response Format.
```

---

## 🐛 PROBLEMAS COMUNES

### ❌ Problema: "El Response Format no se aplica"
**Solución:**
1. Verifica que el JSON esté válido (sin errores de sintaxis)
2. Intenta copiar directamente desde `RESPONSE_FORMAT_SCHEMA.json`
3. En OpenAI, selecciona **JSON schema** (no "JSON mode")
4. Verifica que `"strict": true` esté en el schema

### ❌ Problema: "Las respuestas no incluyen JSON"
**Solución:**
1. Verifica que `strict: true` esté en el Response Format
2. Si `strict: true` causa problemas, prueba con `strict: false`
3. Asegúrate de que el schema está en la sección correcta

### ❌ Problema: "El system prompt no se aplica"
**Solución:**
1. Borra el contenido anterior completamente
2. Pega el nuevo contenido
3. Guarda explícitamente (click Save)
4. Recarga la página y verifica

### ❌ Problema: "Vector Store no conectado"
**Solución:**
1. Ve a https://platform.openai.com/assistants
2. En el Assistant, busca **Tools**
3. Activa **File search**
4. En **Files**, verifica que el Vector Store esté presente
5. Si no, añade: `vs_68f8db9ce9808191ad733dd979c6af14`

---

## 📝 CONTENIDO DE CADA ARCHIVO

### ASSISTANT_CONFIG_JSON.json
```
Contiene:
- metadata (nombre, ID, descripción)
- system_prompt (texto completo)
- response_format (schema JSON completo)
- tools (configuración)
- vector_store (ID y status)
- instructions_for_openai_dashboard (pasos)
```

### SYSTEM_PROMPT_PLAIN.txt
```
Contiene:
- System prompt sin JSON
- Instrucciones claras
- Ejemplos de respuestas
- Reglas fundamentales
```

### RESPONSE_FORMAT_SCHEMA.json
```
Contiene:
- Schema JSON válido
- Estructura de objeto
- Propiedades requeridas
- Tipos de datos
- Restricciones (strict: true)
```

---

## 🔄 ACTUALIZAR EL ASSISTANT

Si necesitas cambiar el system prompt en el futuro:

1. Edita `SYSTEM_PROMPT_BAREMOS.md` (archivo principal)
2. Actualiza `SYSTEM_PROMPT_PLAIN.txt` con los cambios
3. Copia el contenido a OpenAI Dashboard
4. Guarda cambios
5. Prueba con casos de uso

---

## 📞 SOPORTE

**Si algo no funciona:**

1. Verifica que estés en la URL correcta: https://platform.openai.com/assistants
2. Verifica que el ID del Assistant sea: `asst_ZRKOTi9BkuvF5vTyNgczTOu2`
3. Verifica que el API Key en .env.local sea válido
4. Prueba en OpenAI Playground primero (no en el frontend)
5. Revisa los logs del assistant en OpenAI

---

## ✨ RESULTADO FINAL

Cuando todo esté configurado correctamente:

✅ El assistant responde con criterios específicos
✅ Incluye cálculos desglosados numéricamente
✅ Proporciona JSON válido en cada respuesta
✅ El frontend puede parsear y mostrar datos estructurados
✅ Las respuestas son consistentes y confiables
✅ Las conversaciones multi-turno funcionan correctamente
