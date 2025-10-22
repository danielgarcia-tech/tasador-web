# EJEMPLOS DE RESPUESTAS ESPERADAS DEL CHATBOT RAG

Este documento muestra cómo debe responder el chatbot RAG de baremos. Sirve como referencia para validar que el sistema funciona correctamente.

## CASO 1: Pregunta Básica de Honorarios

### 🙋 PREGUNTA
"¿Cuál es el honorario para un juicio de €50.000 en Madrid?"

### ✅ RESPUESTA ESPERADA
```
Según el Criterio 3.1 del baremo ICA Madrid:

CÁLCULO:
- Cuantía: €50.000
- Rango aplicable: €30.000-€60.000 → Porcentaje: 4%
- Honorario base: €50.000 × 4% = €2.000

FUNDAMENTACIÓN:
Criterio 3.1 del baremo establece un 4% para cuantías entre €30.000 y €60.000.

✅ RESULTADO: €2.000

Fuente: [Criterio 3.1, pág. X del baremo ICA Madrid]
```

---

## CASO 2: Pregunta con Incremento por Complejidad

### 🙋 PREGUNTA
"¿Cuál es el honorario si el caso es complicado?"

### ✅ RESPUESTA ESPERADA
```
Según el Criterio 5.2 (Incrementos por Complejidad):

INCREMENTOS APLICABLES:
- Complejidad ALTA: +25%
- Complejidad MEDIA: +15%
- Complejidad BAJA: +5%

EJEMPLO (asumiendo base de €2.000):
- Complejidad MEDIA: €2.000 × 1,15 = €2.300 (+€300)
- Complejidad ALTA: €2.000 × 1,25 = €2.500 (+€500)

CONDICIONES:
La complejidad se valora según:
- Número de cuestiones jurídicas
- Jurisprudencia aplicable
- Diligencias necesarias

✅ INCREMENTO: +5% a +25% según complejidad

Fuente: [Criterio 5.2, pág. X del baremo ICA]
```

---

## CASO 3: Pregunta con Reducciones por Alegaciones

### 🙋 PREGUNTA
"¿Qué reducción aplica si el caso termina en alegaciones?"

### ✅ RESPUESTA ESPERADA
```
Según el Criterio 7.1 (Reducciones por Alegaciones):

REDUCCIÓN: 10%

CÁLCULO EJEMPLO:
- Honorario base: €2.000
- Reducción por alegaciones (10%): €2.000 × 0,10 = -€200
- ✅ TOTAL: €2.000 - €200 = €1.800

CONDICIONES DE APLICACIÓN:
- Aplica cuando el caso termina en fase de alegaciones
- No se acumula con otras reducciones (se aplica la mayor)
- Se calcula sobre el honorario ANTES de incrementos

EJEMPLO COMPLETO:
- Base: €2.000
- Incremento por complejidad (+15%): €300
- Subtotal: €2.300
- Reducción por alegaciones (-10% sobre original): €200
- ✅ TOTAL: €2.100

Fuente: [Criterio 7.1, pág. X del baremo ICA]
```

---

## CASO 4: Pregunta Combinada (Base + Incremento + Reducción)

### 🙋 PREGUNTA
"Tengo un caso de €45.000 en Madrid, es mediamente complejo y termina en alegaciones. ¿Cuánto me corresponde?"

### ✅ RESPUESTA ESPERADA
```
RESPUESTA FINAL: €1.989

DESGLOSE COMPLETO:

1️⃣ HONORARIO BASE (Criterio 3.1)
   - Cuantía: €45.000
   - Rango: €30.000-€60.000 → 4%
   - Base: €45.000 × 4% = €1.800

2️⃣ INCREMENTO POR COMPLEJIDAD MEDIA (Criterio 5.2)
   - Complejidad media: +15%
   - Incremento: €1.800 × 0,15 = €270
   - Subtotal: €1.800 + €270 = €2.070

3️⃣ REDUCCIÓN POR ALEGACIONES (Criterio 7.1)
   - Reducción: 10%
   - Monto reducido: €2.070 × 0,10 = €207
   - TOTAL FINAL: €2.070 - €207 = €1.863

NOTA SOBRE REDUCCIONES:
Si el caso terminase en desistimiento (Criterio 7.2): -15%
- Sería: €2.070 × 0,15 = €310 (mayor reducción)
- TOTAL: €1.760
- Se aplica la redución MAYOR entre ambas

✅ RESULTADO FINAL: €1.863 (con alegaciones)

Fuente: [Criterios 3.1, 5.2, 7.1 del baremo ICA Madrid]
```

---

## CASO 5: Pregunta sobre Cuantía Indeterminada

### 🙋 PREGUNTA
"¿Cómo se calcula para un caso de cuantía indeterminada?"

### ✅ RESPUESTA ESPERADA
```
Según el Criterio 2.X (Cuantía Indeterminada):

Para cuantías indeterminadas NO se aplica porcentaje.
Se usa una TARIFA FIJA o base especial.

TABLA DE CUANTÍAS INDETERMINADAS:
- Procedimiento administrativo: €XXX fijo
- Nulidad contractual: €XXX fijo
- Resolución de conflicto laboral: €XXX fijo
- Otra característica especial: [especificar según criterio]

CÁLCULO:
- Base fija: €XXX
- Incrementos/Reducciones: Aplican igual que en casos normales
- Ejemplo: €500 (base) + 15% (complejidad) = €575

⚠️ IMPORTANTE:
La cuantía indeterminada se valora según:
- Trascendencia del asunto
- Esfuerzo dedicado
- Responsabilidad asumida

✅ BASE: €XXX (sin porcentaje)

Fuente: [Criterio 2.X, pág. X del baremo ICA]
```

---

## CASO 6: Pregunta Sobre Varios Criterios

### 🙋 PREGUNTA
"¿Qué es el Criterio 5.2 y cuándo aplica?"

### ✅ RESPUESTA ESPERADA
```
Criterio 5.2 - INCREMENTOS POR COMPLEJIDAD

DEFINICIÓN:
Permite aumentar el honorario base cuando el caso presenta características 
que lo hacen especialmente complicado.

NIVELES DE COMPLEJIDAD:

┌─────────────┬──────────┬─────────────────────────────────────────┐
│ Nivel       │ Aumento  │ Criterios de aplicación                │
├─────────────┼──────────┼─────────────────────────────────────────┤
│ Baja        │ +5%      │ Caso muy sencillo, una cuestión jurídica│
│ Media       │ +15%     │ Varios puntos, jurisprudencia compleja  │
│ Alta        │ +25%     │ Muy complejo, múltiples disciplinas     │
└─────────────┴──────────┴─────────────────────────────────────────┘

EJEMPLOS DE APLICACIÓN:

✅ Complejidad MEDIA (+15%):
   - Caso con 3-4 cuestiones jurídicas diferentes
   - Requiere análisis de jurisprudencia contradictoria
   - Necesita múltiples diligencias

✅ Complejidad ALTA (+25%):
   - Caso con aspectos penal-civil (pluridisciplinar)
   - Require peritos especializados
   - Jurisprudencia muy discutida

CÁLCULO:
Base €2.000 con complejidad media: €2.000 × 1,15 = €2.300

⚠️ NO ACUMULA con otro Criterio 5.X
(Se aplica solo el mayor)

Fuente: [Criterio 5.2, págs. X-Y del baremo ICA]
```

---

## CASO 7: Pregunta sobre Reducciones Múltiples

### 🙋 PREGUNTA
"¿Se acumulan las reducciones por alegaciones y desistimiento?"

### ✅ RESPUESTA ESPERADA
```
NO se acumulan las reducciones. Según el criterio de interpretación:

REGLA: Se aplica la REDUCCIÓN MÁS FAVORABLE (la mayor)

REDUCCIONES POSIBLES:
- Criterio 7.1 (Alegaciones): -10%
- Criterio 7.2 (Desistimiento): -15%
- Criterio 7.3 (Conformidad): -20%

EJEMPLO:
Caso con honorario base de €2.000 que termina en:

✅ ALEGACIONES: €2.000 × 0,10 = €1.800
❌ DESISTIMIENTO: €2.000 × 0,15 = €1.700
❌ CONFORMIDAD: €2.000 × 0,20 = €1.600

Si aplican múltiples, se elige la MAYOR reducción:
✅ RESULTADO: €1.600 (conformidad)

JUSTIFICACIÓN:
Se interpreta que cualquier reducción representa una menor dedicación,
por lo que se aplica solo la más significativa.

Fuente: [Interpretación de Criterios 7.1, 7.2, 7.3]
```

---

## PATRONES DE RESPUESTA CORRECTA

### ✅ CARACTERÍSTICAS DE UNA BUENA RESPUESTA

1. **Cita explícita del criterio**: "Según Criterio 3.1..."
2. **Fórmula matemática**: "€50.000 × 4% = €2.000"
3. **Resultado en negrita**: **€2.000**
4. **Referencias**: "[Criterio X.X, pág. Y]"
5. **Condiciones**: "Aplica cuando..."
6. **Ejemplos numéricos**: Con valores reales

### ❌ CARACTERÍSTICAS DE RESPUESTA INCORRECTA

1. ❌ Sin referencias a criterios
2. ❌ Respuestas genéricas ("depende del caso")
3. ❌ Sin cálculos numéricos
4. ❌ Sin indicar incrementos/reducciones
5. ❌ Confusión de criterios
6. ❌ Reducciones acumuladas sin aclaración

---

## FLUJO DE VALIDACIÓN RECOMENDADO

Cuando pruebes el chatbot, verifica esta secuencia:

```
✅ Paso 1: Abre el chatbot
   └─ Debe mostrar mensaje de bienvenida con ejemplos

✅ Paso 2: Pregunta simple
   └─ P: "¿Cuál es el honorario para €50.000?"
   └─ R: Debe responder con Criterio 3.1 + cálculo

✅ Paso 3: Pregunta con incremento
   └─ P: "¿Y si es complejidad media?"
   └─ R: Debe aplicar Criterio 5.2, +15%

✅ Paso 4: Pregunta con reducción
   └─ P: "¿Qué pasa si termina en alegaciones?"
   └─ R: Debe aplicar Criterio 7.1, -10%

✅ Paso 5: Pregunta combinada
   └─ P: "€45.000, complejidad media, termina en alegaciones"
   └─ R: Debe combinar correctamente los tres criterios

✅ Paso 6: Verificar formato
   └─ Números claros y desglosados
   └─ Referencias exactas a criterios
   └─ Resultado final destacado
```

---

## NOTAS SOBRE PRECISIÓN

- **Criterios exactos**: Debe usar el baremo específico de la CCAA seleccionada
- **Percentajes correctos**: Verificar contra documento original
- **Cálculos precisos**: No deben haber errores aritméticos
- **No inventar información**: Si no lo encuentra, indicar claramente
- **Contexto CCAA**: Las respuestas varían según comunidad autónoma

---

## REFERENCIA RÁPIDA DE CRITERIOS

| Criterio | Tema | Rango/Valor |
|----------|------|------------|
| 1.X | Cuantía ordinaria | Porcentaje según rango |
| 2.X | Cuantía indeterminada | Tarifa fija |
| 3.X | Base de cálculo | Criterios especiales |
| 5.X | Incrementos | +5% a +25% |
| 7.X | Reducciones | -10% a -20% |

---

## INSTRUCCIONES PARA EL DESARROLLO

**Cuando hagas cambios al system prompt:**

1. Actualiza SYSTEM_PROMPT_BAREMOS.md
2. Verifica que BaremoChatbot.tsx incluya el contexto en buildContextMessage()
3. Prueba con los 7 casos de uso anteriores
4. Valida que las respuestas tengan el formato esperado
5. Documenta cualquier particularidad por CCAA

**Cuando encuentres problemas:**

1. Revisa el console.log con color azul (INFO)
2. Verifica que el contexto se envía correctamente
3. Comprueba el Assistant ID en OpenAI
4. Confirma que el Vector Store tiene documentos
5. Valida las credenciales en .env.local
