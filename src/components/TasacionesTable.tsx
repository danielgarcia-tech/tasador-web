import { FileText, Calendar, MapPin, Scale, Euro, User, Eye, Edit, Trash2, Download } from 'lucide-react'
import { type Tasacion } from '../lib/supabase'

interface TasacionesTableProps {
  paginatedTasaciones: Tasacion[]
  filteredTasacionesLength: number
  onViewDetails: (tasacion: Tasacion) => void
  onEdit: (tasacion: Tasacion) => void
  onDelete: (tasacion: Tasacion) => void
  onDownloadMinuta: (tasacion: Tasacion) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TasacionesTable({
  paginatedTasaciones,
  filteredTasacionesLength,
  onViewDetails,
  onEdit,
  onDelete,
  onDownloadMinuta,
  currentPage,
  totalPages,
  onPageChange
}: TasacionesTableProps) {
  if (filteredTasacionesLength === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <FileText className="h-12 w-12 text-blue-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          📋 No hay tasaciones registradas
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Comienza creando tu primera tasación para ver el historial aquí.
        </p>
      </div>
    )
  }

  return (
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
                👥 Usuario
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
                🔖 REF ARANZADI
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
                  <div className="flex items-center">
                    <div className="bg-teal-100 rounded-full p-2 mr-4">
                      <FileText className="h-4 w-4 text-teal-600" />
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
                      onClick={() => onViewDetails(tasacion)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md"
                      title="Ver detalles completos de la tasación"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(tasacion)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 hover:shadow-md"
                      title="Editar información de la tasación"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(tasacion)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
                      title="Eliminar esta tasación"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDownloadMinuta(tasacion)}
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
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
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
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 shadow-sm ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
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
  )
}