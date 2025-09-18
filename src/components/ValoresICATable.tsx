import React, { useState } from 'react';
import { useValoresICA } from '../hooks/useValoresICA';
import type { ValorICA } from '../hooks/useValoresICA';

interface ValoresICATableProps {
  isAdmin: boolean;
}

const ValoresICATable: React.FC<ValoresICATableProps> = ({ isAdmin }) => {
  const { valoresICA, loading, error, createValorICA, updateValorICA, deleteValorICA } = useValoresICA();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ValorICA>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<Omit<ValorICA, 'id' | 'created_at' | 'updated_at'>>({
    ccaa: '',
    provincia: '',
    allanamiento: 0,
    audiencia_previa: 0,
    juicio: 0,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0,
    verbal_vista: 0,
  });

  const [filterCCAA, setFilterCCAA] = useState<string>('');
  const [filterProvincia, setFilterProvincia] = useState<string>('');

  const handleEdit = (valor: ValorICA) => {
    setEditingId(valor.id!);
    setEditForm(valor);
  };

  const handleSaveEdit = async () => {
    if (editingId && editForm) {
      const result = await updateValorICA(editingId, editForm);
      if (result.success) {
        setEditingId(null);
        setEditForm({});
      } else {
        alert(`Error al actualizar: ${result.error}`);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este valor ICA?')) {
      const result = await deleteValorICA(id);
      if (!result.success) {
        alert(`Error al eliminar: ${result.error}`);
      }
    }
  };

  const handleCreate = async () => {
    const result = await createValorICA(createForm);
    if (result.success) {
      setShowCreateForm(false);
      setCreateForm({
        ccaa: '',
        provincia: '',
        allanamiento: 0,
        audiencia_previa: 0,
        juicio: 0,
        factor_apelacion: 0.5,
        verbal_alegaciones: 0,
        verbal_vista: 0,
      });
    } else {
      alert(`Error al crear: ${result.error}`);
    }
  };

  // Filtrar valores ICA
  const filteredValores = valoresICA.filter((valor) => {
    const matchesCCAA = !filterCCAA || valor.ccaa.toLowerCase().includes(filterCCAA.toLowerCase());
    const matchesProvincia = !filterProvincia || valor.provincia.toLowerCase().includes(filterProvincia.toLowerCase());
    return matchesCCAA && matchesProvincia;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Cargando valores ICA...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error al cargar valores ICA: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Valores ICA por Comunidad y Provincia</h3>
        {isAdmin && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Agregar Nuevo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Filtrar por CCAA</label>
          <input
            type="text"
            value={filterCCAA}
            onChange={(e) => setFilterCCAA(e.target.value)}
            placeholder="Ej: Andalucía"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Filtrar por Provincia</label>
          <input
            type="text"
            value={filterProvincia}
            onChange={(e) => setFilterProvincia(e.target.value)}
            placeholder="Ej: Sevilla"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterCCAA('');
              setFilterProvincia('');
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredValores.length} de {valoresICA.length} registros
        {(filterCCAA || filterProvincia) && (
          <span className="ml-2 text-blue-600">
            (filtrado por {filterCCAA && `CCAA: "${filterCCAA}"`}{filterCCAA && filterProvincia && ', '}{filterProvincia && `Provincia: "${filterProvincia}"`})
          </span>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Crear Nuevo Valor ICA</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CCAA</label>
              <input
                type="text"
                value={createForm.ccaa}
                onChange={(e) => setCreateForm(prev => ({ ...prev, ccaa: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: Andalucía"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Provincia</label>
              <input
                type="text"
                value={createForm.provincia}
                onChange={(e) => setCreateForm(prev => ({ ...prev, provincia: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: Sevilla"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Allanamiento</label>
              <input
                type="number"
                step="0.01"
                value={createForm.allanamiento}
                onChange={(e) => setCreateForm(prev => ({ ...prev, allanamiento: parseFloat(e.target.value) || 0 }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Audiencia Previa</label>
              <input
                type="number"
                step="0.01"
                value={createForm.audiencia_previa}
                onChange={(e) => setCreateForm(prev => ({ ...prev, audiencia_previa: parseFloat(e.target.value) || 0 }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Juicio</label>
              <input
                type="number"
                step="0.01"
                value={createForm.juicio}
                onChange={(e) => setCreateForm(prev => ({ ...prev, juicio: parseFloat(e.target.value) || 0 }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Factor Apelación</label>
              <input
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={createForm.factor_apelacion}
                onChange={(e) => setCreateForm(prev => ({ ...prev, factor_apelacion: parseFloat(e.target.value) || 0 }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Verbal Alegaciones</label>
              <input
                type="number"
                step="0.01"
                value={createForm.verbal_alegaciones}
                onChange={(e) => setCreateForm(prev => ({ ...prev, verbal_alegaciones: parseFloat(e.target.value) || 0 }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Verbal Vista</label>
              <input
                type="number"
                step="0.01"
                value={createForm.verbal_vista}
                onChange={(e) => setCreateForm(prev => ({ ...prev, verbal_vista: parseFloat(e.target.value) || 0 }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Crear
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CCAA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provincia</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allanamiento</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aud. Previa</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Juicio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factor Apel.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verbal Aleg.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verbal Vista</th>
              {isAdmin && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredValores.map((valor) => (
              <tr key={valor.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  {editingId === valor.id ? (
                    <input
                      type="text"
                      value={editForm.ccaa || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ccaa: e.target.value }))}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    valor.ccaa
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === valor.id ? (
                    <input
                      type="text"
                      value={editForm.provincia || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, provincia: e.target.value }))}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    valor.provincia
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === valor.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.allanamiento || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, allanamiento: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    `€${valor.allanamiento.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === valor.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.audiencia_previa || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, audiencia_previa: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    `€${valor.audiencia_previa.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === valor.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.juicio || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, juicio: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    `€${valor.juicio.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === valor.id ? (
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="1"
                      value={editForm.factor_apelacion || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, factor_apelacion: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    valor.factor_apelacion.toFixed(3)
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === valor.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.verbal_alegaciones || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, verbal_alegaciones: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    typeof valor.verbal_alegaciones === 'number' ? 
                      `€${valor.verbal_alegaciones.toFixed(2)}` : 
                      valor.verbal_alegaciones
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === valor.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.verbal_vista || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, verbal_vista: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    typeof valor.verbal_vista === 'number' ? 
                      `€${valor.verbal_vista.toFixed(2)}` : 
                      valor.verbal_vista
                  )}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-sm">
                    {editingId === valor.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(valor)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(valor.id!)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {valoresICA.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay valores ICA configurados
        </div>
      )}
    </div>
  );
};

export default ValoresICATable;