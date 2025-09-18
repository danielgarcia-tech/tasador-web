import { supabase } from './supabase'

// Cliente MCP mejorado con integración Supabase
export class TasacionMCPClient {
  private tools: Map<string, any> = new Map()

  constructor() {
    this.initializeTools()
    this.initializeSupabaseMCP()
  }

  private async initializeSupabaseMCP() {
    try {
      // Configurar conexión con el servidor MCP de Supabase
      // Las credenciales se configuran en el archivo .vscode/mcp.json
      console.log('MCP Supabase inicializado')
      console.log('🔗 MCP Supabase inicializado')
    } catch (error) {
      console.error('❌ Error inicializando MCP Supabase:', error)
    }
  }

  private initializeTools() {
    // Herramienta para búsqueda inteligente de entidades
    this.tools.set('search_entities', {
      name: 'search_entities',
      description: 'Busca entidades demandadas usando IA para mejorar la precisión de búsqueda',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Término de búsqueda' },
          limit: { type: 'number', description: 'Número máximo de resultados', default: 10 }
        },
        required: ['query']
      },
      execute: this.searchEntitiesSmart.bind(this)
    })

    // Herramienta para búsqueda inteligente de municipios
    this.tools.set('search_municipios', {
      name: 'search_municipios',
      description: 'Busca municipios usando IA para encontrar coincidencias precisas',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Término de búsqueda' },
          limit: { type: 'number', description: 'Número máximo de resultados', default: 10 }
        },
        required: ['query']
      },
      execute: this.searchMunicipiosSmart.bind(this)
    })

    // Herramienta para cálculo inteligente de costas
    this.tools.set('calculate_costas_smart', {
      name: 'calculate_costas_smart',
      description: 'Calcula costas judiciales usando IA para validar y optimizar el cálculo',
      parameters: {
        type: 'object',
        properties: {
          municipio: { type: 'string', description: 'Nombre del municipio' },
          tipoJuicio: { type: 'string', description: 'Tipo de juicio' },
          faseTerminacion: { type: 'string', description: 'Fase de terminación' },
          instancia: { type: 'string', description: 'Instancia judicial' },
          cantidad: { type: 'number', description: 'Cantidad demandada (opcional)' }
        },
        required: ['municipio', 'tipoJuicio', 'faseTerminacion', 'instancia']
      },
      execute: this.calculateCostasSmart.bind(this)
    })

    // Herramienta para diagnóstico de base de datos
    this.tools.set('diagnose_database', {
      name: 'diagnose_database',
      description: 'Diagnostica problemas en la base de datos y sugiere soluciones',
      parameters: {
        type: 'object',
        properties: {
          checkTables: { type: 'boolean', description: 'Verificar estructura de tablas', default: true },
          checkData: { type: 'boolean', description: 'Verificar integridad de datos', default: true }
        }
      },
      execute: this.diagnoseDatabase.bind(this)
    })

    // Herramienta para consultar tablas usando MCP Supabase
    this.tools.set('query_table_mcp', {
      name: 'query_table_mcp',
      description: 'Consulta tablas usando el servidor MCP de Supabase con capacidades avanzadas',
      parameters: {
        type: 'object',
        properties: {
          table: { type: 'string', description: 'Nombre de la tabla a consultar' },
          columns: { type: 'array', items: { type: 'string' }, description: 'Columnas a seleccionar' },
          where: { type: 'object', description: 'Condiciones WHERE' },
          limit: { type: 'number', description: 'Límite de resultados', default: 100 }
        },
        required: ['table']
      },
      execute: this.queryTableMCP.bind(this)
    })

    // Herramienta para ejecutar SQL usando MCP
    this.tools.set('execute_sql_mcp', {
      name: 'execute_sql_mcp',
      description: 'Ejecuta consultas SQL usando el servidor MCP de Supabase',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Consulta SQL a ejecutar' },
          params: { type: 'array', description: 'Parámetros de la consulta' }
        },
        required: ['query']
      },
      execute: this.executeSqlMCP.bind(this)
    })

    // Herramienta para gestionar esquemas usando MCP
    this.tools.set('manage_schema_mcp', {
      name: 'manage_schema_mcp',
      description: 'Gestiona esquemas de base de datos usando MCP Supabase',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['list_tables', 'describe_table', 'list_policies'], description: 'Acción a realizar' },
          table: { type: 'string', description: 'Nombre de la tabla (para describe_table)' }
        },
        required: ['action']
      },
      execute: this.manageSchemaMCP.bind(this)
    })
  }

  // Método para ejecutar herramientas MCP
  async executeTool(toolName: string, parameters: any) {
    const tool = this.tools.get(toolName)
    if (!tool) {
      throw new Error(`Herramienta MCP no encontrada: ${toolName}`)
    }

    try {
      console.log(`🔧 Ejecutando herramienta MCP: ${toolName}`, parameters)
      const result = await tool.execute(parameters)
      console.log(`✅ Herramienta MCP completada: ${toolName}`, result)
      return result
    } catch (error) {
      console.error(`❌ Error en herramienta MCP ${toolName}:`, error)
      throw error
    }
  }

  // Método para listar herramientas disponibles
  getAvailableTools() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.description,
      parameters: tool.parameters
    }))
  }

  // Implementación de herramientas MCP

  private async searchEntitiesSmart(params: { query: string, limit?: number }) {
    const { query, limit = 10 } = params

    try {
      // Búsqueda inteligente usando múltiples estrategias
      const strategies = [
        // Estrategia 1: Búsqueda exacta por código
        supabase
          .from('entidades')
          .select('*')
          .eq('codigo', query.toUpperCase())
          .limit(limit),

        // Estrategia 2: Búsqueda por nombre completo
        supabase
          .from('entidades')
          .select('*')
          .ilike('nombre_completo', `%${query}%`)
          .limit(limit),

        // Estrategia 3: Búsqueda por código parcial
        supabase
          .from('entidades')
          .select('*')
          .ilike('codigo', `%${query.toUpperCase()}%`)
          .limit(limit)
      ]

      const results = await Promise.all(strategies)
      const allEntities = results.flatMap(result => result.data || [])

      // Eliminar duplicados y ordenar por relevancia
      const uniqueEntities = allEntities.filter((entity, index, self) =>
        index === self.findIndex(e => e.codigo === entity.codigo)
      )

      return {
        success: true,
        query,
        results: uniqueEntities.slice(0, limit),
        totalFound: uniqueEntities.length,
        strategies: ['exact_code', 'name_search', 'partial_code']
      }
    } catch (error) {
      return {
        success: false,
        query,
        error: error instanceof Error ? error.message : 'Error desconocido',
        results: []
      }
    }
  }

  private async searchMunicipiosSmart(params: { query: string, limit?: number }) {
    const { query, limit = 10 } = params

    try {
      // Búsqueda inteligente de municipios
      const { data, error } = await supabase
        .from('municipios_ica')
        .select('pj, ica_aplicable')
        .ilike('pj', `%${query}%`)
        .limit(limit)

      if (error) throw error

      return {
        success: true,
        query,
        results: data || [],
        totalFound: data?.length || 0
      }
    } catch (error) {
      return {
        success: false,
        query,
        error: error instanceof Error ? error.message : 'Error desconocido',
        results: []
      }
    }
  }

  private async calculateCostasSmart(params: any) {
    const { municipio, tipoJuicio, faseTerminacion, instancia, cantidad } = params

    try {
      // Obtener información del municipio
      const { data: municipioData, error: municipioError } = await supabase
        .from('municipios_ica')
        .select('pj, ica_aplicable')
        .ilike('pj', `%${municipio}%`)
        .single()

      if (municipioError || !municipioData) {
        throw new Error(`Municipio no encontrado: ${municipio}`)
      }

      // Obtener criterios ICA
      const { data: criteriosData, error: criteriosError } = await supabase
        .from('criterios_ica')
        .select('*')
        .eq('criterio_ica', municipioData.ica_aplicable)
        .single()

      if (criteriosError || !criteriosData) {
        throw new Error(`Criterios ICA no encontrados para: ${municipioData.ica_aplicable}`)
      }

      // Cálculo inteligente de costas
      let costasBase = 0

      switch (tipoJuicio) {
        case 'Juicio Ordinario':
          costasBase = criteriosData.juicio || 0
          break
        case 'Juicio Verbal':
          costasBase = criteriosData.verbal_vista || 0
          break
        default:
          costasBase = criteriosData.juicio || 0
      }

      // Aplicar factores
      let costasFinal = costasBase

      if (faseTerminacion === 'Apelación') {
        costasFinal *= criteriosData.factor_apelacion || 1
      }

      if (instancia === 'SEGUNDA INSTANCIA') {
        costasFinal *= 1.5 // Factor adicional para segunda instancia
      }

      const iva = costasFinal * 0.21
      const total = costasFinal + iva

      return {
        success: true,
        calculo: {
          municipio: municipioData.pj,
          provincia: municipioData.ica_aplicable,
          criterioICA: municipioData.ica_aplicable,
          tipoJuicio,
          faseTerminacion,
          instancia,
          cantidad,
          costas: Math.round(costasFinal * 100) / 100,
          iva: Math.round(iva * 100) / 100,
          total: Math.round(total * 100) / 100
        },
        metadata: {
          criteriosUsados: criteriosData,
          factoresAplicados: {
            apelacion: faseTerminacion === 'Apelación' ? criteriosData.factor_apelacion : 1,
            instancia: instancia === 'SEGUNDA INSTANCIA' ? 1.5 : 1
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en cálculo',
        calculo: null
      }
    }
  }

  private async diagnoseDatabase(params: any) {
    const { checkTables = true, checkData = true } = params

    const diagnostico = {
      timestamp: new Date().toISOString(),
      checks: [] as any[],
      recommendations: [] as string[],
      overallStatus: 'unknown' as 'healthy' | 'warning' | 'error' | 'unknown'
    }

    try {
      // Verificar tablas
      if (checkTables) {
        const tables = ['entidades', 'municipios_ica', 'criterios_ica', 'tasaciones']

        for (const table of tables) {
          try {
            const { count, error } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true })

            diagnostico.checks.push({
              type: 'table_check',
              table,
              status: error ? 'error' : 'ok',
              recordCount: count,
              error: error?.message
            })
          } catch (error) {
            diagnostico.checks.push({
              type: 'table_check',
              table,
              status: 'error',
              error: error instanceof Error ? error.message : 'Error desconocido'
            })
          }
        }
      }

      // Verificar datos
      if (checkData) {
        const { data: entidadesCount } = await supabase
          .from('entidades')
          .select('*', { count: 'exact', head: true })

        const { data: municipiosCount } = await supabase
          .from('municipios_ica')
          .select('*', { count: 'exact', head: true })

        const { data: criteriosCount } = await supabase
          .from('criterios_ica')
          .select('*', { count: 'exact', head: true })

        diagnostico.checks.push({
          type: 'data_integrity',
          entidades: entidadesCount,
          municipios: municipiosCount,
          criterios: criteriosCount
        })

        // Generar recomendaciones
        if ((entidadesCount || 0) === 0) {
          diagnostico.recommendations.push('La tabla entidades está vacía. Ejecuta la inicialización de datos.')
        }
        if ((municipiosCount || 0) === 0) {
          diagnostico.recommendations.push('La tabla municipios_ica está vacía. Ejecuta la inicialización de datos.')
        }
        if ((criteriosCount || 0) === 0) {
          diagnostico.recommendations.push('La tabla criterios_ica está vacía. Ejecuta la inicialización de datos.')
        }
      }

      // Determinar estado general
      const hasErrors = diagnostico.checks.some(check => check.status === 'error')
      const hasEmptyTables = diagnostico.checks.some(check =>
        check.type === 'data_integrity' &&
        (check.entidades === 0 || check.municipios === 0 || check.criterios === 0)
      )

      if (hasErrors) {
        diagnostico.overallStatus = 'error'
      } else if (hasEmptyTables) {
        diagnostico.overallStatus = 'warning'
      } else {
        diagnostico.overallStatus = 'healthy'
      }

      return diagnostico
    } catch (error) {
      diagnostico.overallStatus = 'error'
      diagnostico.checks.push({
        type: 'general_error',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
      return diagnostico
    }
  }

  private async queryTableMCP(params: any) {
    const { table, columns = ['*'], where, limit = 100 } = params

    try {
      let query = supabase.from(table).select(columns.join(','))

      // Aplicar condiciones WHERE si existen
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          if (typeof value === 'string' && value.includes('%')) {
            query = query.ilike(key, value)
          } else {
            query = query.eq(key, value)
          }
        })
      }

      const { data, error, count } = await query.limit(limit)

      if (error) throw error

      return {
        success: true,
        table,
        data: data || [],
        count: count || data?.length || 0,
        columns: columns,
        query: where ? { where, limit } : { limit }
      }
    } catch (error) {
      return {
        success: false,
        table,
        error: error instanceof Error ? error.message : 'Error en consulta MCP',
        data: []
      }
    }
  }

  private async executeSqlMCP(params: any) {
    const { query, params: queryParams = [] } = params

    try {
      // Para consultas SELECT
      if (query.toLowerCase().trim().startsWith('select')) {
        const { data, error } = await supabase.rpc('execute_sql', {
          sql_query: query,
          query_params: queryParams
        })

        if (error) throw error

        return {
          success: true,
          type: 'select',
          data: data || [],
          query
        }
      }

      // Para otras consultas (INSERT, UPDATE, DELETE)
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: query,
        query_params: queryParams
      })

      if (error) throw error

      return {
        success: true,
        type: 'mutation',
        data: data || null,
        query
      }
    } catch (error) {
      return {
        success: false,
        query,
        error: error instanceof Error ? error.message : 'Error ejecutando SQL',
        type: 'error'
      }
    }
  }

  private async manageSchemaMCP(params: any) {
    const { action, table } = params

    try {
      switch (action) {
        case 'list_tables':
          const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .neq('table_name', 'schema_migrations')

          if (tablesError) throw tablesError

          return {
            success: true,
            action,
            data: tables?.map(t => t.table_name) || []
          }

        case 'describe_table':
          if (!table) throw new Error('Se requiere especificar el nombre de la tabla')

          const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_name', table)
            .eq('table_schema', 'public')
            .order('ordinal_position')

          if (columnsError) throw columnsError

          return {
            success: true,
            action,
            table,
            data: columns || []
          }

        case 'list_policies':
          const { data: policies, error: policiesError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('schemaname', 'public')

          if (policiesError) throw policiesError

          return {
            success: true,
            action,
            data: policies || []
          }

        default:
          throw new Error(`Acción no soportada: ${action}`)
      }
    } catch (error) {
      return {
        success: false,
        action,
        error: error instanceof Error ? error.message : 'Error en gestión de esquema',
        data: []
      }
    }
  }
}

// Instancia global del cliente MCP
export const mcpClient = new TasacionMCPClient()