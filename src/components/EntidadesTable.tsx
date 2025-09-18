import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Entidad {
  id?: string;
  nombre_corto: string;
  nombre_completo: string;
}

interface EntidadesTableProps {
  isAdmin: boolean;
}

const EntidadesTable: React.FC<EntidadesTableProps> = ({ isAdmin }) => {
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Entidad>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<Omit<Entidad, 'id'>>({
    nombre_corto: '',
    nombre_completo: '',
  });
  const [filterNombreCorto, setFilterNombreCorto] = useState<string>('');
  const [filterNombreCompleto, setFilterNombreCompleto] = useState<string>('');

  React.useEffect(() => {
    loadEntidades();
  }, []);

  const loadEntidades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('entidades')
        .select('*')
        .order('nombre_corto', { ascending: true });

      if (error) throw error;
      setEntidades(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entidad: Entidad) => {
    setEditingId(entidad.id!);
    setEditForm(entidad);
  };

  const handleSaveEdit = async () => {
    if (editingId && editForm) {
      try {
        const { error } = await supabase
          .from('entidades')
          .update({
            nombre_corto: editForm.nombre_corto,
            nombre_completo: editForm.nombre_completo,
          })
          .eq('id', editingId);

        if (error) throw error;
        setEditingId(null);
        setEditForm({});
        await loadEntidades();
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
    if (confirm('¿Estás seguro de que quieres eliminar esta entidad?')) {
      try {
        const { error } = await supabase
          .from('entidades')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await loadEntidades();
      } catch (err) {
        alert(`Error al eliminar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      }
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('entidades')
        .insert([createForm]);

      if (error) throw error;
      setShowCreateForm(false);
      setCreateForm({
        nombre_corto: '',
        nombre_completo: '',
      });
      await loadEntidades();
    } catch (err) {
      alert(`Error al crear: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  // Filtrar entidades
  const filteredEntidades = entidades.filter((entidad) => {
    const matchesNombreCorto = !filterNombreCorto || entidad.nombre_corto.toLowerCase().includes(filterNombreCorto.toLowerCase());
    const matchesNombreCompleto = !filterNombreCompleto || entidad.nombre_completo.toLowerCase().includes(filterNombreCompleto.toLowerCase());
    return matchesNombreCorto && matchesNombreCompleto;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Cargando entidades...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error al cargar entidades: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestión de Entidades</h3>
        {isAdmin && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Agregar Entidad
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Filtrar por Código</label>
          <input
            type="text"
            value={filterNombreCorto}
            onChange={(e) => setFilterNombreCorto(e.target.value)}
            placeholder="Ej: BBVA"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Filtrar por Nombre Completo</label>
          <input
            type="text"
            value={filterNombreCompleto}
            onChange={(e) => setFilterNombreCompleto(e.target.value)}
            placeholder="Ej: Banco Bilbao"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterNombreCorto('');
              setFilterNombreCompleto('');
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredEntidades.length} de {entidades.length} entidades
        {(filterNombreCorto || filterNombreCompleto) && (
          <span className="ml-2 text-blue-600">
            (filtrado por {filterNombreCorto && `Código: "${filterNombreCorto}"`}{filterNombreCorto && filterNombreCompleto && ', '}{filterNombreCompleto && `Nombre: "${filterNombreCompleto}"`})
          </span>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Crear Nueva Entidad</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Código (Nombre Corto)</label>
              <input
                type="text"
                value={createForm.nombre_corto}
                onChange={(e) => setCreateForm(prev => ({ ...prev, nombre_corto: e.target.value.toUpperCase() }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: BBVA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre Completo</label>
              <input
                type="text"
                value={createForm.nombre_completo}
                onChange={(e) => setCreateForm(prev => ({ ...prev, nombre_completo: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: Banco Bilbao Vizcaya Argentaria"
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
              {isAdmin && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEntidades.map((entidad) => (
              <tr key={entidad.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">
                  {editingId === entidad.id ? (
                    <input
                      type="text"
                      value={editForm.nombre_corto || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, nombre_corto: e.target.value.toUpperCase() }))}
                      className="w-full border rounded px-2 py-1 font-mono"
                    />
                  ) : (
                    entidad.nombre_corto
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === entidad.id ? (
                    <input
                      type="text"
                      value={editForm.nombre_completo || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, nombre_completo: e.target.value }))}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    entidad.nombre_completo
                  )}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-sm">
                    {editingId === entidad.id ? (
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
                          onClick={() => handleEdit(entidad)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(entidad.id!)}
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

      {filteredEntidades.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {entidades.length === 0 ? 'No hay entidades registradas' : 'No se encontraron entidades con los filtros aplicados'}
        </div>
      )}
    </div>
  );
};

export default EntidadesTable;