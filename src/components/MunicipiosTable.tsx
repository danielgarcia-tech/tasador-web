import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Municipio {
  id?: string;
  pj: string;
  ica_aplicable: string;
}

interface MunicipiosTableProps {
  isAdmin: boolean;
}

const MunicipiosTable: React.FC<MunicipiosTableProps> = ({ isAdmin }) => {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Municipio>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<Omit<Municipio, 'id'>>({
    pj: '',
    ica_aplicable: '',
  });
  const [filterPJ, setFilterPJ] = useState<string>('');
  const [filterICA, setFilterICA] = useState<string>('');

  React.useEffect(() => {
    loadMunicipios();
  }, []);

  const loadMunicipios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('municipios')
        .select('*')
        .order('pj', { ascending: true })
        .order('ica_aplicable', { ascending: true });

      if (error) throw error;
      setMunicipios(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (municipio: Municipio) => {
    setEditingId(municipio.id!);
    setEditForm(municipio);
  };

  const handleSaveEdit = async () => {
    if (editingId && editForm) {
      try {
        const { error } = await supabase
          .from('municipios')
          .update({
            pj: editForm.pj,
            ica_aplicable: editForm.ica_aplicable,
          })
          .eq('id', editingId);

        if (error) throw error;
        setEditingId(null);
        setEditForm({});
        await loadMunicipios();
      } catch (err) {
        alert(`Error al actualizar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este municipio?')) {
      try {
        const { error } = await supabase
          .from('municipios')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await loadMunicipios();
      } catch (err) {
        alert(`Error al eliminar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      }
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('municipios')
        .insert([createForm]);

      if (error) throw error;
      setShowCreateForm(false);
      setCreateForm({
        pj: '',
        ica_aplicable: '',
      });
      await loadMunicipios();
    } catch (err) {
      alert(`Error al crear: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  // Filtrar municipios
  const filteredMunicipios = municipios.filter((municipio) => {
    const matchesPJ = !filterPJ || municipio.pj.toLowerCase().includes(filterPJ.toLowerCase());
    const matchesICA = !filterICA || municipio.ica_aplicable.toLowerCase().includes(filterICA.toLowerCase());
    return matchesPJ && matchesICA;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Cargando municipios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error al cargar municipios: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestión de Municipios</h3>
        {isAdmin && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Agregar Municipio
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Filtrar por PJ</label>
          <input
            type="text"
            value={filterPJ}
            onChange={(e) => setFilterPJ(e.target.value)}
            placeholder="Ej: Sevilla"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Filtrar por ICA</label>
          <input
            type="text"
            value={filterICA}
            onChange={(e) => setFilterICA(e.target.value)}
            placeholder="Ej: ICA001"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterPJ('');
              setFilterICA('');
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredMunicipios.length} de {municipios.length} municipios
        {(filterPJ || filterICA) && (
          <span className="ml-2 text-blue-600">
            (filtrado por {filterPJ && `PJ: "${filterPJ}"`}{filterPJ && filterICA && ', '}{filterICA && `ICA: "${filterICA}"`})
          </span>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Crear Nuevo Municipio</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Partido Judicial (PJ)</label>
              <input
                type="text"
                value={createForm.pj}
                onChange={(e) => setCreateForm(prev => ({ ...prev, pj: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: Sevilla"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ICA Aplicable</label>
              <input
                type="text"
                value={createForm.ica_aplicable}
                onChange={(e) => setCreateForm(prev => ({ ...prev, ica_aplicable: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: ICA001"
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partido Judicial</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ICA Aplicable</th>
              {isAdmin && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMunicipios.map((municipio) => (
              <tr key={municipio.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  {editingId === municipio.id ? (
                    <input
                      type="text"
                      value={editForm.pj || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, pj: e.target.value }))}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    municipio.pj
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === municipio.id ? (
                    <input
                      type="text"
                      value={editForm.ica_aplicable || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ica_aplicable: e.target.value }))}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    municipio.ica_aplicable
                  )}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-sm">
                    {editingId === municipio.id ? (
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
                          onClick={() => handleEdit(municipio)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(municipio.id!)}
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

      {filteredMunicipios.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {municipios.length === 0 ? 'No hay municipios registrados' : 'No se encontraron municipios con los filtros aplicados'}
        </div>
      )}
    </div>
  );
};

export default MunicipiosTable;