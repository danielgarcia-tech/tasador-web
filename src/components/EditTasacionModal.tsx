import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Calculator } from 'lucide-react'
import { calcularCostas, obtenerFasesTerminacion } from '../lib/calculator'
import { useTasaciones } from '../hooks/useTasaciones'
import type { Tasacion } from '../lib/supabase'

const editTasacionSchema = z.object({
  nombre_cliente: z.string().min(1, 'El nombre del cliente es requerido'),
  numero_procedimiento: z.string().min(1, 'El número de procedimiento es requerido'),
  nombre_juzgado: z.string().optional(),
  entidad_demandada: z.string().optional(),
  municipio: z.string().min(1, 'El municipio es requerido'),
  criterio_ica: z.string().optional(),
  tipo_proceso: z.enum(['Juicio Verbal', 'Juicio Ordinario']).optional(),
  fase_terminacion: z.string().min(1, 'La fase de terminación es requerida'),
  instancia: z.enum(['PRIMERA INSTANCIA', 'SEGUNDA INSTANCIA']),
  nombre_usuario: z.string().optional(),
  fecha_demanda: z.string().optional(),
})

type EditTasacionFormData = z.infer<typeof editTasacionSchema>

interface EditTasacionModalProps {
  tasacion: Tasacion
  isOpen: boolean
  onClose: () => void
}

export default function EditTasacionModal({ tasacion, isOpen, onClose }: EditTasacionModalProps) {
  const { update } = useTasaciones()
  const [isLoading, setIsLoading] = useState(false)
  const [costas, setCostas] = useState<{ costas: number; iva: number; total: number } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<EditTasacionFormData>({
    resolver: zodResolver(editTasacionSchema),
    defaultValues: {
      nombre_cliente: tasacion.nombre_cliente,
      numero_procedimiento: tasacion.numero_procedimiento,
      nombre_juzgado: tasacion.nombre_juzgado || '',
      entidad_demandada: tasacion.entidad_demandada || '',
      municipio: tasacion.municipio,
      criterio_ica: tasacion.criterio_ica || '',
      tipo_proceso: tasacion.tipo_proceso || '',
      fase_terminacion: tasacion.fase_terminacion,
      instancia: tasacion.instancia,
      nombre_usuario: tasacion.nombre_usuario || '',
      fecha_demanda: tasacion.fecha_demanda || '',
    }
  })

  const criterioIca = watch('criterio_ica')
  const tipoJuicio = watch('tipo_proceso')
  const faseTerminacion = watch('fase_terminacion')
  const instancia = watch('instancia')

  // Recalcular costas cuando cambien los parámetros relevantes
  useEffect(() => {
    const calcularCostasAsync = async () => {
      if (criterioIca && faseTerminacion && instancia && tipoJuicio) {
        try {
          const resultado = await calcularCostas({
            criterioICA: criterioIca,
            tipoJuicio: tipoJuicio as 'Juicio Verbal' | 'Juicio Ordinario',
            faseTerminacion,
            instancia,
            fechaDemanda: tasacion.fecha_demanda
          })
          setCostas(resultado)
        } catch (error) {
          console.error('Error calculating costas:', error)
          setCostas(null)
        }
      }
    }
    
    calcularCostasAsync()
  }, [criterioIca, tipoJuicio, faseTerminacion, instancia])

  const onSubmit = async (data: EditTasacionFormData) => {
    if (!costas) {
      alert('Error: No se pudieron calcular las costas')
      return
    }

    setIsLoading(true)
    try {
      await update(tasacion.id, {
        ...data,
        costas_sin_iva: costas.costas,
        iva_21: costas.iva,
        total: costas.total,
        updated_at: new Date().toISOString()
      })
      onClose()
    } catch (error) {
      console.error('Error updating tasacion:', error)
      alert('Error al actualizar la tasación')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Tasación</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Cliente y Procedimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente *
              </label>
              <input
                {...register('nombre_cliente')}
                className="input"
                placeholder="Nombre completo del cliente"
              />
              {errors.nombre_cliente && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre_cliente.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Procedimiento *
              </label>
              <input
                {...register('numero_procedimiento')}
                className="input"
                placeholder="Ej: PO 123/2024"
              />
              {errors.numero_procedimiento && (
                <p className="text-red-500 text-sm mt-1">{errors.numero_procedimiento.message}</p>
              )}
            </div>
          </div>

          {/* Juzgado y Entidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Juzgado
              </label>
              <input
                {...register('nombre_juzgado')}
                className="input"
                placeholder="Ej: Juzgado de Primera Instancia nº 1 de Madrid"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entidad Demandada
              </label>
              <input
                {...register('entidad_demandada')}
                className="input"
                placeholder="Nombre de la entidad demandada"
              />
            </div>
          </div>

          {/* Municipio y Criterio ICA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipio *
              </label>
              <input
                {...register('municipio')}
                className="input"
                placeholder="Nombre del municipio"
              />
              {errors.municipio && (
                <p className="text-red-500 text-sm mt-1">{errors.municipio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Criterio ICA
              </label>
              <input
                {...register('criterio_ica')}
                className="input"
                placeholder="Criterio ICA aplicable"
              />
            </div>
          </div>

          {/* Tipo de Proceso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Proceso *
            </label>
            <select {...register('tipo_proceso')} className="input">
              <option value="">Seleccionar tipo...</option>
              <option value="Juicio Ordinario">Juicio Ordinario</option>
              <option value="Juicio Verbal">Juicio Verbal</option>
            </select>
          </div>

          {/* Fase e Instancia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fase de Terminación *
              </label>
              <select {...register('fase_terminacion')} className="input">
                <option value="">Seleccionar fase...</option>
                {tipoJuicio && obtenerFasesTerminacion(tipoJuicio).map((fase) => (
                  <option key={fase} value={fase}>
                    {fase}
                  </option>
                ))}
              </select>
              {errors.fase_terminacion && (
                <p className="text-red-500 text-sm mt-1">{errors.fase_terminacion.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instancia *
              </label>
              <select {...register('instancia')} className="input">
                <option value="PRIMERA INSTANCIA">Primera Instancia</option>
                <option value="SEGUNDA INSTANCIA">Segunda Instancia</option>
              </select>
              {errors.instancia && (
                <p className="text-red-500 text-sm mt-1">{errors.instancia.message}</p>
              )}
            </div>
          </div>

          {/* Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Usuario
            </label>
            <input
              {...register('nombre_usuario')}
              className="input"
              placeholder="Nombre del usuario que realiza la tasación"
            />
          </div>

          {/* Fecha de Demanda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Demanda
            </label>
            <input
              {...register('fecha_demanda')}
              type="date"
              className="input"
            />
            <p className="text-gray-600 text-sm mt-1">Se usa para seleccionar los valores de costas aplicables (pre-2025 o 2025+)</p>
          </div>

          {/* Resultado del Cálculo */}
          {costas && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-800">Cálculo Actualizado</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Costas sin IVA:</span>
                  <div className="font-semibold text-gray-900">€{costas.costas.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600">IVA (21%):</span>
                  <div className="font-semibold text-gray-900">€{costas.iva.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <div className="font-bold text-green-600 text-lg">€{costas.total.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={!isValid || isLoading || !costas}
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}