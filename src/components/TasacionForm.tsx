import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building, MapPin } from 'lucide-react'
import { calcularCostas, obtenerFasesTerminacion } from '../lib/calculator'
import { buscarMunicipios, obtenerTodosMunicipios } from '../lib/municipios'
import { buscarEntidades, buscarEntidadPorCodigo } from '../lib/entidades'
import { useTasaciones } from '../hooks/useTasaciones'
import { useAuth } from '../contexts/CustomAuthContext'
import { generateMinutaDocx } from '../lib/docx-generator'
import CountUp from './CountUp'

// Componente para animar valores monetarios
interface AnimatedCurrencyProps {
  amount: number
  duration?: number
  className?: string
}

function AnimatedCurrency({ amount, duration = 1, className = '' }: AnimatedCurrencyProps) {
  return (
    <CountUp
      to={amount}
      duration={duration}
      separator="."
      prefix="€"
      className={className}
    />
  )
}

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
})

type TasacionFormData = z.infer<typeof tasacionSchema>

export default function TasacionForm() {
  const [entidades, setEntidades] = useState<Array<{codigo: string, nombre: string}>>([])
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<{municipio: string, criterio_ica: string} | null>(null)
  const [resultado, setResultado] = useState<{costas: number, iva: number, total: number} | null>(null)
  const [showMunicipios, setShowMunicipios] = useState(false)
  const [showEntidades, setShowEntidades] = useState(false)
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState<Array<{municipio: string, criterio_ica: string}>>([])
  const [todosMunicipios, setTodosMunicipios] = useState<Array<{municipio: string, criterio_ica: string}>>([])
  const [generatingMinuta, setGeneratingMinuta] = useState(false)
  const [savingTasacion, setSavingTasacion] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }
  
  const { create: createTasacion } = useTasaciones()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TasacionFormData>({
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
      } else {
        setEntidades([])
        setShowEntidades(false)
      }
    }
    
    buscarEntidadesAsync()
  }, [entidadWatch])

  const onSubmit = async (data: TasacionFormData) => {
    try {
      if (!municipioSeleccionado) {
        alert('Por favor seleccione un municipio válido')
        return
      }

      // Calcular costas
      const resultadoCalculo = await calcularCostas({
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
      setGeneratingMinuta(true)

      if (!resultado || !municipioSeleccionado) {
        showNotification('error', 'No hay resultado para generar minuta')
        return
      }

      // Obtener datos del formulario
      const formData = watch()

      // Buscar el nombre completo de la entidad demandada
      let nombreCompletoEntidad = formData.entidad_demandada || ''
      if (formData.entidad_demandada) {
        const entidadCompleta = await buscarEntidadPorCodigo(formData.entidad_demandada)
        if (entidadCompleta) {
          nombreCompletoEntidad = entidadCompleta.nombre
        }
      }

      // Preparar datos para el generador de documentos
      const tasacionData = {
        nombreCliente: formData.nombre_cliente || '',
        numeroProcedimiento: formData.numero_procedimiento || '',
        nombreJuzgado: formData.nombre_juzgado || '',
        entidadDemandada: nombreCompletoEntidad,
        municipio: formData.municipio || '',
        instancia: formData.instancia as 'PRIMERA INSTANCIA' | 'SEGUNDA INSTANCIA',
        costas: resultado.costas,
        iva: resultado.iva,
        total: resultado.total,
        fecha: new Date().toLocaleDateString('es-ES'),
        refAranzadi: formData.ref_aranzadi || undefined
      }

      console.log('Generando documento DOCX con datos:', tasacionData)

      // Guardar automáticamente la tasación en el historial antes de generar la minuta
      try {
        setSavingTasacion(true)
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
          ref_aranzadi: formData.ref_aranzadi || '',
          costas_sin_iva: resultado.costas,
          iva_21: resultado.iva,
          total: resultado.total,
          nombre_usuario: 'Usuario Sistema' // TODO: Obtener del contexto de usuario
        })
        console.log('Tasación guardada automáticamente en el historial')
      } catch (saveError) {
        console.warn('No se pudo guardar la tasación en el historial, pero continuando con la generación de minuta:', saveError)
        // No lanzamos error aquí para no interrumpir la generación de minuta
      } finally {
        setSavingTasacion(false)
      }

      // Generar el documento usando la biblioteca docx
      await generateMinutaDocx(tasacionData)

      showNotification('success', 'Minuta generada correctamente y tasación guardada en historial')

    } catch (error) {
      console.error('Error al generar minuta:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('DETALLE ERROR GENERAR MINUTA:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      })
      showNotification('error', `Error al generar la minuta: ${errorMessage}`)
    } finally {
      setGeneratingMinuta(false)
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

  return (
    <div className="space-y-6">
      {/* Notificaciones */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Asistente MCP Inteligente - DESACTIVADO */}
      {/* <MCPTasacionAssistant
        onSuggestion={handleMCPSuggestion}
        currentData={{
          municipio: municipioWatch,
          tipoJuicio: tipoProcesoWatch,
          cantidad: resultado?.total
        }}
      /> */}
      <div className="card p-6">
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

            {/* REF ARANZADI */}
            <div>
              <label className="label">
                REF ARANZADI
              </label>
              <input
                {...register('ref_aranzadi')}
                type="text"
                placeholder="Referencia única del expediente"
                className="input"
              />
              <p className="text-sm text-gray-500 mt-1">Identificador único para el expediente</p>
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
          <div className="mb-4 text-sm text-green-700">
            👤 Tasación realizada por: <span className="font-semibold">{user?.nombre || user?.email || 'Usuario desconocido'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <AnimatedCurrency
                amount={resultado.costas}
                duration={1}
                className="text-2xl font-bold text-green-700"
              />
              <div className="text-sm text-green-600">Costas (sin IVA)</div>
            </div>
            <div className="text-center">
              <AnimatedCurrency
                amount={resultado.iva}
                duration={1}
                className="text-2xl font-bold text-green-700"
              />
              <div className="text-sm text-green-600">IVA (21%)</div>
            </div>
            <div className="text-center">
              <AnimatedCurrency
                amount={resultado.total}
                duration={1.5}
                className="text-3xl font-bold text-green-800"
              />
              <div className="text-sm text-green-600">Total</div>
            </div>
          </div>

          {/* Explicación detallada del cálculo */}
          <div className="bg-white rounded-lg p-4 border border-green-200 mb-6">
            <h4 className="text-md font-semibold text-green-900 mb-3">
              📊 Detalle del Cálculo
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Criterio ICA:</strong> {municipioSeleccionado?.criterio_ica}
                </div>
                <div>
                  <strong>Municipio:</strong> {watch('municipio')}
                </div>
                <div>
                  <strong>Tipo de Proceso:</strong> {watch('tipo_proceso')}
                </div>
                <div>
                  <strong>Fase de Terminación:</strong> {watch('fase_terminacion')}
                </div>
                <div>
                  <strong>Instancia:</strong> {watch('instancia') === 'PRIMERA INSTANCIA' ? 'Primera Instancia' : 'Segunda Instancia'}
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">💡 Información del cálculo:</h5>
                <div className="space-y-1 text-xs">
                  {(() => {
                    const formData = watch();
                    const tipoJuicio = formData.tipo_proceso;
                    const faseTerminacion = formData.fase_terminacion;
                    const instancia = formData.instancia;
                    const criterioICA = municipioSeleccionado?.criterio_ica;

                    let explicacion = [];

                    explicacion.push(`📍 Municipio: ${municipioSeleccionado?.municipio || 'No seleccionado'} (Criterio ICA: ${criterioICA})`);
                    explicacion.push(`⚖️ Tipo de proceso: ${tipoJuicio}`);
                    explicacion.push(`📋 Fase de terminación: ${faseTerminacion || 'No seleccionada'}`);
                    explicacion.push(`🏛️ Instancia: ${instancia || 'PRIMERA INSTANCIA'}`);
                    explicacion.push('');
                    explicacion.push('🔍 El cálculo se realiza consultando los baremos actualizados desde la base de datos.');
                    explicacion.push('� Los valores se obtienen dinámicamente según el criterio ICA del municipio seleccionado.');
                    explicacion.push('');

                    explicacion.push('💰 DESGLOSE FINAL:');
                    explicacion.push(`• Base imponible (costas): €${resultado.costas.toFixed(2)}`);
                    explicacion.push(`• IVA (21%): €${resultado.iva.toFixed(2)}`);
                    explicacion.push(`• Total con IVA: €${resultado.total.toFixed(2)}`);

                    return explicacion.map((line, index) => (
                      <div key={index} className={line === '' ? 'h-2' : ''}>{line}</div>
                    ));
                  })()}
                </div>
              </div>
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
              disabled={generatingMinuta || savingTasacion}
              className={`font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                generatingMinuta || savingTasacion
                  ? 'bg-purple-400 cursor-not-allowed text-purple-100'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {(generatingMinuta || savingTasacion) ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {savingTasacion ? 'GUARDANDO...' : 'GENERANDO...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  GENERAR MINUTA
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}