import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function DebugData() {
  const [tasaciones, setTasaciones] = useState<any[]>([])
  const [criterios, setCriterios] = useState<any[]>([])
  const [entidades, setEntidades] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tasaciones
        const { data: tasacionesData, error: tasacionesError } = await supabase
          .from('tasaciones')
          .select('*')
          .limit(3)
        
        if (tasacionesError) throw new Error(`Tasaciones: ${tasacionesError.message}`)
        setTasaciones(tasacionesData || [])

        // Criterios ICA
        const { data: criteriosData, error: criteriosError } = await supabase
          .from('criterios_ica')
          .select('*')
          .limit(3)
        
        if (criteriosError) throw new Error(`Criterios: ${criteriosError.message}`)
        setCriterios(criteriosData || [])

        // Entidades
        const { data: entidadesData, error: entidadesError } = await supabase
          .from('entidades')
          .select('*')
          .limit(3)
        
        if (entidadesError) throw new Error(`Entidades: ${entidadesError.message}`)
        setEntidades(entidadesData || [])

      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Error desconocido')
      }
    }

    fetchData()
  }, [])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-medium text-red-800">Error de Datos</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-bold">Debug de Datos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Tasaciones ({tasaciones.length})</h3>
          {tasaciones.length > 0 ? (
            <pre className="text-xs text-blue-600 overflow-auto">
              {JSON.stringify(tasaciones[0], null, 2)}
            </pre>
          ) : (
            <p className="text-blue-600">Sin datos</p>
          )}
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">Criterios ICA ({criterios.length})</h3>
          {criterios.length > 0 ? (
            <pre className="text-xs text-green-600 overflow-auto">
              {JSON.stringify(criterios[0], null, 2)}
            </pre>
          ) : (
            <p className="text-green-600">Sin datos</p>
          )}
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-medium text-purple-800 mb-2">Entidades ({entidades.length})</h3>
          {entidades.length > 0 ? (
            <pre className="text-xs text-purple-600 overflow-auto">
              {JSON.stringify(entidades[0], null, 2)}
            </pre>
          ) : (
            <p className="text-purple-600">Sin datos</p>
          )}
        </div>
      </div>
    </div>
  )
}