import { useState } from 'react'
import { useMCPTasacion } from '../hooks/useMCPTasacion'
import { Database, Search, Calculator, AlertTriangle, CheckCircle, XCircle, TestTube } from 'lucide-react'
import { runMCPTests } from '../lib/mcp-tester'
import type { MCPTestResult } from '../lib/mcp-tester'
import { diagnoseDatabaseIssues } from '../lib/mcp-diagnosis'

export default function MCPControlPanel() {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'queries' | 'tools' | 'tests'>('diagnostics')
  const [queryResult, setQueryResult] = useState<any>(null)
  const [sqlQuery, setSqlQuery] = useState('')
  const [testResults, setTestResults] = useState<MCPTestResult[]>([])
  const [testSummary, setTestSummary] = useState<any>(null)

  const {
    isLoading,
    diagnostics,
    runDiagnostics,
    queryTable,
    executeSQL
  } = useMCPTasacion()

  const handleRunQuery = async (tableName: string) => {
    const result = await queryTable(tableName, { limit: 5 })
    setQueryResult(result)
  }

  const handleExecuteSQL = async () => {
    if (!sqlQuery.trim()) return
    const result = await executeSQL(sqlQuery)
    setQueryResult(result)
  }

  const handleRunFullDiagnosis = async () => {
    try {
      await diagnoseDatabaseIssues()
    } catch (error) {
      console.error('Error en diagnóstico completo:', error)
    }
  }

  const handleRunTests = async () => {
    try {
      const { results, summary } = await runMCPTests()
      setTestResults(results)
      setTestSummary(summary)
    } catch (error) {
      console.error('Error ejecutando pruebas MCP:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Database className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Database className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Panel de Control MCP
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'diagnostics', label: 'Diagnóstico', icon: AlertTriangle },
            { id: 'queries', label: 'Consultas', icon: Search },
            { id: 'tools', label: 'Herramientas', icon: Calculator },
            { id: 'tests', label: 'Pruebas', icon: TestTube }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Diagnóstico de Base de Datos</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRunFullDiagnosis}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Diagnosticando...' : 'Diagnóstico Completo MCP'}
                  </button>
                  <button
                    onClick={runDiagnostics}
                    disabled={isLoading}
                    className="btn-secondary"
                  >
                    {isLoading ? 'Ejecutando...' : 'Diagnóstico Básico'}
                  </button>
                </div>
              </div>

              {diagnostics && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    {getStatusIcon(diagnostics.overallStatus)}
                    <div>
                      <div className="font-medium text-gray-900">
                        Estado General: {diagnostics.overallStatus === 'healthy' ? 'Saludable' :
                                       diagnostics.overallStatus === 'warning' ? 'Advertencias' :
                                       'Problemas'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Última verificación: {new Date().toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {diagnostics.tableStatus && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(diagnostics.tableStatus).map(([table, status]: [string, any]) => (
                        <div key={table} className="p-3 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(status.status)}
                            <span className="font-medium text-sm">{table}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Registros: {status.count || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {diagnostics.recommendations && diagnostics.recommendations.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Recomendaciones</h4>
                      <ul className="space-y-1">
                        {diagnostics.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-sm text-blue-800 flex items-start space-x-2">
                            <span>•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Consultas a Tablas</h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['municipios', 'entidades', 'criterios_ica', 'tasaciones'].map((table) => (
                  <button
                    key={table}
                    onClick={() => handleRunQuery(table)}
                    disabled={isLoading}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-sm capitalize">{table}</div>
                    <div className="text-xs text-gray-500">Ver primeros 5 registros</div>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Consulta SQL Personalizada</h4>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="SELECT * FROM municipios LIMIT 5;"
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={handleExecuteSQL}
                  disabled={isLoading || !sqlQuery.trim()}
                  className="btn-primary"
                >
                  {isLoading ? 'Ejecutando...' : 'Ejecutar SQL'}
                </button>
              </div>

              {queryResult && (
                <div className="p-4 bg-gray-50 border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Resultado de la Consulta</h4>
                  <div className="text-sm">
                    {queryResult.success ? (
                      <div>
                        <div className="text-green-600 mb-2">✅ Consulta exitosa</div>
                        {queryResult.data && Array.isArray(queryResult.data) && (
                          <div className="space-y-2">
                            {queryResult.data.slice(0, 3).map((row: any, i: number) => (
                              <div key={i} className="p-2 bg-white border rounded text-xs">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(row, null, 2)}
                                </pre>
                              </div>
                            ))}
                            {queryResult.data.length > 3 && (
                              <div className="text-gray-500 text-xs">
                                ... y {queryResult.data.length - 3} registros más
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-600">
                        ❌ Error: {queryResult.error || 'Error desconocido'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Herramientas MCP Disponibles</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-300 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Search className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Búsqueda Inteligente</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Búsqueda de entidades por código o nombre</div>
                    <div>• Búsqueda de municipios con criterios ICA</div>
                    <div>• Sugerencias automáticas basadas en contexto</div>
                  </div>
                </div>

                <div className="p-4 border border-gray-300 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calculator className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Cálculos Inteligentes</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Cálculo automático de costas judiciales</div>
                    <div>• Recomendaciones basadas en historial</div>
                    <div>• Validación de datos en tiempo real</div>
                  </div>
                </div>

                <div className="p-4 border border-gray-300 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Database className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Gestión de Datos</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Consultas avanzadas a tablas</div>
                    <div>• Ejecución de SQL personalizado</div>
                    <div>• Gestión de esquemas de BD</div>
                  </div>
                </div>

                <div className="p-4 border border-gray-300 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Diagnóstico</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Verificación de estructura de tablas</div>
                    <div>• Análisis de políticas RLS</div>
                    <div>• Detección de problemas de integridad</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Estado del Servidor MCP</h4>
                <div className="flex items-center space-x-2 text-sm text-blue-800">
                  <CheckCircle className="h-4 w-4" />
                  <span>Servidor supabase-tasador activo y funcionando</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Pruebas del Sistema MCP</h3>
                <button
                  onClick={handleRunTests}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Ejecutando Pruebas...' : 'Ejecutar Todas las Pruebas'}
                </button>
              </div>

              {testSummary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{testSummary.total}</div>
                    <div className="text-sm text-blue-800">Total</div>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{testSummary.passed}</div>
                    <div className="text-sm text-green-800">Aprobadas</div>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{testSummary.failed}</div>
                    <div className="text-sm text-red-800">Fallidas</div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-600">{testSummary.averageDuration.toFixed(0)}ms</div>
                    <div className="text-sm text-gray-800">Tiempo Promedio</div>
                  </div>
                </div>
              )}

              {testResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Resultados Detallados</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div key={index} className={`p-3 border rounded-lg ${
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {result.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-medium text-sm">{result.testName}</span>
                          </div>
                          <span className="text-xs text-gray-500">{result.duration}ms</span>
                        </div>
                        {result.result && (
                          <div className="text-sm text-gray-700">{result.result}</div>
                        )}
                        {result.error && (
                          <div className="text-sm text-red-700 mt-1">{result.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testResults.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Haz clic en "Ejecutar Todas las Pruebas" para comenzar</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}