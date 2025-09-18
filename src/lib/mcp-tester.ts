import { mcpClient } from '../lib/mcp-client'

export interface MCPTestResult {
  testName: string
  success: boolean
  duration: number
  result?: any
  error?: string
}

export class MCPTester {
  private results: MCPTestResult[] = []

  async runAllTests(): Promise<MCPTestResult[]> {
    this.results = []

    console.log('🚀 Iniciando pruebas del sistema MCP...')

    // Test 1: Verificar conexión MCP
    await this.testConnection()

    // Test 2: Verificar herramientas disponibles
    await this.testAvailableTools()

    // Test 3: Probar consulta a tabla municipios
    await this.testQueryMunicipios()

    // Test 4: Probar consulta a tabla entidades
    await this.testQueryEntidades()

    // Test 5: Probar búsqueda inteligente
    await this.testSearchEntities()

    // Test 6: Probar cálculo inteligente
    await this.testCalculateCostas()

    // Test 7: Probar diagnóstico de BD
    await this.testDatabaseDiagnostics()

    console.log('✅ Pruebas completadas')
    return this.results
  }

  private async testConnection(): Promise<void> {
    const startTime = Date.now()
    try {
      const result = await mcpClient.executeTool('list_tables', {})
      const duration = Date.now() - startTime

      this.results.push({
        testName: 'Conexión MCP',
        success: result.success,
        duration,
        result: result.success ? 'Conexión exitosa' : result.error
      })
    } catch (error) {
      this.results.push({
        testName: 'Conexión MCP',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  private async testAvailableTools(): Promise<void> {
    const startTime = Date.now()
    try {
      const result = await mcpClient.executeTool('list_tools', {})
      const duration = Date.now() - startTime

      this.results.push({
        testName: 'Herramientas disponibles',
        success: result.success,
        duration,
        result: result.tools ? `${result.tools.length} herramientas` : 'Sin herramientas'
      })
    } catch (error) {
      this.results.push({
        testName: 'Herramientas disponibles',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  private async testQueryMunicipios(): Promise<void> {
    const startTime = Date.now()
    try {
      const result = await mcpClient.executeTool('query_table_mcp', {
        table: 'municipios',
        columns: ['municipio', 'criterio_ica'],
        limit: 5
      })
      const duration = Date.now() - startTime

      this.results.push({
        testName: 'Consulta municipios',
        success: result.success && result.data && result.data.length > 0,
        duration,
        result: result.success ? `${result.data.length} registros encontrados` : result.error
      })
    } catch (error) {
      this.results.push({
        testName: 'Consulta municipios',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  private async testQueryEntidades(): Promise<void> {
    const startTime = Date.now()
    try {
      const result = await mcpClient.executeTool('query_table_mcp', {
        table: 'entidades',
        columns: ['codigo', 'nombre'],
        limit: 5
      })
      const duration = Date.now() - startTime

      this.results.push({
        testName: 'Consulta entidades',
        success: result.success && result.data && result.data.length > 0,
        duration,
        result: result.success ? `${result.data.length} registros encontrados` : result.error
      })
    } catch (error) {
      this.results.push({
        testName: 'Consulta entidades',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  private async testSearchEntities(): Promise<void> {
    const startTime = Date.now()
    try {
      const result = await mcpClient.executeTool('search_entidades', {
        query: 'admin',
        limit: 3
      })
      const duration = Date.now() - startTime

      this.results.push({
        testName: 'Búsqueda entidades',
        success: result.success,
        duration,
        result: result.success ? `${result.results?.length || 0} resultados` : result.error
      })
    } catch (error) {
      this.results.push({
        testName: 'Búsqueda entidades',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  private async testCalculateCostas(): Promise<void> {
    const startTime = Date.now()
    try {
      const result = await mcpClient.executeTool('calculate_costas_smart', {
        municipio: 'Madrid',
        tipoJuicio: 'Juicio Ordinario',
        faseTerminacion: 'Juicio',
        instancia: 'PRIMERA INSTANCIA'
      })
      const duration = Date.now() - startTime

      this.results.push({
        testName: 'Cálculo costas',
        success: result.success,
        duration,
        result: result.success ? `Cálculo: €${result.calculo?.total || 0}` : result.error
      })
    } catch (error) {
      this.results.push({
        testName: 'Cálculo costas',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  private async testDatabaseDiagnostics(): Promise<void> {
    const startTime = Date.now()
    try {
      const result = await mcpClient.executeTool('diagnose_database', {
        checkTables: true,
        checkData: true
      })
      const duration = Date.now() - startTime

      this.results.push({
        testName: 'Diagnóstico BD',
        success: result.success,
        duration,
        result: result.success ? `Estado: ${result.overallStatus}` : result.error
      })
    } catch (error) {
      this.results.push({
        testName: 'Diagnóstico BD',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  getTestSummary(): {
    total: number
    passed: number
    failed: number
    averageDuration: number
  } {
    const total = this.results.length
    const passed = this.results.filter(r => r.success).length
    const failed = total - passed
    const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total

    return { total, passed, failed, averageDuration }
  }

  getResults(): MCPTestResult[] {
    return this.results
  }
}

// Función de utilidad para ejecutar pruebas desde el panel de control
export async function runMCPTests(): Promise<{
  results: MCPTestResult[]
  summary: {
    total: number
    passed: number
    failed: number
    averageDuration: number
  }
}> {
  const tester = new MCPTester()
  const results = await tester.runAllTests()
  const summary = tester.getTestSummary()

  return { results, summary }
}