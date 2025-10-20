import { X, FileText, Scale, Euro, Calendar } from 'lucide-react'
import { type Tasacion } from '../lib/supabase'

interface DetailsTasacionModalProps {
  tasacion: Tasacion | null
  isOpen: boolean
  onClose: () => void
}

export function DetailsTasacionModal({ tasacion, isOpen, onClose }: DetailsTasacionModalProps) {
  if (!isOpen || !tasacion) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalles de la Tasación</h2>
            <button
              onClick={onClose}
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
                  <p className="text-sm text-gray-900 font-mono">{tasacion.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Cliente:</span>
                  <p className="text-sm text-gray-900">{tasacion.nombre_cliente}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Número de Procedimiento:</span>
                  <p className="text-sm text-gray-900">{tasacion.numero_procedimiento}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Juzgado:</span>
                  <p className="text-sm text-gray-900">{tasacion.nombre_juzgado || 'No especificado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Entidad Demandada:</span>
                  <p className="text-sm text-gray-900">{tasacion.entidad_demandada || 'No especificada'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Usuario:</span>
                  <p className="text-sm text-gray-900">{tasacion.usuarios_personalizados?.nombre || tasacion.nombre_usuario || 'Desconocido'}</p>
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
                  <p className="text-sm text-gray-900">{tasacion.tipo_proceso}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Instancia:</span>
                  <p className="text-sm text-gray-900">{tasacion.instancia}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Fase de Terminación:</span>
                  <p className="text-sm text-gray-900">{tasacion.fase_terminacion}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Municipio:</span>
                  <p className="text-sm text-gray-900">{tasacion.municipio}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Criterio ICA:</span>
                  <p className="text-sm text-gray-900">{tasacion.criterio_ica}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">REF ARANZADI:</span>
                  <p className="text-sm text-gray-900">{tasacion.ref_aranzadi || 'No especificada'}</p>
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
                    €{tasacion.costas_sin_iva?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">IVA (21%):</span>
                  <p className="text-lg font-bold text-blue-600">
                    €{tasacion.iva_21?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Total:</span>
                  <p className="text-2xl font-bold text-green-600">
                    €{tasacion.total?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
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
                    {new Date(tasacion.created_at).toLocaleString('es-ES', {
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
                    {new Date(tasacion.updated_at).toLocaleString('es-ES', {
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
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}