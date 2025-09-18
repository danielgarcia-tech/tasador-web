import { useState } from 'react'
import { testDatabaseInitialization } from '../lib/test-database'
import { checkTableStructure, populateBasicData } from '../lib/database-init'

export default function DatabaseTestPanel() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async (testFunction: () => Promise<void>, testName: string) => {
    setIsRunning(true)
    setTestResults([`🚀 Ejecutando: ${testName}...`])

    // Capturar logs de consola
    const originalLog = console.log
    const originalError = console.error
    const logs: string[] = []

    console.log = (...args) => {
      logs.push(`📝 ${args.join(' ')}`)
      originalLog(...args)
    }

    console.error = (...args) => {
      logs.push(`❌ ${args.join(' ')}`)
      originalError(...args)
    }

    try {
      await testFunction()
      logs.push(`✅ ${testName} completado`)
    } catch (error) {
      logs.push(`❌ Error en ${testName}: ${error}`)
    }

    // Restaurar console
    console.log = originalLog
    console.error = originalError

    setTestResults(logs)
    setIsRunning(false)
  }

  const handleRunFullTest = () => runTest(testDatabaseInitialization, 'Pruebas Completas de Base de Datos')
  const handleCheckStructure = () => runTest(checkTableStructure, 'Verificación de Estructura de Tablas')
  const handlePopulateBasic = () => runTest(populateBasicData, 'Población de Datos Básicos')

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Panel de Pruebas de Base de Datos
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Verifica la inicialización y funcionamiento de la base de datos
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCheckStructure}
              disabled={isRunning}
              className="btn-secondary"
            >
              Verificar Estructura
            </button>
            <button
              onClick={handlePopulateBasic}
              disabled={isRunning}
              className="btn-secondary"
            >
              Datos Básicos
            </button>
            <button
              onClick={handleRunFullTest}
              disabled={isRunning}
              className="btn-primary"
            >
              {isRunning ? 'Ejecutando...' : 'Pruebas Completas'}
            </button>
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Resultados de las pruebas:
            </h3>
            <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`${
                    result.includes('✅') ? 'text-green-700' :
                    result.includes('❌') ? 'text-red-700' :
                    result.includes('📝') ? 'text-blue-700' :
                    result.includes('📍') ? 'text-purple-700' :
                    result.includes('🏢') ? 'text-indigo-700' :
                    result.includes('📊') ? 'text-orange-700' :
                    'text-gray-700'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900">Verificar Estructura</h4>
            <p className="text-sm text-blue-700 mt-1">
              Comprueba que las tablas existen y tienen la estructura correcta
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900">Datos Básicos</h4>
            <p className="text-sm text-green-700 mt-1">
              Inserta registros de prueba para verificar funcionamiento
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900">Pruebas Completas</h4>
            <p className="text-sm text-purple-700 mt-1">
              Ejecuta verificación, población y pruebas de búsqueda completas
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-900">Diagnóstico de Errores</h4>
            <p className="text-sm text-orange-700 mt-1">
              Muestra detalles completos de errores para facilitar solución
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">📋 Instrucciones para resolver errores:</h4>
          <ol className="text-sm text-yellow-800 space-y-1">
            <li><strong>Error 401 (Unauthorized):</strong> Ejecutar el archivo <code>supabase-policies.sql</code> en el SQL Editor de Supabase</li>
            <li><strong>Error 400 (Bad Request):</strong> Verificar la estructura de las tablas y columnas</li>
            <li><strong>Duplicados:</strong> El método alternativo maneja automáticamente los registros duplicados</li>
            <li><strong>Conexión:</strong> Verificar las credenciales de Supabase en el archivo de configuración</li>
          </ol>
        </div>
      </div>
    </div>
  )
}