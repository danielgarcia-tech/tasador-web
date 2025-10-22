# RESPONSE FORMAT SCHEMA - BAREMOS RAG

## Schema JSON Mejorado para Respuestas del Assistant

### Versión 1: Cálculo de Cuantía y Honorarios

```json
{
  "name": "calculo_honorarios",
  "description": "Respuesta estructurada para cálculos de honorarios según baremos",
  "schema": {
    "type": "object",
    "properties": {
      "resumen": {
        "type": "object",
        "description": "Resumen ejecutivo de la respuesta",
        "properties": {
          "honorario_total": {
            "type": "number",
            "description": "Honorario final calculado en EUR",
            "minimum": 0
          },
          "moneda": {
            "type": "string",
            "enum": ["EUR"],
            "description": "Moneda del cálculo"
          },
          "estado": {
            "type": "string",
            "enum": ["calculado", "estimacion", "no_encontrado", "error"],
            "description": "Estado del cálculo"
          }
        },
        "required": ["honorario_total", "moneda", "estado"]
      },
      "cuantia_proceso": {
        "type": "object",
        "description": "Detalles de la cuantía del proceso",
        "properties": {
          "valor": {
            "type": "number",
            "description": "Valor monetario del proceso en EUR",
            "minimum": 0
          },
          "tipo": {
            "type": "string",
            "enum": ["determinada", "indeterminada"],
            "description": "Si la cuantía es determinada o indeterminada"
          },
          "rango_aplicable": {
            "type": "string",
            "description": "Rango de cuantía donde cae (ej: €30.000-€60.000)"
          }
        },
        "required": ["valor", "tipo"]
      },
      "criterio_base": {
        "type": "object",
        "description": "Criterio base aplicado para el cálculo",
        "properties": {
          "codigo": {
            "type": "string",
            "description": "Código del criterio (ej: 3.1)"
          },
          "nombre": {
            "type": "string",
            "description": "Nombre descriptivo del criterio"
          },
          "porcentaje": {
            "type": "number",
            "description": "Porcentaje aplicado",
            "minimum": 0,
            "maximum": 100
          },
          "valor_calculado": {
            "type": "number",
            "description": "Valor resultante en EUR",
            "minimum": 0
          },
          "fundamentacion": {
            "type": "string",
            "description": "Explicación de por qué aplica este criterio"
          }
        },
        "required": ["codigo", "nombre", "porcentaje", "valor_calculado"]
      },
      "incrementos": {
        "type": "array",
        "description": "Incrementos aplicados al honorario base",
        "items": {
          "type": "object",
          "properties": {
            "criterio": {
              "type": "string",
              "description": "Código del criterio de incremento (ej: 5.2)"
            },
            "tipo": {
              "type": "string",
              "enum": ["complejidad", "diligencia", "responsabilidad", "otro"],
              "description": "Tipo de incremento"
            },
            "nivel": {
              "type": "string",
              "enum": ["baja", "media", "alta"],
              "description": "Nivel del incremento"
            },
            "porcentaje": {
              "type": "number",
              "description": "Porcentaje de incremento",
              "minimum": 0
            },
            "valor_calculado": {
              "type": "number",
              "description": "Valor del incremento en EUR"
            },
            "aplicado": {
              "type": "boolean",
              "description": "Si el incremento fue aplicado"
            },
            "motivo": {
              "type": "string",
              "description": "Explicación de por qué se aplicó"
            }
          },
          "required": ["criterio", "tipo", "porcentaje", "valor_calculado", "aplicado"]
        }
      },
      "reducciones": {
        "type": "array",
        "description": "Reducciones aplicadas al honorario",
        "items": {
          "type": "object",
          "properties": {
            "criterio": {
              "type": "string",
              "description": "Código del criterio de reducción (ej: 7.1)"
            },
            "tipo": {
              "type": "string",
              "enum": ["alegaciones", "desistimiento", "conformidad", "otro"],
              "description": "Tipo de reducción"
            },
            "porcentaje": {
              "type": "number",
              "description": "Porcentaje de reducción",
              "minimum": 0,
              "maximum": 100
            },
            "valor_calculado": {
              "type": "number",
              "description": "Valor de la reducción en EUR (negativo)"
            },
            "aplicado": {
              "type": "boolean",
              "description": "Si la reducción fue aplicada"
            },
            "motivo": {
              "type": "string",
              "description": "Razón de la reducción"
            }
          },
          "required": ["criterio", "tipo", "porcentaje", "valor_calculado", "aplicado"]
        }
      },
      "desglose_calculos": {
        "type": "array",
        "description": "Paso a paso del cálculo",
        "items": {
          "type": "object",
          "properties": {
            "paso": {
              "type": "integer",
              "description": "Número de paso",
              "minimum": 1
            },
            "descripcion": {
              "type": "string",
              "description": "Descripción de la operación"
            },
            "operacion": {
              "type": "string",
              "description": "Fórmula matemática (ej: 50000 × 4%)"
            },
            "resultado": {
              "type": "number",
              "description": "Resultado de esta operación"
            },
            "subtotal": {
              "type": "number",
              "description": "Subtotal acumulado hasta este paso"
            }
          },
          "required": ["paso", "descripcion", "operacion", "resultado"]
        }
      },
      "criterios_aplicables": {
        "type": "array",
        "description": "Lista de todos los criterios relevantes encontrados",
        "items": {
          "type": "object",
          "properties": {
            "codigo": {
              "type": "string",
              "description": "Código del criterio"
            },
            "nombre": {
              "type": "string",
              "description": "Nombre del criterio"
            },
            "descripcion": {
              "type": "string",
              "description": "Descripción completa"
            },
            "aplicado": {
              "type": "boolean",
              "description": "Si fue aplicado en este cálculo"
            },
            "razon_no_aplicado": {
              "type": "string",
              "description": "Si no se aplicó, la razón"
            }
          },
          "required": ["codigo", "nombre", "aplicado"]
        }
      },
      "condiciones_especiales": {
        "type": "object",
        "description": "Condiciones especiales del baremo",
        "properties": {
          "acumulacion_criterios": {
            "type": "string",
            "description": "Explicación sobre si se acumulan criterios"
          },
          "limitaciones": {
            "type": "array",
            "description": "Limitaciones aplicables",
            "items": {
              "type": "string"
            }
          },
          "excepciones": {
            "type": "array",
            "description": "Excepciones encontradas",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "fuente": {
        "type": "object",
        "description": "Información de la fuente del baremo",
        "properties": {
          "baremo": {
            "type": "string",
            "description": "Nombre del baremo (ej: ICA Madrid)"
          },
          "ccaa": {
            "type": "string",
            "description": "Comunidad autónoma"
          },
          "ano": {
            "type": "integer",
            "description": "Año del baremo",
            "minimum": 2000
          },
          "paginas": {
            "type": "string",
            "description": "Páginas consultadas (ej: 8-12)"
          },
          "referencia_completa": {
            "type": "string",
            "description": "Referencia completa del documento"
          }
        },
        "required": ["baremo", "ccaa"]
      },
      "observaciones": {
        "type": "array",
        "description": "Observaciones importantes sobre el cálculo",
        "items": {
          "type": "string"
        }
      },
      "proximos_pasos": {
        "type": "array",
        "description": "Sugerencias o próximos pasos si aplica",
        "items": {
          "type": "string"
        }
      }
    },
    "required": [
      "resumen",
      "cuantia_proceso",
      "criterio_base",
      "fuente"
    ],
    "additionalProperties": false
  },
  "strict": true
}
```

---

## Ejemplo de Respuesta Completa

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
    },
    {
      "codigo": "7.2",
      "nombre": "Reducción por desistimiento",
      "descripcion": "Disminución cuando hay desistimiento (-15%)",
      "aplicado": false,
      "razon_no_aplicado": "No se indicó desistimiento, solo alegaciones"
    }
  ],
  "condiciones_especiales": {
    "acumulacion_criterios": "Las reducciones NO se acumulan. Se aplica la más favorable (la mayor)",
    "limitaciones": [
      "La reducción por alegaciones no acumula con reducción por desistimiento",
      "No aplica reducción en procedimientos de ejecución"
    ],
    "excepciones": [
      "En casos de cuantía indeterminada se usa tarifa fija"
    ]
  },
  "fuente": {
    "baremo": "ICA Madrid",
    "ccaa": "MADRID",
    "ano": 2020,
    "paginas": "8-12",
    "referencia_completa": "Baremo de Honorarios de la Abogacía - Criterios ICA Madrid 2020"
  },
  "observaciones": [
    "Se aplicó la reducción por alegaciones como es más favorable que desistimiento",
    "El cálculo es exacto según los criterios indicados"
  ],
  "proximos_pasos": [
    "Verificar si aplica alguna otra reducción no mencionada",
    "Consultar baremo específico para excepciones por tipo de procedimiento"
  ]
}
```

---

## Schema Alternativo: Pregunta sobre Criterios

```json
{
  "name": "consulta_criterios",
  "description": "Respuesta para consultas sobre criterios sin cálculo",
  "schema": {
    "type": "object",
    "properties": {
      "pregunta_respondida": {
        "type": "string",
        "description": "La pregunta formulada"
      },
      "criterios_relevantes": {
        "type": "array",
        "description": "Criterios encontrados relevantes",
        "items": {
          "type": "object",
          "properties": {
            "codigo": { "type": "string" },
            "nombre": { "type": "string" },
            "descripcion": { "type": "string" },
            "rango_aplicacion": { "type": "string" },
            "porcentaje_minimo": { "type": "number" },
            "porcentaje_maximo": { "type": "number" },
            "ejemplos": {
              "type": "array",
              "items": { "type": "string" }
            }
          },
          "required": ["codigo", "nombre", "descripcion"]
        }
      },
      "respuesta_textual": {
        "type": "string",
        "description": "Respuesta en formato texto"
      },
      "fuente": {
        "type": "object",
        "properties": {
          "baremo": { "type": "string" },
          "ccaa": { "type": "string" },
          "paginas": { "type": "string" }
        }
      }
    },
    "required": ["pregunta_respondida", "criterios_relevantes"]
  },
  "strict": true
}
```

---

## Instrucciones de Uso

### Para el Frontend (TypeScript)

```typescript
interface ResumenRespuesta {
  honorario_total: number
  moneda: "EUR"
  estado: "calculado" | "estimacion" | "no_encontrado" | "error"
}

interface RespuestaCalculoHonorarios {
  resumen: ResumenRespuesta
  cuantia_proceso: {
    valor: number
    tipo: "determinada" | "indeterminada"
    rango_aplicable?: string
  }
  criterio_base: {
    codigo: string
    nombre: string
    porcentaje: number
    valor_calculado: number
    fundamentacion?: string
  }
  incrementos?: Array<{
    criterio: string
    tipo: string
    nivel?: string
    porcentaje: number
    valor_calculado: number
    aplicado: boolean
    motivo?: string
  }>
  reducciones?: Array<{
    criterio: string
    tipo: string
    porcentaje: number
    valor_calculado: number
    aplicado: boolean
    motivo?: string
  }>
  desglose_calculos?: Array<{
    paso: number
    descripcion: string
    operacion: string
    resultado: number
    subtotal?: number
  }>
  criterios_aplicables?: Array<{
    codigo: string
    nombre: string
    descripcion?: string
    aplicado: boolean
    razon_no_aplicado?: string
  }>
  condiciones_especiales?: {
    acumulacion_criterios?: string
    limitaciones?: string[]
    excepciones?: string[]
  }
  fuente: {
    baremo: string
    ccaa: string
    ano?: number
    paginas?: string
    referencia_completa?: string
  }
  observaciones?: string[]
  proximos_pasos?: string[]
}
```

### En el BaremoChatbot.tsx

```typescript
// Extraer el JSON de la respuesta del assistant
const parseRespuestaJSON = (responseText: string) => {
  try {
    // Buscar el bloque JSON en la respuesta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as RespuestaCalculoHonorarios
    }
  } catch (error) {
    console.error('Error parseando JSON:', error)
  }
  return null
}

// Usar en el componente
const respuestaJSON = parseRespuestaJSON(responseText)
if (respuestaJSON) {
  console.log('Total:', respuestaJSON.resumen.honorario_total)
  // Mostrar desglose visual
  respuestaJSON.desglose_calculos?.forEach(calc => {
    console.log(`${calc.paso}. ${calc.operacion} = ${calc.resultado}`)
  })
}
```

---

## Validación

### Checklist para Respuestas Válidas

- ✅ JSON es válido y parseabale
- ✅ `resumen.honorario_total` es un número
- ✅ Todos los valores monetarios en EUR
- ✅ Estados válidos: calculado|estimacion|no_encontrado|error
- ✅ Criterios usan códigos consistentes (ej: 3.1, 5.2, 7.1)
- ✅ Porcentajes entre 0-100
- ✅ Paso a paso lógico y consistente
- ✅ Suma correcta: base + incrementos - reducciones = total
- ✅ `additionalProperties: false` previene campos extra

---

## Migración desde Schema Anterior

**De:**
```json
{
  "cuantia": 45000,
  "ica_aplicado": true,
  "criterios_usados": "Criterio 3.1..."
}
```

**A:**
```json
{
  "resumen": {
    "honorario_total": 1863,
    "moneda": "EUR",
    "estado": "calculado"
  },
  "cuantia_proceso": {
    "valor": 45000,
    "tipo": "determinada"
  },
  "criterios_aplicables": [
    {
      "codigo": "3.1",
      "nombre": "Base de cálculo",
      "aplicado": true
    }
  ]
}
```

**Ventajas:**
- Más estructurado y detallado
- Información granular por criterio
- Fácil de parsear y procesar
- Compatible con bases de datos
- Permite auditoría completa
- Extensible para nuevos tipos de criterios
