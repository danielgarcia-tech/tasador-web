import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { FileText, Trash2, Edit, Download } from 'lucide-react'
import { useTasaciones } from '../hooks/useTasaciones'
import EditTasacionModal from './EditTasacionModal'
import type { Tasacion } from '../lib/supabase'

export default function TasacionesList() {
  const { tasaciones, loading, delete: deleteTasacion } = useTasaciones()
  const [selectedTasaciones, setSelectedTasaciones] = useState<string[]>([])
  const [editingTasacion, setEditingTasacion] = useState<Tasacion | null>(null)

  const handleSelectTasacion = (id: string) => {
    setSelectedTasaciones(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedTasaciones.length === tasaciones.length) {
      setSelectedTasaciones([])
    } else {
      setSelectedTasaciones(tasaciones.map(t => t.id))
    }
  }

  const handleEdit = (tasacion: Tasacion) => {
    setEditingTasacion(tasacion)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta tasación?')) {
      try {
        await deleteTasacion(id)
      } catch (error) {
        alert('Error al eliminar la tasación')
      }
    }
  }

  const exportToExcel = () => {
    // TODO: Implementar exportación a Excel
    alert('Funcionalidad de exportación próximamente...')
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Historial de Tasaciones ({tasaciones.length})
          </h2>
        </div>
        
        {selectedTasaciones.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={exportToExcel}
              className="btn-secondary flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Exportar ({selectedTasaciones.length})</span>
            </button>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        {tasaciones.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay tasaciones
            </h3>
            <p className="text-gray-500">
              Comience creando su primera tasación de costas judiciales.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">
                    <input
                      type="checkbox"
                      checked={selectedTasaciones.length === tasaciones.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="table-header-cell">Procedimiento</th>
                  <th className="table-header-cell">Juzgado</th>
                  <th className="table-header-cell">Entidad</th>
                  <th className="table-header-cell">Municipio</th>
                  <th className="table-header-cell">Proceso</th>
                  <th className="table-header-cell">Costas sin IVA</th>
                  <th className="table-header-cell">IVA 21%</th>
                  <th className="table-header-cell">Total</th>
                  <th className="table-header-cell">Usuario</th>
                  <th className="table-header-cell">Fecha</th>
                  <th className="table-header-cell">Acciones</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {tasaciones.map((tasacion) => (
                  <tr key={tasacion.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedTasaciones.includes(tasacion.id)}
                        onChange={() => handleSelectTasacion(tasacion.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="table-cell">
                      <div className="text-sm font-mono font-medium">
                        {tasacion.numero_procedimiento}
                      </div>
                      <div className="text-xs text-blue-600">
                        {tasacion.nombre_cliente}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-blue-600">
                        {tasacion.nombre_juzgado || 'No especificado'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        {tasacion.entidad_demandada || 'No especificada'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm font-medium">
                        {tasacion.municipio}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tasacion.criterio_ica}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        {tasacion.tipo_proceso || 'No especificado'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tasacion.fase_terminacion} - {tasacion.instancia}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm font-medium">
                        €{tasacion.costas_sin_iva.toFixed(2)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        €{tasacion.iva_21.toFixed(2)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm font-bold text-green-600">
                        €{tasacion.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        {tasacion.nombre_usuario || 'No especificado'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        {format(new Date(tasacion.created_at), 'dd/MM/yyyy', { locale: es })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(tasacion.created_at), 'HH:mm', { locale: es })}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(tasacion)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="Editar tasación"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tasacion.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Eliminar tasación"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {editingTasacion && (
        <EditTasacionModal
          tasacion={editingTasacion}
          isOpen={!!editingTasacion}
          onClose={() => setEditingTasacion(null)}
        />
      )}
    </div>
  )
}