import { useState, useEffect } from 'react'
import { Calculator, Calendar, Euro, TrendingUp, AlertCircle, Download } from 'lucide-react'
import { interestCalculator, initializeInterestCalculator } from '../lib/interestCalculator'
import type { InterestCalculationInput, InterestCalculationResult } from '../lib/interestCalculator'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoRua from '../assets/logo-rua.png'

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}

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

  // Estados para personalización del informe PDF
  const [reportTitle, setReportTitle] = useState<string>('INFORME DE CÁLCULO DE INTERESES')
  const [reportSubtitle, setReportSubtitle] = useState<string>('Cálculo Simple de Intereses')
  const [reportFooter, setReportFooter] = useState<string>('Departamento de Ejecuciones y Tasaciones - RUA ABOGADOS')
  const [nombreExpediente, setNombreExpediente] = useState<string>('')
  const [numeroProcedimiento, setNumeroProcedimiento] = useState<string>('')

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

  const generatePDF = async () => {
    if (!resultado) return

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
        if (nombreExpediente) {
          pdf.text(`Expediente: ${nombreExpediente}`, pageWidth - margin - 60, pageHeight - 10)
        }
        if (numeroProcedimiento) {
          pdf.text(`Nº Procedimiento: ${numeroProcedimiento}`, margin, pageHeight - 5)
        }
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
      try {
        const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = logoRua
        })
        
        const maxLogoWidth = 80
        const aspectRatio = logoImg.height / logoImg.width
        const logoWidth = maxLogoWidth
        const logoHeight = logoWidth * aspectRatio
        const logoX = (pageWidth - logoWidth) / 2
        
        pdf.addImage(logoRua, 'PNG', logoX, 30, logoWidth, logoHeight)
      } catch (error) {
        console.warn('No se pudo cargar el logo:', error)
      }

      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text(reportTitle, pageWidth / 2, 130, { align: 'center' })

      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'normal')
      pdf.text(reportSubtitle, pageWidth / 2, 150, { align: 'center' })

      if (nombreExpediente) {
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Expediente:', pageWidth / 2, 180, { align: 'center' })

        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text(nombreExpediente.toUpperCase(), pageWidth / 2, 195, { align: 'center' })
      }
      
      if (numeroProcedimiento) {
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Nº Procedimiento: ${numeroProcedimiento}`, pageWidth / 2, 210, { align: 'center' })
      }

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 230, { align: 'center' })
      pdf.text(`Hora: ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, 240, { align: 'center' })

      pdf.setFontSize(10)
      pdf.text(reportFooter, pageWidth / 2, 250, { align: 'center' })

      addFooter(pageNumber)

      // RESUMEN EJECUTIVO
      let yPosition = addNewPage()
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RESUMEN EJECUTIVO', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')

      const capitalNum = parseFloat(capital.replace(',', '.'))
      const summaryData = [
        ['Capital Principal:', formatCurrency(capitalNum)],
        ['Total Intereses:', formatCurrency(resultado.totalInteres)],
        ['Total a Pagar:', formatCurrency(capitalNum + resultado.totalInteres)],
        ['Modalidad:', modalidad === 'legal' ? 'Interés Legal' :
                      modalidad === 'judicial' ? 'Interés Judicial' :
                      modalidad === 'tae' ? 'TAE Contrato' : 'TAE + 5%'],
        ['Fecha Inicio:', new Date(fechaInicio).toLocaleDateString('es-ES')],
        ['Fecha Fin:', new Date(fechaFin).toLocaleDateString('es-ES')],
        ['Días Totales:', resultado.detallePorAño.reduce((sum, d) => sum + d.dias, 0).toString()]
      ]

      if (modalidad === 'tae' || modalidad === 'tae_plus5') {
        summaryData.push(['TAE Contrato:', `${taeContrato}%`])
      }

      if (modalidad === 'judicial' && fechaSentencia) {
        summaryData.push(['Fecha Sentencia:', new Date(fechaSentencia).toLocaleDateString('es-ES')])
      }

      autoTable(pdf, {
        startY: yPosition,
        head: [['Concepto', 'Valor']],
        body: summaryData,
        theme: 'grid',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { halign: 'right', cellWidth: 90 }
        },
        margin: { left: margin, right: margin }
      })

      yPosition = pdf.lastAutoTable.finalY + 20

      // DETALLE POR AÑO
      if (yPosition > pageHeight - 100) {
        yPosition = addNewPage()
      } else {
        yPosition += 10
      }

      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('DETALLE DE CÁLCULO POR AÑO', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10

      const detalleData = resultado.detallePorAño.map(detalle => [
        detalle.año.toString(),
        detalle.dias.toString(),
        `${(detalle.tasa * 100).toFixed(2)}%`,
        detalle.tipo === 'legal' ? 'Legal' :
        detalle.tipo === 'judicial' ? 'Judicial' :
        detalle.tipo === 'tae' ? 'TAE' : 'TAE+5%',
        formatCurrency(detalle.interes)
      ])

      autoTable(pdf, {
        startY: yPosition,
        head: [['Año', 'Días', 'Tasa (%)', 'Tipo', 'Interés (€)']],
        body: detalleData,
        foot: [['', '', '', 'TOTAL:', formatCurrency(resultado.totalInteres)]],
        theme: 'striped',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        footStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'right'
        },
        columnStyles: {
          0: { halign: 'center' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin }
      })

      yPosition = pdf.lastAutoTable.finalY + 20

      // METODOLOGÍA
      if (yPosition > pageHeight - 60) {
        yPosition = addNewPage()
      }

      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('METODOLOGÍA DE CÁLCULO', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      
      const metodologiaTexto = [
        'El cálculo de intereses se ha realizado conforme a la legislación española vigente,',
        'aplicando la fórmula estándar de interés simple con año comercial de 360 días:',
        '',
        'Interés = Capital × Tasa × Días / 360',
        '',
        'Los tipos de interés aplicados corresponden a las tasas oficiales publicadas',
        'por el Banco de España para cada período del cálculo.'
      ]

      metodologiaTexto.forEach(linea => {
        if (yPosition > pageHeight - 30) {
          yPosition = addNewPage()
        }
        pdf.text(linea, margin, yPosition)
        yPosition += 6
      })

      // Guardar PDF
      const fileName = nombreExpediente 
        ? `Informe_Intereses_${nombreExpediente.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`
        : `Informe_Intereses_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`
      
      pdf.save(fileName)

    } catch (error) {
      console.error('Error al generar PDF:', error)
      setError('Error al generar el PDF')
    }
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

        {/* Campos opcionales para el informe PDF */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Información Opcional para el Informe PDF
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Expediente
              </label>
              <input
                type="text"
                value={nombreExpediente}
                onChange={(e) => setNombreExpediente(e.target.value)}
                placeholder="Ej: Expediente XYZ-2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nº de Procedimiento
              </label>
              <input
                type="text"
                value={numeroProcedimiento}
                onChange={(e) => setNumeroProcedimiento(e.target.value)}
                placeholder="Ej: 123/2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Resultado del Cálculo</h3>
              <button
                onClick={generatePDF}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Descargar PDF</span>
              </button>
            </div>

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