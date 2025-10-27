import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CostaXICA24K {
  id?: string;
  ccaa: string;
  ica: string;
  allanamiento: number;
  audiencia_previa: number;
  juicio: number;
  factor_apelacion: number;
  verbal_alegaciones: number;
  verbal_vista: number;
}

interface Costas24kTableProps {
  isAdmin: boolean;
}

const Costas24kTable: React.FC<Costas24kTableProps> = ({ isAdmin }) => {
  const [costas, setCostas] = useState<CostaXICA24K[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CostaXICA24K>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<Omit<CostaXICA24K, 'id'>>({
    ccaa: '',
    ica: '',
    allanamiento: 0,
    audiencia_previa: 0,
    juicio: 0,
    factor_apelacion: 0.5,
    verbal_alegaciones: 0.5,
    verbal_vista: 0.5,
  });
  const [filterCCAA, setFilterCCAA] = useState<string>('');
  const [filterICA, setFilterICA] = useState<string>('');

  React.useEffect(() => {
    loadCostas();
  }, []);

  const loadCostas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('costasxica24k')
        .select('*')
        .order('ccaa', { ascending: true })
        .order('ica', { ascending: true });

      if (error) throw error;
      setCostas(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (costa: CostaXICA24K) => {
    setEditingId(costa.id!);
    setEditForm(costa);
  };

  const handleSaveEdit = async () => {
    if (editingId && editForm) {
      try {
        const { error } = await supabase
          .from('costasxica24k')
          .update({
            ccaa: editForm.ccaa,
            ica: editForm.ica,
            allanamiento: editForm.allanamiento,
            audiencia_previa: editForm.audiencia_previa,
            juicio: editForm.juicio,
            factor_apelacion: editForm.factor_apelacion,
            verbal_alegaciones: editForm.verbal_alegaciones,
            verbal_vista: editForm.verbal_vista,
          })
          .eq('id', editingId);

        if (error) throw error;
        setEditingId(null);
        setEditForm({});
        await loadCostas();
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
    if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      try {
        const { error } = await supabase
          .from('costasxica24k')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await loadCostas();
      } catch (err) {
        alert(`Error al eliminar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      }
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('costasxica24k')
        .insert([createForm]);

      if (error) throw error;
      setShowCreateForm(false);
      setCreateForm({
        ccaa: '',
        ica: '',
        allanamiento: 0,
        audiencia_previa: 0,
        juicio: 0,
        factor_apelacion: 0.5,
        verbal_alegaciones: 0.5,
        verbal_vista: 0.5,
      });
      await loadCostas();
    } catch (err) {
      alert(`Error al crear: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  // Filtrar costas
  const filteredCostas = costas.filter((costa) => {
    const matchesCCAA = !filterCCAA || costa.ccaa.toLowerCase().includes(filterCCAA.toLowerCase());
    const matchesICA = !filterICA || costa.ica.toLowerCase().includes(filterICA.toLowerCase());
    return matchesCCAA && matchesICA;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Cargando costas 24K...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error al cargar costas: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestión de Costas por ICA - 24K (2025+)</h3>
        {isAdmin && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Agregar Costa 24K
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
            placeholder="Ej: Andalucía, Madrid"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Filtrar por ICA</label>
          <input
            type="text"
            value={filterICA}
            onChange={(e) => setFilterICA(e.target.value)}
            placeholder="Ej: Sevilla, Madrid"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterCCAA('');
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
        Mostrando {filteredCostas.length} de {costas.length} registros
        {(filterCCAA || filterICA) && (
          <span className="ml-2 text-blue-600">
            (filtrado por {filterCCAA && `CCAA: "${filterCCAA}"`}{filterCCAA && filterICA && ', '}{filterICA && `ICA: "${filterICA}"`})
          </span>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Crear Nueva Costa 24K</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium mb-1">ICA</label>
              <input
                type="text"
                value={createForm.ica}
                onChange={(e) => setCreateForm(prev => ({ ...prev, ica: e.target.value }))}
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
                step="0.01"
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
                min="0"
                max="1"
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
                min="0"
                max="1"
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
        <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">CCAA</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">ICA</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allanamiento</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aud. Previa</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Juicio</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">F. Apelación</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">V. Alegaciones</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">V. Vista</th>
              {isAdmin && <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCostas.map((costa) => (
              <tr key={costa.id} className="hover:bg-gray-50">
                <td className="px-2 py-2 text-sm">
                  {editingId === costa.id ? (
                    <input
                      type="text"
                      value={editForm.ccaa || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ccaa: e.target.value }))}
                      className="w-full border rounded px-1 py-1 text-sm"
                    />
                  ) : (
                    costa.ccaa
                  )}
                </td>
                <td className="px-2 py-2 text-sm">
                  {editingId === costa.id ? (
                    <input
                      type="text"
                      value={editForm.ica || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ica: e.target.value }))}
                      className="w-full border rounded px-1 py-1 text-sm"
                    />
                  ) : (
                    costa.ica
                  )}
                </td>
                <td className="px-2 py-2 text-sm font-mono">
                  {editingId === costa.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.allanamiento || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, allanamiento: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-1 py-1 text-sm"
                    />
                  ) : (
                    `€${costa.allanamiento.toFixed(2)}`
                  )}
                </td>
                <td className="px-2 py-2 text-sm font-mono">
                  {editingId === costa.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.audiencia_previa || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, audiencia_previa: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-1 py-1 text-sm"
                    />
                  ) : (
                    `€${costa.audiencia_previa.toFixed(2)}`
                  )}
                </td>
                <td className="px-2 py-2 text-sm font-mono">
                  {editingId === costa.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.juicio || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, juicio: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-1 py-1 text-sm"
                    />
                  ) : (
                    `€${costa.juicio.toFixed(2)}`
                  )}
                </td>
                <td className="px-2 py-2 text-sm">
                  {editingId === costa.id ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={editForm.factor_apelacion || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, factor_apelacion: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-1 py-1 text-sm"
                    />
                  ) : (
                    costa.factor_apelacion.toFixed(2)
                  )}
                </td>
                <td className="px-2 py-2 text-sm">
                  {editingId === costa.id ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={editForm.verbal_alegaciones || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, verbal_alegaciones: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-1 py-1 text-sm"
                    />
                  ) : (
                    costa.verbal_alegaciones.toFixed(2)
                  )}
                </td>
                <td className="px-2 py-2 text-sm">
                  {editingId === costa.id ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={editForm.verbal_vista || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, verbal_vista: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-1 py-1 text-sm"
                    />
                  ) : (
                    costa.verbal_vista.toFixed(2)
                  )}
                </td>
                {isAdmin && (
                  <td className="px-2 py-2 text-sm">
                    {editingId === costa.id ? (
                      <div className="flex gap-1">
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
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(costa)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(costa.id!)}
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

      {filteredCostas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {costas.length === 0 ? 'No hay costas 24K registradas' : 'No se encontraron costas con los filtros aplicados'}
        </div>
      )}
    </div>
  );
};

export default Costas24kTable;
