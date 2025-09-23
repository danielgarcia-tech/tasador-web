import { useState } from 'react'
import { FileText, Search, FolderOpen, Download, Eye, Filter, AlertCircle } from 'lucide-react'
import { useBaremosHonorarios, type BaremoFile } from '../hooks/useBaremosHonorarios'

export default function BaremosHonorarios() {
  const {
    baremos,
    loading,
    error,
    selectedFolder,
    selectFolder,
    searchBaremos,
    openBaremo,
    downloadBaremo,
    getCategories
  } = useBaremosHonorarios()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Filtrar baremos por búsqueda y categoría
  const filteredBaremos = baremos.filter(baremo => {
    const matchesSearch = searchTerm === '' || searchBaremos(searchTerm).includes(baremo)
    const matchesCategory = selectedCategory === '' || baremo.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectFolder = async () => {
    try {
      await selectFolder()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al seleccionar carpeta')
    }
  }

  const handleOpenBaremo = async (baremo: BaremoFile) => {
    try {
      await openBaremo(baremo)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al abrir el baremo')
    }
  }

  const handleDownloadBaremo = async (baremo: BaremoFile) => {
    try {
      await downloadBaremo(baremo)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al descargar el baremo')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄'
      case 'xlsx':
      case 'xls':
        return '📊'
      case 'docx':
      case 'doc':
        return '📝'
      default:
        return '📄'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Baremos de Honorarios</h2>
          <p className="text-gray-600">Consulta y descarga baremos de honorarios profesionales</p>
        </div>
        <button
          onClick={handleSelectFolder}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              Cargando...
            </>
          ) : (
            <>
              <FolderOpen className="h-4 w-4 mr-2" />
              Seleccionar Carpeta
            </>
          )}
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar baremos por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las categorías</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mostrar errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div className="text-red-800">{error}</div>
          </div>
        </div>
      )}

      {/* Información de carpeta seleccionada */}
      {selectedFolder && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FolderOpen className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <div className="font-medium text-blue-800">Carpeta seleccionada</div>
              <div className="text-blue-700 text-sm">{selectedFolder}</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de baremos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {filteredBaremos.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron baremos
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Selecciona una carpeta para cargar los baremos.'}
                </p>
              </div>
            ) : (
              filteredBaremos.map((baremo, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getFileIcon(baremo.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{baremo.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(baremo.size)} • Modificado: {baremo.lastModified.toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-xs text-gray-400">{baremo.path}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenBaremo(baremo)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDownloadBaremo(baremo)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Información sobre Baremos</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Los baremos se actualizan periódicamente según la legislación vigente</li>
          <li>• Para baremos específicos de tu jurisdicción, consulta con el colegio profesional correspondiente</li>
          <li>• Los honorarios pueden variar según la complejidad del caso y acuerdos entre las partes</li>
          <li>• Esta herramienta es solo informativa y no constituye asesoramiento legal</li>
        </ul>
      </div>
    </div>
  )
}