import { Search, RefreshCw } from 'lucide-react'

interface TasacionesFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  filterTipoProceso: string
  setFilterTipoProceso: (value: string) => void
  filterInstancia: string
  setFilterInstancia: (value: string) => void
  filterUsuario: string
  setFilterUsuario: (value: string) => void
  filterDateFrom: string
  setFilterDateFrom: (value: string) => void
  filterDateTo: string
  setFilterDateTo: (value: string) => void
  usuariosUnicos: string[]
  filteredTasacionesLength: number
  paginatedTasacionesLength: number
  onClearFilters: () => void
}

export function TasacionesFilters({
  searchTerm,
  setSearchTerm,
  filterTipoProceso,
  setFilterTipoProceso,
  filterInstancia,
  setFilterInstancia,
  filterUsuario,
  setFilterUsuario,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  usuariosUnicos,
  filteredTasacionesLength,
  paginatedTasacionesLength,
  onClearFilters
}: TasacionesFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Búsqueda */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-800 mb-3">🔍 Búsqueda Global</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por procedimiento, cliente, municipio, entidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filtro Tipo Proceso */}
        <div className="w-full lg:w-52">
          <label className="block text-sm font-semibold text-gray-800 mb-3">⚖️ Tipo de Proceso</label>
          <select
            value={filterTipoProceso}
            onChange={(e) => setFilterTipoProceso(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-white"
          >
            <option value="">Todos los tipos</option>
            <option value="Juicio Verbal">Juicio Verbal</option>
            <option value="Juicio Ordinario">Juicio Ordinario</option>
          </select>
        </div>

        {/* Filtro Instancia */}
        <div className="w-full lg:w-52">
          <label className="block text-sm font-semibold text-gray-800 mb-3">🏛️ Instancia</label>
          <select
            value={filterInstancia}
            onChange={(e) => setFilterInstancia(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-white"
          >
            <option value="">Todas las instancias</option>
            <option value="PRIMERA INSTANCIA">Primera Instancia</option>
            <option value="SEGUNDA INSTANCIA">Segunda Instancia</option>
          </select>
        </div>

        {/* Filtro Usuario */}
        <div className="w-full lg:w-52">
          <label className="block text-sm font-semibold text-gray-800 mb-3">👤 Usuario</label>
          <select
            value={filterUsuario}
            onChange={(e) => setFilterUsuario(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-white"
          >
            <option value="">Todos los usuarios</option>
            {usuariosUnicos.map((usuario) => (
              <option key={usuario} value={usuario}>
                {usuario}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro rango de fechas */}
        <div className="w-full lg:w-72">
          <label className="block text-sm font-semibold text-gray-800 mb-3">📅 Rango de Fecha</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-1/2 border-2 border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Fecha desde"
            />
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-1/2 border-2 border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Fecha hasta"
            />
          </div>
        </div>
      </div>

      {/* Resultados del filtro */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            📊 Mostrando <span className="font-semibold text-gray-800">{paginatedTasacionesLength}</span> de <span className="font-semibold text-gray-800">{filteredTasacionesLength}</span> tasaciones
          </span>
        </div>
        {(searchTerm || filterTipoProceso || filterInstancia || filterUsuario) && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}