import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, X, Loader, Download } from 'lucide-react'
import { OpenAI } from 'openai'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  jsonData?: RespuestaBaremo
}

interface BaremoChatbotProps {
  ccaa: string
  provincia: string
  onClose: () => void
}

// Tipos para la respuesta estructurada del assistant
interface ResumenRespuesta {
  honorario_total: number
  moneda: string
  estado: string
}

interface CuantiaProc {
  valor: number
  tipo: string
  rango_aplicable?: string
}

interface CriterioBase {
  codigo: string
  nombre: string
  porcentaje: number
  valor_calculado: number
  fundamentacion?: string
}

interface Incremento {
  criterio: string
  tipo: string
  nivel?: string
  porcentaje: number
  valor_calculado: number
  aplicado: boolean
  motivo?: string
}

interface Reduccion {
  criterio: string
  tipo: string
  porcentaje: number
  valor_calculado: number
  aplicado: boolean
  motivo?: string
}

interface PasoCalculo {
  paso: number
  descripcion: string
  operacion: string
  resultado: number
  subtotal?: number
}

interface CriterioAplicable {
  codigo: string
  nombre: string
  descripcion?: string
  aplicado: boolean
  razon_no_aplicado?: string
}

interface Fuente {
  baremo: string
  ccaa: string
  ano?: number
  paginas?: string
}

interface RespuestaBaremo {
  resumen: ResumenRespuesta
  cuantia_proceso: CuantiaProc
  criterio_base: CriterioBase
  incrementos?: Incremento[]
  reducciones?: Reduccion[]
  desglose_calculos?: PasoCalculo[]
  criterios_aplicables?: CriterioAplicable[]
  fuente: Fuente
  observaciones?: string[]
}

// Colores para logs en consola
const LOG_COLORS = {
  INFO: 'color: #0066cc; font-weight: bold;',
  SUCCESS: 'color: #28a745; font-weight: bold;',
  ERROR: 'color: #dc3545; font-weight: bold;',
  WARNING: 'color: #ff9800; font-weight: bold;',
  DEBUG: 'color: #6c757d; font-weight: normal;',
}

const log = {
  info: (msg: string, data?: any) => console.log(`%c[BAREMO-RAG]`, LOG_COLORS.INFO, msg, data || ''),
  success: (msg: string, data?: any) => console.log(`%c[✓ SUCCESS]`, LOG_COLORS.SUCCESS, msg, data || ''),
  error: (msg: string, data?: any) => console.error(`%c[✗ ERROR]`, LOG_COLORS.ERROR, msg, data || ''),
  warning: (msg: string, data?: any) => console.warn(`%c[⚠ WARNING]`, LOG_COLORS.WARNING, msg, data || ''),
  debug: (msg: string, data?: any) => console.log(`%c[DEBUG]`, LOG_COLORS.DEBUG, msg, data || ''),
}

// Función mejorada para parsear JSON de la respuesta
const parseRespuestaJSON = (responseText: string): RespuestaBaremo | null => {
  try {
    log.debug('🔍 Intentando parsear JSON de la respuesta...')
    
    // Buscar el primer { y el último } para extraer JSON válido
    const jsonStart = responseText.indexOf('{')
    const jsonEnd = responseText.lastIndexOf('}')
    
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      log.warning('⚠️ No se encontró JSON válido en la respuesta')
      return null
    }
    
    const jsonStr = responseText.substring(jsonStart, jsonEnd + 1)
    log.debug(`📋 JSON extraído (${jsonStr.length} caracteres)`)
    
    const jsonData = JSON.parse(jsonStr) as RespuestaBaremo
    
    // Validar que tenga los campos requeridos
    if (!jsonData.resumen || !jsonData.cuantia_proceso || !jsonData.criterio_base || !jsonData.fuente) {
      log.warning('⚠️ JSON válido pero incompleto (faltan campos requeridos)')
      return null
    }
    
    log.success('✓ JSON parseado correctamente', {
      total: jsonData.resumen.honorario_total,
      criterio: jsonData.criterio_base.codigo,
    })
    
    return jsonData
  } catch (error) {
    log.error('Error parseando JSON:', error instanceof Error ? error.message : 'Error desconocido')
    return null
  }
}

// Función para formatear visualmente el desglose de cálculos
const formatearDesglose = (jsonData: RespuestaBaremo): string => {
  let desglose = `\n📊 DESGLOSE DETALLADO:\n`
  desglose += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  
  // Cuantía
  desglose += `💰 Cuantía: €${jsonData.cuantia_proceso.valor.toLocaleString('es-ES')}\n`
  if (jsonData.cuantia_proceso.rango_aplicable) {
    desglose += `   Rango: ${jsonData.cuantia_proceso.rango_aplicable}\n`
  }
  desglose += `\n`
  
  // Criterio base
  desglose += `📌 Criterio Base (${jsonData.criterio_base.codigo}):\n`
  desglose += `   ${jsonData.criterio_base.nombre}\n`
  desglose += `   Fórmula: €${jsonData.cuantia_proceso.valor.toLocaleString('es-ES')} × ${jsonData.criterio_base.porcentaje}%\n`
  desglose += `   = €${jsonData.criterio_base.valor_calculado.toLocaleString('es-ES')}\n`
  
  let subtotal = jsonData.criterio_base.valor_calculado
  
  // Incrementos
  if (jsonData.incrementos && jsonData.incrementos.length > 0) {
    desglose += `\n⬆️ INCREMENTOS:\n`
    jsonData.incrementos.forEach((inc, idx) => {
      if (inc.aplicado) {
        desglose += `   ${idx + 1}. ${inc.tipo.toUpperCase()} - Criterio ${inc.criterio}\n`
        desglose += `      ${inc.nivel ? `Nivel: ${inc.nivel} → ` : ''}+${inc.porcentaje}%\n`
        desglose += `      €${jsonData.criterio_base.valor_calculado.toLocaleString('es-ES')} × ${inc.porcentaje}% = +€${inc.valor_calculado.toLocaleString('es-ES')}\n`
        if (inc.motivo) {
          desglose += `      💬 ${inc.motivo}\n`
        }
        subtotal += inc.valor_calculado
      }
    })
  }
  
  // Reducciones
  if (jsonData.reducciones && jsonData.reducciones.length > 0) {
    desglose += `\n⬇️ REDUCCIONES:\n`
    jsonData.reducciones.forEach((red, idx) => {
      if (red.aplicado) {
        desglose += `   ${idx + 1}. ${red.tipo.toUpperCase()} - Criterio ${red.criterio}\n`
        desglose += `      -${red.porcentaje}%\n`
        desglose += `      €${subtotal.toLocaleString('es-ES')} × ${red.porcentaje}% = -€${Math.abs(red.valor_calculado).toLocaleString('es-ES')}\n`
        if (red.motivo) {
          desglose += `      💬 ${red.motivo}\n`
        }
        subtotal += red.valor_calculado
      }
    })
  }
  
  // Total
  desglose += `\n${'━'.repeat(40)}\n`
  desglose += `💵 HONORARIO TOTAL: €${jsonData.resumen.honorario_total.toLocaleString('es-ES')}\n`
  desglose += `${'━'.repeat(40)}\n`
  
  // Paso a paso detallado
  if (jsonData.desglose_calculos && jsonData.desglose_calculos.length > 0) {
    desglose += `\n📝 PASO A PASO:\n`
    jsonData.desglose_calculos.forEach(paso => {
      desglose += `   ${paso.paso}. ${paso.descripcion}\n`
      desglose += `      ${paso.operacion} = €${paso.resultado.toLocaleString('es-ES')}\n`
      if (paso.subtotal !== undefined) {
        desglose += `      Subtotal: €${paso.subtotal.toLocaleString('es-ES')}\n`
      }
    })
  }
  
  // Criterios
  if (jsonData.criterios_aplicables && jsonData.criterios_aplicables.length > 0) {
    desglose += `\n📋 CRITERIOS APLICABLES:\n`
    jsonData.criterios_aplicables.forEach(crit => {
      if (crit.aplicado) {
        desglose += `   ✓ ${crit.codigo} - ${crit.nombre}\n`
      }
    })
  }
  
  // Fuente
  desglose += `\n📚 FUENTE:\n`
  desglose += `   Baremo: ${jsonData.fuente.baremo} (${jsonData.fuente.ccaa})\n`
  if (jsonData.fuente.ano) {
    desglose += `   Año: ${jsonData.fuente.ano}\n`
  }
  if (jsonData.fuente.paginas) {
    desglose += `   Páginas: ${jsonData.fuente.paginas}\n`
  }
  
  // Observaciones
  if (jsonData.observaciones && jsonData.observaciones.length > 0) {
    desglose += `\n💡 OBSERVACIONES:\n`
    jsonData.observaciones.forEach(obs => {
      desglose += `   • ${obs}\n`
    })
  }
  
  return desglose
}

export default function BaremoChatbot({ ccaa, provincia, onClose }: BaremoChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Inicializar cliente OpenAI
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // Necesario para usar en cliente
  })

  useEffect(() => {
    log.info('🤖 BaremoChatbot inicializado', { ccaa, provincia })
    log.debug('API Key presente:', !!import.meta.env.VITE_OPENAI_API_KEY)
    log.debug('Assistant ID:', import.meta.env.VITE_OPENAI_ASSISTANT_ID)
    log.info('💡 El assistant está configurado para responder con criterios específicos y cálculos numéricos')
  }, [ccaa, provincia])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const buildContextMessage = () => {
    return `CONTEXTO IMPORTANTE:
- Baremo aplicable: ${ccaa} (Provincia: ${provincia})
- Debes citar criterios específicos (ej: Criterio 3.1, 5.2, 7.1)
- Proporciona cálculos NUMÉRICOS desglosados
- Incluye incrementos/reducciones aplicables
- Ejemplo de formato: "Según Criterio 3.1: Base 4% de €50.000 = €2.000. Reducción por alegaciones (Criterio 7.1, -10%): -€200. TOTAL: €1.800"
- NUNCA respondas genéricamente, sé específico con números y criterios
- Si no tienes el dato exacto, indica: "No encontrado en el baremo de ${ccaa}"`
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    log.info('📤 Usuario envía mensaje:', input)
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      // Crear thread si no existe
      let currentThreadId = threadId
      if (!currentThreadId) {
        log.info('🧵 Creando nuevo thread...')
        const thread = await client.beta.threads.create()
        currentThreadId = thread.id
        setThreadId(thread.id)
        log.success('✓ Thread creado:', currentThreadId)
        log.debug('📝 Context enviado:', buildContextMessage())
      } else {
        log.debug('🧵 Usando thread existente:', currentThreadId)
      }

      // Enviar mensaje al thread
      log.info('📨 Enviando mensaje al thread...')
      const contextMsg = buildContextMessage()
      const userMsg = `${contextMsg}\n\n[PREGUNTA DEL USUARIO]\n${input}`
      
      log.debug('📤 Enviando al assistant:', userMsg.substring(0, 150) + '...')
      await client.beta.threads.messages.create(currentThreadId, {
        role: 'user',
        content: userMsg,
      })
      log.success('✓ Mensaje enviado al thread')

      // Ejecutar assistant
      log.info('🚀 Ejecutando assistant...')
      log.debug('Assistant ID:', import.meta.env.VITE_OPENAI_ASSISTANT_ID)
      const run = await client.beta.threads.runs.createAndPoll(currentThreadId, {
        assistant_id: import.meta.env.VITE_OPENAI_ASSISTANT_ID,
      })

      log.debug('Estado del run:', run.status)
      if (run.status !== 'completed') {
        throw new Error(`Assistant error: ${run.status}`)
      }
      log.success('✓ Assistant completado')

      // Obtener respuesta
      log.info('📩 Recuperando respuesta...')
      const threadMessages = await client.beta.threads.messages.list(currentThreadId)
      log.debug('Mensajes recuperados:', threadMessages.data.length)
      
      const assistantMsg = threadMessages.data[0]

      if (!assistantMsg || assistantMsg.role !== 'assistant') {
        throw new Error('No response from assistant')
      }
      log.success('✓ Respuesta del asistente recibida')

      const responseText = assistantMsg.content
        .filter(block => block.type === 'text')
        .map(block => (block.type === 'text' ? block.text.value : ''))
        .join('\n')

      log.debug(`Longitud de respuesta: ${responseText.length} caracteres`)
      log.info('📝 Respuesta:', responseText.substring(0, 100) + '...')

      // Parsear JSON de la respuesta
      const jsonData = parseRespuestaJSON(responseText)
      
      let displayText = responseText
      if (jsonData) {
        log.success('✓ JSON parseado exitosamente')
        log.debug('Total calculado:', `€${jsonData.resumen.honorario_total}`)
        
        // Crear texto formateado con desglose visual
        displayText = `✅ RESPUESTA: €${jsonData.resumen.honorario_total.toLocaleString('es-ES')} (Criterio ${jsonData.criterio_base.codigo})`
        displayText += formatearDesglose(jsonData)
      } else {
        log.warning('⚠️ No se pudo parsear JSON, mostrando respuesta texto')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: displayText,
        timestamp: new Date(),
        jsonData: jsonData || undefined,
      }

      setMessages(prev => [...prev, assistantMessage])
      log.success('✅ Ciclo completo exitoso')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      log.error('Error en el chatbot:', {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : 'Sin stack trace',
      })
    } finally {
      setLoading(false)
      log.info('Procesamiento completado')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-3/4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <div>
              <h3 className="font-bold text-sm">Consultor de Baremos</h3>
              <p className="text-xs opacity-90">
                {ccaa} - {provincia}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="flex flex-col items-start justify-start h-full text-left text-gray-600 space-y-3">
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2">🤖 Asistente de Baremos</p>
                <p className="text-xs leading-relaxed">Soy un especialista en criterios de honorarios. Respondo con:</p>
                <ul className="text-xs mt-2 space-y-1 ml-2 leading-relaxed">
                  <li>✅ <strong>Criterios específicos:</strong> Criterio 3.1, 5.2, etc.</li>
                  <li>✅ <strong>Cálculos desglosados:</strong> Base × % = Resultado</li>
                  <li>✅ <strong>Incrementos/Reducciones:</strong> Por complejidad, alegaciones, etc.</li>
                  <li>✅ <strong>Referencias exactas:</strong> Del baremo de {ccaa}</li>
                </ul>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Ejemplos de preguntas:</p>
                <ul className="text-xs space-y-1 opacity-75">
                  <li>• ¿Cuál es el honorario para un caso de €50.000?</li>
                  <li>• ¿Qué incremento aplica por complejidad?</li>
                  <li>• ¿Cuál es la reducción si termina en alegaciones?</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-300'
                }`}
              >
                {message.role === 'assistant' && message.jsonData ? (
                  // Renderizado especial para respuestas con JSON
                  <div className="space-y-2">
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <p className="font-bold text-green-700">
                        💵 €{message.jsonData.resumen.honorario_total.toLocaleString('es-ES')}
                      </p>
                      <p className="text-xs text-green-600">
                        Criterio {message.jsonData.criterio_base.codigo}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-2 rounded border border-blue-200 text-xs">
                      <p className="font-semibold text-blue-700 mb-1">Cuantía:</p>
                      <p>€{message.jsonData.cuantia_proceso.valor.toLocaleString('es-ES')}</p>
                      {message.jsonData.cuantia_proceso.rango_aplicable && (
                        <p className="text-blue-600">{message.jsonData.cuantia_proceso.rango_aplicable}</p>
                      )}
                    </div>

                    <div className="bg-amber-50 p-2 rounded border border-amber-200 text-xs">
                      <p className="font-semibold text-amber-700">Base ({message.jsonData.criterio_base.codigo}):</p>
                      <p>€{message.jsonData.criterio_base.valor_calculado.toLocaleString('es-ES')} ({message.jsonData.criterio_base.porcentaje}%)</p>
                    </div>

                    {message.jsonData.incrementos && message.jsonData.incrementos.some(i => i.aplicado) && (
                      <div className="bg-purple-50 p-2 rounded border border-purple-200 text-xs">
                        <p className="font-semibold text-purple-700 mb-1">⬆️ Incrementos:</p>
                        {message.jsonData.incrementos
                          .filter(i => i.aplicado)
                          .map((inc, i) => (
                            <p key={i}>
                              {inc.nivel?.toUpperCase()} +{inc.porcentaje}% = +€{inc.valor_calculado.toLocaleString('es-ES')}
                            </p>
                          ))}
                      </div>
                    )}

                    {message.jsonData.reducciones && message.jsonData.reducciones.some(r => r.aplicado) && (
                      <div className="bg-red-50 p-2 rounded border border-red-200 text-xs">
                        <p className="font-semibold text-red-700 mb-1">⬇️ Reducciones:</p>
                        {message.jsonData.reducciones
                          .filter(r => r.aplicado)
                          .map((red, i) => (
                            <p key={i}>
                              {red.tipo.toUpperCase()} -{red.porcentaje}% = -€{Math.abs(red.valor_calculado).toLocaleString('es-ES')}
                            </p>
                          ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const jsonStr = JSON.stringify(message.jsonData, null, 2)
                        navigator.clipboard.writeText(jsonStr)
                        log.success('✓ JSON copiado al portapapeles')
                      }}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded flex items-center justify-center gap-1"
                    >
                      <Download className="h-3 w-3" /> Copiar JSON
                    </button>
                  </div>
                ) : (
                  // Renderizado normal para texto
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Consultando baremos...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Haz una pregunta..."
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Presiona Enter para enviar o Shift+Enter para salto de línea
          </p>
        </div>
      </div>
    </div>
  )
}
