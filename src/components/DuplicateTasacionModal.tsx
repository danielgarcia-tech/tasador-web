import { AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface DuplicateTasacionData {
  existing: {
    nombre_cliente: string
    numero_procedimiento: string
    municipio: string
    costas_sin_iva: number
    iva_21: number
    total: number
    created_at: string
  }
  new: {
    nombre_cliente: string
    numero_procedimiento: string
    municipio: string
    costas_sin_iva: number
    iva_21: number
    total: number
  }
  refAranzadi: string
}

interface DuplicateTasacionModalProps {
  isOpen: boolean
  duplicateData: DuplicateTasacionData | null
  onClose: (action: 'update' | 'create' | 'cancel') => void
  newRefAranzadi: string
  onNewRefAranzadiChange: (value: string) => void
}

export function DuplicateTasacionModal({
  isOpen,
  duplicateData,
  onClose,
  newRefAranzadi,
  onNewRefAranzadiChange,
}: DuplicateTasacionModalProps) {
  const [action, setAction] = useState<'update' | 'create' | null>(null)

  if (!isOpen || !duplicateData) return null

  const handleClose = (selectedAction: 'update' | 'create' | 'cancel') => {
    if (selectedAction === 'create' && (!newRefAranzadi || newRefAranzadi.trim() === '')) {
      alert('Por favor, introduce una nueva referencia Aranzadi válida')
      return
    }
    setAction(null)
    onClose(selectedAction)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center">
                <AlertCircle className="h-8 w-8 mr-3" />
                Tasación Duplicada Detectada
              </h2>
              <p className="text-amber-100 mt-1">Ya existe una tasación con esta referencia Aranzadi</p>
            </div>
            <button
              onClick={() => handleClose('cancel')}
              className="text-white hover:text-gray-200 text-3xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Referencia Duplicada */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Referencia Aranzadi Duplicada</h3>
            <p className="text-2xl font-bold text-amber-700 font-mono">{duplicateData.refAranzadi}</p>
          </div>

          {/* Comparativa de Valores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Valores Actuales */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">📊</span>
                Valores ACTUALES en Base de Datos
              </h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600">Cliente:</p>
                  <p className="font-semibold text-gray-900">{duplicateData.existing.nombre_cliente}</p>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600">Procedimiento:</p>
                  <p className="font-semibold text-gray-900">{duplicateData.existing.numero_procedimiento}</p>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600">Municipio:</p>
                  <p className="font-semibold text-gray-900">{duplicateData.existing.municipio}</p>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded border-l-4 border-emerald-500">
                  <span className="text-gray-700 font-medium">Costas (sin IVA):</span>
                  <span className="text-lg font-bold text-emerald-600">€{duplicateData.existing.costas_sin_iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded border-l-4 border-blue-500">
                  <span className="text-gray-700 font-medium">IVA (21%):</span>
                  <span className="text-lg font-bold text-blue-600">€{duplicateData.existing.iva_21.toFixed(2)}</span>
                </div>
                <div className="bg-blue-600 text-white p-4 rounded-lg mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">TOTAL:</span>
                    <span className="text-2xl font-bold">€{duplicateData.existing.total.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Guardada: {new Date(duplicateData.existing.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            {/* Valores Nuevos */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">🔢</span>
                Valores NUEVOS a Guardar
              </h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border-l-4 border-green-500">
                  <p className="text-sm text-gray-600">Cliente:</p>
                  <p className="font-semibold text-gray-900">{duplicateData.new.nombre_cliente}</p>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-green-500">
                  <p className="text-sm text-gray-600">Procedimiento:</p>
                  <p className="font-semibold text-gray-900">{duplicateData.new.numero_procedimiento}</p>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-green-500">
                  <p className="text-sm text-gray-600">Municipio:</p>
                  <p className="font-semibold text-gray-900">{duplicateData.new.municipio}</p>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded border-l-4 border-emerald-500">
                  <span className="text-gray-700 font-medium">Costas (sin IVA):</span>
                  <span className="text-lg font-bold text-emerald-600">€{duplicateData.new.costas_sin_iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded border-l-4 border-green-500">
                  <span className="text-gray-700 font-medium">IVA (21%):</span>
                  <span className="text-lg font-bold text-green-600">€{duplicateData.new.iva_21.toFixed(2)}</span>
                </div>
                <div className="bg-green-600 text-white p-4 rounded-lg mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">TOTAL:</span>
                    <span className="text-2xl font-bold">€{duplicateData.new.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Análisis de Diferencias */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Análisis de Diferencias</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded border-l-4 border-slate-400">
                <p className="text-sm text-gray-600">Diferencia en Costas:</p>
                <p className={`text-lg font-bold ${
                  duplicateData.new.costas_sin_iva !== duplicateData.existing.costas_sin_iva 
                    ? 'text-orange-600' 
                    : 'text-green-600'
                }`}>
                  €{(duplicateData.new.costas_sin_iva - duplicateData.existing.costas_sin_iva).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-slate-400">
                <p className="text-sm text-gray-600">Diferencia en IVA:</p>
                <p className={`text-lg font-bold ${
                  duplicateData.new.iva_21 !== duplicateData.existing.iva_21 
                    ? 'text-orange-600' 
                    : 'text-green-600'
                }`}>
                  €{(duplicateData.new.iva_21 - duplicateData.existing.iva_21).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-slate-400">
                <p className="text-sm text-gray-600">Diferencia Total:</p>
                <p className={`text-lg font-bold ${
                  duplicateData.new.total !== duplicateData.existing.total 
                    ? 'text-orange-600' 
                    : 'text-green-600'
                }`}>
                  €{(duplicateData.new.total - duplicateData.existing.total).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Opciones */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">¿Qué deseas hacer?</h3>
            <div className="space-y-4">
              {/* Opción 1: Actualizar */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  action === 'update' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => setAction('update')}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    checked={action === 'update'}
                    onChange={() => setAction('update')}
                    className="mt-1 mr-3 h-5 w-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">Actualizar tasación existente</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Reemplazar los valores actuales en la base de datos con los nuevos valores calculados
                    </p>
                  </div>
                </div>
              </div>

              {/* Opción 2: Crear Nuevo */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  action === 'create' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-green-300 hover:bg-gray-50'
                }`}
                onClick={() => setAction('create')}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    checked={action === 'create'}
                    onChange={() => setAction('create')}
                    className="mt-1 mr-3 h-5 w-5 text-green-600"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">Crear nuevo registro</h4>
                    <p className="text-sm text-gray-600 mt-1 mb-3">
                      Guardar como un nuevo registro con una referencia Aranzadi diferente
                    </p>
                    {action === 'create' && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nueva Referencia Aranzadi:
                        </label>
                        <input
                          type="text"
                          value={newRefAranzadi}
                          onChange={(e) => onNewRefAranzadiChange(e.target.value)}
                          placeholder="Ej: 236-2025-BIS"
                          className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
          <button
            onClick={() => handleClose('cancel')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleClose(action === 'update' ? 'update' : action === 'create' ? 'create' : 'cancel')}
            disabled={!action}
            className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              action === 'update' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : action === 'create'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-400 text-white'
            }`}
          >
            {action === 'update' ? 'Actualizar Tasación' : action === 'create' ? 'Crear Nueva Tasación' : 'Selecciona una opción'}
          </button>
        </div>
      </div>
    </div>
  )
}
