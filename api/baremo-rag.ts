import { VercelRequest, VercelResponse } from '@vercel/node'
import { OpenAI } from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const VECTOR_STORE_ID = process.env.VECTOR_STORE_ID || 'vs_68f8db9ce9808191ad733dd979c6af14'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  question: string
  ccaa: string
  provincia: string
  conversationHistory?: Message[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Permitir solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { question, ccaa, provincia, conversationHistory = [] } = req.body as RequestBody

    if (!question) {
      return res.status(400).json({ error: 'Question is required' })
    }

    // Crear thread para la conversación
    const thread = await client.beta.threads.create()

    // Agregar mensaje del usuario al thread
    await client.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `${question}\n\n[Contexto: Baremo de ${ccaa}, ${provincia}]`,
    })

    // Ejecutar assistant con el vector store
    const run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID || '',
      // El assistant ya tiene el vector store configurado
    })

    if (run.status !== 'completed') {
      throw new Error(`Assistant run failed with status: ${run.status}`)
    }

    // Obtener mensajes del thread
    const messages = await client.beta.threads.messages.list(thread.id)
    const assistantMessage = messages.data[0]

    if (!assistantMessage || assistantMessage.role !== 'assistant') {
      throw new Error('No assistant response received')
    }

    const responseText = assistantMessage.content
      .filter(block => block.type === 'text')
      .map(block => (block.type === 'text' ? block.text.value : ''))
      .join('\n')

    return res.status(200).json({
      response: responseText,
      ccaa,
      provincia,
      threadId: thread.id,
    })
  } catch (error) {
    console.error('RAG Error:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    })
  }
}
