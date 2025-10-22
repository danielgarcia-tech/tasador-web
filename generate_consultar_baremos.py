import os
import json

base_path = r'public\BAREMOS HONORARIOS\CRITERIOS TASACIÓN COSTAS'
baremos_data = {}

for ccaa in sorted(os.listdir(base_path)):
    ccaa_path = os.path.join(base_path, ccaa)
    if os.path.isdir(ccaa_path):
        provinces = {}
        for prov in sorted(os.listdir(ccaa_path)):
            prov_path = os.path.join(ccaa_path, prov)
            if os.path.isdir(prov_path):
                files = sorted([f for f in os.listdir(prov_path) if os.path.isfile(os.path.join(prov_path, f))])
                if files:  # Solo incluir si tiene archivos
                    provinces[prov] = files
        
        if provinces:  # Solo incluir si tiene provincias
            baremos_data[ccaa] = provinces

# Generar código TypeScript
ts_code = "import { useState, useMemo } from 'react'\n"
ts_code += "import { ChevronRight, Download, MapPin, File } from 'lucide-react'\n\n"

ts_code += "// Estructura cargada dinámicamente desde public/BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS\n"
ts_code += "// CCAA -> PROVINCIA -> [archivos PDF]\n"
ts_code += "const BAREMOS_DATA: { [ccaa: string]: { [provincia: string]: string[] } } = {\n"

for ccaa, provinces in baremos_data.items():
    ts_code += f"  '{ccaa}': {{\n"
    for prov, files in provinces.items():
        ts_code += f"    '{prov}': [\n"
        for file in files:
            # Construir ruta completa
            file_path = f"BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/{ccaa}/{prov}/{file}"
            ts_code += f"      '{file}',\n"
        ts_code = ts_code.rstrip(',\n') + "\n"
        ts_code += "    ],\n"
    ts_code = ts_code.rstrip(',\n') + "\n"
    ts_code += "  },\n"

ts_code = ts_code.rstrip(',\n') + "\n"
ts_code += "}\n\n"

ts_code += """export default function ConsultarBaremos() {
  const [selectedCCAAKey, setSelectedCCAAKey] = useState<string | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  
  const ccaaList = useMemo(() => Object.keys(BAREMOS_DATA).sort(), [])
  
  const provinceList = useMemo(() => {
    if (!selectedCCAAKey) return []
    return Object.keys(BAREMOS_DATA[selectedCCAAKey] || {}).sort()
  }, [selectedCCAAKey])
  
  const files = useMemo(() => {
    if (!selectedCCAAKey || !selectedProvince) return []
    return BAREMOS_DATA[selectedCCAAKey]?.[selectedProvince] || []
  }, [selectedCCAAKey, selectedProvince])
  
  const handleDownload = (fileName: string) => {
    const ccaaKey = selectedCCAAKey
    const province = selectedProvince
    if (!ccaaKey || !province) return
    
    const filePath = `BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/${ccaaKey}/${province}/${fileName}`
    const link = document.createElement('a')
    link.href = `/${filePath}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const totalProvinces = Object.values(BAREMOS_DATA).reduce((acc, ccaa) => acc + Object.keys(ccaa).length, 0)
  const totalFiles = Object.values(BAREMOS_DATA).reduce((acc, ccaa) => 
    acc + Object.values(ccaa).reduce((a, files) => a + files.length, 0), 0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Consultar Baremos</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Accede a los criterios de honorarios de cada comunidad autónoma y provincia
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Paso 1: Seleccionar CCAA */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center h-8 w-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                1
              </div>
              <h2 className="text-xl font-bold text-gray-900">Comunidad Autónoma</h2>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {ccaaList.map(ccaaKey => (
                <button
                  key={ccaaKey}
                  onClick={() => {
                    setSelectedCCAAKey(ccaaKey)
                    setSelectedProvince(null)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all border-l-4 flex items-center justify-between ${
                    selectedCCAAKey === ccaaKey
                      ? 'bg-blue-100 border-blue-600 text-blue-900 font-medium'
                      : 'hover:bg-gray-50 border-transparent text-gray-700'
                  }`}
                >
                  <span>{ccaaKey}</span>
                  {selectedCCAAKey === ccaaKey && <ChevronRight className="h-5 w-5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Paso 2: Seleccionar Provincia */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center h-8 w-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                2
              </div>
              <h2 className="text-xl font-bold text-gray-900">Provincia/Zona</h2>
            </div>

            {!selectedCCAAKey ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Selecciona una CCAA primero</p>
              </div>
            ) : provinceList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No hay provincias disponibles</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {provinceList.map(province => (
                  <button
                    key={province}
                    onClick={() => setSelectedProvince(province)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all border-l-4 flex items-center justify-between ${
                      selectedProvince === province
                        ? 'bg-green-100 border-green-600 text-green-900 font-medium'
                        : 'hover:bg-gray-50 border-transparent text-gray-700'
                    }`}
                  >
                    <span>{province}</span>
                    {selectedProvince === province && <ChevronRight className="h-5 w-5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paso 3: Descargar PDFs */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center h-8 w-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                3
              </div>
              <h2 className="text-xl font-bold text-gray-900">Descargas</h2>
            </div>

            {!selectedProvince ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Selecciona una provincia para ver archivos</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No hay archivos disponibles</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDownload(file)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-300 rounded-lg transition-all text-left group"
                  >
                    <File className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-green-700">
                        {file}
                      </p>
                    </div>
                    <Download className="h-4 w-4 text-green-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{ccaaList.length}</div>
            <p className="text-sm text-gray-600 mt-2">CCAA Disponibles</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{totalProvinces}</div>
            <p className="text-sm text-gray-600 mt-2">Provincias/Zonas</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{totalFiles}</div>
            <p className="text-sm text-gray-600 mt-2">Documentos</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">📚</div>
            <p className="text-sm text-gray-600 mt-2">2025</p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
          <p className="text-blue-800">
            Selecciona tu comunidad autónoma y provincia para acceder a los criterios de honorarios aplicables.
          </p>
        </div>
      </div>
    </div>
  )
}"""

print(ts_code)
