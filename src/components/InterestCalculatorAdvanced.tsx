import { useState, useEffect, useRef } from 'react'
import { Calculator, TrendingUp, Upload, AlertCircle, Trash2 } from 'lucide-react'
import { interestCalculator, initializeInterestCalculator } from '../lib/interestCalculator'
import type { InterestCalculationInput, InterestCalculationResult } from '../lib/interestCalculator'
import * as XLSX from 'xlsx'
import CountUp from './CountUp'

interface ExcelRow {
  [key: string]: any
}

interface CalculationResult extends ExcelRow {
  cuantía: number
  fecha_inicio: string
  fecha_fin: string
  modalidad: 'legal' | 'judicial' | 'tae' | 'tae_plus5'
  tae_contrato?: number
  fecha_sentencia?: string
  resultado?: InterestCalculationResult
  error?: string
}

interface ColumnMapping {
  cuantía: string
  fecha_inicio: string
}

export default function InterestCalculatorAdvanced() {
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [excelData, setExcelData] = useState<ExcelRow[]>([])
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ cuantía: '', fecha_inicio: '' })
  const [globalModalidades, setGlobalModalidades] = useState<Array<'legal' | 'judicial' | 'tae' | 'tae_plus5'>>(['legal'])
  const [globalFechaFin, setGlobalFechaFin] = useState<string>('')
  const [globalTaeContrato, setGlobalTaeContrato] = useState<string>('')
  const [globalFechaSentencia, setGlobalFechaSentencia] = useState<string>('')
  const [results, setResults] = useState<CalculationResult[]>([])
  const [calculating, setCalculating] = useState(false)
  const [expandedModalities, setExpandedModalities] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      setExcelData([])
      setResults([])
      setAvailableColumns([])
      setColumnMapping({ cuantía: '', fecha_inicio: '' })

      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })

      // Get first worksheet
      const worksheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[worksheetName]

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      if (jsonData.length < 2) {
        throw new Error('El archivo debe contener al menos una fila de datos')
      }

      // Extract available columns from first row (headers)
      const headers = jsonData[0].map((h: any) => String(h || '').trim())
      const availableColumns = headers.filter(h => h.length > 0)

      if (availableColumns.length === 0) {
        throw new Error('No se encontraron columnas válidas en el archivo')
      }

      setAvailableColumns(availableColumns)

      // Convert data rows to objects using headers
      const dataRows: ExcelRow[] = []
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        const rowObj: ExcelRow = {}

        headers.forEach((header, index) => {
          if (header && header.trim()) {
            rowObj[header.trim()] = row[index] || ''
          }
        })

        // Only add rows that have at least one non-empty value
        if (Object.values(rowObj).some(val => val !== '')) {
          dataRows.push(rowObj)
        }
      }

      if (dataRows.length === 0) {
        throw new Error('No se encontraron datos válidos en el archivo')
      }

      setExcelData(dataRows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo')
      console.error('Error processing file:', err)
    }
  }

  const calculateAllInterests = async () => {
    if (!initialized || excelData.length === 0 || !columnMapping.cuantía || !columnMapping.fecha_inicio) {
      setError('Debe seleccionar las columnas de mapeo y subir un archivo')
      return
    }

    if (!globalFechaFin) {
      setError('Debe especificar la fecha fin')
      return
    }

    try {
      setCalculating(true)
      setError(null)

      const calculatedResults: CalculationResult[] = []

      for (const row of excelData) {
        try {
          // Get values using column mapping
          const cuantiaValue = row[columnMapping.cuantía]
          const fechaInicioValue = row[columnMapping.fecha_inicio]

          if (!cuantiaValue || !fechaInicioValue) {
            throw new Error('Faltan datos en la fila')
          }

          // Parse cuantía (handle both string and number)
          const capital = typeof cuantiaValue === 'number' 
            ? cuantiaValue 
            : parseFloat(String(cuantiaValue).replace(',', '.').replace(/[^\d.-]/g, ''))

          if (isNaN(capital) || capital <= 0) {
            // Skip rows with invalid or zero/negative amounts
            continue
          }

          // Calculate for each selected modality
          for (const modalidad of globalModalidades) {
            // Parse dates
            const parsedFechaInicio = parseDate(fechaInicioValue)
            const parsedFechaFin = parseDate(globalFechaFin)

            if (!parsedFechaInicio) {
              throw new Error(`Fecha inicio inválida: ${fechaInicioValue}`)
            }

            if (!parsedFechaFin) {
              throw new Error(`Fecha fin inválida: ${globalFechaFin}`)
            }

          const input: InterestCalculationInput = {
            capital,
            fechaInicio: parsedFechaInicio,
            fechaFin: parsedFechaFin,
            modalidad
          }

          // Add optional fields based on modality
          if ((modalidad === 'tae' || modalidad === 'tae_plus5') && globalTaeContrato) {
            input.taeContrato = parseFloat(globalTaeContrato)
          }

            if (modalidad === 'judicial' && globalFechaSentencia) {
              input.fechaSentencia = new Date(globalFechaSentencia)
            }

            const result = interestCalculator.calcularIntereses(input)

            calculatedResults.push({
              ...row,
              cuantía: capital,
              fecha_inicio: parsedFechaInicio.toISOString().split('T')[0],
              fecha_fin: parsedFechaFin.toISOString().split('T')[0],
              modalidad,
              tae_contrato: globalTaeContrato ? parseFloat(globalTaeContrato) : undefined,
              fecha_sentencia: globalFechaSentencia || undefined,
              resultado: result
            })
          }
        } catch (rowError) {
          console.warn('Error calculating row:', rowError)
          // For errors, add one entry per modality with error
          for (const modalidad of globalModalidades) {
            calculatedResults.push({
              ...row,
              cuantía: 0,
              fecha_inicio: '',
              fecha_fin: '',
              modalidad,
              error: rowError instanceof Error ? rowError.message : 'Error en el cálculo'
            })
          }
        }
      }

      setResults(calculatedResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular intereses')
      console.error('Error calculating interests:', err)
    } finally {
      setCalculating(false)
    }
  }

  const clearData = () => {
    setExcelData([])
    setResults([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const parseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null

    // If it's already a Date object
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue
    }

    // If it's a number (Excel serial date)
    if (typeof dateValue === 'number') {
      // Excel dates are days since 1900-01-01, but Excel incorrectly treats 1900 as leap year
      const excelEpoch = new Date(1900, 0, 1)
      const days = dateValue - 2 // Adjust for Excel's leap year bug
      return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000)
    }

    // If it's a string
    if (typeof dateValue === 'string') {
      // Try different formats
      const formats = [
        // DD/MM/YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        // DD-MM-YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        // YYYY/MM/DD
        /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
        // YYYY-MM-DD
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
        // DD/MM/YY
        /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
        // MM/DD/YYYY (US format)
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      ]

      for (const format of formats) {
        const match = dateValue.match(format)
        if (match) {
          let year: number, month: number, day: number
          if (format === formats[0] || format === formats[1] || format === formats[4]) {
            // DD/MM/YYYY or DD-MM-YYYY or DD/MM/YY
            day = parseInt(match[1])
            month = parseInt(match[2]) - 1 // JS months are 0-based
            year = parseInt(match[3])
            if (year < 100) year += 2000 // YY to YYYY
          } else if (format === formats[2] || format === formats[3]) {
            // YYYY/MM/DD or YYYY-MM-DD
            year = parseInt(match[1])
            month = parseInt(match[2]) - 1
            day = parseInt(match[3])
          } else {
            // MM/DD/YYYY - assume US format
            month = parseInt(match[1]) - 1
            day = parseInt(match[2])
            year = parseInt(match[3])
          }

          const date = new Date(year, month, day)
          if (!isNaN(date.getTime())) {
            return date
          }
        }
      }

      // Try native Date parsing as last resort
      const nativeDate = new Date(dateValue)
      if (!isNaN(nativeDate.getTime())) {
        return nativeDate
      }
    }

    return null
  }

  const formatCurrency = (amount: number) => {
    // Redondear a 2 decimales antes de formatear
    const roundedAmount = Math.round(amount * 100) / 100
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(roundedAmount)
  }

  const formatDate = (dateString: string) => {
    const parsed = parseDate(dateString)
    if (parsed) {
      return parsed.toLocaleDateString('es-ES')
    }
    return 'Fecha inválida'
  }

  interface AnimatedCurrencyProps {
    amount: number
    duration?: number
    className?: string
  }

  function AnimatedCurrency({ amount, duration = 1, className = '' }: AnimatedCurrencyProps) {
    // Redondear a 2 decimales antes de animar
    const roundedAmount = Math.round(amount * 100) / 100
    return (
      <CountUp
        to={roundedAmount}
        duration={duration}
        separator="."
        prefix="€"
        className={className}
      />
    )
  }

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new()

    globalModalidades.forEach(modalidad => {
      const modalityResults = results.filter(r => r.modalidad === modalidad)
      const data = modalityResults.map(result => ({
        'Cuantía': result.cuantía,
        'Fecha Inicio': result.fecha_inicio,
        'Fecha Fin': result.fecha_fin,
        'Modalidad': result.modalidad,
        'TAE Contrato': result.tae_contrato || '',
        'Fecha Sentencia': result.fecha_sentencia || '',
        'Total Intereses': result.resultado?.totalInteres || 0,
        'Estado': result.error ? result.error : 'Calculado'
      }))

      const worksheet = XLSX.utils.json_to_sheet(data)
      const sheetName = modalidad === 'legal' ? 'Legal' :
                       modalidad === 'judicial' ? 'Judicial' :
                       modalidad === 'tae' ? 'TAE' : 'TAE+5%'
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    })

    XLSX.writeFile(workbook, 'resultados_calculo_intereses.xlsx')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Cargando calculador...</span>
        </div>
      </div>
    )
  }

  if (error && !initialized) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">CALCULADOR DE INTERESES</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Carga un archivo Excel/CSV con múltiples cuantías y calcula intereses legales, judiciales y TAE según la legislación española.
        </p>

        {/* File Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Selecciona cualquier archivo Excel/CSV. Podrás mapear las columnas después de cargarlo.
              </p>
              <p className="text-xs text-gray-500">
                Formatos soportados: .xlsx, .xls, .csv
              </p>
            </div>
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Archivo
              </label>
            </div>
          </div>
        </div>

        {/* Column Mapping Section */}
        {availableColumns.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Mapeo de Columnas</h3>
            <p className="text-blue-700 mb-4">
              Selecciona qué columnas de tu Excel corresponden a los campos requeridos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Columna de Cuantía *
                </label>
                <select
                  value={columnMapping.cuantía}
                  onChange={(e) => setColumnMapping(prev => ({ ...prev, cuantía: e.target.value }))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar columna...</option>
                  {availableColumns.map((col, index) => (
                    <option key={index} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Columna de Fecha Inicio *
                </label>
                <select
                  value={columnMapping.fecha_inicio}
                  onChange={(e) => setColumnMapping(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar columna...</option>
                  {availableColumns.map((col, index) => (
                    <option key={index} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>

            <h4 className="text-md font-semibold text-blue-900 mb-4">Parámetros Globales de Cálculo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Modalidades *
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'legal' as const, label: 'Legal' },
                    { value: 'judicial' as const, label: 'Judicial' },
                    { value: 'tae' as const, label: 'TAE' },
                    { value: 'tae_plus5' as const, label: 'TAE + 5%' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={globalModalidades.includes(value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGlobalModalidades([...globalModalidades, value])
                          } else {
                            setGlobalModalidades(globalModalidades.filter(m => m !== value))
                          }
                        }}
                        className="mr-2"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Fecha Fin *
                </label>
                <input
                  type="date"
                  value={globalFechaFin}
                  onChange={(e) => setGlobalFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {(globalModalidades.includes('tae') || globalModalidades.includes('tae_plus5')) && (
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    TAE Contrato (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={globalTaeContrato}
                    onChange={(e) => setGlobalTaeContrato(e.target.value)}
                    placeholder="5.25"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {globalModalidades.includes('judicial') && (
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Fecha Sentencia
                  </label>
                  <input
                    type="date"
                    value={globalFechaSentencia}
                    onChange={(e) => setGlobalFechaSentencia(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Data Preview */}
        {excelData.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Datos Cargados ({excelData.length} filas)
                </h3>
                {columnMapping.cuantía && columnMapping.fecha_inicio && (
                  <p className="text-sm text-gray-600 mt-1">
                    Mapeo aplicado: <span className="font-medium text-blue-600">"{columnMapping.cuantía}" → Cuantía</span>, 
                    <span className="font-medium text-blue-600 ml-1">"{columnMapping.fecha_inicio}" → Fecha Inicio</span>
                  </p>
                )}
              </div>
              <div className="space-x-2">
                <button
                  onClick={calculateAllInterests}
                  disabled={calculating || !initialized || !columnMapping.cuantía || !columnMapping.fecha_inicio || !globalFechaFin}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {calculating ? 'Calculando...' : 'Calcular Todos'}
                </button>
                <button
                  onClick={clearData}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {availableColumns.map((col, index) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {col}
                        {col === columnMapping.cuantía && <span className="ml-1 text-blue-600">→ Cuantía</span>}
                        {col === columnMapping.fecha_inicio && <span className="ml-1 text-blue-600">→ Fecha Inicio</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {excelData.slice(0, 5).map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {availableColumns.map((col, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {col === columnMapping.cuantía && row[col] ? formatCurrency(Number(row[col])) : (row[col] || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {excelData.length > 5 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Mostrando las primeras 5 filas de {excelData.length} totales
                </p>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Resultados del Cálculo
              </h3>
              <button
                onClick={exportToExcel}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Exportar a Excel
              </button>
            </div>

            {globalModalidades.map(modalidad => {
              const modalityResults = results.filter(r => r.modalidad === modalidad)
              const isExpanded = expandedModalities.has(modalidad)
              const displayResults = isExpanded ? modalityResults : modalityResults.slice(0, 5)

              return (
                <div key={modalidad} className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-semibold text-gray-800">
                      {modalidad === 'legal' ? 'Legal' :
                       modalidad === 'judicial' ? 'Judicial' :
                       modalidad === 'tae' ? 'TAE' : 'TAE+5%'} 
                      ({modalityResults.length} cálculos)
                    </h4>
                    {modalityResults.length > 5 && (
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedModalities)
                          if (isExpanded) {
                            newExpanded.delete(modalidad)
                          } else {
                            newExpanded.add(modalidad)
                          }
                          setExpandedModalities(newExpanded)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {isExpanded ? 'Mostrar menos' : `Mostrar todos (${modalityResults.length})`}
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cuantía
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Período
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Intereses
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {displayResults.map((result, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(result.cuantía)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(result.fecha_inicio)} - {formatDate(result.fecha_fin)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {result.resultado ? <AnimatedCurrency amount={result.resultado.totalInteres} duration={1} /> : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {result.error ? (
                                <span className="text-red-600 text-xs">{result.error}</span>
                              ) : (
                                <span className="text-green-600 text-xs">✓ Calculado</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}

            {/* Summary */}
            <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-primary-900 mb-2">Resumen</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <CountUp
                    to={results.filter(r => r.resultado).length}
                    duration={1}
                    className="text-2xl font-bold text-green-700"
                  />
                  <p className="text-sm text-primary-600">Cálculos exitosos</p>
                </div>
                <div className="text-center">
                  <AnimatedCurrency
                    amount={results.reduce((sum, r) => sum + (r.resultado?.totalInteres || 0), 0)}
                    duration={1.5}
                    className="text-3xl font-bold text-green-800"
                  />
                  <p className="text-sm text-primary-600">Total intereses</p>
                </div>
                <div className="text-center">
                  <CountUp
                    to={results.filter(r => r.error).length}
                    duration={1}
                    className="text-3xl font-bold text-green-800"
                  />
                  <p className="text-sm text-primary-600">Errores</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}