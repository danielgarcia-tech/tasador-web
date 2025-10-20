import { AlertTriangle } from 'lucide-react'
import { type Tasacion } from '../lib/supabase'

interface DeleteTasacionModalProps {
  tasacion: Tasacion | null
  isOpen: boolean
  isDeleting: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteTasacionModal({
  tasacion,
  isOpen,
  isDeleting,
  error,
  onClose,
  onConfirm
}: DeleteTasacionModalProps) {
  if (!isOpen || !tasacion) return null

  return (
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

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Tasación a eliminar:</h3>
            <div className="text-sm text-gray-600">
              <p><strong>Cliente:</strong> {tasacion.nombre_cliente}</p>
              <p><strong>Procedimiento:</strong> {tasacion.numero_procedimiento}</p>
              <p><strong>Municipio:</strong> {tasacion.municipio}</p>
              <p><strong>Total:</strong> €{tasacion.total?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
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
                  <AlertTriangle className="h-4 w-4" />
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}