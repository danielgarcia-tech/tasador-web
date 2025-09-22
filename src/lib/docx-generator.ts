import { Document, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, Packer, Footer } from 'docx'
import { saveAs } from 'file-saver'

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
  refAranzadi?: string
}

export async function generateMinutaDocx(tasacionData: TasacionData): Promise<void> {
  try {
    // Crear el pie de página
    const footer = new Footer({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "En virtud de la Ley Orgánica 3/2018, de 5 diciembre, de Protección de Datos de Carácter Personal y garantía de los derechos digitales y del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, le informamos que los datos facilitados por usted han sido incluidos en nuestros ficheros para su tratamiento, con la finalidad de realizar los servicios –por usted– contratados. Usted tiene derecho a acceder a los mismos y ejercer los derechos de rectificación, cancelación, limitación, oposición y portabilidad de manera gratuita contactando comunicándose con RÚA ABOGADOS, S.L.P.U. a través del teléfono (+34 900 20 20 43) o en el correo electrónico: protecciondedatos@ruaabogados.es",
              font: "Times New Roman",
              size: 16, // 8pt = 16 half-points
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
        }),
      ],
    })

    // Crear el documento
    const doc = new Document({
      sections: [{
        properties: {},
        footers: {
          default: footer,
        },
        children: [
          // Encabezado del despacho
          new Paragraph({
            children: [
              new TextRun({
                text: "RÚA ABOGADOS, S.L.P.U.",
                bold: true,
                font: "Times New Roman",
                size: 24, // 12pt = 24 half-points
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "N.I.F.: B-32.425.670",
                font: "Times New Roman",
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "C/: Rosalía de Castro, nº 8, 1º.",
                font: "Times New Roman",
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "32.500-O Carballiño",
                font: "Times New Roman",
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Ourense.",
                font: "Times New Roman",
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 }
          }),

          // Fecha
          new Paragraph({
            children: [
              new TextRun({
                text: `En Orense, a ${tasacionData.fecha}`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 }
          }),

          // Título principal - Cambiar según la instancia
          new Paragraph({
            children: [
              new TextRun({
                text: "PROPUESTA DE MINUTA DE HONORARIOS",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
              new TextRun({
                text: tasacionData.instancia === 'SEGUNDA INSTANCIA'
                  ? ` devengados por este despacho en su intervención en ${tasacionData.numeroProcedimiento} seguido ante la ${tasacionData.nombreJuzgado}, en representación de ${tasacionData.nombreCliente}, como parte recurrida, en el recurso interpuesto por ${tasacionData.entidadDemandada}., como parte recurrente.`
                  : ` devengados por este despacho en su intervención en ${tasacionData.numeroProcedimiento} seguido ante ${tasacionData.nombreJuzgado}, en representación de ${tasacionData.nombreCliente} como parte demandante frente a ${tasacionData.entidadDemandada}, como parte demandada.`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 600 }
          }),

          // Tabla de honorarios (sin bordes, solo texto alineado)
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.NONE, size: 0 },
              bottom: { style: BorderStyle.NONE, size: 0 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
              insideHorizontal: { style: BorderStyle.NONE, size: 0 },
              insideVertical: { style: BorderStyle.NONE, size: 0 },
            },
            rows: [
              // Costas sin IVA
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Según Baremo",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                    width: { size: 10, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${tasacionData.costas.toFixed(2)}`,
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                        alignment: AlignmentType.RIGHT,
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // IVA
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "IVA",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "21%",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${tasacionData.iva.toFixed(2)}`,
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                        alignment: AlignmentType.RIGHT,
                      }),
                    ],
                  }),
                ],
              }),
              // Total
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "TOTAL",
                            bold: true,
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${tasacionData.total.toFixed(2)}`,
                            bold: true,
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                        alignment: AlignmentType.RIGHT,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Espacios
          new Paragraph({
            children: [new TextRun({ text: "", font: "Times New Roman" })],
            spacing: { after: 600 }
          }),

          new Paragraph({
            children: [new TextRun({ text: "", font: "Times New Roman" })],
            spacing: { after: 400 }
          }),

          // Firma
          new Paragraph({
            children: [
              new TextRun({
                text: "Pablo L. Rúa Sobrino",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "SOCIO-DIRECTOR",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Col. 1.114 ICA Ourense",
                font: "Times New Roman",
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 }
          }),

          // Espacio adicional
          new Paragraph({
            children: [new TextRun({ text: "", font: "Times New Roman" })],
            spacing: { after: 200 }
          }),

          // Cuenta bancaria
          new Paragraph({
            children: [
              new TextRun({
                text: 'Nº Cta. ("la Caixa"): ES87 2100 2182 0202 0030 8400.',
                font: "Times New Roman",
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
          }),
        ],
      }],
    })

    // Generar el archivo usando Packer para navegador
    const blob = await Packer.toBlob(doc)
    
    // Descargar el archivo
    const fileName = tasacionData.refAranzadi 
      ? `MINUTA-${tasacionData.refAranzadi}.docx`
      : `minuta_${tasacionData.numeroProcedimiento}.docx`
    saveAs(blob, fileName)

  } catch (error) {
    console.error('Error generating DOCX:', error)
    throw new Error(`Error al generar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}