import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Calculator, TrendingUp, Upload, AlertCircle, Trash2, BarChart3, Download, X, RefreshCw } from 'lucide-react'
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
  cuantía: string
  fecha_inicio: string
  concepto?: string
}

export default function InterestCalculatorAdvanced() {
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [excelData, setExcelData] = useState<ExcelRow[]>([])
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ cuantía: '', fecha_inicio: '', concepto: '' })
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
  const [reportFooter, setReportFooter] = useState<string>('Sistema de Cálculo de Intereses Legales - Tasador Web v2.0')
  const [showReportCustomization, setShowReportCustomization] = useState<boolean>(false)
  const [reportTemplates, setReportTemplates] = useState<Array<{name: string, config: any}>>([])
  const [templateName, setTemplateName] = useState<string>('')
  const [isResetting, setIsResetting] = useState<boolean>(false)
  const [calculationProgress, setCalculationProgress] = useState<number>(0)
  const [calculationStatus, setCalculationStatus] = useState<string>('')

  // Función para reset completo de la calculadora
  const resetCalculator = useCallback(() => {
    setIsResetting(true)
    
    // Limpiar todos los estados
    setExcelData([])
    setResults([])
    setError(null)
    setAvailableColumns([])
    setColumnMapping({ cuantía: '', fecha_inicio: '', concepto: '' })
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
      setColumnMapping({ cuantía: '', fecha_inicio: '', concepto: '' })

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
  }, [])

  // Optimización del cálculo de intereses con progress tracking
  const calculateAllInterests = useCallback(async () => {
    if (!initialized || excelData.length === 0 || !columnMapping.cuantía || !columnMapping.fecha_inicio) {
      setError('Debe seleccionar las columnas de mapeo y subir un archivo')
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
      const totalCalculations = totalRows * globalModalidades.length

      for (const [rowIndex, row] of excelData.entries()) {
        try {
          // Get values using column mapping
          const cuantiaValue = row[columnMapping.cuantía]
          const fechaInicioValue = row[columnMapping.fecha_inicio]
          const conceptoValue = columnMapping.concepto ? row[columnMapping.concepto] : undefined

          // Skip rows with invalid or missing data
          if (!cuantiaValue || !fechaInicioValue ||
              String(cuantiaValue).toLowerCase().includes('total') ||
              String(fechaInicioValue).toLowerCase().includes('total') ||
              String(cuantiaValue).trim() === '' ||
              String(fechaInicioValue).trim() === '') {
            continue
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
          for (const [modalityIndex, modalidad] of globalModalidades.entries()) {
            const currentCalculation = (rowIndex * globalModalidades.length) + modalityIndex + 1
            const progress = Math.round((currentCalculation / totalCalculations) * 100)
            
            setCalculationProgress(progress)
            setCalculationStatus(`Calculando ${modalidad} para registro ${rowIndex + 1}/${totalRows}...`)
            
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

            // Skip if total interest is zero or negative
            if (result.totalInteres <= 0) {
              continue
            }

            calculatedResults.push({
              ...row,
              cuantía: capital,
              fecha_inicio: parsedFechaInicio.toISOString().split('T')[0],
              fecha_fin: parsedFechaFin.toISOString().split('T')[0],
              modalidad,
              tae_contrato: globalTaeContrato ? parseFloat(globalTaeContrato) : undefined,
              fecha_sentencia: globalFechaSentencia || undefined,
              concepto: conceptoValue ? String(conceptoValue) : undefined,
              resultado: result
            })
          }
        } catch (rowError) {
          console.warn('Error calculating row:', rowError)
          // Skip rows with errors completely - don't add any results
          continue
        }
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

    // Preguntar por el nombre del expediente
    const nombreExpediente = prompt('Introduce el nombre del expediente:')
    if (!nombreExpediente || nombreExpediente.trim() === '') {
      alert('Debes introducir un nombre de expediente válido.')
      return
    }

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
        pdf.text('Generado por Tasador Web', pageWidth - margin - 60, pageHeight - 5)
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
        // Convertir la imagen importada a base64 para jsPDF
        const img = new Image()
        img.src = logoRua
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const imgData = canvas.toDataURL('image/png')

        // Añadir logo centrado en la parte superior
        const logoWidth = 80
        const logoHeight = (img.height * logoWidth) / img.width
        const logoX = (pageWidth - logoWidth) / 2
        pdf.addImage(imgData, 'PNG', logoX, 30, logoWidth, logoHeight)
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

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 220, { align: 'center' })
      pdf.text(`Hora: ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, 230, { align: 'center' })

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
        { title: '2. PARÁMETROS DE CÁLCULO', page: 4 },
        { title: '3. RESULTADOS POR MODALIDAD', page: 5 }
      ]

      // Añadir resultados por modalidad al índice
      let currentPage = 6
      globalModalidades.forEach(modalidad => {
        const modalityResults = results.filter(r => r.modalidad === modalidad)
        if (modalityResults.length > 0) {
          const title = `3.${globalModalidades.indexOf(modalidad) + 1}. ${modalidad === 'legal' ? 'INTERESES LEGALES' :
                     modalidad === 'judicial' ? 'INTERESES JUDICIALES' :
                     modalidad === 'tae' ? 'INTERESES TAE' : 'INTERESES TAE + 5%'}`
          indexItems.push({ title, page: currentPage })
          currentPage += Math.ceil(modalityResults.length / 15) + 1 // Estimación de páginas
        }
      })

      indexItems.push({ title: '4. ANÁLISIS GRÁFICO', page: currentPage })
      indexItems.push({ title: '5. DETALLE DE CÁLCULOS', page: currentPage + 2 })

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
      const totalCalculos = results.length
      const totalIntereses = results.reduce((sum, r) => sum + (r.resultado?.totalInteres || 0), 0)
      const totalCapital = results.reduce((sum, r) => sum + r.cuantía, 0)

      pdf.setFont('helvetica', 'normal')
      pdf.text(`• Total de cálculos realizados: ${totalCalculos}`, margin, yPosition)
      yPosition += 8
      pdf.text(`• Capital total analizado: ${totalCapital.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`, margin, yPosition)
      yPosition += 8
      pdf.text(`• Intereses totales generados: ${totalIntereses.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`, margin, yPosition)
      yPosition += 8
      pdf.text(`• Período de cálculo: Hasta ${new Date(globalFechaFin).toLocaleDateString('es-ES')}`, margin, yPosition)
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

      pdf.text(`• Fecha fin de cálculo: ${new Date(globalFechaFin).toLocaleDateString('es-ES')}`, margin + 10, yPosition)
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

      // RESULTADOS POR MODALIDAD
      yPosition = addNewPage()
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('3. RESULTADOS POR MODALIDAD', margin, yPosition)
      yPosition += 15

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
        const capitalModalidad = modalityResults.reduce((sum, r) => sum + r.cuantía, 0)

        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`• Número de cálculos: ${modalityResults.length}`, margin + 10, yPosition)
        yPosition += 7
        pdf.text(`• Capital total: ${capitalModalidad.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`, margin + 10, yPosition)
        yPosition += 7
        pdf.text(`• Intereses totales: ${totalInteresesModalidad.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`, margin + 10, yPosition)
        yPosition += 12

        // Tabla de resultados
        if (yPosition > pageHeight - 80) {
          yPosition = addNewPage()
        }

        const tableData = modalityResults.map(r => {
          const row = [
            r.cuantía.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
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

        const tableHeaders = [['Capital (€)', 'Fecha Inicio', 'Fecha Fin', 'Intereses (€)']]
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

      // ANÁLISIS GRÁFICO
      yPosition = addNewPage()
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('4. ANÁLISIS GRÁFICO', margin, yPosition)
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

      // DETALLE DE CÁLCULOS
      yPosition = addNewPage()
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('5. DETALLE DE CÁLCULOS', margin, yPosition)
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

      // Descargar el PDF
      const fileName = `INFORME_INTERESES_${nombreExpediente.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}.pdf`
      pdf.save(fileName)

      alert(`PDF generado correctamente: ${fileName}`)

    } catch (error) {
      console.error('Error generando PDF:', error)
      setError('Error al generar el PDF')
    }
  }, [results, globalModalidades, globalFechaFin, globalTaeContrato, globalFechaSentencia, reportTitle, reportSubtitle, reportNotes, reportAdditionalInfo, reportFooter])

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
                {columnMapping.cuantía && columnMapping.fecha_inicio && (
                  <p className="text-sm text-gray-600 mt-1">
                    Mapeo aplicado: <span className="font-medium text-blue-600">"{columnMapping.cuantía}" → Cuantía</span>, 
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
                    !columnMapping.cuantía || 
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
                        {col === columnMapping.cuantía && <span className="ml-1 text-blue-600">→ Cuantía</span>}
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
                onClick={exportToPDF}
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

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                setReportTitle('INFORME DE CÁLCULOS DE INTERESES')
                setReportSubtitle('DE INTERESES')
                setReportNotes('')
                setReportAdditionalInfo('')
                setReportFooter('Sistema de Cálculo de Intereses Legales - Tasador Web v2.0')
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
    </div>
  )
}