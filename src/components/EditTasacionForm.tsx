import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save } from 'lucide-react'
import { buscarMunicipios, obtenerTodosMunicipios } from '../lib/municipios'
import { buscarEntidades, obtenerTodasEntidades } from '../lib/entidades'
import { obtenerFasesTerminacion } from '../lib/calculator'
import { type Tasacion } from '../lib/supabase'

const tasacionSchema = z.object({
  nombre_cliente: z.string().min(1, 'El nombre del cliente es requerido'),
  numero_procedimiento: z.string().min(1, 'El número de procedimiento es requerido'),
  nombre_juzgado: z.string().optional(),
  entidad_demandada: z.string().optional(),
  municipio: z.string().min(1, 'El municipio es requerido'),
  tipo_proceso: z.enum(['Juicio Verbal', 'Juicio Ordinario']),
  fase_terminacion: z.string().min(1, 'La fase de terminación es requerida'),
  instancia: z.enum(['PRIMERA INSTANCIA', 'SEGUNDA INSTANCIA']),
  ref_aranzadi: z.string().optional(),
  fecha_demanda: z.string().optional(),
})

type TasacionForm = z.infer<typeof tasacionSchema>

export type { TasacionForm }

interface EditTasacionFormProps {
  editingTasacion: Tasacion | null
  isUpdating: boolean
  onSubmit: (data: TasacionForm) => Promise<void>
  onCancel: () => void
}

export function EditTasacionForm({
  editingTasacion,
  isUpdating,
  onSubmit,
  onCancel,
}: EditTasacionFormProps) {
  const [entidades, setEntidades] = useState<Array<{ codigo: string; nombre: string }>>([])
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<{ municipio: string; criterio_ica: string } | null>(null)
  const [showMunicipios, setShowMunicipios] = useState(false)
  const [showEntidades, setShowEntidades] = useState(false)
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState<Array<{ municipio: string; criterio_ica: string }>>([])
  const [todosMunicipios, setTodosMunicipios] = useState<Array<{ municipio: string; criterio_ica: string }>>([])

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<TasacionForm>({
    resolver: zodResolver(tasacionSchema),
    defaultValues: {
      tipo_proceso: 'Juicio Ordinario',
      instancia: 'PRIMERA INSTANCIA',
    },
  })

  const tipoProcesoWatch = watch('tipo_proceso')
  const municipioWatch = watch('municipio')
  const entidadWatch = watch('entidad_demandada')

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [municipiosResult, entidadesResult] = await Promise.all([
          obtenerTodosMunicipios(),
          obtenerTodasEntidades(),
        ])
        setTodosMunicipios(municipiosResult)
        setMunicipiosFiltrados(municipiosResult.slice(0, 50))
        setEntidades(entidadesResult)
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }
    cargarDatos()
  }, [])

  // Cargar datos de la tasación a editar
  useEffect(() => {
    if (editingTasacion) {
      reset({
        nombre_cliente: editingTasacion.nombre_cliente,
        numero_procedimiento: editingTasacion.numero_procedimiento,
        nombre_juzgado: editingTasacion.nombre_juzgado || '',
        entidad_demandada: editingTasacion.entidad_demandada || '',
        municipio: editingTasacion.municipio,
        tipo_proceso: editingTasacion.tipo_proceso,
        fase_terminacion: editingTasacion.fase_terminacion,
        instancia: editingTasacion.instancia,
        ref_aranzadi: editingTasacion.ref_aranzadi || '',
        fecha_demanda: editingTasacion.fecha_demanda || '',
      })
      setMunicipioSeleccionado({
        municipio: editingTasacion.municipio,
        criterio_ica: editingTasacion.criterio_ica || '',
      })
    }
  }, [editingTasacion, reset])

  // Actualizar fases de terminación cuando cambia el tipo de proceso
  useEffect(() => {
    setValue('fase_terminacion', '')
  }, [tipoProcesoWatch, setValue])

  // Buscar municipios
  useEffect(() => {
    const buscarMunicipiosAsync = async () => {
      if (municipioWatch && municipioWatch.length >= 2) {
        const resultados = await buscarMunicipios(municipioWatch)
        setMunicipiosFiltrados(resultados)
        setShowMunicipios(true)
      } else if (municipioWatch && municipioWatch.length === 0) {
        setMunicipiosFiltrados(todosMunicipios.slice(0, 50))
        setShowMunicipios(true)
      } else {
        setMunicipiosFiltrados([])
      }
    }
    buscarMunicipiosAsync()
  }, [municipioWatch, todosMunicipios])

  // Buscar entidades
  useEffect(() => {
    const buscarEntidadesAsync = async () => {
      if (entidadWatch && entidadWatch.length >= 2) {
        const resultados = await buscarEntidades(entidadWatch)
        setEntidades(resultados)
        setShowEntidades(true)
      } else {
        setEntidades([])
      }
    }
    buscarEntidadesAsync()
  }, [entidadWatch])

  const fasesTerminacion = obtenerFasesTerminacion(tipoProcesoWatch)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campos del formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Cliente *
          </label>
          <input
            {...register('nombre_cliente')}
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.nombre_cliente && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre_cliente.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Procedimiento *
          </label>
          <input
            {...register('numero_procedimiento')}
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.numero_procedimiento && (
            <p className="mt-1 text-sm text-red-600">{errors.numero_procedimiento.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Juzgado
          </label>
          <input
            {...register('nombre_juzgado')}
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entidad Demandada
          </label>
          <input
            {...register('entidad_demandada')}
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onFocus={() => setShowEntidades(true)}
          />
          {showEntidades && entidades.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {entidades.map((entidad, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setValue('entidad_demandada', entidad.nombre)
                    setShowEntidades(false)
                  }}
                >
                  {entidad.nombre}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Municipio *
          </label>
          <input
            {...register('municipio')}
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onFocus={() => setShowMunicipios(true)}
          />
          {errors.municipio && (
            <p className="mt-1 text-sm text-red-600">{errors.municipio.message}</p>
          )}
          {showMunicipios && municipiosFiltrados.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {municipiosFiltrados.map((municipio, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setValue('municipio', municipio.municipio)
                    setMunicipioSeleccionado(municipio)
                    setShowMunicipios(false)
                  }}
                >
                  <div className="font-medium">{municipio.municipio}</div>
                  <div className="text-sm text-gray-500">ICA: {municipio.criterio_ica}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Proceso *
          </label>
          <select
            {...register('tipo_proceso')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Juicio Verbal">Juicio Verbal</option>
            <option value="Juicio Ordinario">Juicio Ordinario</option>
          </select>
          {errors.tipo_proceso && (
            <p className="mt-1 text-sm text-red-600">{errors.tipo_proceso.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fase de Terminación *
          </label>
          <select
            {...register('fase_terminacion')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar fase...</option>
            {fasesTerminacion.map((fase) => (
              <option key={fase} value={fase}>
                {fase}
              </option>
            ))}
          </select>
          {errors.fase_terminacion && (
            <p className="mt-1 text-sm text-red-600">{errors.fase_terminacion.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instancia *
          </label>
          <select
            {...register('instancia')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="PRIMERA INSTANCIA">Primera Instancia</option>
            <option value="SEGUNDA INSTANCIA">Segunda Instancia</option>
          </select>
          {errors.instancia && (
            <p className="mt-1 text-sm text-red-600">{errors.instancia.message}</p>
          )}
        </div>
      </div>

      {/* Información del municipio seleccionado */}
      {municipioSeleccionado && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Información del Municipio</h3>
          <p className="text-sm text-blue-800">
            <strong>Municipio:</strong> {municipioSeleccionado.municipio}
            <br />
            <strong>Criterio ICA:</strong> {municipioSeleccionado.criterio_ica}
          </p>
        </div>
      )}

      {/* Campo REF ARANZADI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          REF ARANZADI
        </label>
        <input
          {...register('ref_aranzadi')}
          type="text"
          placeholder="Referencia única del expediente"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">Identificador único para el expediente</p>
      </div>

      {/* Campo FECHA DEMANDA */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha Demanda
        </label>
        <input
          {...register('fecha_demanda')}
          type="date"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">Fecha de la demanda. Se usa para seleccionar los valores de costas aplicables (pre-2025 o 2025+)</p>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          disabled={isUpdating}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isUpdating || isSubmitting}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Actualizando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Actualizar Tasación
            </>
          )}
        </button>
      </div>
    </form>
  )
}
