import { useState, useEffect } from 'react'
import { supabase, type Tasacion } from '../lib/supabase'
import { useAuth } from '../contexts/CustomAuthContext'

export function useTasaciones() {
  const [tasaciones, setTasaciones] = useState<Tasacion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const { user } = useAuth()

  // Función para detectar si es un error de conexión
  const isConnectionError = (error: any): boolean => {
    if (!error) return false
    
    const errorMessage = error.message || error.toString() || ''
    const errorDetails = error.details || ''
    
    return (
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
      errorMessage.includes('ERR_NETWORK_CHANGED') ||
      errorMessage.includes('ERR_CONNECTION_REFUSED') ||
      errorDetails.includes('Failed to fetch') ||
      !navigator.onLine
    )
  }

  // Función para obtener mensaje de error descriptivo
  const getErrorMessage = (error: any): string => {
    if (isConnectionError(error)) {
      return 'No hay conexión a internet. Verifica tu conexión y vuelve a intentarlo.'
    }
    
    if (error?.message?.includes('JWT')) {
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.'
    }
    
    if (error?.message?.includes('permission')) {
      return 'No tienes permisos para realizar esta acción.'
    }
    
    if (error?.message?.includes('duplicate key')) {
      return 'Ya existe un registro con estos datos.'
    }
    
    return error?.message || 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
  }

  const fetchTasaciones = async (isRetry = false) => {
    // Esta función asume que ya se verificó que hay usuario
    // Para la carga inicial, evitar múltiples llamadas simultáneas
    if (loading && !isRetry) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('tasaciones')
        .select('*, usuarios_personalizados!user_id(nombre)')
        .order('created_at', { ascending: false })

      // Si el usuario NO es admin, filtrar solo sus tasaciones
      if (user && user.rol !== 'admin') {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query

      if (error) throw error
      
      setTasaciones(data || [])
      setIsOffline(false)
      
    } catch (error) {
      // console.error('Error fetching tasaciones:', error)
      
      // Para la carga inicial, no hacer reintentos automáticos
      // Solo mostrar el error y permitir que el usuario lo intente manualmente
      const connectionError = isConnectionError(error)
      setIsOffline(connectionError)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const createTasacion = async (tasacion: Omit<Tasacion, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('Usuario no autenticado')

    try {
      const { data, error } = await supabase
        .from('tasaciones')
        .insert([{ ...tasacion, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      
      setTasaciones(prev => [data, ...prev])
      setIsOffline(false)
      return data
    } catch (error) {
      // console.error('Error creating tasacion:', error)
      if (isConnectionError(error)) {
        setIsOffline(true)
      }
      throw new Error(getErrorMessage(error))
    }
  }

  const updateTasacion = async (id: string, updates: Partial<Tasacion>) => {
    if (!user) throw new Error('Usuario no autenticado')

    try {
      // Verificar si el usuario puede modificar esta tasación
      const tasacion = tasaciones.find(t => t.id === id)
      if (!tasacion) throw new Error('Tasación no encontrada')
      
      if (user.rol !== 'admin' && tasacion.user_id !== user.id) {
        throw new Error('No tienes permisos para modificar esta tasación')
      }

      const { data, error } = await supabase
        .from('tasaciones')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setTasaciones(prev => 
        prev.map(t => t.id === id ? { ...t, ...data } : t)
      )
      setIsOffline(false)
      return data
    } catch (error) {
      // console.error('Error updating tasacion:', error)
      if (isConnectionError(error)) {
        setIsOffline(true)
      }
      throw new Error(getErrorMessage(error))
    }
  }

  const deleteTasacion = async (id: string) => {
    if (!user) throw new Error('Usuario no autenticado')

    try {
      // Verificar si el usuario puede eliminar esta tasación
      const tasacion = tasaciones.find(t => t.id === id)
      if (!tasacion) throw new Error('Tasación no encontrada')
      
      if (user.rol !== 'admin' && tasacion.user_id !== user.id) {
        throw new Error('No tienes permisos para eliminar esta tasación')
      }

      const { error } = await supabase
        .from('tasaciones')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setTasaciones(prev => prev.filter(t => t.id !== id))
      setIsOffline(false)
    } catch (error) {
      // console.error('Error deleting tasacion:', error)
      if (isConnectionError(error)) {
        setIsOffline(true)
      }
      throw new Error(getErrorMessage(error))
    }
  }

  const [initialLoadDone, setInitialLoadDone] = useState(false)

  useEffect(() => {
    // Carga inicial: ejecutar solo cuando hay usuario disponible y no se ha cargado aún
    if (user && !initialLoadDone) {
      fetchTasaciones()
      setInitialLoadDone(true)
    }
    // Si no hay usuario, no hacer nada (mantener estado vacío)
  }, [user, initialLoadDone])

  return {
    tasaciones,
    loading,
    error,
    isOffline,
    refresh: fetchTasaciones,
    create: createTasacion,
    update: updateTasacion,
    delete: deleteTasacion,
  }
}