import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Calculator, TrendingUp, Upload, AlertCircle, Trash2, BarChart3, Download, X, RefreshCw, Plus } from 'lucide-react'
import { interestCalculator, initializeInterestCalculator } from '../lib/interestCalculator'
import type { InterestCalculationInput, InterestCalculationResult } from '../lib/interestCalculator'
import * as XLSX from 'xlsx'
import CountUp from './CountUp'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}

// Extender Window para incluir gc (Garbage Collector)
declare global {
  interface Window {
    gc?: () => void
  }
}
import html2canvas from 'html2canvas'
import logoRua from '../assets/logo-rua.png'

interface ExcelRow {
  [key: string]: any
}

interface CalculationResult extends ExcelRow {
  cuantía: number
  cuantías_desglosadas?: Record<string, number> // Guardar cuantías individuales por columna
  columna_cuantía?: string // La columna específica de cuantía para este resultado
  fecha_inicio: string
  fecha_fin: string
  modalidad: 'legal' | 'judicial' | 'tae' | 'tae_plus5'
  tae_contrato?: number
  fecha_sentencia?: string
  concepto?: string
  resultado?: InterestCalculationResult
  error?: string
}

interface ColumnMapping {
  cuantías: string[] // Array para múltiples columnas de cuantía
  fecha_inicio: string
  concepto?: string
}

export default function InterestCalculatorAdvanced() {
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [excelData, setExcelData] = useState<ExcelRow[]>([])
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ cuantías: [''], fecha_inicio: '', concepto: '' })
  const [globalModalidades, setGlobalModalidades] = useState<Array<'legal' | 'judicial' | 'tae' | 'tae_plus5'>>(['legal'])
  const [globalFechaFin, setGlobalFechaFin] = useState<string>('')
  const [globalTaeContrato, setGlobalTaeContrato] = useState<string>('')
  const [globalFechaSentencia, setGlobalFechaSentencia] = useState<string>('')
  const [results, setResults] = useState<CalculationResult[]>([])
  const [calculating, setCalculating] = useState(false)
  const [expandedModalities, setExpandedModalities] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados para personalización del informe
  const [reportTitle, setReportTitle] = useState<string>('INFORME DE CÁLCULOS DE INTERESES')
  const [reportSubtitle, setReportSubtitle] = useState<string>('DE INTERESES')
  const [reportNotes, setReportNotes] = useState<string>('')
  const [reportAdditionalInfo, setReportAdditionalInfo] = useState<string>('')
  const [reportFooter, setReportFooter] = useState<string>('Departamento de Ejecuciones y Tasaciones - RUA ABOGADOS')
  const [showReportCustomization, setShowReportCustomization] = useState<boolean>(false)
  const [reportTemplates, setReportTemplates] = useState<Array<{name: string, config: any}>>([])
  const [templateName, setTemplateName] = useState<string>('')
  const [isResetting, setIsResetting] = useState<boolean>(false)
  const [calculationProgress, setCalculationProgress] = useState<number>(0)
  const [calculationStatus, setCalculationStatus] = useState<string>('')
  
  // Estados para controlar secciones del informe
  const [includeResultadoPorModalidad, setIncludeResultadoPorModalidad] = useState<boolean>(true)
  const [includeTablaResumen, setIncludeTablaResumen] = useState<boolean>(true)
  const [includeDetalleCalculo, setIncludeDetalleCalculo] = useState<boolean>(true)
  const [includeResumenVisual, setIncludeResumenVisual] = useState<boolean>(true)
  const [includeMetodologia, setIncludeMetodologia] = useState<boolean>(true)
  
  // Estados para modal de configuración del PDF
  const [showPdfConfigModal, setShowPdfConfigModal] = useState<boolean>(false)
  const [numeroProcedimiento, setNumeroProcedimiento] = useState<string>('')
  const [nombreExpedienteTemp, setNombreExpedienteTemp] = useState<string>('')

  // Función para reset completo de la calculadora
  const resetCalculator = useCallback(() => {
    setIsResetting(true)
    
    // Limpiar todos los estados
    setExcelData([])
    setResults([])
    setError(null)
    setAvailableColumns([])
    setColumnMapping({ cuantías: [''], fecha_inicio: '', concepto: '' })
    setGlobalModalidades(['legal'])
    setGlobalFechaFin('')
    setGlobalTaeContrato('')
    setGlobalFechaSentencia('')
    setExpandedModalities(new Set())
    setCalculating(false)
    
    // Limpiar input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    // Resetear configuración de informes
    setReportTitle('INFORME DE CÁLCULOS DE INTERESES')
    setReportSubtitle('DE INTERESES')
    setReportNotes('')
    setReportAdditionalInfo('')
    setReportFooter('Sistema de Cálculo de Intereses Legales - Tasador Web v2.0')
    setShowReportCustomization(false)
    setIncludeResultadoPorModalidad(true)
    setIncludeTablaResumen(true)
    setIncludeDetalleCalculo(true)
    setIncludeResumenVisual(true)
    setIncludeMetodologia(true)
    setShowPdfConfigModal(false)
    setNumeroProcedimiento('')
    setNombreExpedienteTemp('')
    setTemplateName('')
    
    // Forzar garbage collection si está disponible
    if (window.gc) {
      setTimeout(() => window.gc!(), 100)
    }
    
    setTimeout(() => {
      setIsResetting(false)
    }, 300)
  }, [])

  // Función optimizada para limpiar solo datos (mantener configuración)
  const clearData = useCallback(() => {
    setExcelData([])
    setResults([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Funciones para guardar/cargar plantillas
  const saveReportTemplate = () => {
    if (!templateName.trim()) {
      alert('Por favor, introduce un nombre para la plantilla')
      return
    }

    const template = {
      name: templateName,
      config: {
        reportTitle,
        reportSubtitle,
        reportNotes,
        reportAdditionalInfo,
        reportFooter
      }
    }

    const existingTemplates = JSON.parse(localStorage.getItem('reportTemplates') || '[]')
    const updatedTemplates = [...existingTemplates.filter((t: any) => t.name !== templateName), template]
    localStorage.setItem('reportTemplates', JSON.stringify(updatedTemplates))
    setReportTemplates(updatedTemplates)
    setTemplateName('')
    alert('Plantilla guardada correctamente')
  }

  const loadReportTemplate = (template: any) => {
    setReportTitle(template.config.reportTitle)
    setReportSubtitle(template.config.reportSubtitle)
    setReportNotes(template.config.reportNotes)
    setReportAdditionalInfo(template.config.reportAdditionalInfo)
    setReportFooter(template.config.reportFooter)
    alert(`Plantilla "${template.name}" cargada correctamente`)
  }

  const deleteReportTemplate = (templateName: string) => {
    const existingTemplates = JSON.parse(localStorage.getItem('reportTemplates') || '[]')
    const updatedTemplates = existingTemplates.filter((t: any) => t.name !== templateName)
    localStorage.setItem('reportTemplates', JSON.stringify(updatedTemplates))
    setReportTemplates(updatedTemplates)
  }

  // Cargar plantillas al inicializar
  useEffect(() => {
    const savedTemplates = JSON.parse(localStorage.getItem('reportTemplates') || '[]')
    setReportTemplates(savedTemplates)
  }, [])

  // Initialize calculator con cleanup
  useEffect(() => {
    let mounted = true
    
    const initCalculator = async () => {
      try {
        await initializeInterestCalculator()
        if (mounted) {
          setInitialized(true)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError('Error al inicializar el calculador de intereses')
          setLoading(false)
        }
        console.error('Error initializing interest calculator:', err)
      }
    }

    initCalculator()
    
    return () => {
      mounted = false
    }
  }, [])

  // Cleanup cuando el componente se desmonte
  useEffect(() => {
    return () => {
      // Limpiar timers y referencias
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Forzar garbage collection si está disponible
      if (window.gc) {
        setTimeout(() => window.gc!(), 100)
      }
    }
  }, [])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      setExcelData([])
      setResults([])
      setAvailableColumns([])
      setColumnMapping({ cuantías: [''], fecha_inicio: '', concepto: '' })

      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array', cellDates: true })

      // Get first worksheet
      const worksheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[worksheetName]

      // Convert to JSON with raw strings for better control
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][]

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
      setColumnMapping({ cuantías: [''], fecha_inicio: '', concepto: '' })

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
  }, [])

  // Optimización del cálculo de intereses con progress tracking
  const calculateAllInterests = useCallback(async () => {
    // Validar que haya al menos una cuantía seleccionada (no vacía)
    const cuantiasSeleccionadas = columnMapping.cuantías.filter(q => q !== '')
    if (!initialized || excelData.length === 0 || cuantiasSeleccionadas.length === 0 || !columnMapping.fecha_inicio) {
      setError('Debe seleccionar al menos una columna de cuantía y la columna de fecha')
      return
    }

    if (!globalFechaFin) {
      setError('Debe especificar la fecha fin')
      return
    }

    // Validate TAE requirements
    if ((globalModalidades.includes('tae') || globalModalidades.includes('tae_plus5')) && !globalTaeContrato) {
      setError('Debe especificar la TAE del contrato para calcular intereses TAE')
      return
    }

    // Validate judicial requirements
    if (globalModalidades.includes('judicial') && !globalFechaSentencia) {
      setError('Debe especificar la fecha de sentencia para calcular intereses judiciales')
      return
    }

    try {
      setCalculating(true)
      setError(null)
      setCalculationProgress(0)
      setCalculationStatus('Iniciando cálculos...')

      const calculatedResults: CalculationResult[] = []
      const totalRows = excelData.length
      let processedRows = 0
      let skippedRows: Array<{rowIndex: number, reason: string, data: any}> = []

      for (const [rowIndex, row] of excelData.entries()) {
        try {
          // Get values using column mapping
          const fechaInicioValue = row[columnMapping.fecha_inicio]
          const conceptoValue = columnMapping.concepto ? row[columnMapping.concepto] : undefined
          
          // Para cada columna de cuantía seleccionada, crear UN RESULTADO SEPARADO
          const cuantiasValidas = columnMapping.cuantías.filter(q => q !== '')
          
          // Primero validar la fecha para toda la fila
          const fechaStr = String(fechaInicioValue || '').trim().toLowerCase()
          const isRowLabel = fechaStr.includes('total') || 
                            fechaStr.includes('fecha') || 
                            fechaStr.includes('suma') ||
                            fechaStr === ''
          
          if (isRowLabel) {
            skippedRows.push({rowIndex: rowIndex + 1, reason: 'Fila de encabezado o etiqueta', data: row})
            continue
          }

          // Parse date early to validate
          const parsedFechaInicio = parseDate(fechaInicioValue)
          
          if (!parsedFechaInicio) {
            skippedRows.push({rowIndex: rowIndex + 1, reason: `Fecha inicio inválida (${fechaInicioValue})`, data: row})
            continue
          }

          // PROCESAMIENTO POR COLUMNA DE CUANTÍA
          for (const cuantiaCol of cuantiasValidas) {
            const cuantiaValue = row[cuantiaCol]
            if (!cuantiaValue && cuantiaValue !== 0) {
              // Saltar si la columna está vacía para esta fila
              continue
            }
            
            const valor = typeof cuantiaValue === 'number' 
              ? cuantiaValue 
              : parseFloat(String(cuantiaValue).replace(',', '.').replace(/[^\d.-]/g, ''))
            
            if (isNaN(valor)) {
              skippedRows.push({rowIndex: rowIndex + 1, reason: `Capital no es un número válido en columna "${cuantiaCol}"`, data: row})
              continue
            }

            // Descartar filas con capital CERO
            if (valor === 0) {
              skippedRows.push({rowIndex: rowIndex + 1, reason: `Capital es cero en columna "${cuantiaCol}"`, data: row})
              continue
            }

            // Descartar filas con capital NEGATIVO
            if (valor < 0) {
              skippedRows.push({rowIndex: rowIndex + 1, reason: `Capital negativo (${valor}) en columna "${cuantiaCol}" - no se calcula interés`, data: row})
              continue
            }

            processedRows++

            // Calculate for each selected modality
            for (const [modalityIndex, modalidad] of globalModalidades.entries()) {
              const currentCalculation = (rowIndex * globalModalidades.length * cuantiasValidas.length) + (cuantiasValidas.indexOf(cuantiaCol) * globalModalidades.length) + modalityIndex + 1
              const progress = Math.round((currentCalculation / (totalRows * globalModalidades.length * cuantiasValidas.length)) * 100)
              
              setCalculationProgress(progress)
              setCalculationStatus(`Calculando ${modalidad} para columna "${cuantiaCol}" en registro ${rowIndex + 1}/${totalRows}...`)
              
              // Add a small delay for progress visualization (only for large datasets)
              if (totalRows > 100 && currentCalculation % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 10))
              }
              // Skip TAE modalities if no TAE contract rate is provided
              if ((modalidad === 'tae' || modalidad === 'tae_plus5') && !globalTaeContrato) {
                continue
              }

              // Skip judicial if no sentence date is provided
              if (modalidad === 'judicial' && !globalFechaSentencia) {
                continue
              }
              // Parse dates
              const parsedFechaFin = parseDate(globalFechaFin)

              if (!parsedFechaFin) {
                throw new Error(`Fecha fin inválida: ${globalFechaFin}`)
              }

              const input: InterestCalculationInput = {
                capital: valor,
                fechaInicio: parsedFechaInicio,
                fechaFin: parsedFechaFin,
                modalidad
              }

              // Add optional fields based on modality
              if ((modalidad === 'tae' || modalidad === 'tae_plus5') && globalTaeContrato) {
                input.taeContrato = parseFloat(globalTaeContrato)
              }

              if (modalidad === 'judicial' && globalFechaSentencia) {
                input.fechaSentencia = parseDateFromYYYYMMDD(globalFechaSentencia)
              }

              const result = interestCalculator.calcularIntereses(input)

              // Crear un resultado POR CADA COLUMNA DE CUANTÍA
              calculatedResults.push({
                ...row,
                cuantía: valor,
                columna_cuantía: cuantiaCol, // Guardar la columna de cuantía específica
                fecha_inicio: formatDateToYYYYMMDD(parsedFechaInicio),
                fecha_fin: formatDateToYYYYMMDD(parsedFechaFin),
                modalidad,
                tae_contrato: globalTaeContrato ? parseFloat(globalTaeContrato) : undefined,
                fecha_sentencia: globalFechaSentencia || undefined,
                concepto: conceptoValue ? String(conceptoValue) : undefined,
                resultado: result
              })
            }
          }
        } catch (rowError) {
          skippedRows.push({rowIndex: rowIndex + 1, reason: `Error: ${rowError instanceof Error ? rowError.message : 'Desconocido'}`, data: row})
          console.warn('Error calculating row:', rowError)
          // Skip rows with errors completely - don't add any results
          continue
        }
      }

      // Log summary of processing
      console.log(`📊 Resumen de procesamiento:`)
      console.log(`   - Total de filas en Excel: ${totalRows}`)
      console.log(`   - Filas procesadas: ${processedRows}`)
      console.log(`   - Filas descartadas: ${skippedRows.length}`)
      if (skippedRows.length > 0 && skippedRows.length <= 20) {
        console.log(`   - Detalles de filas descartadas:`)
        skippedRows.forEach(skip => {
          console.log(`     Fila ${skip.rowIndex}: ${skip.reason}`)
        })
      }

      setCalculationProgress(100)
      setCalculationStatus('Finalizando cálculos...')
      setResults(calculatedResults)
      
      // Clear progress after a short delay
      setTimeout(() => {
        setCalculationProgress(0)
        setCalculationStatus('')
      }, 1500)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular intereses')
      console.error('Error calculating interests:', err)
    } finally {
      setCalculating(false)
    }
  }, [initialized, excelData, columnMapping, globalFechaFin, globalModalidades, globalTaeContrato, globalFechaSentencia])

  // Función auxiliar para parsear fechas
  const parseDate = (dateValue: any): Date | null => {
    if (!dateValue && dateValue !== 0) return null

    // If it's already a Date object
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue
    }

    // Convert to string for consistent processing
    let dateString = String(dateValue).trim()

    // If it's a number or numeric string (including decimals like 27.43)
    if (typeof dateValue === 'number' || /^\d+(\.\d+)?$/.test(dateString)) {
      const num = parseFloat(dateString)
      
      // Excel serial dates for reasonable historical dates start around 30000+ (1980s)
      if (num > 30000) {
        const excelEpoch = new Date(1900, 0, 1)
        const days = num - 2 // Adjust for Excel's leap year bug
        const resultDate = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000)
        if (!isNaN(resultDate.getTime())) {
          return resultDate
        }
      }
      
      // For small numbers, they might be days of month with decimals representing time
      // Skip these as they're invalid
      return null
    }

    // If it's a string with date format
    if (typeof dateValue === 'string') {
      // Normalize separators - handle both . and / and -
      let normalized = dateString.replace(/\./g, '/')
      
      // Try different formats in order of preference
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
      ]

      for (const format of formats) {
        const match = normalized.match(format)
        if (match) {
          let year: number, month: number, day: number
          if (format === formats[0] || format === formats[1] || format === formats[4]) {
            // DD/MM/YYYY or DD-MM-YYYY or DD/MM/YY
            day = parseInt(match[1])
            month = parseInt(match[2]) - 1 // JS months are 0-based
            year = parseInt(match[3])
            if (year < 100) year += 2000 // YY to YYYY
            
            // Validar que el mes sea válido (0-11 en JS, 1-12 en humano)
            if (month < 0 || month > 11 || day < 1 || day > 31) {
              continue // Intentar siguiente formato
            }
          } else if (format === formats[2] || format === formats[3]) {
            // YYYY/MM/DD or YYYY-MM-DD
            year = parseInt(match[1])
            month = parseInt(match[2]) - 1
            day = parseInt(match[3])
            
            // Validar que el mes sea válido
            if (month < 0 || month > 11 || day < 1 || day > 31) {
              continue // Intentar siguiente formato
            }
          } else {
            continue
          }

          // Crear fecha a mediodía para evitar problemas de zona horaria
          const date = new Date(year, month, day, 12, 0, 0, 0)
          if (!isNaN(date.getTime())) {
            return date
          }
        }
      }

      // Try native Date parsing as last resort
      const nativeDate = new Date(dateString)
      if (!isNaN(nativeDate.getTime())) {
        return nativeDate
      }
    }

    return null
  }

  // Función auxiliar para formatear fecha como YYYY-MM-DD sin conversión UTC
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Función auxiliar para parsear fecha YYYY-MM-DD sin conversión UTC
  const parseDateFromYYYYMMDD = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day, 12, 0, 0, 0)
  }

  // Memoización del procesamiento de datos de evolución de intereses
  const chartData = useMemo(() => {
    if (results.length === 0) return []
    
    const yearlyData: { [key: string]: { [modality: string]: number } } = {}

    results.forEach(result => {
      if (!result.resultado) return

      const startDate = parseDate(result.fecha_inicio)
      const endDate = parseDate(result.fecha_fin)

      if (!startDate || !endDate) return

      // Calculate interest for each year in the period
      let currentDate = new Date(startDate)
      const endYear = endDate.getFullYear()

      while (currentDate.getFullYear() <= endYear) {
        const year = currentDate.getFullYear().toString()

        if (!yearlyData[year]) {
          yearlyData[year] = { legal: 0, judicial: 0, tae: 0, tae_plus5: 0 }
        }

        // For simplicity, we'll distribute the total interest evenly across years
        const yearsDiff = endDate.getFullYear() - startDate.getFullYear() + 1
        const yearlyInterest = result.resultado!.totalInteres / yearsDiff

        yearlyData[year][result.modalidad] += yearlyInterest

        currentDate.setFullYear(currentDate.getFullYear() + 1)
      }
    })

    // Convert to array format for charts
    return Object.keys(yearlyData)
      .sort()
      .map(year => ({
        year,
        Legal: Math.round(yearlyData[year].legal * 100) / 100,
        Judicial: Math.round(yearlyData[year].judicial * 100) / 100,
        TAE: Math.round(yearlyData[year].tae * 100) / 100,
        'TAE+5%': Math.round(yearlyData[year].tae_plus5 * 100) / 100,
        Total: Math.round((yearlyData[year].legal + yearlyData[year].judicial + yearlyData[year].tae + yearlyData[year].tae_plus5) * 100) / 100
      }))
  }, [results])

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
  
  // Función para formatear celdas de la tabla de vista previa
  const formatCellValue = (col: string, value: any) => {
    if (!value && value !== 0) return '-'
    
    // Si es la columna de cuantía, formatear como moneda (y convertir negativo a positivo)
    if (columnMapping.cuantías.includes(col)) {
      let num = Number(value)
      if (!isNaN(num)) {
        // Convertir a valor absoluto (positivo)
        num = Math.abs(num)
        return formatCurrency(num)
      }
    }
    
    // Si es la columna de fecha_inicio, intentar formatear como fecha
    if (col === columnMapping.fecha_inicio) {
      // Verificar si es un número (fecha serial de Excel)
      if (typeof value === 'number' && value > 1000) {
        const parsed = parseDate(value)
        if (parsed) {
          return parsed.toLocaleDateString('es-ES')
        }
      }
      // Si es string, intentar parsear
      if (typeof value === 'string') {
        const parsed = parseDate(value)
        if (parsed) {
          return parsed.toLocaleDateString('es-ES')
        }
      }
    }
    
    return value
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

  const exportToExcel = useCallback(() => {
    // Preguntar al usuario por el número de expediente
    const numeroExpediente = prompt('Introduce el número de expediente:')

    if (!numeroExpediente || numeroExpediente.trim() === '') {
      alert('Debes introducir un número de expediente válido.')
      return
    }

    const workbook = XLSX.utils.book_new()

    globalModalidades.forEach(modalidad => {
      const modalityResults = results.filter(r => r.modalidad === modalidad && r.resultado)

      if (modalityResults.length === 0) return

      const data: any[] = []

      // Agregar título de la hoja
      const tituloHoja = `RESUMEN INTERESES - ${modalidad.toUpperCase()} - EXPEDIENTE ${numeroExpediente}`
      data.push([tituloHoja])
      data.push(['']) // Fila vacía

      // Agregar encabezados
      data.push([
        'Importe',
        'Fecha Origen',
        'Fecha Fin',
        'Año',
        'Días',
        'Tasa (%)',
        'Interés Año',
        'Tipo'
      ])

      modalityResults.forEach(result => {
        if (!result.resultado?.detallePorAño) return

        // Add a row for each year calculation
        result.resultado.detallePorAño.forEach(yearDetail => {
          data.push([
            { v: result.cuantía, t: 'n', z: '#,##0.00 €' },
            result.fecha_inicio,
            result.fecha_fin,
            yearDetail.año,
            yearDetail.dias,
            { v: yearDetail.tasa, t: 'n', z: '0.0000%' },
            { v: yearDetail.interes, t: 'n', z: '#,##0.00 €' },
            yearDetail.tipo
          ])
        })

        // Add summary row for this calculation
        data.push([
          { v: result.cuantía, t: 'n', z: '#,##0.00 €' },
          result.fecha_inicio,
          result.fecha_fin,
          'TOTAL',
          '',
          '',
          { v: result.resultado.totalInteres, t: 'n', z: '#,##0.00 €' },
          'RESUMEN'
        ])

        // Add empty row for separation
        data.push(['', '', '', '', '', '', '', ''])
      })

      const worksheet = XLSX.utils.aoa_to_sheet(data)

      // Aplicar estilos y formato
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')

      // Estilos para el título
      if (worksheet['A1']) {
        worksheet['A1'].s = {
          font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '2B6CB0' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        }
      }

      // Estilos para los encabezados
      for (let col = 0; col < 8; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 2, c: col })
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '4A5568' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            }
          }
        }
      }

      // Aplicar bordes a todas las celdas de datos
      for (let row = 3; row <= range.e.r; row++) {
        for (let col = 0; col < 8; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
              ...worksheet[cellAddress].s,
              border: {
                top: { style: 'thin', color: { rgb: 'D1D5DB' } },
                bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
                left: { style: 'thin', color: { rgb: 'D1D5DB' } },
                right: { style: 'thin', color: { rgb: 'D1D5DB' } }
              },
              alignment: col < 4 ? { horizontal: 'left' } : { horizontal: 'center' }
            }
          }
        }
      }

      // Estilos especiales para filas TOTAL
      for (let row = 3; row <= range.e.r; row++) {
        const tipoCell = XLSX.utils.encode_cell({ r: row, c: 7 })
        if (worksheet[tipoCell] && worksheet[tipoCell].v === 'RESUMEN') {
          for (let col = 0; col < 8; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
            if (worksheet[cellAddress]) {
              worksheet[cellAddress].s = {
                ...worksheet[cellAddress].s,
                font: { bold: true, color: { rgb: '2D3748' } },
                fill: { fgColor: { rgb: 'EDF2F7' } }
              }
            }
          }
        }
      }

      // Combinar celdas para el título
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }
      ]

      // Set column widths
      worksheet['!cols'] = [
        { wch: 15 }, // Importe
        { wch: 12 }, // Fecha Origen
        { wch: 12 }, // Fecha Fin
        { wch: 8 },  // Año
        { wch: 8 },  // Días
        { wch: 12 }, // Tasa (%)
        { wch: 18 }, // Interés Año
        { wch: 12 }  // Tipo
      ]

      const sheetName = modalidad === 'legal' ? 'Legal' :
                       modalidad === 'judicial' ? 'Judicial' :
                       modalidad === 'tae' ? 'TAE' : 'TAE+5%'

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    })

    XLSX.writeFile(workbook, `RESUMEN INTERESES Nº EXPT ${numeroExpediente}.xlsx`)
  }, [results, globalModalidades])

  const exportToPDF = useCallback(async () => {
    if (results.length === 0) {
      setError('No hay resultados para exportar')
      return
    }

    // Validar que se haya ingresado nombre de expediente y número de procedimiento
    if (!nombreExpedienteTemp || nombreExpedienteTemp.trim() === '') {
      alert('Debes introducir un nombre de expediente válido.')
      return
    }
    
    if (!numeroProcedimiento || numeroProcedimiento.trim() === '') {
      alert('Debes introducir un número de procedimiento válido.')
      return
    }
    
    // Cerrar el modal
    setShowPdfConfigModal(false)
    
    const nombreExpediente = nombreExpedienteTemp.trim()

    try {
      const pdf = new jsPDF()
      let pageNumber = 1
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)

      // Función auxiliar para añadir pie de página
      const addFooter = (pageNum: number) => {
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'italic')
        pdf.text(`Página ${pageNum}`, margin, pageHeight - 10)
        pdf.text(`Expediente: ${nombreExpediente}`, pageWidth - margin - 60, pageHeight - 10)
        pdf.text(`Nº Procedimiento: ${numeroProcedimiento}`, margin, pageHeight - 5)
        pdf.text('RUA ABOGADOS', pageWidth - margin - 40, pageHeight - 5)
      }

      // Función auxiliar para añadir nueva página
      const addNewPage = () => {
        pdf.addPage()
        pageNumber++
        addFooter(pageNumber)
        return margin
      }

      // PORTADA
      // Añadir logo en la parte superior
      try {
        // Cargar imagen para obtener dimensiones reales
        const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = logoRua
        })
        
        // Calcular dimensiones manteniendo proporción
        const maxLogoWidth = 80
        const aspectRatio = logoImg.height / logoImg.width
        const logoWidth = maxLogoWidth
        const logoHeight = logoWidth * aspectRatio
        const logoX = (pageWidth - logoWidth) / 2
        
        pdf.addImage(logoRua, 'PNG', logoX, 30, logoWidth, logoHeight)
      } catch (error) {
        // Si hay error con el logo, continuar sin él
        console.warn('No se pudo cargar el logo:', error)
      }

      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text(reportTitle, pageWidth / 2, 130, { align: 'center' })

      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text(reportSubtitle, pageWidth / 2, 150, { align: 'center' })

      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Expediente:', pageWidth / 2, 180, { align: 'center' })

      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text(nombreExpediente.toUpperCase(), pageWidth / 2, 195, { align: 'center' })
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Nº Procedimiento: ${numeroProcedimiento}`, pageWidth / 2, 210, { align: 'center' })

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 230, { align: 'center' })
      pdf.text(`Hora: ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, 240, { align: 'center' })

      pdf.setFontSize(10)
      pdf.text(reportFooter, pageWidth / 2, 250, { align: 'center' })

      addFooter(pageNumber)

      // ÍNDICE
      let yPosition = addNewPage()
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ÍNDICE', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')

      const indexItems = [
        { title: '1. RESUMEN EJECUTIVO', page: 3 },
        { title: '2. PARÁMETROS DE CÁLCULO', page: 4 }
      ]

      let currentPage = 5
      let sectionNumber = 3
      
      // Añadir metodología si está seleccionada
      if (includeMetodologia) {
        indexItems.push({ title: `${sectionNumber}. METODOLOGÍA DE CÁLCULO`, page: currentPage })
        currentPage += 2
        sectionNumber++
      }
      
      // Añadir secciones opcionales al índice
      if (includeResultadoPorModalidad) {
        indexItems.push({ title: `${sectionNumber}. RESULTADOS POR MODALIDAD`, page: currentPage })
        globalModalidades.forEach(modalidad => {
          const modalityResults = results.filter(r => r.modalidad === modalidad)
          if (modalityResults.length > 0) {
            const title = `${sectionNumber}.${globalModalidades.indexOf(modalidad) + 1}. ${modalidad === 'legal' ? 'INTERESES LEGALES' :
                       modalidad === 'judicial' ? 'INTERESES JUDICIALES' :
                       modalidad === 'tae' ? 'INTERESES TAE' : 'INTERESES TAE + 5%'}`
            indexItems.push({ title, page: currentPage })
            currentPage += Math.ceil(modalityResults.length / 15) + 1
          }
        })
        sectionNumber++
      }
      
      if (includeTablaResumen) {
        indexItems.push({ title: `${sectionNumber}. TABLA RESUMEN POR CONCEPTO`, page: currentPage })
        currentPage += 2
        sectionNumber++
      }
      
      if (includeResumenVisual) {
        indexItems.push({ title: `${sectionNumber}. ANÁLISIS GRÁFICO`, page: currentPage })
        currentPage += 2
        sectionNumber++
      }
      
      if (includeDetalleCalculo) {
        indexItems.push({ title: `${sectionNumber}. DETALLE DE CÁLCULOS`, page: currentPage })
      }

      indexItems.forEach(item => {
        if (yPosition > pageHeight - 40) {
          yPosition = addNewPage()
        }
        pdf.text(item.title, margin, yPosition)
        pdf.text(item.page.toString(), pageWidth - margin - 20, yPosition, { align: 'right' })
        yPosition += 8
      })

      // RESUMEN EJECUTIVO
      yPosition = addNewPage()
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('1. RESUMEN EJECUTIVO', margin, yPosition)
      yPosition += 15

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Este informe contiene el cálculo de intereses correspondiente al expediente:', margin, yPosition)
      yPosition += 8
      pdf.setFont('helvetica', 'bold')
      pdf.text(nombreExpediente, margin + 10, yPosition)
      yPosition += 15

      // Estadísticas generales
      
      // Calcular capital total: Sumar directamente desde excelData tal como vienen los valores
      // Esto asegura que coincida exactamente con la suma del usuario
      let capitalTotal = 0
      const cuantiasValidas = columnMapping.cuantías.filter(q => q !== '')
      excelData.forEach((row) => {
        for (const cuantiaCol of cuantiasValidas) {
          const cuantiaValue = row[cuantiaCol]
          if (cuantiaValue || cuantiaValue === 0) {
            const valor = typeof cuantiaValue === 'number' 
              ? cuantiaValue 
              : parseFloat(String(cuantiaValue).replace(',', '.').replace(/[^\d.-]/g, ''))
            if (!isNaN(valor)) {
              capitalTotal += valor
            }
          }
        }
      })

      pdf.setFont('helvetica', 'normal')
      pdf.text(`• Período de cálculo: Hasta ${parseDateFromYYYYMMDD(globalFechaFin).toLocaleDateString('es-ES')}`, margin, yPosition)
      yPosition += 8
      pdf.text(`• Modalidades calculadas: ${globalModalidades.join(', ')}`, margin, yPosition)
      yPosition += 15

      // Notas personalizadas
      if (reportNotes.trim()) {
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('NOTAS DEL EXPEDIENTE', margin, yPosition)
        yPosition += 12

        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        const notesLines = pdf.splitTextToSize(reportNotes, contentWidth)
        pdf.text(notesLines, margin, yPosition)
        yPosition += (notesLines.length * 5) + 10
      }

      // Información adicional
      if (reportAdditionalInfo.trim()) {
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('INFORMACIÓN ADICIONAL', margin, yPosition)
        yPosition += 12

        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        const infoLines = pdf.splitTextToSize(reportAdditionalInfo, contentWidth)
        pdf.text(infoLines, margin, yPosition)
        yPosition += (infoLines.length * 5) + 15
      }

      // PARÁMETROS DE CÁLCULO
      if (yPosition > pageHeight - 60) {
        yPosition = addNewPage()
      }
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('2. PARÁMETROS DE CÁLCULO', margin, yPosition)
      yPosition += 15

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Parámetros utilizados en los cálculos:', margin, yPosition)
      yPosition += 10

      pdf.text(`• Fecha fin de cálculo: ${parseDateFromYYYYMMDD(globalFechaFin).toLocaleDateString('es-ES')}`, margin + 10, yPosition)
      yPosition += 8

      if (globalModalidades.includes('tae') || globalModalidades.includes('tae_plus5')) {
        pdf.text(`• TAE del contrato: ${globalTaeContrato}%`, margin + 10, yPosition)
        yPosition += 8
      }

      if (globalModalidades.includes('judicial')) {
        pdf.text(`• Fecha de sentencia: ${new Date(globalFechaSentencia).toLocaleDateString('es-ES')}`, margin + 10, yPosition)
        yPosition += 8
      }

      pdf.text(`• Modalidades de cálculo: ${globalModalidades.map(m =>
        m === 'legal' ? 'Legal' :
        m === 'judicial' ? 'Judicial' :
        m === 'tae' ? 'TAE' : 'TAE + 5%'
      ).join(', ')}`, margin + 10, yPosition)
      yPosition += 15

      // METODOLOGÍA DE CÁLCULO (condicional)
      if (includeMetodologia) {
        yPosition = addNewPage()
        let sectionNum = 3
        
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${sectionNum}. METODOLOGÍA DE CÁLCULO`, margin, yPosition)
        yPosition += 15

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Los cálculos de intereses han sido realizados utilizando herramientas internas desarrolladas', margin, yPosition)
        yPosition += 6
        pdf.text('por el Departamento de Ejecuciones y Tasaciones de RUA ABOGADOS, aplicando', margin, yPosition)
        yPosition += 6
        pdf.text('estrictamente la normativa vigente para cada período.', margin, yPosition)
        yPosition += 15

        // Fórmulas por modalidad
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Fórmulas Matemáticas Aplicadas:', margin, yPosition)
        yPosition += 12

        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')

        // Fórmula general
        pdf.setFont('helvetica', 'bold')
        pdf.text('Fórmula General:', margin, yPosition)
        yPosition += 8
        pdf.setFont('helvetica', 'normal')
        pdf.text('Interés = Capital × (Tasa / 100) × (Días / 365)', margin + 10, yPosition)
        yPosition += 12

        // Intereses Legales
        if (globalModalidades.includes('legal')) {
          pdf.setFont('helvetica', 'bold')
          pdf.text('Intereses Legales:', margin, yPosition)
          yPosition += 8
          pdf.setFont('helvetica', 'normal')
          pdf.text('Se aplica el tipo de interés legal del dinero establecido anualmente por la Ley de', margin + 10, yPosition)
          yPosition += 6
          pdf.text('Presupuestos Generales del Estado para cada ejercicio.', margin + 10, yPosition)
          yPosition += 10
        }

        // Intereses Judiciales
        if (globalModalidades.includes('judicial')) {
          pdf.setFont('helvetica', 'bold')
          pdf.text('Intereses Judiciales:', margin, yPosition)
          yPosition += 8
          pdf.setFont('helvetica', 'normal')
          pdf.text('Se aplica el interés de demora procesal (legal + 2 puntos) únicamente al período posterior a', margin + 10, yPosition)
          yPosition += 6
          pdf.text('la sentencia. Los resultados mostrados reflejan SOLO los intereses judiciales realmente generados,', margin + 10, yPosition)
          yPosition += 6
          pdf.text('sin incluir el período legal previo a la sentencia.', margin + 10, yPosition)
          yPosition += 10
        }

        // Intereses TAE
        if (globalModalidades.includes('tae') || globalModalidades.includes('tae_plus5')) {
          pdf.setFont('helvetica', 'bold')
          pdf.text('Intereses Contractuales (TAE):', margin, yPosition)
          yPosition += 8
          pdf.setFont('helvetica', 'normal')
          pdf.text('• TAE: Se aplica la Tasa Anual Equivalente pactada en el contrato.', margin + 10, yPosition)
          yPosition += 6
          if (globalModalidades.includes('tae_plus5')) {
            pdf.text('• TAE + 5%: Se aplica la TAE contractual incrementada en 5 puntos porcentuales.', margin + 10, yPosition)
            yPosition += 6
          }
          yPosition += 8
        }

        // Tabla de intereses históricos
        if (yPosition > pageHeight - 100) {
          yPosition = addNewPage()
        }

        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Tabla de Intereses Aplicables por Año:', margin, yPosition)
        yPosition += 12

        // Obtener rango de años de los resultados
        const allYears = new Set<number>()
        results.forEach(r => {
          if (r.resultado?.detallePorAño) {
            r.resultado.detallePorAño.forEach(d => allYears.add(d.año))
          }
        })
        const yearsArray = Array.from(allYears).sort((a, b) => a - b)

        if (yearsArray.length > 0) {
          // Construir datos de la tabla
          const interestTableData: any[] = []
          
          yearsArray.forEach(year => {
            const row: any[] = [year.toString()]
            
            // Buscar las tasas de este año en los resultados
            const yearData = results.find(r => 
              r.resultado?.detallePorAño?.some(d => d.año === year)
            )?.resultado?.detallePorAño?.find(d => d.año === year)
            
            if (yearData) {
              const tasaLegal = yearData.tasa * 100
              row.push(tasaLegal.toFixed(2) + '%')
              row.push((tasaLegal + 2).toFixed(2) + '%')
            } else {
              row.push('-')
              row.push('-')
            }
            
            if (globalModalidades.includes('tae')) {
              row.push(globalTaeContrato + '%')
            }
            if (globalModalidades.includes('tae_plus5')) {
              row.push((parseFloat(globalTaeContrato) + 5).toFixed(2) + '%')
            }
            
            interestTableData.push(row)
          })

          // Construir encabezados
          const headers = ['Año', 'Legal', 'Judicial']
          if (globalModalidades.includes('tae')) headers.push('TAE')
          if (globalModalidades.includes('tae_plus5')) headers.push('TAE+5%')

          // Dividir en múltiples tablas si hay muchos años
          const rowsPerTable = 20
          for (let i = 0; i < interestTableData.length; i += rowsPerTable) {
            if (i > 0 && yPosition > pageHeight - 100) {
              yPosition = addNewPage()
            }
            
            const chunk = interestTableData.slice(i, i + rowsPerTable)
            
            autoTable(pdf, {
              startY: yPosition,
              head: [headers],
              body: chunk,
              theme: 'grid',
              styles: { fontSize: 9, cellPadding: 2 },
              headStyles: { fillColor: [41, 128, 185], textColor: 255 },
              margin: { left: margin, right: margin },
              columnStyles: {
                0: { halign: 'center', fontStyle: 'bold' },
                1: { halign: 'center' },
                2: { halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'center' }
              },
              didDrawPage: (data) => {
                yPosition = (data.cursor?.y || yPosition) + 15
              }
            })
          }
        }
        
        yPosition += 10
      }

      // RESULTADOS POR MODALIDAD (condicional)
      if (includeResultadoPorModalidad) {
        yPosition = addNewPage()
        let sectionNum = 3
        if (includeMetodologia) sectionNum++
        
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${sectionNum}. RESULTADOS POR MODALIDAD`, margin, yPosition)
        yPosition += 15

        // Calcular el capital total UNA SOLA VEZ para todas las modalidades
        // Sumar directamente desde excelData tal como vienen los valores (mismo cálculo que en resumen)
        let capitalTotalFijo = 0
        const cuantiasValidasModal = columnMapping.cuantías.filter(q => q !== '')
        excelData.forEach((row) => {
          for (const cuantiaCol of cuantiasValidasModal) {
            const cuantiaValue = row[cuantiaCol]
            if (cuantiaValue || cuantiaValue === 0) {
              const valor = typeof cuantiaValue === 'number' 
                ? cuantiaValue 
                : parseFloat(String(cuantiaValue).replace(',', '.').replace(/[^\d.-]/g, ''))
              if (!isNaN(valor)) {
                capitalTotalFijo += valor
              }
            }
          }
        })

        globalModalidades.forEach((modalidad, index) => {
          const modalityResults = results.filter(r => r.modalidad === modalidad)
          if (modalityResults.length === 0) return

          if (yPosition > pageHeight - 60) {
            yPosition = addNewPage()
          }

          const title = `${index + 1}. ${modalidad === 'legal' ? 'INTERESES LEGALES' :
                     modalidad === 'judicial' ? 'INTERESES JUDICIALES' :
                     modalidad === 'tae' ? 'INTERESES TAE' : 'INTERESES TAE + 5%'}`
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.text(title, margin, yPosition)
          yPosition += 10

          const totalInteresesModalidad = modalityResults.reduce((sum, r) => sum + (r.resultado?.totalInteres || 0), 0)

          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`• Intereses totales: ${totalInteresesModalidad.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`, margin + 10, yPosition)
          yPosition += 12

          // Tabla de resultados
          if (yPosition > pageHeight - 80) {
            yPosition = addNewPage()
          }

          const tableData = modalityResults.map(r => {
            const row = [
              r.cuantía.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              r.columna_cuantía ? `(${r.columna_cuantía})` : '', // Mostrar la columna de cuantía
              new Date(r.fecha_inicio).toLocaleDateString('es-ES'),
              new Date(r.fecha_fin).toLocaleDateString('es-ES'),
              (r.resultado?.totalInteres || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ]
            
            // Agregar concepto al inicio si está disponible
            if (r.concepto) {
              row.unshift(r.concepto)
            }
            
            return row
          })

          const tableHeaders = [['Capital (€)', 'Columna', 'Fecha Inicio', 'Fecha Fin', 'Intereses (€)']]
          if (modalityResults.some(r => r.concepto)) {
            tableHeaders[0].unshift('Concepto')
          }

          autoTable(pdf, {
            startY: yPosition,
            head: tableHeaders,
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            margin: { left: margin, right: margin },
            columnStyles: {
              0: { halign: 'right' },
              3: { halign: 'right' }
            },
            didDrawPage: (data) => {
              yPosition = (data.cursor?.y || yPosition) + 15
            }
          })

          yPosition += 15
        })
      }
      
      // TABLA RESUMEN POR CONCEPTO (condicional)
      if (includeTablaResumen) {
        if (yPosition > pageHeight - 60) {
          yPosition = addNewPage()
        }
        
        let sectionNum = 3
        if (includeMetodologia) sectionNum++
        if (includeResultadoPorModalidad) sectionNum++
        
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${sectionNum}. TABLA RESUMEN POR CONCEPTO`, margin, yPosition)
        yPosition += 15

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Resumen consolidado por concepto con períodos y modalidades:', margin, yPosition)
        yPosition += 15

        // Agrupar por concepto
        const conceptosMap = new Map<string, CalculationResult[]>()
        results.forEach(r => {
          const concepto = r.concepto || 'Sin concepto'
          if (!conceptosMap.has(concepto)) {
            conceptosMap.set(concepto, [])
          }
          conceptosMap.get(concepto)!.push(r)
        })

        // Construir headers dinámicos basados en modalidades seleccionadas
        const baseHeaders = ['Concepto', 'Cuantía (€)', 'Columna', 'Fecha Inicio', 'Fecha Fin']
        const modalidadHeaders: string[] = []
        const modalidadKeys: Array<'legal' | 'judicial' | 'tae' | 'tae_plus5'> = []
        
        if (globalModalidades.includes('legal')) {
          modalidadHeaders.push('Legal (€)')
          modalidadKeys.push('legal')
        }
        if (globalModalidades.includes('judicial')) {
          modalidadHeaders.push('Judicial (€)')
          modalidadKeys.push('judicial')
        }
        if (globalModalidades.includes('tae')) {
          modalidadHeaders.push('TAE (€)')
          modalidadKeys.push('tae')
        }
        if (globalModalidades.includes('tae_plus5')) {
          modalidadHeaders.push('TAE+5% (€)')
          modalidadKeys.push('tae_plus5')
        }

        const headers = [...baseHeaders, ...modalidadHeaders]

        const tablaResumenData: any[] = []
        conceptosMap.forEach((resultados, concepto) => {
          // Agrupar por cuantía y columna dentro del concepto
          const cuantiasColumnasMap = new Map<string, CalculationResult[]>()
          resultados.forEach(r => {
            const key = `${r.cuantía}_${r.columna_cuantía || 'default'}`
            if (!cuantiasColumnasMap.has(key)) {
              cuantiasColumnasMap.set(key, [])
            }
            cuantiasColumnasMap.get(key)!.push(r)
          })

          cuantiasColumnasMap.forEach((resPorCuantia) => {
            const firstResult = resPorCuantia[0]
            
            // Calcular intereses por modalidad
            const interesesPorModalidad: Record<string, number> = {}
            modalidadKeys.forEach(mod => {
              const resModalidad = resPorCuantia.find(r => r.modalidad === mod)
              interesesPorModalidad[mod] = resModalidad?.resultado?.totalInteres || 0
            })
            
            const row = [
              concepto,
              firstResult.cuantía.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              firstResult.columna_cuantía ? `(${firstResult.columna_cuantía})` : '',
              parseDateFromYYYYMMDD(firstResult.fecha_inicio).toLocaleDateString('es-ES'),
              parseDateFromYYYYMMDD(firstResult.fecha_fin).toLocaleDateString('es-ES'),
              ...modalidadKeys.map(mod => 
                interesesPorModalidad[mod].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              )
            ]
            
            tablaResumenData.push(row)
          })
        })

        if (tablaResumenData.length > 0) {
          // Construir columnStyles dinámicamente
          const columnStyles: any = {
            1: { halign: 'right' }, // Cuantía
            2: { halign: 'center' }, // Columna
          }
          
          // Alinear a la derecha las columnas de intereses (empiezan en índice 5)
          modalidadKeys.forEach((_, idx) => {
            columnStyles[5 + idx] = { halign: 'right' }
          })
          
          autoTable(pdf, {
            startY: yPosition,
            head: [headers],
            body: tablaResumenData,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [52, 152, 219], textColor: 255 },
            margin: { left: margin, right: margin },
            columnStyles: columnStyles,
            didDrawPage: (data) => {
              yPosition = (data.cursor?.y || yPosition) + 15
            }
          })
        }
      }

      // ANÁLISIS GRÁFICO (condicional)
      if (includeResumenVisual) {
        yPosition = addNewPage()
        let sectionNum = 3
        if (includeMetodologia) sectionNum++
        if (includeResultadoPorModalidad) sectionNum++
        if (includeTablaResumen) sectionNum++
        
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${sectionNum}. ANÁLISIS GRÁFICO`, margin, yPosition)
        yPosition += 15

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Evolución temporal de los intereses calculados:', margin, yPosition)
        yPosition += 15

        // Intentar capturar gráficos
        const chartElements = document.querySelectorAll('.recharts-wrapper')
        if (chartElements.length > 0) {
          try {
            for (let i = 0; i < Math.min(chartElements.length, 2); i++) {
              if (yPosition > pageHeight - 120) {
                yPosition = addNewPage()
              }

              const canvas = await html2canvas(chartElements[i] as HTMLElement, {
                useCORS: true,
                allowTaint: true
              })

              const imgData = canvas.toDataURL('image/png')
              const imgWidth = contentWidth
              const imgHeight = (canvas.height * imgWidth) / canvas.width

              if (imgHeight > pageHeight - yPosition - 40) {
                // Si la imagen es demasiado grande, reducirla
                const scale = (pageHeight - yPosition - 40) / imgHeight
                const scaledWidth = imgWidth * scale
                const scaledHeight = imgHeight * scale
                pdf.addImage(imgData, 'PNG', margin, yPosition, scaledWidth, scaledHeight)
                yPosition += scaledHeight + 10
              } else {
                pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight)
                yPosition += imgHeight + 10
              }

              // Añadir título al gráfico
              pdf.setFontSize(10)
              pdf.setFont('helvetica', 'italic')
              pdf.text(`Gráfico ${i + 1}: Evolución de intereses por modalidad`, margin, yPosition - 5)
              yPosition += 10
            }
          } catch (error) {
            console.warn('No se pudieron capturar los gráficos:', error)
            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'normal')
            pdf.text('Nota: Los gráficos no pudieron ser incluidos en el PDF.', margin, yPosition)
            pdf.text('Para ver los gráficos completos, consulte la aplicación web.', margin, yPosition + 8)
            yPosition += 20
          }
        } else {
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'normal')
          pdf.text('No hay gráficos disponibles para incluir en el informe.', margin, yPosition)
          yPosition += 15
        }
      }

      // DETALLE DE CÁLCULOS (condicional)
      if (includeDetalleCalculo) {
        yPosition = addNewPage()
        let sectionNum = 3
        if (includeMetodologia) sectionNum++
        if (includeResultadoPorModalidad) sectionNum++
        if (includeTablaResumen) sectionNum++
        if (includeResumenVisual) sectionNum++
        
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${sectionNum}. DETALLE DE CÁLCULOS`, margin, yPosition)
        yPosition += 15

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Detalle año a año de todos los cálculos realizados:', margin, yPosition)
        yPosition += 15

        globalModalidades.forEach(modalidad => {
          const modalityResults = results.filter(r => r.modalidad === modalidad && r.resultado?.detallePorAño)
          if (modalityResults.length === 0) return

          if (yPosition > pageHeight - 60) {
            yPosition = addNewPage()
          }

          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`${modalidad === 'legal' ? 'Intereses Legales' :
                    modalidad === 'judicial' ? 'Intereses Judiciales' :
                    modalidad === 'tae' ? 'Intereses TAE' : 'Intereses TAE + 5%'}`, margin, yPosition)
          yPosition += 12

          modalityResults.forEach(result => {
            if (!result.resultado?.detallePorAño) return

            if (yPosition > pageHeight - 80) {
              yPosition = addNewPage()
            }

            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'bold')
            pdf.text(`Capital: ${result.cuantía.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`, margin + 10, yPosition)
            yPosition += 8
            pdf.text(`Período: ${new Date(result.fecha_inicio).toLocaleDateString('es-ES')} - ${new Date(result.fecha_fin).toLocaleDateString('es-ES')}`, margin + 10, yPosition)
            yPosition += 10

            const detailData = result.resultado.detallePorAño.map(year => [
              year.año.toString(),
              year.dias.toString(),
              (year.tasa * 100).toFixed(4) + '%',
              year.interes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ])

            autoTable(pdf, {
              startY: yPosition,
              head: [['Año', 'Días', 'Tasa', 'Interés (€)']],
              body: detailData,
              theme: 'grid',
              styles: { fontSize: 7, cellPadding: 2 },
              headStyles: { fillColor: [52, 152, 219], textColor: 255 },
              margin: { left: margin + 10, right: margin },
              columnStyles: {
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right' }
              },
              didDrawPage: (data) => {
                yPosition = (data.cursor?.y || yPosition) + 12
              }
            })

            yPosition += 12
          })
        })
      }

      // Descargar el PDF
      const fileName = `INFORME_INTERESES_${nombreExpediente.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}.pdf`
      pdf.save(fileName)

      alert(`PDF generado correctamente: ${fileName}`)

    } catch (error) {
      console.error('Error generando PDF:', error)
      setError('Error al generar el PDF')
    }
  }, [results, globalModalidades, globalFechaFin, globalTaeContrato, globalFechaSentencia, reportTitle, reportSubtitle, reportNotes, reportAdditionalInfo, reportFooter, excelData, columnMapping, includeResultadoPorModalidad, includeTablaResumen, includeDetalleCalculo, includeResumenVisual, includeMetodologia, nombreExpedienteTemp, numeroProcedimiento])

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">CALCULADOR DE INTERESES</h1>
          </div>
          {/* Botón Nuevo Cálculo */}
          <button
            onClick={resetCalculator}
            disabled={isResetting}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isResetting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
            }`}
            title="Resetea completamente la calculadora y libera memoria"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'Reseteando...' : 'Nuevo Cálculo'}
          </button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Columnas de Cuantía * (Puedes seleccionar múltiples - se sumarán)
                </label>
                <div className="space-y-2">
                  {columnMapping.cuantías.map((cuantiaCol, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select
                        value={cuantiaCol}
                        onChange={(e) => {
                          const newCuantias = [...columnMapping.cuantías]
                          newCuantias[idx] = e.target.value
                          setColumnMapping(prev => ({ ...prev, cuantías: newCuantias }))
                        }}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar columna...</option>
                        {availableColumns.map((col, index) => (
                          <option key={index} value={col}>{col}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const newCuantias = columnMapping.cuantías.filter((_, i) => i !== idx)
                          setColumnMapping(prev => ({ ...prev, cuantías: newCuantias }))
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        title="Eliminar esta columna"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setColumnMapping(prev => ({ ...prev, cuantías: [...prev.cuantías, ''] }))
                    }}
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Columna de Cuantía
                  </button>
                </div>
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
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Columna de Concepto (opcional)
                </label>
                <select
                  value={columnMapping.concepto || ''}
                  onChange={(e) => setColumnMapping(prev => ({ ...prev, concepto: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin concepto</option>
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
                {columnMapping.cuantías.some(c => c !== '') && columnMapping.fecha_inicio && (
                  <p className="text-sm text-gray-600 mt-1">
                    Mapeo aplicado: <span className="font-medium text-blue-600">"{columnMapping.cuantías.filter(c => c !== '').join(', ')}" → Cuantías</span>, 
                    <span className="font-medium text-blue-600 ml-1">"{columnMapping.fecha_inicio}" → Fecha Inicio</span>
                    {columnMapping.concepto && (
                      <span className="font-medium text-green-600 ml-1">"{columnMapping.concepto}" → Concepto</span>
                    )}
                  </p>
                )}
              </div>
              <div className="space-x-2">
                <button
                  onClick={calculateAllInterests}
                  disabled={
                    calculating || 
                    !initialized || 
                    columnMapping.cuantías.filter(q => q !== '').length === 0 || 
                    !columnMapping.fecha_inicio || 
                    !globalFechaFin ||
                    ((globalModalidades.includes('tae') || globalModalidades.includes('tae_plus5')) && !globalTaeContrato) ||
                    (globalModalidades.includes('judicial') && !globalFechaSentencia)
                  }
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {calculating ? 'Calculando...' : 'Calcular Todos'}
                </button>
                <button
                  onClick={clearData}
                  disabled={calculating}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            {calculating && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-blue-600 animate-pulse" />
                    <span className="text-sm font-medium text-blue-900">Calculando intereses...</span>
                  </div>
                  <span className="text-sm text-blue-700 font-medium">{calculationProgress}%</span>
                </div>
                
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${calculationProgress}%` }}
                  ></div>
                </div>
                
                {calculationStatus && (
                  <p className="text-sm text-blue-700 mt-1">{calculationStatus}</p>
                )}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {availableColumns.map((col, index) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {col}
                        {columnMapping.cuantías.includes(col) && <span className="ml-1 text-blue-600">→ Cuantía</span>}
                        {col === columnMapping.fecha_inicio && <span className="ml-1 text-blue-600">→ Fecha Inicio</span>}
                        {col === columnMapping.concepto && <span className="ml-1 text-green-600">→ Concepto</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {excelData.slice(0, 5).map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {availableColumns.map((col, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCellValue(col, row[col])}
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

            {/* Performance Warning for Large Datasets */}
            {excelData.length > 200 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-800">
                      Dataset Grande Detectado ({excelData.length} filas)
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      El cálculo de {excelData.length} registros con {globalModalidades.length} modalidad(es) 
                      puede tomar varios minutos. Se recomienda procesar en lotes más pequeños para mejor rendimiento.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
              <button
                onClick={() => setShowReportCustomization(!showReportCustomization)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Personalizar Informe
              </button>
              <button
                onClick={() => setShowPdfConfigModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ml-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
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
                            Columna
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
                              {result.columna_cuantía || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(result.fecha_inicio)} - {formatDate(result.fecha_fin)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {result.resultado ? formatCurrency(result.resultado.totalInteres) : '-'}
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

                  {/* Modality Summary */}
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="text-md font-semibold text-blue-900 mb-2">
                      Resumen {modalidad === 'legal' ? 'Legal' :
                               modalidad === 'judicial' ? 'Judicial' :
                               modalidad === 'tae' ? 'TAE' : 'TAE+5%'}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <CountUp
                          to={modalityResults.filter(r => r.resultado).length}
                          duration={1}
                          className="text-2xl font-bold text-blue-700"
                        />
                        <p className="text-sm text-blue-600">Cálculos exitosos</p>
                      </div>
                      <div className="text-center">
                        <AnimatedCurrency
                          amount={modalityResults.reduce((sum, r) => sum + (r.resultado?.totalInteres || 0), 0)}
                          duration={1.5}
                          className="text-3xl font-bold text-blue-800"
                        />
                        <p className="text-sm text-blue-600">Total intereses</p>
                      </div>
                      <div className="text-center">
                        <CountUp
                          to={modalityResults.filter(r => r.error).length}
                          duration={1}
                          className="text-2xl font-bold text-red-700"
                        />
                        <p className="text-sm text-blue-600">Errores</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Interest Evolution Charts */}
        {results.length > 0 && chartData.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-6 w-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Evolución de Intereses por Año
              </h3>
            </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Evolución por Modalidad</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `€${value.toLocaleString()}`} />
                      <Tooltip
                        formatter={(value: number, name: string) => [`€${value.toLocaleString()}`, name]}
                        labelFormatter={(label) => `Año ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Legal"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Judicial"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="TAE"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="TAE+5%"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Intereses por Modalidad y Año</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `€${value.toLocaleString()}`} />
                      <Tooltip
                        formatter={(value: number) => [`€${value.toLocaleString()}`, 'Intereses']}
                        labelFormatter={(label) => `Año ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="Legal" fill="#10B981" />
                      <Bar dataKey="Judicial" fill="#F59E0B" />
                      <Bar dataKey="TAE" fill="#EF4444" />
                      <Bar dataKey="TAE+5%" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-sm text-gray-600">
                  <p>* Los intereses se distribuyen equitativamente entre los años del período de cálculo para fines de visualización.</p>
                  <p>* Para cálculos más precisos año a año, considere períodos más cortos o cálculos específicos por año.</p>
                </div>
              </div>
            </div>
        )}
      </div>

      {/* Sección de Personalización del Informe */}
      {showReportCustomization && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Personalización del Informe PDF</h2>
            </div>
            <button
              onClick={() => setShowReportCustomization(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Principal
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="INFORME DE CÁLCULOS DE INTERESES"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtítulo
              </label>
              <input
                type="text"
                value={reportSubtitle}
                onChange={(e) => setReportSubtitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="DE INTERESES"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas del Expediente
              </label>
              <textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agregue aquí notas específicas del expediente, observaciones importantes o información adicional..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Información Adicional
              </label>
              <textarea
                value={reportAdditionalInfo}
                onChange={(e) => setReportAdditionalInfo(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Información adicional sobre el caso, referencias legales, o cualquier otro detalle relevante..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pie de Página
              </label>
              <input
                type="text"
                value={reportFooter}
                onChange={(e) => setReportFooter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sistema de Cálculo de Intereses Legales - Tasador Web v2.0"
              />
            </div>
          </div>

          {/* Sección de Selección de Contenidos del Informe */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Secciones del Informe</h3>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona las secciones que deseas incluir en el informe PDF:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeResultadoPorModalidad"
                  checked={includeResultadoPorModalidad}
                  onChange={(e) => setIncludeResultadoPorModalidad(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeResultadoPorModalidad" className="ml-2 text-sm text-gray-700">
                  <span className="font-medium">Resultado por Modalidad</span>
                  <p className="text-xs text-gray-500">Resumen de cálculos agrupados por tipo de interés</p>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeTablaResumen"
                  checked={includeTablaResumen}
                  onChange={(e) => setIncludeTablaResumen(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeTablaResumen" className="ml-2 text-sm text-gray-700">
                  <span className="font-medium">Tabla Resumen por Concepto</span>
                  <p className="text-xs text-gray-500">Tabla con concepto, períodos en una fila única por concepto</p>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeDetalleCalculo"
                  checked={includeDetalleCalculo}
                  onChange={(e) => setIncludeDetalleCalculo(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeDetalleCalculo" className="ml-2 text-sm text-gray-700">
                  <span className="font-medium">Detalle de Cálculos</span>
                  <p className="text-xs text-gray-500">Desglose año a año de cada cálculo realizado</p>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeResumenVisual"
                  checked={includeResumenVisual}
                  onChange={(e) => setIncludeResumenVisual(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeResumenVisual" className="ml-2 text-sm text-gray-700">
                  <span className="font-medium">Resumen Visual (Gráficos)</span>
                  <p className="text-xs text-gray-500">Gráficos de evolución temporal de intereses</p>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeMetodologia"
                  checked={includeMetodologia}
                  onChange={(e) => setIncludeMetodologia(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeMetodologia" className="ml-2 text-sm text-gray-700">
                  <span className="font-medium">Metodología de Cálculo</span>
                  <p className="text-xs text-gray-500">Fórmulas matemáticas y tabla de intereses históricos</p>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                setReportTitle('INFORME DE CÁLCULOS DE INTERESES')
                setReportSubtitle('DE INTERESES')
                setReportNotes('')
                setReportAdditionalInfo('')
                setReportFooter('Departamento de Ejecuciones y Tasaciones - RUA ABOGADOS')
                setIncludeResultadoPorModalidad(true)
                setIncludeTablaResumen(true)
                setIncludeDetalleCalculo(true)
                setIncludeResumenVisual(true)
                setIncludeMetodologia(true)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Restablecer Valores
            </button>
            <button
              onClick={() => setShowReportCustomization(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Aplicar Cambios
            </button>
          </div>

          {/* Sección de Plantillas */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plantillas de Informes</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Plantilla
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Informe Judicial Completo"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={saveReportTemplate}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  💾 Guardar Plantilla
                </button>
              </div>
            </div>

            {reportTemplates.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">Plantillas Guardadas</h4>
                <div className="space-y-2">
                  {reportTemplates.map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium text-gray-900">{template.name}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadReportTemplate(template)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Cargar
                        </button>
                        <button
                          onClick={() => deleteReportTemplate(template.name)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Configuración del PDF */}
      {showPdfConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Download className="h-6 w-6 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-900">Configuración del Informe PDF</h2>
                </div>
                <button
                  onClick={() => setShowPdfConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Datos del Expediente */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos del Expediente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Expediente *
                    </label>
                    <input
                      type="text"
                      value={nombreExpedienteTemp}
                      onChange={(e) => setNombreExpedienteTemp(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Ej: Reclamación Juan Pérez"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Procedimiento *
                    </label>
                    <input
                      type="text"
                      value={numeroProcedimiento}
                      onChange={(e) => setNumeroProcedimiento(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Ej: 123/2024"
                    />
                  </div>
                </div>
              </div>

              {/* Secciones a Incluir */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Secciones del Informe</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona las secciones que deseas incluir en el informe:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeResultadoPorModalidad}
                      onChange={(e) => setIncludeResultadoPorModalidad(e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">Resultado por Modalidad</span>
                      <p className="text-xs text-gray-500">Resumen de cálculos agrupados por tipo de interés</p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTablaResumen}
                      onChange={(e) => setIncludeTablaResumen(e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">Tabla Resumen por Concepto</span>
                      <p className="text-xs text-gray-500">Tabla consolidada con períodos por concepto</p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMetodologia}
                      onChange={(e) => setIncludeMetodologia(e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">Metodología de Cálculo</span>
                      <p className="text-xs text-gray-500">Fórmulas matemáticas y tabla de intereses históricos</p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeResumenVisual}
                      onChange={(e) => setIncludeResumenVisual(e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">Resumen Visual (Gráficos)</span>
                      <p className="text-xs text-gray-500">Gráficos de evolución temporal de intereses</p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDetalleCalculo}
                      onChange={(e) => setIncludeDetalleCalculo(e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">Detalle de Cálculos</span>
                      <p className="text-xs text-gray-500">Desglose año a año de cada cálculo</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowPdfConfigModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={!nombreExpedienteTemp || !numeroProcedimiento}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}