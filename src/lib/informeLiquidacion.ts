// Generador de informes PDF de liquidaciones de intereses.
//
// Extraído de InterestCalculatorAdvanced.tsx para poder reutilizarse desde
// HistorialLiquidaciones.tsx: dado un "snapshot" serializable (jsonb) de los
// datos con los que se generó una liquidación, se puede reconstruir el mismo
// PDF bajo demanda sin necesidad de guardar el archivo en Supabase Storage.
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import logoRua from '../assets/logo-rua.png'
import type { InterestCalculationResult } from './interestCalculator'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}

export type Modalidad = 'legal' | 'judicial' | 'tae' | 'tae_plus5'

export interface CalculationResultSnapshot {
  cuantía: number
  columna_cuantía?: string
  fecha_inicio: string
  fecha_fin: string
  modalidad: Modalidad
  concepto?: string
  resultado?: InterestCalculationResult
}

// Datos mínimos necesarios para reconstruir el informe completo tal y como
// se generó en su momento. Se guarda como jsonb en
// tasador_historial_liquidaciones.detalle_calculo.
export interface InformeLiquidacionSnapshot {
  nombreExpediente: string
  numeroProcedimiento: string
  fechaGeneracion: string // ISO, momento en que se generó/guardó originalmente
  results: CalculationResultSnapshot[]
  globalModalidades: Modalidad[]
  globalFechaFin: string
  globalFechaSentencia: string
  globalTaeContrato: string
  reportTitle: string
  reportSubtitle: string
  reportNotes: string
  reportAdditionalInfo: string
  reportFooter: string
  includeResultadoPorModalidad: boolean
  includeTablaResumen: boolean
  includeDetalleCalculo: boolean
  includeResumenVisual: boolean
  includeMetodologia: boolean
}

export const parseDateFromYYYYMMDD = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

export async function buildInformeCompletoPdf(snapshot: InformeLiquidacionSnapshot): Promise<jsPDF> {
  const {
    nombreExpediente,
    numeroProcedimiento,
    fechaGeneracion,
    results,
    globalModalidades,
    globalFechaSentencia,
    globalTaeContrato,
    reportTitle,
    reportSubtitle,
    reportNotes,
    reportAdditionalInfo,
    reportFooter,
    includeResultadoPorModalidad,
    includeTablaResumen,
    includeDetalleCalculo,
    includeResumenVisual,
    includeMetodologia
  } = snapshot

  const globalFechaFin = snapshot.globalFechaFin
  const fechaGeneracionDate = new Date(fechaGeneracion)

  const pdf = new jsPDF()
  let pageNumber = 1
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)

  const addFooter = (pageNum: number) => {
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'italic')
    pdf.text(`Página ${pageNum}`, margin, pageHeight - 10)
    pdf.text(`Expediente: ${nombreExpediente}`, pageWidth - margin - 60, pageHeight - 10)
    pdf.text(`Nº Procedimiento: ${numeroProcedimiento}`, margin, pageHeight - 5)
    pdf.text('RUA ABOGADOS', pageWidth - margin - 40, pageHeight - 5)
  }

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
  pdf.text(`Fecha de generación: ${fechaGeneracionDate.toLocaleDateString('es-ES')}`, pageWidth / 2, 230, { align: 'center' })
  pdf.text(`Hora: ${fechaGeneracionDate.toLocaleTimeString('es-ES')}`, pageWidth / 2, 240, { align: 'center' })

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

  if (includeMetodologia) {
    indexItems.push({ title: `${sectionNumber}. METODOLOGÍA DE CÁLCULO`, page: currentPage })
    currentPage += 2
    sectionNumber++
  }

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

  pdf.setFont('helvetica', 'normal')
  pdf.text(`• Período de cálculo: Hasta ${parseDateFromYYYYMMDD(globalFechaFin).toLocaleDateString('es-ES')}`, margin, yPosition)
  yPosition += 8
  pdf.text(`• Modalidades calculadas: ${globalModalidades.join(', ')}`, margin, yPosition)
  yPosition += 15

  // Tabla resumen de totales por modalidad
  const sumaPorModalidad = (mod: Modalidad) =>
    results.filter(r => r.modalidad === mod).reduce((sum, r) => sum + (r.resultado?.totalInteres || 0), 0)

  const totalLegal = sumaPorModalidad('legal')
  const totalJudicial = sumaPorModalidad('judicial')
  const totalTae = sumaPorModalidad('tae')
  const totalTaePlus5 = sumaPorModalidad('tae_plus5')

  if (yPosition > pageHeight - 80) {
    yPosition = addNewPage()
  }

  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Intereses calculados', margin, yPosition)
  yPosition += 10

  autoTable(pdf, {
    startY: yPosition,
    head: [['Concepto', 'Importe (€)']],
    body: [
      ['Intereses Legales', totalLegal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      ['Interés Judicial', totalJudicial.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      ['TAE CTO', totalTae.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      ['TAE+5%', totalTaePlus5.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      [
        { content: 'TOTAL', styles: { fontStyle: 'bold' } },
        {
          content: (totalLegal + totalJudicial + totalTae + totalTaePlus5).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          styles: { fontStyle: 'bold' }
        }
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: margin, right: margin },
    didDrawPage: (tableData) => {
      yPosition = (tableData.cursor?.y || yPosition) + 15
    }
  })

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
    const sectionNum = 3

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

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Fórmulas Matemáticas Aplicadas:', margin, yPosition)
    yPosition += 12

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')

    pdf.setFont('helvetica', 'bold')
    pdf.text('Fórmula General:', margin, yPosition)
    yPosition += 8
    pdf.setFont('helvetica', 'normal')
    pdf.text('Interés = Capital × (Tasa / 100) × (Días / 365)', margin + 10, yPosition)
    yPosition += 12

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

    if (yPosition > pageHeight - 100) {
      yPosition = addNewPage()
    }

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Tabla de Intereses Aplicables por Año:', margin, yPosition)
    yPosition += 12

    const allYears = new Set<number>()
    results.forEach(r => {
      if (r.resultado?.detallePorAño) {
        r.resultado.detallePorAño.forEach(d => allYears.add(d.año))
      }
    })
    const yearsArray = Array.from(allYears).sort((a, b) => a - b)

    if (yearsArray.length > 0) {
      const interestTableData: any[] = []

      yearsArray.forEach(year => {
        const row: any[] = [year.toString()]

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

      const headers = ['Año', 'Legal', 'Judicial']
      if (globalModalidades.includes('tae')) headers.push('TAE')
      if (globalModalidades.includes('tae_plus5')) headers.push('TAE+5%')

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

      if (yPosition > pageHeight - 80) {
        yPosition = addNewPage()
      }

      const tableData = modalityResults.map(r => {
        const row = [
          r.cuantía.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          r.columna_cuantía ? `(${r.columna_cuantía})` : '',
          new Date(r.fecha_inicio).toLocaleDateString('es-ES'),
          new Date(r.fecha_fin).toLocaleDateString('es-ES'),
          (r.resultado?.totalInteres || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ]

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

    const conceptosMap = new Map<string, CalculationResultSnapshot[]>()
    results.forEach(r => {
      const concepto = r.concepto || 'Sin concepto'
      if (!conceptosMap.has(concepto)) {
        conceptosMap.set(concepto, [])
      }
      conceptosMap.get(concepto)!.push(r)
    })

    const baseHeaders = ['Concepto', 'Cuantía (€)', 'Columna', 'Fecha Inicio', 'Fecha Fin']
    const modalidadHeaders: string[] = []
    const modalidadKeys: Modalidad[] = []

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
      const cuantiasColumnasMap = new Map<string, CalculationResultSnapshot[]>()
      resultados.forEach(r => {
        const key = `${r.cuantía}_${r.columna_cuantía || 'default'}`
        if (!cuantiasColumnasMap.has(key)) {
          cuantiasColumnasMap.set(key, [])
        }
        cuantiasColumnasMap.get(key)!.push(r)
      })

      cuantiasColumnasMap.forEach((resPorCuantia) => {
        const firstResult = resPorCuantia[0]

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
      const columnStyles: any = {
        1: { halign: 'right' },
        2: { halign: 'center' },
      }

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
  // Nota: si se regenera el informe fuera de la calculadora (p. ej. desde el
  // historial), no habrá gráficos .recharts-wrapper en el DOM y esta sección
  // caerá automáticamente en el aviso de "no hay gráficos disponibles".
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
            const scale = (pageHeight - yPosition - 40) / imgHeight
            const scaledWidth = imgWidth * scale
            const scaledHeight = imgHeight * scale
            pdf.addImage(imgData, 'PNG', margin, yPosition, scaledWidth, scaledHeight)
            yPosition += scaledHeight + 10
          } else {
            pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight)
            yPosition += imgHeight + 10
          }

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

  return pdf
}

// Informe ligero para liquidaciones antiguas de las que solo se conservan
// los totales agregados (no se guardó el detalle línea a línea del cálculo).
export interface ResumenLiquidacionData {
  refAranzadi: string
  usuario: string
  interesesLegales: number | null
  interesJudicial: number | null
  taeCto: number | null
  taeMas5: number | null
  taePorcentaje: number | null
  fechaFin: string | null
  fechaSentencia: string | null
  fechaCreacion: string
}

export async function buildInformeResumenPdf(data: ResumenLiquidacionData): Promise<jsPDF> {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  let y = 20

  try {
    const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = logoRua
    })

    const maxLogoWidth = 50
    const aspectRatio = logoImg.height / logoImg.width
    const logoWidth = maxLogoWidth
    const logoHeight = logoWidth * aspectRatio
    const logoX = (pageWidth - logoWidth) / 2

    pdf.addImage(logoRua, 'PNG', logoX, y, logoWidth, logoHeight)
    y += logoHeight + 10
  } catch (error) {
    console.warn('No se pudo cargar el logo:', error)
    y += 5
  }

  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('RESUMEN DE LIQUIDACIÓN DE INTERESES', pageWidth / 2, y, { align: 'center' })
  y += 18

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')

  const line = (label: string, value: string) => {
    pdf.setFont('helvetica', 'bold')
    pdf.text(label, margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text(value, margin + 60, y)
    y += 8
  }

  line('Ref. Aranzadi:', data.refAranzadi || 'N/A')
  line('Usuario:', data.usuario || 'N/A')
  line('Fecha de creación:', new Date(data.fechaCreacion).toLocaleDateString('es-ES'))
  line('Fecha fin de cálculo:', data.fechaFin ? new Date(data.fechaFin).toLocaleDateString('es-ES') : 'N/A')
  line('Fecha de sentencia:', data.fechaSentencia ? new Date(data.fechaSentencia).toLocaleDateString('es-ES') : 'N/A')
  line('% TAE aplicado:', data.taePorcentaje ? `${data.taePorcentaje.toFixed(2)}%` : 'N/A')

  y += 8
  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Intereses calculados', margin, y)
  y += 10

  autoTable(pdf, {
    startY: y,
    head: [['Concepto', 'Importe (€)']],
    body: [
      ['Intereses Legales', (data.interesesLegales ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      ['Interés Judicial', (data.interesJudicial ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      ['TAE CTO', (data.taeCto ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      ['TAE+5%', (data.taeMas5 ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      [
        { content: 'TOTAL', styles: { fontStyle: 'bold' } },
        {
          content: ((data.interesesLegales ?? 0) + (data.interesJudicial ?? 0) + (data.taeCto ?? 0) + (data.taeMas5 ?? 0))
            .toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          styles: { fontStyle: 'bold' }
        }
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: margin, right: margin }
  })

  return pdf
}
