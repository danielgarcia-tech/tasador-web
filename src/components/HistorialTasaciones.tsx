import { useEffect, useState, useCallback } from 'react'
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
import * as XLSX from 'xlsx'
import { buscarMunicipios, obtenerTodosMunicipios } from '../lib/municipios'
import { buscarEntidades, obtenerTodasEntidades, buscarEntidadPorCodigo } from '../lib/entidades'
import { generateMinutaDocx } from '../lib/docx-generator'
import { type Tasacion, supabase } from '../lib/supabase'
import { DuplicateTasacionModal } from './DuplicateTasacionModal'
import HistorialLiquidaciones from './HistorialLiquidaciones'

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

export default function HistorialTasaciones() {
  const { tasaciones, loading, error, isOffline, refresh, update: updateTasacion, delete: deleteTasacion } = useTasaciones()

  // Estado para el selector de tipo de historial
  const [tipoHistorial, setTipoHistorial] = useState<'tasaciones' | 'liquidaciones'>('tasaciones')

  // Función helper para determinar el tipo de costas basado en fecha de demanda
  const getTipoCostas = (fechaDemanda: string | null | undefined): string => {
    if (!fechaDemanda) return '18k (Sin fecha)'
    
    const fecha = new Date(fechaDemanda)
    const fechaLimite = new Date('2025-04-03')
    
    return fecha >= fechaLimite ? '24k (2025+)' : '18k (Pre-2025)'
  }
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipoProceso, setFilterTipoProceso] = useState('')
  const [filterInstancia, setFilterInstancia] = useState('')
  const [filterUsuario, setFilterUsuario] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Estados para edición
  const [editingTasacion, setEditingTasacion] = useState<Tasacion | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tasacionToDelete, setTasacionToDelete] = useState<Tasacion | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [tasacionDetails, setTasacionDetails] = useState<Tasacion | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Estado para modal de duplicados
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateData, setDuplicateData] = useState<any>(null)
  const [newRefAranzadi, setNewRefAranzadi] = useState('')
  const [duplicateResolve, setDuplicateResolve] = useState<((value: 'update' | 'create' | 'cancel') => void) | null>(null)

  // Funciones para manejar edición
  const handleEdit = (tasacion: Tasacion) => {
    setEditingTasacion(tasacion)
    setShowEditModal(true)
    setUpdateError(null)
  }

  const handleViewDetails = (tasacion: Tasacion) => {
    setTasacionDetails(tasacion)
    setShowDetailsModal(true)
  }

  // Función para mostrar modal de duplicados y esperar respuesta
  const showDuplicateModalAndWait = useCallback((existingTasacion: any, newTasacionData: any, refAranzadi: string) => {
    return new Promise<'update' | 'create' | 'cancel'>((resolve) => {
      setDuplicateData({ 
        existing: {
          nombre_cliente: existingTasacion.nombre_cliente,
          numero_procedimiento: existingTasacion.numero_procedimiento,
          municipio: existingTasacion.municipio,
          costas_sin_iva: existingTasacion.costas_sin_iva,
          iva_21: existingTasacion.iva_21,
          total: existingTasacion.total,
          created_at: existingTasacion.created_at
        },
        new: newTasacionData,
        refAranzadi 
      })
      setNewRefAranzadi(refAranzadi + '-BIS')
      setDuplicateResolve(() => resolve)
      setShowDuplicateModal(true)
    })
  }, [])

  // Función para cerrar modal de duplicados
  const closeDuplicateModal = (action: 'update' | 'create' | 'cancel') => {
    setShowDuplicateModal(false)
    if (duplicateResolve) {
      duplicateResolve(action)
      setDuplicateResolve(null)
    }
    setDuplicateData(null)
    setNewRefAranzadi('')
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
      const resultado = await calcularCostas({
        criterioICA: municipioSeleccionado.criterio_ica,
        tipoJuicio: data.tipo_proceso,
        faseTerminacion: data.fase_terminacion,
        instancia: data.instancia
      })

      // Si hay cambio en la REF ARANZADI, verificar duplicados
      if (data.ref_aranzadi && data.ref_aranzadi !== editingTasacion.ref_aranzadi) {
        const { data: existingTasacion, error: checkError } = await supabase
          .from('tasaciones')
          .select('*')
          .eq('ref_aranzadi', data.ref_aranzadi.trim())
          .neq('id', editingTasacion.id)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 es "no rows" error
          console.error('Error verificando duplicados:', checkError)
          throw checkError
        }

        // Si existe duplicado, mostrar modal
        if (existingTasacion) {
          const newTasacionData = {
            nombre_cliente: data.nombre_cliente,
            numero_procedimiento: data.numero_procedimiento,
            municipio: data.municipio,
            costas_sin_iva: resultado.costas,
            iva_21: resultado.iva,
            total: resultado.total
          }

          const action = await showDuplicateModalAndWait(existingTasacion, newTasacionData, data.ref_aranzadi)

          if (action === 'cancel') {
            setUpdateError('Operación cancelada. La tasación no fue actualizada.')
            setIsUpdating(false)
            return
          }

          if (action === 'update') {
            // Actualizar el registro existente (merge)
            const { error: updateError } = await supabase
              .from('tasaciones')
              .update({
                nombre_cliente: data.nombre_cliente,
                numero_procedimiento: data.numero_procedimiento,
                nombre_juzgado: data.nombre_juzgado || '',
                entidad_demandada: data.entidad_demandada || '',
                municipio: data.municipio,
                criterio_ica: municipioSeleccionado.criterio_ica,
                tipo_proceso: data.tipo_proceso,
                fase_terminacion: data.fase_terminacion,
                instancia: data.instancia,
                fecha_demanda: data.fecha_demanda || null,
                costas_sin_iva: resultado.costas,
                iva_21: resultado.iva,
                total: resultado.total,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingTasacion.id)

            if (updateError) {
              console.error('Error actualizando tasación duplicada:', updateError)
              throw updateError
            }

            setShowEditModal(false)
            setEditingTasacion(null)
            await refresh()
            setIsUpdating(false)
            return
          }

          if (action === 'create') {
            // Crear nuevo registro con referencia modificada
            const refAranzadiModificada = newRefAranzadi.trim()

            const { error: insertError } = await supabase
              .from('tasaciones')
              .insert([{
                nombre_cliente: editingTasacion.nombre_cliente,
                numero_procedimiento: editingTasacion.numero_procedimiento,
                nombre_juzgado: editingTasacion.nombre_juzgado || '',
                entidad_demandada: editingTasacion.entidad_demandada || '',
                municipio: editingTasacion.municipio,
                criterio_ica: editingTasacion.criterio_ica,
                tipo_proceso: editingTasacion.tipo_proceso,
                fase_terminacion: editingTasacion.fase_terminacion,
                instancia: editingTasacion.instancia,
                ref_aranzadi: refAranzadiModificada,
                fecha_demanda: editingTasacion.fecha_demanda || null,
                costas_sin_iva: editingTasacion.costas_sin_iva,
                iva_21: editingTasacion.iva_21,
                total: editingTasacion.total,
                user_id: editingTasacion.user_id,
                nombre_usuario: editingTasacion.nombre_usuario || 'Usuario Sistema'
              }])

            if (insertError) {
              console.error('Error creando nueva tasación:', insertError)
              throw insertError
            }

            setShowEditModal(false)
            setEditingTasacion(null)
            await refresh()
            setIsUpdating(false)
            return
          }
        }
      }

      // No hay duplicado o no se cambió el ref_aranzadi, actualizar normalmente
      await updateTasacion(editingTasacion.id, {
        ...data,
        criterio_ica: municipioSeleccionado.criterio_ica,
        costas_sin_iva: resultado.costas,
        iva_21: resultado.iva,
        total: resultado.total
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

  // Función para descargar minuta desde el historial
  const handleDownloadMinuta = async (tasacion: Tasacion) => {
    try {
      // Buscar el nombre completo de la entidad demandada
      let nombreCompletoEntidad = tasacion.entidad_demandada || ''
      if (tasacion.entidad_demandada) {
        const entidadCompleta = await buscarEntidadPorCodigo(tasacion.entidad_demandada)
        if (entidadCompleta) {
          nombreCompletoEntidad = entidadCompleta.nombre
        }
      }

      // Preparar datos para el generador de documentos
      const tasacionData = {
        nombreCliente: tasacion.nombre_cliente,
        numeroProcedimiento: tasacion.numero_procedimiento,
        nombreJuzgado: tasacion.nombre_juzgado || '',
        entidadDemandada: nombreCompletoEntidad,
        municipio: tasacion.municipio,
        instancia: tasacion.instancia,
        costas: tasacion.costas_sin_iva,
        iva: tasacion.iva_21,
        total: tasacion.total,
        fecha: new Date(tasacion.created_at).toLocaleDateString('es-ES'),
        fechaDemanda: tasacion.fecha_demanda || undefined,
        refAranzadi: tasacion.ref_aranzadi || undefined
      }

      console.log('Generando minuta desde historial:', tasacionData)

      // Generar el documento
      await generateMinutaDocx(tasacionData)

    } catch (error) {
      console.error('Error al generar minuta desde historial:', error)
      alert('Error al generar la minuta. Por favor, inténtelo de nuevo.')
    }
  }

  const descargarReporteExcel = (rows: Tasacion[]) => {
    try {
      // Mapear las filas a un formato plano
      const data = rows.map(r => ({
        fecha: new Date(r.created_at).toLocaleString('es-ES'),
        usuario: r.usuarios_personalizados?.nombre || r.nombre_usuario || 'Desconocido',
        nombre_cliente: r.nombre_cliente,
        numero_procedimiento: r.numero_procedimiento,
        nombre_juzgado: r.nombre_juzgado || '',
        entidad_demandada: r.entidad_demandada || '',
        municipio: r.municipio,
        criterio_ica: r.criterio_ica,
        tipo_proceso: r.tipo_proceso,
        fase_terminacion: r.fase_terminacion,
        instancia: r.instancia,
        costas_sin_iva: r.costas_sin_iva,
        iva_21: r.iva_21,
        total: r.total,
        fecha_demanda: r.fecha_demanda ? new Date(r.fecha_demanda).toLocaleDateString('es-ES') : '',
        tipo_costas: getTipoCostas(r.fecha_demanda),
        ref_aranzadi: r.ref_aranzadi || ''
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Historial')

      // Generar buffer y forzar descarga
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte_tasaciones_${new Date().toISOString().slice(0,10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generando reporte Excel:', error)
      alert('No se pudo generar el reporte. Revisa la consola para más detalles.')
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
          ref_aranzadi: editingTasacion.ref_aranzadi || '',
          fecha_demanda: editingTasacion.fecha_demanda || '',
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

  // Obtener lista de usuarios únicos
  const usuariosUnicos = Array.from(
    new Set(
      tasaciones
        .map(t => t.usuarios_personalizados?.nombre || t.nombre_usuario || 'Desconocido')
        .filter(nombre => nombre !== 'Desconocido')
    )
  ).sort()

  // Filtrar tasaciones
  const filteredTasaciones = tasaciones.filter(tasacion => {
    const matchesSearch =
      tasacion.numero_procedimiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tasacion.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tasacion.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tasacion.entidad_demandada?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesTipoProceso = !filterTipoProceso || tasacion.tipo_proceso === filterTipoProceso
    const matchesInstancia = !filterInstancia || tasacion.instancia === filterInstancia
    const matchesUsuario = !filterUsuario || (tasacion.usuarios_personalizados?.nombre || tasacion.nombre_usuario || 'Desconocido') === filterUsuario

    // Filtrado por rango de fechas (created_at)
    let matchesDate = true
    try {
      const createdAt = new Date(tasacion.created_at)
      if (filterDateFrom) {
        const from = new Date(filterDateFrom + 'T00:00:00')
        if (createdAt < from) matchesDate = false
      }
      if (filterDateTo) {
        const to = new Date(filterDateTo + 'T23:59:59')
        if (createdAt > to) matchesDate = false
      }
    } catch (e) {
      matchesDate = true
    }

    return matchesSearch && matchesTipoProceso && matchesInstancia && matchesUsuario && matchesDate
  })

  // Paginación
  const totalPages = Math.ceil(filteredTasaciones.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTasaciones = filteredTasaciones.slice(startIndex, startIndex + itemsPerPage)

  // Estadísticas basadas en el conjunto filtrado para actualizar en directo
  const totalTasaciones = filteredTasaciones.length
  const totalCostas = filteredTasaciones.reduce((sum, t) => sum + (t.total || 0), 0)
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
      {/* Selector de Tipo de Historial */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setTipoHistorial('tasaciones')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              tipoHistorial === 'tasaciones'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="h-5 w-5" />
              <span>Historial de Tasaciones</span>
            </div>
          </button>
          <button
            onClick={() => setTipoHistorial('liquidaciones')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              tipoHistorial === 'liquidaciones'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>Historial de Liquidaciones</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mostrar componente según selección */}
      {tipoHistorial === 'liquidaciones' ? (
        <HistorialLiquidaciones />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Historial de Tasaciones</h1>
              <p className="text-gray-600 mt-1">Gestiona y consulta todas las tasaciones realizadas</p>
            </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => descargarReporteExcel(filteredTasaciones)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Descargar reporte
          </button>
          <button
            onClick={() => refresh()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
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

          {/* Filtro Usuario */}
          <div className="w-full lg:w-52">
            <label className="block text-sm font-semibold text-gray-800 mb-3">👤 Usuario</label>
            <select
              value={filterUsuario}
              onChange={(e) => setFilterUsuario(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-white"
            >
              <option value="">Todos los usuarios</option>
              {usuariosUnicos.map((usuario) => (
                <option key={usuario} value={usuario}>
                  {usuario}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro rango de fechas */}
          <div className="w-full lg:w-72">
            <label className="block text-sm font-semibold text-gray-800 mb-3">📅 Rango de Fecha</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-1/2 border-2 border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Fecha desde"
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-1/2 border-2 border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Fecha hasta"
              />
            </div>
          </div>
        </div>

        {/* Resultados del filtro */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              📊 Mostrando <span className="font-semibold text-gray-800">{paginatedTasaciones.length}</span> de <span className="font-semibold text-gray-800">{filteredTasaciones.length}</span> tasaciones
            </span>
          </div>
          {(searchTerm || filterTipoProceso || filterInstancia || filterUsuario) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterTipoProceso('')
                setFilterInstancia('')
                setFilterUsuario('')
                setFilterDateFrom('')
                setFilterDateTo('')
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
                  setFilterDateFrom('')
                  setFilterDateTo('')
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
                    �‍💼 Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    �📍 Ubicación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    📋 Tipo Procedimiento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    📍 Fase Terminación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    🏛️ Instancia
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    💶 Costas s/IVA
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    📊 IVA 21%
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    💰 Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    📅 Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    � Fecha Demanda
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    💰 Tipo Costas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    �🔖 REF ARANZADI
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
                        <div className="bg-blue-100 rounded-full p-2 mr-4">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {tasacion.usuarios_personalizados?.nombre || tasacion.nombre_usuario || 'Desconocido'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            👤 Usuario
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
                            📋 Procedimiento
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-cyan-100 rounded-full p-2 mr-4">
                          <MapPin className="h-4 w-4 text-cyan-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {tasacion.fase_terminacion}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            📍 Fase
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-rose-100 rounded-full p-2 mr-4">
                          <FileText className="h-4 w-4 text-rose-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {tasacion.instancia}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            🏛️ Instancia
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <Euro className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-blue-600">
                            €{tasacion.costas_sin_iva?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <div className="bg-amber-100 rounded-full p-2 mr-3">
                          <Euro className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-amber-600">
                            €{tasacion.iva_21?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <div className="bg-emerald-100 rounded-full p-2 mr-3">
                          <Euro className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-emerald-600">
                            €{tasacion.total?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
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
                      <div className="flex items-center">
                        <div className="bg-indigo-100 rounded-full p-2 mr-4">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {tasacion.fecha_demanda ? new Date(tasacion.fecha_demanda).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }) : 'Sin fecha'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            📅 Fecha demanda
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`rounded-full p-2 mr-4 ${getTipoCostas(tasacion.fecha_demanda).includes('24k') ? 'bg-purple-100' : 'bg-orange-100'}`}>
                          <DollarSign className={`h-4 w-4 ${getTipoCostas(tasacion.fecha_demanda).includes('24k') ? 'text-purple-600' : 'text-orange-600'}`} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {getTipoCostas(tasacion.fecha_demanda)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            💰 Valores aplicables
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-teal-100 rounded-full p-2 mr-4">
                          <FileBarChart className="h-4 w-4 text-teal-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {tasacion.ref_aranzadi || 'Sin referencia'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            🔖 ID único expediente
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewDetails(tasacion)}
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
                          onClick={() => handleDownloadMinuta(tasacion)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:shadow-md"
                          title="Generar minuta en Word"
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

      {/* Modal de Detalles */}
      {showDetailsModal && tasacionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalles de la Tasación</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información General */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Información General
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">ID:</span>
                      <p className="text-sm text-gray-900 font-mono">{tasacionDetails.id}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Cliente:</span>
                      <p className="text-sm text-gray-900">{tasacionDetails.nombre_cliente}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Número de Procedimiento:</span>
                      <p className="text-sm text-gray-900">{tasacionDetails.numero_procedimiento}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Juzgado:</span>
                      <p className="text-sm text-gray-900">{tasacionDetails.nombre_juzgado || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Entidad Demandada:</span>
                      <p className="text-sm text-gray-900">{tasacionDetails.entidad_demandada || 'No especificada'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Usuario:</span>
                      <p className="text-sm text-gray-900">{tasacionDetails.usuarios_personalizados?.nombre || tasacionDetails.nombre_usuario || 'Desconocido'}</p>
                    </div>
                  </div>
                </div>

                {/* Información del Proceso */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-green-600" />
                    Información del Proceso
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Tipo de Proceso:</span>
                      <p className="text-sm text-gray-900">{tasacionDetails.tipo_proceso}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Instancia:</span>
                      <p className="text-sm text-gray-900">{tasacionDetails.instancia}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Fase de Terminación:</span>
                      <p className="text-sm text-gray-900">{tasacionDetails.fase_terminacion}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Municipio:</span>
                      <p className="text-sm text-gray-900">{tasacionDetails.municipio}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Criterio ICA:</span>
                      <p className="text-sm text-gray-900">{tasacionDetails.criterio_ica}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">REF ARANZADI:</span>
                      <p className="text-sm text-gray-900">{tasacionDetails.ref_aranzadi || 'No especificada'}</p>
                    </div>
                  </div>
                </div>

                {/* Información Económica */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Euro className="h-5 w-5 text-emerald-600" />
                    Información Económica
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Costas (sin IVA):</span>
                      <p className="text-lg font-bold text-emerald-600">
                        €{tasacionDetails.costas_sin_iva?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">IVA (21%):</span>
                      <p className="text-lg font-bold text-blue-600">
                        €{tasacionDetails.iva_21?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Total:</span>
                      <p className="text-2xl font-bold text-green-600">
                        €{tasacionDetails.total?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fechas y Metadata */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Fechas y Metadata
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Fecha de Creación:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(tasacionDetails.created_at).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Última Actualización:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(tasacionDetails.updated_at).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Cerrar */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Duplicados */}
      <DuplicateTasacionModal
        isOpen={showDuplicateModal}
        duplicateData={duplicateData}
        onClose={closeDuplicateModal}
        newRefAranzadi={newRefAranzadi}
        onNewRefAranzadiChange={setNewRefAranzadi}
      />
        </>
      )}
    </div>
  )
}