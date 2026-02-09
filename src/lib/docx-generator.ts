import jsPDF from 'jspdf'

interface TasacionData {
  nombreCliente: string
  numeroProcedimiento: string
  nombreJuzgado: string
  entidadDemandada: string
  municipio: string
  instancia: 'PRIMERA INSTANCIA' | 'SEGUNDA INSTANCIA'
  costas: number
  iva: number
  total: number
  fecha: string
  fechaDemanda?: string
  refAranzadi?: string
}

// Función auxiliar para determinar el firmante según la fecha demanda
function getFirmantePorFecha(fechaDemanda?: string): { nombre: string; cargo: string; numeroCol: string } {
  // Valor por defecto: Pablo L. Rúa Sobrino
  if (!fechaDemanda) {
    return {
      nombre: 'Pablo L. Rúa Sobrino',
      cargo: 'SOCIO-DIRECTOR',
      numeroCol: 'Col. 1.114 ICA Ourense'
    }
  }

  // Parsear la fecha demanda (formato esperado: DD/MM/YYYY o YYYY-MM-DD)
  let fecha: Date
  
  if (fechaDemanda.includes('/')) {
    const [dia, mes, año] = fechaDemanda.split('/').map(Number)
    fecha = new Date(año, mes - 1, dia)
  } else if (fechaDemanda.includes('-')) {
    fecha = new Date(fechaDemanda)
  } else {
    // Si no se reconoce el formato, usar por defecto
    return {
      nombre: 'Pablo L. Rúa Sobrino',
      cargo: 'SOCIO-DIRECTOR',
      numeroCol: 'Col. 1.114 ICA Ourense'
    }
  }

  // Comparar con el 3 de julio de 2025
  const fechaLimite = new Date(2025, 6, 3) // julio es mes 6 (0-indexed)

  if (fecha < fechaLimite) {
    // Anterior al 3 de julio de 2025
    return {
      nombre: 'Pablo L. Rúa Sobrino',
      cargo: 'SOCIO-DIRECTOR',
      numeroCol: 'Col. 1.114 ICA Ourense'
    }
  } else {
    // A partir del 3 de julio de 2025
    return {
      nombre: 'Jesús Oroza Alonso',
      cargo: 'ABOGADO',
      numeroCol: 'Col. ICA Ferrol'
    }
  }
}

// Función para obtener la imagen de firma desde archivos locales
async function getSignatureImage(nombreFirmante: string): Promise<Uint8Array> {
  try {
    // Determinar la ruta según el firmante
    const rutaImagen = nombreFirmante === 'Pablo L. Rúa Sobrino' 
      ? '/firmas/pablo-rua-firma.png'
      : '/firmas/jesus-oroza-firma.png'
    
    // Intentar cargar la imagen
    const response = await fetch(rutaImagen)
    if (!response.ok) {
      throw new Error(`No se pudo cargar la imagen: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    console.warn('Error al cargar imagen de firma:', error)
    // Retornar un pixel transparente como fallback
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }
}

export async function generateMinutaDocx(tasacionData: TasacionData): Promise<void> {
  try {
    // Obtener datos del firmante según la fecha demanda
    const firmante = getFirmantePorFecha(tasacionData.fechaDemanda)
    
    // Cargar imagen de firma ANTES de crear el documento
    const imagenFirma = await getSignatureImage(firmante.nombre)
    
    // Crear documento PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    let y = 15
    const pageHeight = pdf.internal.pageSize.getHeight()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 15
    const maxWidth = pageWidth - margin * 2
    
    // Encabezado del despacho
    pdf.setFont('times', 'bold')
    pdf.setFontSize(16)
    pdf.text('RÚA ABOGADOS, S.L.P.U.', margin, y)
    y += 8
    
    pdf.setFont('times', 'normal')
    pdf.setFontSize(12)
    pdf.text('N.I.F.: B-32.425.670', margin, y)
    y += 6
    pdf.text('C/: Rosalía de Castro, nº 8, 1º.', margin, y)
    y += 6
    pdf.text('32.500-O Carballiño', margin, y)
    y += 6
    pdf.text('Ourense.', margin, y)
    y += 14
    
    // Fecha
    pdf.setFont('times', 'normal')
    pdf.setFontSize(12)
    pdf.text(`En Ourense, a ${tasacionData.fecha}`, margin, y)
    y += 14
    
    // Título principal
    pdf.setFont('times', 'bold')
    pdf.setFontSize(14)
    const titulo = 'PROPUESTA DE MINUTA DE HONORARIOS'
    pdf.text(titulo, margin, y)
    y += 10
    
    // Descripción
    pdf.setFont('times', 'normal')
    pdf.setFontSize(12)
    const descripcion = tasacionData.instancia === 'SEGUNDA INSTANCIA'
      ? `Devengados por este despacho en su intervención en el procedimiento ${tasacionData.numeroProcedimiento} seguido ante la ${tasacionData.nombreJuzgado}, en representación de ${tasacionData.nombreCliente}, como parte recurrida, en el recurso interpuesto por ${tasacionData.entidadDemandada}, como parte recurrente.`
      : `Devengados por este despacho en su intervención en el procedimiento ${tasacionData.numeroProcedimiento} seguido ante ${tasacionData.nombreJuzgado}, en representación de ${tasacionData.nombreCliente} como parte demandante frente a ${tasacionData.entidadDemandada}, como parte demandada.`
    
    const lineas = pdf.splitTextToSize(descripcion, maxWidth)
    pdf.text(lineas, margin, y)
    y += lineas.length * 6 + 10
    
    // Tabla de honorarios
    const columnWidths = [40, 20, 15, 25]
    const tableData = [
      ['Según Baremo', '', '', `${tasacionData.costas.toFixed(2)} €`],
      ['IVA', '', '21%', `${tasacionData.iva.toFixed(2)} €`],
      ['TOTAL', '', '', `${tasacionData.total.toFixed(2)} €`]
    ]
    
    const tableStartY = y
    const cellHeight = 12
    const colPositions = [margin]
    let currentX = margin
    for (let i = 0; i < columnWidths.length - 1; i++) {
      currentX += (maxWidth * columnWidths[i]) / 100
      colPositions.push(currentX)
    }
    colPositions.push(margin + maxWidth)
    
    // Borde superior de la tabla
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(0.8)
    pdf.line(margin, y, margin + maxWidth, y)
    
    // Dibujar filas de la tabla
    pdf.setFont('times', 'normal')
    pdf.setFontSize(12)
    
    tableData.forEach((row, rowIndex) => {
      y += cellHeight
      
      row.forEach((cell, cellIndex) => {
        const cellX = colPositions[cellIndex]
        const cellWidth = colPositions[cellIndex + 1] - cellX
        
        // Negrita para la última fila
        if (rowIndex === 2) {
          pdf.setFont('times', 'bold')
          pdf.setFontSize(13)
        } else {
          pdf.setFont('times', 'normal')
          pdf.setFontSize(12)
        }
        
        // Alinear derecha para la columna de precios
        const textX = cellIndex === 3 ? cellX + cellWidth - 2 : cellX + 3
        const textAlign = cellIndex === 3 ? 'right' : 'left'
        
        // Dibujar el texto
        if (cell) {
          pdf.text(cell, textX, y - cellHeight / 3, { align: textAlign, maxWidth: cellWidth - 6 })
        }
      })
      
      // Línea de separación horizontal
      pdf.setDrawColor(180, 180, 180)
      pdf.setLineWidth(0.5)
      pdf.line(margin, y, margin + maxWidth, y)
    })
    
    // Borde inferior más grueso
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(0.8)
    pdf.line(margin, y, margin + maxWidth, y)
    
    // Bordes verticales
    pdf.setLineWidth(0.5)
    colPositions.forEach((xPos, index) => {
      if (index > 0 && index < colPositions.length - 1) {
        pdf.setDrawColor(180, 180, 180)
        pdf.line(xPos, tableStartY, xPos, y)
      }
    })
    
    // Bordes laterales verticales principales
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(0.5)
    pdf.line(margin, tableStartY, margin, y)
    pdf.line(margin + maxWidth, tableStartY, margin + maxWidth, y)
    
    y += 12
    
    // Datos del firmante (alineado a la derecha)
    pdf.setFont('times', 'bold')
    pdf.setFontSize(12)
    pdf.text(firmante.nombre, pageWidth - margin - 2, y, { align: 'right' })
    y += 7
    pdf.text(firmante.cargo, pageWidth - margin - 2, y, { align: 'right' })
    y += 7
    pdf.setFont('times', 'normal')
    pdf.setFontSize(11)
    pdf.text(firmante.numeroCol, pageWidth - margin - 2, y, { align: 'right' })
    y += 14
    
    // Imagen de firma (alineado a la derecha)
    try {
      const base64String = Array.from(imagenFirma)
        .map(byte => String.fromCharCode(byte))
        .join('')
      const imgData = 'data:image/png;base64,' + btoa(base64String)
      pdf.addImage(imgData, 'PNG', pageWidth - margin - 55, y, 55, 40)
      y += 45
    } catch (imgError) {
      console.warn('No se pudo insertar la imagen de firma:', imgError)
    }
    
    // Número de cuenta
    pdf.setFont('times', 'normal')
    pdf.setFontSize(10)
    pdf.text('Nº Cta. ("la Caixa"): ES87 2100 2182 0202 0030 8400.', margin, y)
    y += 8

    // Pie de página
    pdf.setFont('times', 'normal')
    pdf.setFontSize(9)
    const footerText = 'En virtud de la Ley Orgánica 3/2018, de 5 diciembre, de Protección de Datos de Carácter Personal y garantía de los derechos digitales y del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, le informamos que los datos facilitados por usted han sido incluidos en nuestros ficheros para su tratamiento, con la finalidad de realizar los servicios por usted contratados. Usted tiene derecho a acceder a los mismos y ejercer los derechos de rectificación, cancelación, limitación, oposición y portabilidad de manera gratuita contactando comunicándose con RÚA ABOGADOS, S.L.P.U. a través del teléfono (+34 900 20 20 43) o en el correo electrónico: protecciondedatos@ruaabogados.es'
    const footerLines = pdf.splitTextToSize(footerText, pageWidth - 2 * margin)
    pdf.text(footerLines, margin, pageHeight - 12)
    
    // Descargar el PDF
    const fileName = tasacionData.refAranzadi 
      ? `MINUTA-${tasacionData.refAranzadi}.pdf`
      : `minuta_${tasacionData.numeroProcedimiento}.pdf`
    
    pdf.save(fileName)

  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error(`Error al generar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}