import { describe, it, expect, beforeAll } from 'vitest'
import { buildInformeCompletoPdf, buildInformeResumenPdf } from '../src/lib/informeLiquidacion'

beforeAll(() => {
  // jsdom no carga imágenes de verdad; simulamos el evento onload para que
  // la promesa de carga del logo no se quede esperando indefinidamente.
  class FakeImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    height = 40
    width = 160
    private _src = ''
    set src(value: string) {
      this._src = value
      setTimeout(() => this.onload?.(), 0)
    }
    get src() {
      return this._src
    }
  }
  // @ts-expect-error stub mínimo de Image para el entorno de test (jsdom)
  global.Image = FakeImage
})

describe('buildInformeResumenPdf', () => {
  it('genera un PDF de resumen sin datos de detalle', async () => {
    const pdf = await buildInformeResumenPdf({
      refAranzadi: 'TEST-001',
      usuario: 'Usuario Prueba',
      interesesLegales: 100,
      interesJudicial: 50,
      taeCto: 0,
      taeMas5: 0,
      taePorcentaje: 5,
      fechaFin: '2025-01-01',
      fechaSentencia: null,
      fechaCreacion: '2025-01-01T00:00:00.000Z'
    })

    const blob = pdf.output('blob')
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })
})

describe('buildInformeCompletoPdf', () => {
  it('reconstruye el informe completo a partir de un snapshot guardado', async () => {
    const pdf = await buildInformeCompletoPdf({
      nombreExpediente: 'Expediente Test',
      numeroProcedimiento: 'TEST-001',
      fechaGeneracion: '2025-01-01T10:00:00.000Z',
      results: [
        {
          cuantía: 1000,
          fecha_inicio: '2024-01-01',
          fecha_fin: '2025-01-01',
          modalidad: 'legal',
          resultado: {
            totalInteres: 30,
            detallePorAño: [{ año: 2024, dias: 365, tasa: 0.03, interes: 30, tipo: 'legal' }]
          }
        }
      ],
      globalModalidades: ['legal'],
      globalFechaFin: '2025-01-01',
      globalFechaSentencia: '',
      globalTaeContrato: '',
      reportTitle: 'INFORME DE CÁLCULOS DE INTERESES',
      reportSubtitle: 'DE INTERESES',
      reportNotes: '',
      reportAdditionalInfo: '',
      reportFooter: 'RUA ABOGADOS',
      includeResultadoPorModalidad: true,
      includeTablaResumen: true,
      includeDetalleCalculo: true,
      includeResumenVisual: true,
      includeMetodologia: true
    })

    const blob = pdf.output('blob')
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('no falla cuando no hay resultados para alguna modalidad seleccionada', async () => {
    const pdf = await buildInformeCompletoPdf({
      nombreExpediente: 'Expediente Vacío',
      numeroProcedimiento: 'TEST-002',
      fechaGeneracion: '2025-01-01T10:00:00.000Z',
      results: [],
      globalModalidades: ['judicial'],
      globalFechaFin: '2025-01-01',
      globalFechaSentencia: '2024-06-01',
      globalTaeContrato: '',
      reportTitle: 'INFORME',
      reportSubtitle: 'SUBTITULO',
      reportNotes: '',
      reportAdditionalInfo: '',
      reportFooter: 'RUA ABOGADOS',
      includeResultadoPorModalidad: true,
      includeTablaResumen: true,
      includeDetalleCalculo: true,
      includeResumenVisual: false,
      includeMetodologia: true
    })

    const blob = pdf.output('blob')
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })
})
