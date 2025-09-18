import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTasaciones } from '../hooks/useTasaciones'
import {
  FileText,
  Calendar,
  MapPin,
  Scale,
  Euro,
  User,
  Search,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign,
  FileBarChart,
  X,
  Save,
  AlertTriangle,
  WifiOff
} from 'lucide-react'
import { calcularCostas, obtenerFasesTerminacion } from '../lib/calculator'
import { buscarMunicipios, obtenerTodosMunicipios } from '../lib/municipios'
import { buscarEntidades, obtenerTodasEntidades } from '../lib/entidades'
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
})

type TasacionForm = z.infer<typeof tasacionSchema>

export default function HistorialTasaciones() {
  const { tasaciones, loading, error, isOffline, refresh, update: updateTasacion, delete: deleteTasacion } = useTasaciones()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipoProceso, setFilterTipoProceso] = useState('')
  const [filterInstancia, setFilterInstancia] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Estados para edición
  const [editingTasacion, setEditingTasacion] = useState<Tasacion | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tasacionToDelete, setTasacionToDelete] = useState<Tasacion | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Funciones para manejar edición
  const handleEdit = (tasacion: Tasacion) => {
    setEditingTasacion(tasacion)
    setShowEditModal(true)
    setUpdateError(null)
  }

  const handleEditSubmit = async (data: TasacionForm) => {
    if (!editingTasacion) return

    try {
      setIsUpdating(true)
      setUpdateError(null)

      // Obtener el criterio ICA del municipio
      const municipios = await buscarMunicipios(data.municipio)
      const municipioSeleccionado = municipios.find(m => m.municipio === data.municipio)
      
      if (!municipioSeleccionado) {
        throw new Error('Municipio no encontrado')
      }

      // Calcular las costas con los nuevos datos
      const resultado = calcularCostas({
        criterioICA: municipioSeleccionado.criterio_ica,
        tipoJuicio: data.tipo_proceso,
        faseTerminacion: data.fase_terminacion,
        instancia: data.instancia
      })

      await updateTasacion(editingTasacion.id, {
        ...data,
        criterio_ica: municipioSeleccionado.criterio_ica,
        ...resultado
      })

      setShowEditModal(false)
      setEditingTasacion(null)
      await refresh()
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Error al actualizar la tasación')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingTasacion(null)
    setUpdateError(null)
  }

  // Funciones para manejar eliminación
  const handleDelete = (tasacion: Tasacion) => {
    setTasacionToDelete(tasacion)
    setShowDeleteModal(true)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!tasacionToDelete) return

    try {
      setIsDeleting(true)
      setDeleteError(null)

      await deleteTasacion(tasacionToDelete.id)

      setShowDeleteModal(false)
      setTasacionToDelete(null)
      await refresh()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Error al eliminar la tasación')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setTasacionToDelete(null)
    setDeleteError(null)
  }

  // Componente del formulario de edición
  const EditForm = () => {
    const [entidades, setEntidades] = useState<Array<{codigo: string, nombre: string}>>([])
    const [municipioSeleccionado, setMunicipioSeleccionado] = useState<{municipio: string, criterio_ica: string} | null>(null)
    const [showMunicipios, setShowMunicipios] = useState(false)
    const [showEntidades, setShowEntidades] = useState(false)
    const [municipiosFiltrados, setMunicipiosFiltrados] = useState<Array<{municipio: string, criterio_ica: string}>>([])
    const [todosMunicipios, setTodosMunicipios] = useState<Array<{municipio: string, criterio_ica: string}>>([])

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

    // Cargar datos iniciales
    useEffect(() => {
      const cargarDatos = async () => {
        try {
          const [municipiosResult, entidadesResult] = await Promise.all([
            obtenerTodosMunicipios(),
            obtenerTodasEntidades()
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
        })
        setMunicipioSeleccionado({
          municipio: editingTasacion.municipio,
          criterio_ica: editingTasacion.criterio_ica || ''
        })
      }
    }, [reset])

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
      <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-6">
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
                <option key={fase} value={fase}>{fase}</option>
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
              <strong>Municipio:</strong> {municipioSeleccionado.municipio}<br />
              <strong>Criterio ICA:</strong> {municipioSeleccionado.criterio_ica}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancelEdit}
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

  // Este useEffect ha sido removido para evitar loops infinitos
  // El hook useTasaciones ya maneja la carga inicial de datos

  // Filtrar tasaciones
  const filteredTasaciones = tasaciones.filter(tasacion => {
    const matchesSearch =
      tasacion.numero_procedimiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tasacion.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tasacion.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tasacion.entidad_demandada?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesTipoProceso = !filterTipoProceso || tasacion.tipo_proceso === filterTipoProceso
    const matchesInstancia = !filterInstancia || tasacion.instancia === filterInstancia

    return matchesSearch && matchesTipoProceso && matchesInstancia
  })

  // Paginación
  const totalPages = Math.ceil(filteredTasaciones.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTasaciones = filteredTasaciones.slice(startIndex, startIndex + itemsPerPage)

  // Estadísticas
  const totalTasaciones = tasaciones.length
  const totalCostas = tasaciones.reduce((sum, t) => sum + (t.total || 0), 0)
  const promedioTasacion = totalTasaciones > 0 ? totalCostas / totalTasaciones : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial de tasaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {isOffline ? 'Sin conexión a internet' : 'Error al cargar tasaciones'}
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {isOffline 
                ? 'Verifica tu conexión a internet e intenta nuevamente. Los datos se sincronizarán automáticamente cuando se restablezca la conexión.'
                : error
              }
            </p>
            {isOffline && (
              <button
                onClick={() => refresh(true)}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Reintentar conexión
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historial de Tasaciones</h1>
          <p className="text-gray-600 mt-1">Gestiona y consulta todas las tasaciones realizadas</p>
        </div>
        <button
          onClick={() => refresh()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Indicador de Conexión */}
      {isOffline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <WifiOff className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Sin conexión</h3>
              <p className="mt-1 text-sm text-yellow-700">
                No se puede sincronizar con el servidor. Los cambios se guardarán localmente y se sincronizarán cuando se restablezca la conexión.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Tasaciones</p>
              <p className="text-3xl font-bold">{totalTasaciones}</p>
              <p className="text-blue-200 text-xs mt-1">Tasaciones registradas</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FileBarChart className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Total Costas</p>
              <p className="text-3xl font-bold">€{totalCostas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
              <p className="text-emerald-200 text-xs mt-1">Valor acumulado</p>
            </div>
            <div className="bg-emerald-400 bg-opacity-30 rounded-full p-3">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Promedio</p>
              <p className="text-3xl font-bold">€{promedioTasacion.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
              <p className="text-purple-200 text-xs mt-1">Por tasación</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Búsqueda */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-800 mb-3">🔍 Búsqueda Global</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por procedimiento, cliente, municipio, entidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filtro Tipo Proceso */}
          <div className="w-full lg:w-52">
            <label className="block text-sm font-semibold text-gray-800 mb-3">⚖️ Tipo de Proceso</label>
            <select
              value={filterTipoProceso}
              onChange={(e) => setFilterTipoProceso(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-white"
            >
              <option value="">Todos los tipos</option>
              <option value="Juicio Verbal">Juicio Verbal</option>
              <option value="Juicio Ordinario">Juicio Ordinario</option>
            </select>
          </div>

          {/* Filtro Instancia */}
          <div className="w-full lg:w-52">
            <label className="block text-sm font-semibold text-gray-800 mb-3">🏛️ Instancia</label>
            <select
              value={filterInstancia}
              onChange={(e) => setFilterInstancia(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-white"
            >
              <option value="">Todas las instancias</option>
              <option value="PRIMERA INSTANCIA">Primera Instancia</option>
              <option value="SEGUNDA INSTANCIA">Segunda Instancia</option>
            </select>
          </div>
        </div>

        {/* Resultados del filtro */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              📊 Mostrando <span className="font-semibold text-gray-800">{paginatedTasaciones.length}</span> de <span className="font-semibold text-gray-800">{filteredTasaciones.length}</span> tasaciones
            </span>
          </div>
          {(searchTerm || filterTipoProceso || filterInstancia) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterTipoProceso('')
                setFilterInstancia('')
                setCurrentPage(1)
              }}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      {filteredTasaciones.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <FileText className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {searchTerm || filterTipoProceso || filterInstancia
              ? '🔍 No se encontraron resultados'
              : '📋 No hay tasaciones registradas'
            }
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchTerm || filterTipoProceso || filterInstancia
              ? 'Intenta ajustar los filtros de búsqueda para encontrar lo que buscas.'
              : 'Comienza creando tu primera tasación para ver el historial aquí.'
            }
          </p>
          {(searchTerm || filterTipoProceso || filterInstancia) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterTipoProceso('')
                setFilterInstancia('')
              }}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="h-5 w-5" />
              Limpiar filtros y ver todo
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    📄 Procedimiento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    👤 Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    📍 Ubicación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    ⚖️ Proceso
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    💰 Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    📅 Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    ⚡ Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedTasaciones.map((tasacion, index) => (
                  <tr key={tasacion.id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-2 mr-4">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {tasacion.numero_procedimiento}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            🏛️ {tasacion.nombre_juzgado || 'Sin juzgado'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-full p-2 mr-4">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {tasacion.nombre_cliente}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            🏢 {tasacion.entidad_demandada || 'Sin entidad'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-purple-100 rounded-full p-2 mr-4">
                          <MapPin className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {tasacion.municipio}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            📊 ICA: {tasacion.criterio_ica}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-orange-100 rounded-full p-2 mr-4">
                          <Scale className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {tasacion.tipo_proceso}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            📋 {tasacion.fase_terminacion} • {tasacion.instancia}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-emerald-100 rounded-full p-2 mr-3">
                          <Euro className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-emerald-600">
                            €{tasacion.total?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                          </div>
                          <div className="text-xs text-gray-500">
                            IVA: €{tasacion.iva_21?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 rounded-full p-2 mr-4">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {new Date(tasacion.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            🕐 {new Date(tasacion.created_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md"
                          title="Ver detalles completos de la tasación"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(tasacion)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 hover:shadow-md"
                          title="Editar información de la tasación"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tasacion)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
                          title="Eliminar esta tasación"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:shadow-md"
                          title="Descargar reporte en PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="bg-white px-3 py-1 rounded-full shadow-sm border">
                    📄 Página <span className="font-bold text-blue-600">{currentPage}</span> de <span className="font-bold text-blue-600">{totalPages}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 shadow-sm"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior
                  </button>

                  {/* Números de página */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      if (pageNum > totalPages) return null
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                              : 'bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 shadow-sm"
                  >
                    Siguiente
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && editingTasacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Editar Tasación</h2>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {updateError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{updateError}</p>
                </div>
              )}

              <EditForm />
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && tasacionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Eliminar Tasación</h2>
                  <p className="text-gray-600 mt-1">Esta acción no se puede deshacer</p>
                </div>
              </div>

              {deleteError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{deleteError}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tasación a eliminar:</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>Cliente:</strong> {tasacionToDelete.nombre_cliente}</p>
                  <p><strong>Procedimiento:</strong> {tasacionToDelete.numero_procedimiento}</p>
                  <p><strong>Municipio:</strong> {tasacionToDelete.municipio}</p>
                  <p><strong>Total:</strong> €{tasacionToDelete.total?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Eliminar Tasación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}