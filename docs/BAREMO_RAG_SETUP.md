# 🤖 Configuración del Chatbot RAG de Baremos

## Paso 1: Configurar Assistant en OpenAI

1. Ve a https://platform.openai.com/assistants
2. Crea un nuevo Assistant:
   - **Name**: "Baremo Honorarios Assistant"
   - **Description**: "Asistente para consultar criterios de honorarios de baremos"
   - **Model**: gpt-4-turbo
   - **Tools**: File Search (habilitado)
   - **Vector Store**: Asigna tu vector store existente (`vs_68f8db9ce9808191ad733dd979c6af14`)

3. Copia el ID del Assistant (formato: `asst_xxx...`)

## Paso 2: Configurar Variables de Entorno

Edita `.env.local` y agrega:

```env
# OpenAI API
OPENAI_API_KEY=sk_your_api_key_here
OPENAI_ORG_ID=org_your_org_id_here

# Vector Store (ya existe)
VECTOR_STORE_ID=

# Assistant creado en el paso anterior
OPENAI_ASSISTANT_ID=asst_your_assistant_id_here
```

## Paso 3: Verificar Estructura

Los archivos creados:

```
api/
└── baremo-rag.ts          ← API endpoint para RAG

src/
├── components/
│   ├── ConsultarBaremos.tsx (MODIFICADO - Añadido botón "Consultar con IA")
│   └── BaremoChatbot.tsx   ← Nuevo componente chatbot
```

## Paso 4: Probar en Local

```bash
npm run dev
```

1. Ve a "Consultar Baremos"
2. Selecciona CCAA → Provincia
3. Verás botón "Consultar con IA"
4. Haz una pregunta sobre ese baremo

## Flujo de Funcionamiento

```
Usuario → "¿Cuál es el honorario base?"
   ↓
BaremoChatbot.tsx (UI) 
   ↓
/api/baremo-rag (endpoint)
   ↓
OpenAI Assistant + Vector Store
   ↓
Búsqueda semántica en documentos
   ↓
GPT-4 genera respuesta contextualizada
   ↓
Respuesta al usuario
```

## Costos

- **Embeddings**: Gratuitos (ya procesados)
- **Búsqueda Vector**: Incluido en API
- **GPT-4**: ~$0.01-0.05 por pregunta

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Error "No assistant response" | Verifica `OPENAI_ASSISTANT_ID` en .env.local |
| Error "Vector store not found" | Confirma que `VECTOR_STORE_ID` es correcto |
| Error "API key invalid" | Revisa la clave en OpenAI dashboard |
| Respuesta vacía | Asegúrate que el documento está en el vector store |

## Mejoras Futuras

- [ ] Historial persistente en BD
- [ ] Rating de respuestas (útil/no útil)
- [ ] Citas de documentos en las respuestas
- [ ] Múltiples documentos simultáneamente
- [ ] Exportar conversaciones a PDF
