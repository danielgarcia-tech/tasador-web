import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'

interface InteresLegal {
  id: number
  año: number
  interes_legal: number
  created_at: string
  updated_at: string
}

export default function InteresesLegalesTable() {
  const [intereses, setIntereses] = useState<InteresLegal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ año: '', interes_legal: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [newForm, setNewForm] = useState({ año: '', interes_legal: '' })

  const fetchIntereses = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('tae_interes_legal')
        .select('*')
        .order('año', { ascending: false })

      if (error) throw error

      setIntereses(data || [])
    } catch (err) {
      console.error('Error fetching intereses legales:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar los intereses legales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIntereses()
  }, [])

  const handleEdit = (interes: InteresLegal) => {
    setEditingId(interes.id)
    setEditForm({
      año: interes.año.toString(),
      interes_legal: interes.interes_legal.toString()
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ año: '', interes_legal: '' })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    try {
      const año = parseInt(editForm.año)
      const interes_legal = parseFloat(editForm.interes_legal)

      if (isNaN(año) || año < 1900 || año > 2100) {
        throw new Error('El año debe ser un número válido entre 1900 y 2100')
      }

      if (isNaN(interes_legal) || interes_legal < 0 || interes_legal > 50) {
        throw new Error('El interés legal debe ser un porcentaje válido entre 0 y 50')
      }

      const { error } = await supabase
        .from('tae_interes_legal')
        .update({
          año,
          interes_legal,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId)

      if (error) throw error

      setEditingId(null)
      setEditForm({ año: '', interes_legal: '' })
      await fetchIntereses()
    } catch (err) {
      console.error('Error updating interes legal:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar el interés legal')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tae_interes_legal')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchIntereses()
    } catch (err) {
      console.error('Error deleting interes legal:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar el interés legal')
    }
  }

  const handleAdd = async () => {
    try {
      const año = parseInt(newForm.año)
      const interes_legal = parseFloat(newForm.interes_legal)

      if (isNaN(año) || año < 1900 || año > 2100) {
        throw new Error('El año debe ser un número válido entre 1900 y 2100')
      }

      if (isNaN(interes_legal) || interes_legal < 0 || interes_legal > 50) {
        throw new Error('El interés legal debe ser un porcentaje válido entre 0 y 50')
      }

      const { error } = await supabase
        .from('tae_interes_legal')
        .insert({
          año,
          interes_legal
        })

      if (error) throw error

      setIsAdding(false)
      setNewForm({ año: '', interes_legal: '' })
      await fetchIntereses()
    } catch (err) {
      console.error('Error adding interes legal:', err)
      setError(err instanceof Error ? err.message : 'Error al añadir el interés legal')
    }
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewForm({ año: '', interes_legal: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Cargando intereses legales...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Intereses Legales por Año</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestión de las tasas de interés legal aplicables según la legislación española
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Año
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Añadir Nuevo Interés Legal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Año
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={newForm.año}
                onChange={(e) => setNewForm(prev => ({ ...prev, año: e.target.value }))}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Interés Legal (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="50"
                value={newForm.interes_legal}
                onChange={(e) => setNewForm(prev => ({ ...prev, interes_legal: e.target.value }))}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3.25"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={handleCancelAdd}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2 inline" />
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2 inline" />
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Año
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interés Legal (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actualización
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {intereses.map((interes) => (
                <tr key={interes.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingId === interes.id ? (
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        value={editForm.año}
                        onChange={(e) => setEditForm(prev => ({ ...prev, año: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      interes.año
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingId === interes.id ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="50"
                        value={editForm.interes_legal}
                        onChange={(e) => setEditForm(prev => ({ ...prev, interes_legal: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      `${interes.interes_legal}%`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(interes.updated_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === interes.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(interes)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(interes.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {intereses.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay intereses legales configurados</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Información:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Los intereses legales se aplican según la legislación española</li>
          <li>• Las tasas se actualizan anualmente por el Banco de España</li>
          <li>• Los cambios afectan a todos los cálculos futuros de intereses</li>
        </ul>
      </div>
    </div>
  )
}