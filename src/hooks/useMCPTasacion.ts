import { useState, useCallback } from 'react'
import { mcpClient } from '../lib/mcp-client'

interface MCPSuggestion {
  calculo?: {
    costas: number
    iva: number
    total: number
  }
  recomendaciones?: {
    sugerencias: string[]
  }
  results?: any[]
  metadata?: any
}

interface UseMCPTasacionProps {
  onSuggestion?: (suggestion: MCPSuggestion) => void
}

export function useMCPTasacion({ onSuggestion }: UseMCPTasacionProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSuggestion, setLastSuggestion] = useState<MCPSuggestion | null>(null)
  const [diagnostics, setDiagnostics] = useState<any>(null)

  const generateSuggestions = useCallback(async (data: {
    municipio?: string
    tipoJuicio?: string
    cantidad?: number
    faseTerminacion?: string
    instancia?: string
  }) => {
    if (!data.municipio || !data.tipoJuicio) return

    setIsLoading(true)
    try {
      const results = await Promise.allSettled([
        // Buscar municipios similares
        mcpClient.executeTool('search_municipios', {
          query: data.municipio,
          limit: 3
        }),

        // Calcular costas usando MCP
        mcpClient.executeTool('calculate_costas_smart', {
          municipio: data.municipio,
          tipoJuicio: data.tipoJuicio,
          faseTerminacion: data.faseTerminacion || 'Juicio',
          instancia: data.instancia || 'PRIMERA INSTANCIA',
          cantidad: data.cantidad
        }),

        // Obtener recomendaciones basadas en historial
        mcpClient.executeTool('recommend_tasacion', {
          municipio: data.municipio,
          tipoJuicio: data.tipoJuicio,
          cantidad: data.cantidad
        })
      ])

      const suggestions = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value)
        .filter(result => result.success)

      if (suggestions.length > 0) {
        const combinedSuggestion = suggestions.reduce((acc, curr) => ({
          ...acc,
          ...curr
        }), {} as MCPSuggestion)

        setLastSuggestion(combinedSuggestion)

        if (onSuggestion) {
          onSuggestion(combinedSuggestion)
        }
      }

      return suggestions
    } catch (error) {
      console.error('Error generando sugerencias MCP:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [onSuggestion])

  const runDiagnostics = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await mcpClient.executeTool('diagnose_database', {
        checkTables: true,
        checkData: true,
        checkRLS: true
      })

      setDiagnostics(result)
      return result
    } catch (error) {
      console.error('Error en diagnóstico MCP:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const queryTable = useCallback(async (tableName: string, options: {
    columns?: string[]
    where?: Record<string, any>
    limit?: number
    orderBy?: string
  } = {}) => {
    setIsLoading(true)
    try {
      const result = await mcpClient.executeTool('query_table_mcp', {
        table: tableName,
        columns: options.columns || ['*'],
        where: options.where,
        limit: options.limit || 10,
        orderBy: options.orderBy
      })

      return result
    } catch (error) {
      console.error(`Error consultando tabla ${tableName}:`, error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const executeSQL = useCallback(async (query: string) => {
    setIsLoading(true)
    try {
      const result = await mcpClient.executeTool('execute_sql_mcp', {
        query: query
      })

      return result
    } catch (error) {
      console.error('Error ejecutando SQL:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const searchEntities = useCallback(async (query: string, limit: number = 10) => {
    return await mcpClient.executeTool('search_entidades', {
      query,
      limit
    })
  }, [])

  const searchMunicipios = useCallback(async (query: string, limit: number = 10) => {
    return await mcpClient.executeTool('search_municipios', {
      query,
      limit
    })
  }, [])

  const calculateCostasSmart = useCallback(async (params: {
    municipio: string
    tipoJuicio: string
    faseTerminacion: string
    instancia: string
    cantidad?: number
  }) => {
    return await mcpClient.executeTool('calculate_costas_smart', params)
  }, [])

  return {
    isLoading,
    lastSuggestion,
    diagnostics,
    generateSuggestions,
    runDiagnostics,
    queryTable,
    executeSQL,
    searchEntities,
    searchMunicipios,
    calculateCostasSmart
  }
}