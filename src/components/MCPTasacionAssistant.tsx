import { useState, useEffect } from 'react'
import { useMCPTasacion } from '../hooks/useMCPTasacion'

interface MCPTasacionAssistantProps {
  onSuggestion: (suggestion: any) => void
  currentData: {
    municipio?: string
    tipoJuicio?: string
    cantidad?: number
  }
}

export default function MCPTasacionAssistant({ onSuggestion, currentData }: MCPTasacionAssistantProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])

  const {
    isLoading,
    diagnostics,
    generateSuggestions,
    runDiagnostics,
    queryTable
  } = useMCPTasacion({ onSuggestion })

  // Obtener sugerencias inteligentes cuando cambian los datos
  useEffect(() => {
    if (currentData.municipio && currentData.tipoJuicio) {
      const fetchSuggestions = async () => {
        const results = await generateSuggestions({
          municipio: currentData.municipio,
          tipoJuicio: currentData.tipoJuicio,
          cantidad: currentData.cantidad
        })
        if (results) {
          setSuggestions(results)
        }
      }
      fetchSuggestions()
    }
  }, [currentData, generateSuggestions])

  const queryTableData = async (tableName: string) => {
    const result = await queryTable(tableName, { limit: 10 })
    if (result) {
      console.log(`Datos de tabla ${tableName}:`, result)
    }
    return result
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-medium text-gray-900">
              Asistente MCP Inteligente
            </h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={runDiagnostics}
              disabled={isLoading}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              🔍 Diagnosticar
            </button>
            <button
              onClick={() => queryTableData('municipios')}
              disabled={isLoading}
              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
            >
              📊 Municipios
            </button>
            <button
              onClick={() => queryTableData('entidades')}
              disabled={isLoading}
              className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
            >
              🏢 Entidades
            </button>
          </div>
        </div>

        {/* Estado de carga */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            <span>Procesando con MCP...</span>
          </div>
        )}

        {/* Sugerencias activas */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">💡 Sugerencias Inteligentes</h4>

            {suggestions.map((suggestion, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                {suggestion.calculo && (
                  <div className="text-sm">
                    <div className="font-medium text-green-700">Cálculo Recomendado:</div>
                    <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                      <div>Costas: €{suggestion.calculo.costas}</div>
                      <div>IVA: €{suggestion.calculo.iva}</div>
                      <div>Total: €{suggestion.calculo.total}</div>
                    </div>
                  </div>
                )}

                {suggestion.recomendaciones && (
                  <div className="text-sm mt-2">
                    <div className="font-medium text-blue-700">Recomendaciones:</div>
                    <ul className="mt-1 text-xs text-gray-600">
                      {suggestion.recomendaciones.sugerencias.map((sug: string, i: number) => (
                        <li key={i}>• {sug}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {suggestion.results && Array.isArray(suggestion.results) && (
                  <div className="text-sm mt-2">
                    <div className="font-medium text-purple-700">
                      Opciones Encontradas: {suggestion.results.length}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {suggestion.results.slice(0, 2).map((item: any, i: number) => (
                        <div key={i}>
                          {item.nombre || item.municipio || item.criterio_ica}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Resultados de diagnóstico */}
        {diagnostics && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">📊 Diagnóstico de Base de Datos</h4>
            <div className="text-xs space-y-1">
              <div>Estado General: <span className={`font-medium ${
                diagnostics.overallStatus === 'healthy' ? 'text-green-600' :
                diagnostics.overallStatus === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {diagnostics.overallStatus === 'healthy' ? '✅ Saludable' :
                 diagnostics.overallStatus === 'warning' ? '⚠️ Advertencias' :
                 '❌ Problemas'}
              </span></div>

              {diagnostics.recommendations && diagnostics.recommendations.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium text-blue-800">Recomendaciones:</div>
                  <ul className="mt-1 text-blue-700">
                    {diagnostics.recommendations.map((rec: string, i: number) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información sobre herramientas MCP disponibles */}
      </div>
    </div>
  )
}