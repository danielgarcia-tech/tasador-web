import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSingle = vi.fn()

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockSingle
        }))
      }))
    }))
  }
}))

import { calcularCostas } from '../src/lib/calculator'

const criterio = {
  allanamiento: 100,
  audiencia_previa: 200,
  juicio: 500,
  factor_apelacion: 0.5,
  verbal_alegaciones: 0.3,
  verbal_vista: 0.4,
}

describe('calcularCostas', () => {
  beforeEach(() => {
    mockSingle.mockResolvedValue({ data: criterio, error: null })
  })

  it('Primera instancia + Ordinario + Allanamiento usa la columna allanamiento', async () => {
    const r = await calcularCostas({
      criterioICA: 'TEST',
      tipoJuicio: 'Juicio Ordinario',
      faseTerminacion: 'Allanamiento',
      instancia: 'PRIMERA INSTANCIA',
    })
    expect(r.costas).toBe(100)
  })

  it('Segunda instancia + Ordinario + Allanamiento aplica factor_apelacion sobre juicio, no sobre allanamiento', async () => {
    const r = await calcularCostas({
      criterioICA: 'TEST',
      tipoJuicio: 'Juicio Ordinario',
      faseTerminacion: 'Allanamiento',
      instancia: 'SEGUNDA INSTANCIA',
    })
    // Antes del fix esto daba 100 * 0.5 = 50 (allanamiento * factor_apelacion)
    expect(r.costas).toBe(250)
  })

  it('Segunda instancia + Ordinario: Audiencia Previa y Juicio dan el mismo resultado (base = juicio)', async () => {
    const rAudiencia = await calcularCostas({
      criterioICA: 'TEST',
      tipoJuicio: 'Juicio Ordinario',
      faseTerminacion: 'Audiencia Previa',
      instancia: 'SEGUNDA INSTANCIA',
    })
    const rJuicio = await calcularCostas({
      criterioICA: 'TEST',
      tipoJuicio: 'Juicio Ordinario',
      faseTerminacion: 'Juicio',
      instancia: 'SEGUNDA INSTANCIA',
    })
    expect(rAudiencia.costas).toBe(250)
    expect(rAudiencia.costas).toBe(rJuicio.costas)
  })

  it('Segunda instancia + Juicio Verbal + Vista también usa juicio * factor_apelacion', async () => {
    const r = await calcularCostas({
      criterioICA: 'TEST',
      tipoJuicio: 'Juicio Verbal',
      faseTerminacion: 'Vista',
      instancia: 'SEGUNDA INSTANCIA',
    })
    expect(r.costas).toBe(250)
  })
})
