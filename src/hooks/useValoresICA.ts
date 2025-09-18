import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ValorICA {
  id?: number;
  ccaa: string;
  provincia: string;
  allanamiento: number;
  audiencia_previa: number;
  juicio: number;
  factor_apelacion: number;
  verbal_alegaciones: number;
  verbal_vista: number;
  created_at?: string;
  updated_at?: string;
}

export const useValoresICA = () => {
  const [valoresICA, setValoresICA] = useState<ValorICA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchValoresICA = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('criterios_ica_detallados')
        .select('*')
        .order('ccaa', { ascending: true })
        .order('provincia', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setValoresICA(data || []);
    } catch (err) {
      console.error('Error fetching valores ICA:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createValorICA = async (valorICA: Omit<ValorICA, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: createError } = await supabase
        .from('criterios_ica_detallados')
        .insert([valorICA])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setValoresICA(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      console.error('Error creating valor ICA:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      };
    }
  };

  const updateValorICA = async (id: number, updates: Partial<ValorICA>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('criterios_ica_detallados')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setValoresICA(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      return { success: true, data };
    } catch (err) {
      console.error('Error updating valor ICA:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      };
    }
  };

  const deleteValorICA = async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('criterios_ica_detallados')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setValoresICA(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting valor ICA:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      };
    }
  };

  useEffect(() => {
    fetchValoresICA();
  }, []);

  return {
    valoresICA,
    loading,
    error,
    fetchValoresICA,
    createValorICA,
    updateValorICA,
    deleteValorICA
  };
};