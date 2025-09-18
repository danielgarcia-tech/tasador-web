import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calculator, Building, MapPin } from 'lucide-react'
import { calcularCostas, obtenerFasesTerminacion } from '../lib/calculator'
import { buscarMunicipios, obtenerTodosMunicipios } from '../lib/municipios'
import { buscarEntidades, obtenerTodasEntidades } from '../lib/entidades'
import { useTasaciones } from '../hooks/useTasaciones'
import MCPTasacionAssistant from './MCPTasacionAssistant'

const tasacionSchema = z.object({
  nombre_cliente: z.string().min(1, 'El nombre del cliente es requerido'),
  numero_procedimiento: z.string().min(1, 'El número de procedimiento es requerido'),
  nombre_juzgado: z.string().optional(),
  entidad_demandada: z.string().optional(),
  municipio: z.string().min(1, 'El municipio es requerido'),
  tipo_proceso: z.enum(['Juicio Verbal', 'Juicio Ordinario']),
  fase_terminacion: z.string().min(1, 'La fase de terminación es requerida'),
  instancia: z.enum(['PRIMERA INSTANCIA', 'SEGUNDA INSTANCIA']),
})

type TasacionForm = z.infer<typeof tasacionSchema>

export default function TasacionForm() {
  const [entidades, setEntidades] = useState<Array<{codigo: string, nombre: string}>>([])
  const [todasEntidades, setTodasEntidades] = useState<Array<{codigo: string, nombre: string}>>([])
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<{municipio: string, criterio_ica: string} | null>(null)
  const [resultado, setResultado] = useState<{costas: number, iva: number, total: number} | null>(null)
  const [showMunicipios, setShowMunicipios] = useState(false)
  const [showEntidades, setShowEntidades] = useState(false)
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState<Array<{municipio: string, criterio_ica: string}>>([])
  const [todosMunicipios, setTodosMunicipios] = useState<Array<{municipio: string, criterio_ica: string}>>([])
  
  const { create: createTasacion } = useTasaciones()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TasacionForm>({
    resolver: zodResolver(tasacionSchema),
    defaultValues: {
      tipo_proceso: 'Juicio Ordinario',
      instancia: 'PRIMERA INSTANCIA',
    }
  })

  const tipoProcesoWatch = watch('tipo_proceso')
  const municipioWatch = watch('municipio')
  const entidadWatch = watch('entidad_demandada')

  // Actualizar fases de terminación cuando cambia el tipo de proceso
  useEffect(() => {
    setValue('fase_terminacion', '')
  }, [tipoProcesoWatch, setValue])

  // Cargar todos los municipios al montar el componente
  useEffect(() => {
    const cargarTodosMunicipios = async () => {
      try {
        const resultados = await obtenerTodosMunicipios()
        setTodosMunicipios(resultados)
        setMunicipiosFiltrados(resultados.slice(0, 50)) // Mostrar primeros 50 por defecto
      } catch (error) {
        console.error('Error cargando municipios:', error)
      }
    }
    cargarTodosMunicipios()
  }, [])

  // Cargar todas las entidades al montar el componente
  useEffect(() => {
    const cargarTodasEntidades = async () => {
      try {
        const resultados = await obtenerTodasEntidades()
        setTodasEntidades(resultados)
      } catch (error) {
        console.error('Error cargando entidades:', error)
      }
    }
    cargarTodasEntidades()
  }, [])

  // Buscar municipios
  useEffect(() => {
    const buscarMunicipiosAsync = async () => {
      if (municipioWatch && municipioWatch.length >= 2) {
        const resultados = await buscarMunicipios(municipioWatch)
        setMunicipiosFiltrados(resultados)
        setShowMunicipios(true)
      } else if (municipioWatch && municipioWatch.length === 0) {
        // Si el campo está vacío, mostrar todos los municipios
        setMunicipiosFiltrados(todosMunicipios.slice(0, 50))
        setShowMunicipios(true)
      } else {
        setMunicipiosFiltrados([])
        setShowMunicipios(false)
      }
    }

    buscarMunicipiosAsync()
  }, [municipioWatch, todosMunicipios])  // Buscar entidades
  useEffect(() => {
    const buscarEntidadesAsync = async () => {
      if (entidadWatch && entidadWatch.length >= 2) {
        const resultados = await buscarEntidades(entidadWatch)
        setEntidades(resultados)
        setShowEntidades(true)
      } else if (entidadWatch && entidadWatch.length === 0) {
        // Si el campo está vacío, mostrar todas las entidades
        setEntidades(todasEntidades.slice(0, 50))
        setShowEntidades(true)
      } else {
        setEntidades([])
        setShowEntidades(false)
      }
    }
    
    buscarEntidadesAsync()
  }, [entidadWatch, todasEntidades])

  const onSubmit = async (data: TasacionForm) => {
    try {
      if (!municipioSeleccionado) {
        alert('Por favor seleccione un municipio válido')
        return
      }

      // Calcular costas
      const resultadoCalculo = calcularCostas({
        criterioICA: municipioSeleccionado.criterio_ica,
        tipoJuicio: data.tipo_proceso,
        faseTerminacion: data.fase_terminacion,
        instancia: data.instancia
      })

      setResultado(resultadoCalculo)
      // No guardar automáticamente, solo mostrar el resultado
    } catch (error) {
      console.error('Error al calcular tasación:', error)
      alert('Error al calcular la tasación')
    }
  }

  const guardarTasacion = async () => {
    try {
      const formData = watch()
      if (!resultado || !municipioSeleccionado) {
        alert('No hay resultado para guardar')
        return
      }

      // Guardar en base de datos
      await createTasacion({
        nombre_cliente: formData.nombre_cliente,
        numero_procedimiento: formData.numero_procedimiento,
        nombre_juzgado: formData.nombre_juzgado || '',
        entidad_demandada: formData.entidad_demandada || '',
        municipio: formData.municipio,
        criterio_ica: municipioSeleccionado.criterio_ica,
        tipo_proceso: formData.tipo_proceso,
        fase_terminacion: formData.fase_terminacion,
        instancia: formData.instancia,
        costas_sin_iva: resultado.costas,
        iva_21: resultado.iva,
        total: resultado.total,
        nombre_usuario: 'Usuario Sistema' // TODO: Obtener del contexto de usuario
      })

      alert('Tasación guardada correctamente')
      reset()
      setMunicipioSeleccionado(null)
      setResultado(null)
    } catch (error) {
      console.error('Error al guardar tasación:', error)
      alert('Error al guardar la tasación')
    }
  }

  const generarMinuta = async () => {
    try {
      if (!resultado) {
        alert('No hay resultado para generar minuta')
        return
      }

      // TODO: Implementar generación de minuta
      alert('Funcionalidad de generar minuta próximamente disponible')
      console.log('Generando minuta con resultado:', resultado)
    } catch (error) {
      console.error('Error al generar minuta:', error)
      alert('Error al generar la minuta')
    }
  }

  const seleccionarMunicipio = (mun: {municipio: string, criterio_ica: string}) => {
    setValue('municipio', mun.municipio)
    setMunicipioSeleccionado(mun)
    setShowMunicipios(false)
  }

  const seleccionarEntidad = (ent: {codigo: string, nombre: string}) => {
    setValue('entidad_demandada', ent.codigo)
    setShowEntidades(false)
  }

  const handleMCPSuggestion = (suggestion: any) => {
    // Aplicar sugerencias del MCP al formulario
    if (suggestion.calculo) {
      setResultado(suggestion.calculo)
    }

    if (suggestion.recomendaciones) {
      console.log('Recomendaciones MCP:', suggestion.recomendaciones)
      // Aquí podríamos mostrar las recomendaciones al usuario
    }
  }

  return (
    <div className="space-y-6">
      {/* Asistente MCP Inteligente */}
      <MCPTasacionAssistant
        onSuggestion={handleMCPSuggestion}
        currentData={{
          municipio: municipioWatch,
          tipoJuicio: tipoProcesoWatch,
          cantidad: resultado?.total
        }}
      />
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calculator className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Calculadora de Costas Judiciales
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre Cliente */}
            <div>
              <label className="label">
                Nombre Cliente *
              </label>
              <input
                {...register('nombre_cliente')}
                className="input"
                placeholder="Nombre del cliente"
              />
              {errors.nombre_cliente && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre_cliente.message}</p>
              )}
            </div>

            {/* Número Procedimiento */}
            <div>
              <label className="label">
                Número Procedimiento *
              </label>
              <input
                {...register('numero_procedimiento')}
                className="input"
                placeholder="Ej: 123/2023"
              />
              {errors.numero_procedimiento && (
                <p className="mt-1 text-sm text-red-600">{errors.numero_procedimiento.message}</p>
              )}
            </div>

            {/* Nombre Juzgado */}
            <div>
              <label className="label">
                Nombre Juzgado
              </label>
              <input
                {...register('nombre_juzgado')}
                className="input"
                placeholder="Nombre del juzgado"
              />
            </div>

            {/* Entidad Demandada */}
            <div className="relative">
              <label className="label">
                <Building className="inline h-4 w-4 mr-1" />
                Entidad Demandada
              </label>
              <div className="relative">
                <input
                  {...register('entidad_demandada')}
                  className="input pr-10"
                  placeholder="Buscar entidad..."
                  autoComplete="off"
                  onFocus={() => {
                    if (entidades.length === 0 && todasEntidades.length > 0) {
                      setEntidades(todasEntidades.slice(0, 50))
                    }
                    setShowEntidades(true)
                  }}
                  onBlur={() => {
                    // Delay para permitir clics en el dropdown
                    setTimeout(() => setShowEntidades(false), 200)
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => {
                    if (entidades.length === 0 && todasEntidades.length > 0) {
                      setEntidades(todasEntidades.slice(0, 50))
                    }
                    setShowEntidades(!showEntidades)
                  }}
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {showEntidades && entidades.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md max-h-60 overflow-auto">
                  {entidades.map((entidad, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      onClick={() => seleccionarEntidad(entidad)}
                    >
                      <div className="font-medium text-sm">{entidad.codigo}</div>
                      <div className="text-xs text-gray-500 truncate">{entidad.nombre}</div>
                    </button>
                  ))}
                  {entidades.length >= 50 && (
                    <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                      Mostrando primeros 50 resultados. Use la búsqueda para filtrar.
                    </div>
                  )}
                </div>
              )}

              {showEntidades && entidades.length === 0 && entidadWatch && entidadWatch.length >= 2 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md p-4">
                  <div className="text-sm text-gray-500">No se encontraron entidades que coincidan con "{entidadWatch}"</div>
                </div>
              )}
            </div>

            {/* Municipio */}
            <div className="relative">
              <label className="label">
                <MapPin className="inline h-4 w-4 mr-1" />
                Municipio *
              </label>
              <div className="relative">
                <input
                  {...register('municipio')}
                  className="input pr-10"
                  placeholder="Buscar municipio..."
                  autoComplete="off"
                  onFocus={() => {
                    if (municipiosFiltrados.length === 0 && todosMunicipios.length > 0) {
                      setMunicipiosFiltrados(todosMunicipios.slice(0, 50))
                    }
                    setShowMunicipios(true)
                  }}
                  onBlur={() => {
                    // Delay para permitir clics en el dropdown
                    setTimeout(() => setShowMunicipios(false), 200)
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => {
                    if (municipiosFiltrados.length === 0 && todosMunicipios.length > 0) {
                      setMunicipiosFiltrados(todosMunicipios.slice(0, 50))
                    }
                    setShowMunicipios(!showMunicipios)
                  }}
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {showMunicipios && municipiosFiltrados.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md max-h-60 overflow-auto">
                  {municipiosFiltrados.map((municipio, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      onClick={() => seleccionarMunicipio(municipio)}
                    >
                      <div className="font-medium text-sm">{municipio.municipio}</div>
                      <div className="text-xs text-gray-500">Criterio ICA: {municipio.criterio_ica}</div>
                    </button>
                  ))}
                  {municipiosFiltrados.length >= 50 && (
                    <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                      Mostrando primeros 50 resultados. Use la búsqueda para filtrar.
                    </div>
                  )}
                </div>
              )}

              {showMunicipios && municipiosFiltrados.length === 0 && municipioWatch && municipioWatch.length >= 2 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md p-4">
                  <div className="text-sm text-gray-500">No se encontraron municipios que coincidan con "{municipioWatch}"</div>
                </div>
              )}

              {errors.municipio && (
                <p className="mt-1 text-sm text-red-600">{errors.municipio.message}</p>
              )}
            </div>

            {/* Tipo de Proceso */}
            <div>
              <label className="label">
                Tipo de Proceso *
              </label>
              <select {...register('tipo_proceso')} className="input">
                <option value="Juicio Ordinario">Juicio Ordinario</option>
                <option value="Juicio Verbal">Juicio Verbal</option>
              </select>
            </div>

            {/* Fase de Terminación */}
            <div>
              <label className="label">
                Fase de Terminación *
              </label>
              <select {...register('fase_terminacion')} className="input">
                <option value="">Seleccionar fase...</option>
                {obtenerFasesTerminacion(tipoProcesoWatch).map(fase => (
                  <option key={fase} value={fase}>{fase}</option>
                ))}
              </select>
              {errors.fase_terminacion && (
                <p className="mt-1 text-sm text-red-600">{errors.fase_terminacion.message}</p>
              )}
            </div>

            {/* Instancia */}
            <div>
              <label className="label">
                Instancia *
              </label>
              <select {...register('instancia')} className="input">
                <option value="PRIMERA INSTANCIA">Primera Instancia</option>
                <option value="SEGUNDA INSTANCIA">Segunda Instancia</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Calculando...' : 'Calcular Tasación'}
            </button>
          </div>
        </form>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="card p-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            Resultado del Cálculo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                €{resultado.costas.toFixed(2)}
              </div>
              <div className="text-sm text-green-600">Costas (sin IVA)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                €{resultado.iva.toFixed(2)}
              </div>
              <div className="text-sm text-green-600">IVA (21%)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-800">
                €{resultado.total.toFixed(2)}
              </div>
              <div className="text-sm text-green-600">Total</div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={guardarTasacion}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              GUARDAR TASACIÓN
            </button>

            <button
              onClick={generarMinuta}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              GENERAR MINUTA
            </button>
          </div>
        </div>
      )}
    </div>
  )
}