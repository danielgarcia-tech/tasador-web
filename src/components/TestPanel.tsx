import { useState } from 'react'
import { runAllTests } from '../lib/tests'
import { buscarEntidades, buscarEntidadPorCodigo } from '../lib/entidades'
import { buscarMunicipios, buscarMunicipioPorNombre, obtenerCriteriosICA } from '../lib/municipios'
import { calcularCostas } from '../lib/calculator'

export default function TestPanel() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [entidadTest, setEntidadTest] = useState('')
  const [municipioTest, setMunicipioTest] = useState('')
  const [entidadResult, setEntidadResult] = useState<any>(null)
  const [municipioResult, setMunicipioResult] = useState<any>(null)
  const [criteriosResult, setCriteriosResult] = useState<any[]>([])
  const [calculoResult, setCalculoResult] = useState<any>(null)

  const handleRunTests = async () => {
    setIsRunning(true)
    setTestResults(['🚀 Iniciando pruebas...'])

    // Capturar logs de consola
    const originalLog = console.log
    const originalError = console.error
    const logs: string[] = []

    console.log = (...args) => {
      logs.push(args.join(' '))
      originalLog(...args)
    }

    console.error = (...args) => {
      logs.push(`❌ ${args.join(' ')}`)
      originalError(...args)
    }

    try {
      const success = await runAllTests()
      logs.push(success ? '✅ Todas las pruebas completadas exitosamente' : '❌ Algunas pruebas fallaron')
    } catch (error) {
      logs.push(`❌ Error ejecutando pruebas: ${error}`)
    }

    // Restaurar console
    console.log = originalLog
    console.error = originalError

    setTestResults(logs)
    setIsRunning(false)
  }

  const testEntidad = async () => {
    if (!entidadTest.trim()) return

    try {
      const resultados = await buscarEntidades(entidadTest)
      setEntidadResult(resultados)

      const entidadEspecifica = await buscarEntidadPorCodigo(entidadTest.toUpperCase())
      console.log('Entidad específica:', entidadEspecifica)
    } catch (error) {
      console.error('Error probando entidad:', error)
    }
  }

  const testMunicipio = async () => {
    if (!municipioTest.trim()) return

    try {
      const resultados = await buscarMunicipios(municipioTest)
      setMunicipioResult(resultados)

      const municipioEspecifico = await buscarMunicipioPorNombre(municipioTest)
      console.log('Municipio específico:', municipioEspecifico)
    } catch (error) {
      console.error('Error probando municipio:', error)
    }
  }

  const testCriterios = async () => {
    try {
      const criterios = await obtenerCriteriosICA()
      setCriteriosResult(criterios)
    } catch (error) {
      console.error('Error obteniendo criterios:', error)
    }
  }

  const testCalculo = async () => {
    try {
      const resultado = calcularCostas({
        criterioICA: 'Madrid',
        tipoJuicio: 'Juicio Ordinario',
        faseTerminacion: 'Juicio',
        instancia: 'PRIMERA INSTANCIA'
      })
      setCalculoResult(resultado)
    } catch (error) {
      console.error('Error en cálculo:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Panel de Pruebas Avanzado
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Pruebas específicas de búsqueda y cálculo
            </p>
          </div>
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="btn-primary"
          >
            {isRunning ? 'Ejecutando...' : 'Ejecutar Todas las Pruebas'}
          </button>
        </div>

        {/* Pruebas de Entidades */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Prueba de Búsqueda de Entidades</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={entidadTest}
              onChange={(e) => setEntidadTest(e.target.value)}
              placeholder="Buscar entidad..."
              className="input flex-1"
            />
            <button onClick={testEntidad} className="btn-secondary">
              Buscar
            </button>
          </div>
          {entidadResult && (
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Resultados:</strong> {entidadResult.length} entidades encontradas
              {entidadResult.slice(0, 3).map((ent: any, i: number) => (
                <div key={i} className="mt-1">
                  {ent.codigo} - {ent.nombre}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pruebas de Municipios */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Prueba de Búsqueda de Municipios</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={municipioTest}
              onChange={(e) => setMunicipioTest(e.target.value)}
              placeholder="Buscar municipio..."
              className="input flex-1"
            />
            <button onClick={testMunicipio} className="btn-secondary">
              Buscar
            </button>
          </div>
          {municipioResult && (
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Resultados:</strong> {municipioResult.length} municipios encontrados
              {municipioResult.slice(0, 3).map((mun: any, i: number) => (
                <div key={i} className="mt-1">
                  {mun.municipio} ({mun.criterio_ica}) - {mun.provincia}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pruebas de Criterios ICA */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Prueba de Criterios ICA</h3>
          <button onClick={testCriterios} className="btn-secondary mb-3">
            Obtener Criterios ICA
          </button>
          {criteriosResult.length > 0 && (
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Criterios encontrados:</strong> {criteriosResult.length}
              {criteriosResult.slice(0, 5).map((crit: any, i: number) => (
                <div key={i} className="mt-1">
                  {crit.provincia} - {crit.criterio_ica}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pruebas de Cálculo */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Prueba de Cálculo de Costas</h3>
          <button onClick={testCalculo} className="btn-secondary mb-3">
            Calcular Costas de Prueba
          </button>
          {calculoResult && (
            <div className="bg-green-50 p-3 rounded text-sm">
              <strong>Resultado del cálculo:</strong>
              <div>Costas: €{calculoResult.costas}</div>
              <div>IVA: €{calculoResult.iva}</div>
              <div>Total: €{calculoResult.total}</div>
            </div>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Resultados de las pruebas completas:
            </h3>
            <div className="space-y-1 font-mono text-sm max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`${
                    result.includes('✅') ? 'text-green-700' :
                    result.includes('❌') ? 'text-red-700' :
                    result.includes('🧪') ? 'text-blue-700' :
                    'text-gray-700'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900">Búsqueda de Entidades</h4>
            <p className="text-sm text-blue-700 mt-1">
              Búsqueda optimizada por código y nombre completo
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900">Búsqueda de Municipios</h4>
            <p className="text-sm text-green-700 mt-1">
              Búsqueda por nombre con criterios ICA asociados
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900">Cálculo de Costas</h4>
            <p className="text-sm text-purple-700 mt-1">
              Cálculo preciso con datos de base de datos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}