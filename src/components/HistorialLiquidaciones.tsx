import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RefreshCw, Download, Eye, Trash2, WifiOff, TrendingUp } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Liquidacion {
  id: string
  user_id: string
  ref_aranzadi: string | null
  intereses_legales: number | null
  interes_judicial: number | null
  tae_cto: number | null
  tae_mas_5: number | null
  fecha_fin: string | null
  fecha_sentencia: string | null
  tae_porcentaje: number | null
  created_at: string
  updated_at: string
  usuarios_personalizados?: {
    nombre: string
  }
}

interface InformeLiquidacion {
  id: string
  nombre_archivo: string
  fecha_generacion: string
}

export default function HistorialLiquidaciones() {
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [searchUsuario, setSearchUsuario] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterInteresesMin, setFilterInteresesMin] = useState('')
  const [filterInteresesMax, setFilterInteresesMax] = useState('')
  const [filterModalidad, setFilterModalidad] = useState<'todas' | 'legal' | 'judicial' | 'tae'>('todas')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Estados para modales
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedLiquidacion, setSelectedLiquidacion] = useState<Liquidacion | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [liquidacionToDelete, setLiquidacionToDelete] = useState<Liquidacion | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [informesAsociados, setInformesAsociados] = useState<InformeLiquidacion[]>([])
  const [loadingInformes, setLoadingInformes] = useState(false)

  useEffect(() => {
    fetchLiquidaciones()
    
    // Verificar conexión
    const checkOnlineStatus = () => setIsOffline(!navigator.onLine)
    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)
    
    return () => {
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
    }
  }, [])

  const fetchLiquidaciones = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('tasador_historial_liquidaciones')
        .select(`
          *,
          usuarios_personalizados(
            nombre
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setLiquidaciones(data || [])
    } catch (err) {
      console.error('Error fetching liquidaciones:', err)
      setError('Error al cargar el historial de liquidaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!liquidacionToDelete) return

    try {
      setIsDeleting(true)
      const { error: deleteError } = await supabase
        .from('tasador_historial_liquidaciones')
        .delete()
        .eq('id', liquidacionToDelete.id)

      if (deleteError) throw deleteError

      setLiquidaciones(prev => prev.filter(l => l.id !== liquidacionToDelete.id))
      setShowDeleteModal(false)
      setLiquidacionToDelete(null)
    } catch (err) {
      console.error('Error deleting liquidacion:', err)
      alert('Error al eliminar la liquidación')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewDetails = async (liquidacion: Liquidacion) => {
    setSelectedLiquidacion(liquidacion)
    setShowDetailsModal(true)
    
    // Cargar informes asociados
    if (liquidacion.ref_aranzadi) {
      setLoadingInformes(true)
      try {
        const { data, error } = await supabase
          .from('tasador_relacion_informes_liquidaciones')
          .select('id, nombre_archivo, fecha_generacion')
          .eq('ref_aranzadi', liquidacion.ref_aranzadi)
          .order('fecha_generacion', { ascending: false })
        
        if (error) throw error
        setInformesAsociados(data || [])
      } catch (err) {
        console.error('Error cargando informes:', err)
        setInformesAsociados([])
      } finally {
        setLoadingInformes(false)
      }
    }
  }

  const descargarExcel = (liquidaciones: Liquidacion[]) => {
    const data = liquidaciones.map(l => ({
      'Ref. Aranzadi': l.ref_aranzadi || 'N/A',
      'Intereses Legales': l.intereses_legales ? `€${l.intereses_legales.toFixed(2)}` : 'N/A',
      'Interés Judicial': l.interes_judicial ? `€${l.interes_judicial.toFixed(2)}` : 'N/A',
      'TAE CTO': l.tae_cto ? `${l.tae_cto.toFixed(2)}%` : 'N/A',
      'TAE+5': l.tae_mas_5 ? `${l.tae_mas_5.toFixed(2)}%` : 'N/A',
      'Fecha de Creación': new Date(l.created_at).toLocaleDateString('es-ES')
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Liquidaciones')
    XLSX.writeFile(wb, `historial_liquidaciones_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Filtrar liquidaciones
  const filteredLiquidaciones = liquidaciones.filter(l => {
    const matchSearch = !searchTerm || 
      (l.ref_aranzadi?.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchUsuario = !searchUsuario ||
      (l.usuarios_personalizados?.nombre.toLowerCase().includes(searchUsuario.toLowerCase()))

    const matchDateFrom = !filterDateFrom || 
      new Date(l.created_at) >= new Date(filterDateFrom)

    const matchDateTo = !filterDateTo || 
      new Date(l.created_at) <= new Date(filterDateTo)

    // Filtro por rango de intereses (suma de todos los intereses)
    const totalIntereses = (l.intereses_legales || 0) + (l.interes_judicial || 0) + (l.tae_cto || 0) + (l.tae_mas_5 || 0)
    const matchInteresesMin = !filterInteresesMin || totalIntereses >= parseFloat(filterInteresesMin)
    const matchInteresesMax = !filterInteresesMax || totalIntereses <= parseFloat(filterInteresesMax)

    // Filtro por modalidad
    let matchModalidad = true
    if (filterModalidad === 'legal') {
      matchModalidad = (l.intereses_legales || 0) > 0
    } else if (filterModalidad === 'judicial') {
      matchModalidad = (l.interes_judicial || 0) > 0
    } else if (filterModalidad === 'tae') {
      matchModalidad = ((l.tae_cto || 0) > 0 || (l.tae_mas_5 || 0) > 0)
    }

    return matchSearch && matchUsuario && matchDateFrom && matchDateTo && matchInteresesMin && matchInteresesMax && matchModalidad
  })

  // Paginación
  const totalPages = Math.ceil(filteredLiquidaciones.length / itemsPerPage)
  const paginatedLiquidaciones = filteredLiquidaciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Estadísticas
  const totalInteresesLegales = filteredLiquidaciones.reduce((sum, l) => sum + (l.intereses_legales || 0), 0)
  const totalInteresesJudiciales = filteredLiquidaciones.reduce((sum, l) => sum + (l.interes_judicial || 0), 0)
  const totalInteresesRecuperados = totalInteresesLegales + totalInteresesJudiciales + 
    filteredLiquidaciones.reduce((sum, l) => sum + (l.tae_cto || 0) + (l.tae_mas_5 || 0), 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 ml-4">Cargando historial de liquidaciones...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
                No se puede sincronizar con el servidor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Expedientes Liquidados</p>
              <p className="text-3xl font-bold">{filteredLiquidaciones.length}</p>
              <p className="text-blue-200 text-xs mt-1">Liquidaciones registradas</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Total Int. Legales Recuperados</p>
              <p className="text-3xl font-bold">€{totalInteresesLegales.toFixed(2)}</p>
              <p className="text-emerald-200 text-xs mt-1">{filteredLiquidaciones.length} liquidaciones</p>
            </div>
            <div className="bg-emerald-400 bg-opacity-30 rounded-full p-3">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Int. Judiciales Recuperados</p>
              <p className="text-3xl font-bold">€{totalInteresesJudiciales.toFixed(2)}</p>
              <p className="text-blue-200 text-xs mt-1">{filteredLiquidaciones.length} liquidaciones</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Total Intereses Recuperados</p>
              <p className="text-3xl font-bold">€{totalInteresesRecuperados.toFixed(2)}</p>
              <p className="text-purple-200 text-xs mt-1">Suma total de intereses</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por Ref. Aranzadi
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ej: 236-2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por Usuario
            </label>
            <input
              type="text"
              value={searchUsuario}
              onChange={(e) => setSearchUsuario(e.target.value)}
              placeholder="Nombre del usuario"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modalidad
            </label>
            <select
              value={filterModalidad}
              onChange={(e) => setFilterModalidad(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todas</option>
              <option value="legal">Con Int. Legales</option>
              <option value="judicial">Con Int. Judicial</option>
              <option value="tae">Con TAE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Intereses Mínimo (€)
            </label>
            <input
              type="number"
              value={filterInteresesMin}
              onChange={(e) => setFilterInteresesMin(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Intereses Máximo (€)
            </label>
            <input
              type="number"
              value={filterInteresesMax}
              onChange={(e) => setFilterInteresesMax(e.target.value)}
              placeholder="999999.99"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => {
              setSearchTerm('')
              setSearchUsuario('')
              setFilterDateFrom('')
              setFilterDateTo('')
              setFilterInteresesMin('')
              setFilterInteresesMax('')
              setFilterModalidad('todas')
              setCurrentPage(1)
            }}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            ✕ Limpiar todos los filtros
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => descargarExcel(filteredLiquidaciones)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Descargar Excel
            </button>
            <button
              onClick={fetchLiquidaciones}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ref. Aranzadi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Int. Legales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Int. Judicial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TAE CTO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TAE+5
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % TAE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Sentencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modificado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLiquidaciones.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No hay liquidaciones registradas</p>
                  </td>
                </tr>
              ) : (
                paginatedLiquidaciones.map((liquidacion) => (
                  <tr key={liquidacion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {liquidacion.ref_aranzadi || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {liquidacion.usuarios_personalizados?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {liquidacion.intereses_legales ? `€${liquidacion.intereses_legales.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {liquidacion.interes_judicial ? `€${liquidacion.interes_judicial.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {liquidacion.tae_cto ? `€${liquidacion.tae_cto.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {liquidacion.tae_mas_5 ? `€${liquidacion.tae_mas_5.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {liquidacion.tae_porcentaje ? `${liquidacion.tae_porcentaje.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {liquidacion.fecha_fin ? new Date(liquidacion.fecha_fin).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {liquidacion.fecha_sentencia ? new Date(liquidacion.fecha_sentencia).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(liquidacion.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(liquidacion.updated_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(liquidacion)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setLiquidacionToDelete(liquidacion)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredLiquidaciones.length)}
                  </span>{' '}
                  de <span className="font-medium">{filteredLiquidaciones.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {showDetailsModal && selectedLiquidacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">Detalles de Liquidación</h2>
                  <p className="text-blue-100 mt-1">Información completa del cálculo</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información Principal */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">1</span>
                  Información Principal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Ref. Aranzadi</label>
                    <p className="mt-1 text-lg font-bold text-gray-900">{selectedLiquidacion.ref_aranzadi || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Usuario</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{selectedLiquidacion.usuarios_personalizados?.nombre || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <label className="block text-xs font-medium text-gray-500 uppercase">% TAE Aplicado</label>
                    <p className="mt-1 text-lg font-bold text-blue-600">
                      {selectedLiquidacion.tae_porcentaje ? `${selectedLiquidacion.tae_porcentaje.toFixed(2)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Intereses Calculados */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                  <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">2</span>
                  Intereses Calculados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border-l-4 border-emerald-500 shadow-sm">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Intereses Legales</label>
                    <p className="text-2xl font-bold text-emerald-600">
                      {selectedLiquidacion.intereses_legales 
                        ? `€${selectedLiquidacion.intereses_legales.toFixed(2)}` 
                        : '€0.00'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow-sm">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Interés Judicial</label>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedLiquidacion.interes_judicial 
                        ? `€${selectedLiquidacion.interes_judicial.toFixed(2)}` 
                        : '€0.00'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500 shadow-sm">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">TAE CTO</label>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedLiquidacion.tae_cto 
                        ? `€${selectedLiquidacion.tae_cto.toFixed(2)}` 
                        : '€0.00'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-l-4 border-pink-500 shadow-sm">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">TAE+5</label>
                    <p className="text-2xl font-bold text-pink-600">
                      {selectedLiquidacion.tae_mas_5 
                        ? `€${selectedLiquidacion.tae_mas_5.toFixed(2)}` 
                        : '€0.00'}
                    </p>
                  </div>
                </div>

                {/* Total */}
                <div className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">TOTAL INTERESES:</span>
                    <span className="text-3xl font-bold">
                      €{((selectedLiquidacion.intereses_legales || 0) + 
                         (selectedLiquidacion.interes_judicial || 0) + 
                         (selectedLiquidacion.tae_cto || 0) + 
                         (selectedLiquidacion.tae_mas_5 || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center">
                  <span className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">3</span>
                  Fechas del Cálculo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Fecha Fin Cálculo</label>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {selectedLiquidacion.fecha_fin 
                        ? new Date(selectedLiquidacion.fecha_fin).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          }) 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Fecha Sentencia</label>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {selectedLiquidacion.fecha_sentencia 
                        ? new Date(selectedLiquidacion.fecha_sentencia).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          }) 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Creado</label>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {new Date(selectedLiquidacion.created_at).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Última Modificación</label>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {new Date(selectedLiquidacion.updated_at).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informes Asociados */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">4</span>
                  Informes Generados
                </h3>
                {loadingInformes ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600">Cargando informes...</span>
                  </div>
                ) : informesAsociados.length > 0 ? (
                  <div className="space-y-2">
                    {informesAsociados.map((informe) => (
                      <div key={informe.id} className="bg-white rounded-lg p-3 border border-purple-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{informe.nombre_archivo}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Generado: {new Date(informe.fecha_generacion).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const { data, error } = await supabase.storage
                                .from('informes_liquidaciones')
                                .download(informe.nombre_archivo)
                              
                              if (error) throw error
                              
                              // Crear URL y descargar
                              const url = URL.createObjectURL(data)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = informe.nombre_archivo
                              document.body.appendChild(a)
                              a.click()
                              document.body.removeChild(a)
                              URL.revokeObjectURL(url)
                            } catch (err) {
                              console.error('Error descargando informe:', err)
                              alert('Error al descargar el informe')
                            }
                          }}
                          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                        >
                          <Download className="h-4 w-4" />
                          Descargar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-purple-100 text-center">
                    <p className="text-gray-500 text-sm">No hay informes generados para esta liquidación</p>
                  </div>
                )}
              </div>

              {/* ID de Registro */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-500 uppercase">ID de Registro</label>
                <p className="mt-1 text-sm font-mono text-gray-600">{selectedLiquidacion.id}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && liquidacionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h2>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar esta liquidación? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setLiquidacionToDelete(null)
                }}
                disabled={isDeleting}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
