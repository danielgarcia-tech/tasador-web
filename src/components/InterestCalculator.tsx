import { useState, useEffect } from 'react'
import { Calculator, Calendar, Euro, TrendingUp, AlertCircle } from 'lucide-react'
import { interestCalculator, initializeInterestCalculator } from '../lib/interestCalculator'
import type { InterestCalculationInput, InterestCalculationResult } from '../lib/interestCalculator'

interface InterestCalculatorProps {
  className?: string
}

export default function InterestCalculatorComponent({ className = '' }: InterestCalculatorProps) {
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [capital, setCapital] = useState<string>('')
  const [fechaInicio, setFechaInicio] = useState<string>('')
  const [fechaFin, setFechaFin] = useState<string>('')
  const [modalidad, setModalidad] = useState<'legal' | 'judicial' | 'tae' | 'tae_plus5'>('legal')
  const [taeContrato, setTaeContrato] = useState<string>('')
  const [fechaSentencia, setFechaSentencia] = useState<string>('')

  // Result state
  const [resultado, setResultado] = useState<InterestCalculationResult | null>(null)
  const [calculating, setCalculating] = useState(false)

  // Initialize calculator
  useEffect(() => {
    const initCalculator = async () => {
      try {
        await initializeInterestCalculator()
        setInitialized(true)
        setLoading(false)
      } catch (err) {
        setError('Error al inicializar el calculador de intereses')
        setLoading(false)
        console.error('Error initializing interest calculator:', err)
      }
    }

    initCalculator()
  }, [])

  const handleCalculate = async () => {
    if (!initialized) return

    try {
      setCalculating(true)
      setError(null)

      // Validate inputs
      const capitalNum = parseFloat(capital.replace(',', '.'))
      if (isNaN(capitalNum) || capitalNum <= 0) {
        throw new Error('El capital debe ser un número positivo')
      }

      if (!fechaInicio || !fechaFin) {
        throw new Error('Las fechas de inicio y fin son obligatorias')
      }

      const fechaInicioDate = new Date(fechaInicio)
      const fechaFinDate = new Date(fechaFin)

      if (fechaInicioDate >= fechaFinDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
      }

      const input: InterestCalculationInput = {
        capital: capitalNum,
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        modalidad
      }

      // Add optional fields
      if (modalidad === 'tae' || modalidad === 'tae_plus5') {
        const taeNum = parseFloat(taeContrato.replace(',', '.'))
        if (isNaN(taeNum) || taeNum <= 0) {
          throw new Error('El TAE del contrato debe ser un número positivo')
        }
        input.taeContrato = taeNum
      }

      if (modalidad === 'judicial' && fechaSentencia) {
        input.fechaSentencia = new Date(fechaSentencia)
      }

      const result = interestCalculator.calcularIntereses(input)
      setResultado(result)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular intereses')
      setResultado(null)
    } finally {
      setCalculating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Cargando calculador...</span>
        </div>
      </div>
    )
  }

  if (error && !initialized) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">CALCULADOR DE INTERESES</h2>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Calcule intereses legales, judiciales y TAE según la legislación española
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Capital */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capital (€)
            </label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                placeholder="0,00"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Modalidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modalidad
            </label>
            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value as typeof modalidad)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="legal">Interés Legal</option>
              <option value="judicial">Interés Judicial</option>
              <option value="tae">TAE Contrato</option>
              <option value="tae_plus5">TAE + 5%</option>
            </select>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* TAE Contrato (solo para modalidades TAE) */}
          {(modalidad === 'tae' || modalidad === 'tae_plus5') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TAE Contrato (%)
              </label>
              <input
                type="text"
                value={taeContrato}
                onChange={(e) => setTaeContrato(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}

          {/* Fecha Sentencia (solo para judicial) */}
          {modalidad === 'judicial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Sentencia
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={fechaSentencia}
                  onChange={(e) => setFechaSentencia(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Calculate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCalculate}
            disabled={calculating || !initialized}
            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Calculator className="h-4 w-4" />
            <span>{calculating ? 'Calculando...' : 'Calcular Intereses'}</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {resultado && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultado del Cálculo</h3>

            {/* Total Interest */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-primary-600 font-medium">TOTAL INTERESES</p>
                <p className="text-3xl font-bold text-primary-700">
                  {formatCurrency(resultado.totalInteres)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Sobre capital de {formatCurrency(parseFloat(capital.replace(',', '.')) || 0)}
                </p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Días
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa (%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interés (€)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resultado.detallePorAño.map((detalle, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {detalle.año}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detalle.dias}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(detalle.tasa * 100).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          detalle.tipo === 'legal' ? 'bg-blue-100 text-blue-800' :
                          detalle.tipo === 'judicial' ? 'bg-green-100 text-green-800' :
                          detalle.tipo === 'tae' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {detalle.tipo === 'legal' ? 'Legal' :
                           detalle.tipo === 'judicial' ? 'Judicial' :
                           detalle.tipo === 'tae' ? 'TAE' : 'TAE+5%'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(detalle.interes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}