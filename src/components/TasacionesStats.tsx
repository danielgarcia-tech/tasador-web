import { FileBarChart, DollarSign, TrendingUp } from 'lucide-react'

interface TasacionesStatsProps {
  totalTasaciones: number
  totalCostas: number
  promedioTasacion: number
}

export function TasacionesStats({ totalTasaciones, totalCostas, promedioTasacion }: TasacionesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Total Tasaciones</p>
            <p className="text-3xl font-bold">{totalTasaciones}</p>
            <p className="text-blue-200 text-xs mt-1">Tasaciones registradas</p>
          </div>
          <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
            <FileBarChart className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium mb-1">Total Costas</p>
            <p className="text-3xl font-bold">€{totalCostas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            <p className="text-emerald-200 text-xs mt-1">Valor acumulado</p>
          </div>
          <div className="bg-emerald-400 bg-opacity-30 rounded-full p-3">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium mb-1">Promedio</p>
            <p className="text-3xl font-bold">€{promedioTasacion.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            <p className="text-purple-200 text-xs mt-1">Por tasación</p>
          </div>
          <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}