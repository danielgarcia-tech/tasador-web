import { useState, useMemo } from 'react'
import { ChevronRight, Download, MapPin, File, MessageSquare } from 'lucide-react'
import BaremoChatbot from './BaremoChatbot'

// Estructura simple: CCAA -> PROVINCIA -> [nombres de archivos]
// La ruta se construye como: BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/{CCAA}/{PROVINCIA}/{archivo}
const BAREMOS_DATA: { [ccaa: string]: { [provincia: string]: string[] } } = {
  'ANDALUCIA': {
    'ALMERIA': ['2023 Colegio Almería - Criterios ICA Barcelona.pdf', 'Criterio Honorarios ICA Almer｡a.pdf'],
    'CORDOBA': ['Criterio Honorarios ICA C｢rdoba.pdf'],
    'CÁDIZ': ['Criterio Honorarios ICA Cadiz.pdf'],
    'GRANADA': ['Criterio Honorarios ICA Granada.pdf'],
    'HUELVA': ['Criterio Honorarios ICA Huelva.pdf'],
    'JAEN': ['Criterio Honorarios ICA Jaén.pdf'],
    'JEREZ': ['Criterio Honorarios ICA Jerez.pdf'],
    'MALAGA': ['Criterio Honorarios ICA Mlaga.pdf'],
    'SEVILLA': ['Criterio Honorarios ICA Sevilla.pdf', 'Criterios Tasación SEVILLA.pdf']
  },
  'ARAGÓN': {
    'HUESCA': ['Criterio Honorarios ICA Huesca.pdf'],
    'TERUEL': ['Criterio Honorarios ICA Teruel.pdf'],
    'ZARAGOZA': ['Criterio Honorarios ICA Zaragoza 2001.pdf', 'Criterio Honorarios ICA Zaragoza 2011.pdf', 'DICTAMEN COSTAS EXCESIVAS ZARAGOZA.pdf']
  },
  'ASTURIAS': {
    'GIJÓN': ['CRITERIOS DE HONORARIOS ICA GIJON.pdf'],
    'OVIEDO': ['Criterios-honorarios-2011-ICAO OVIEDO.pdf']
  },
  'CANTABRIA': {
    'CANTABRIA': ['Criterio Honorarios ICA CANTABRIA - ESCALA ICA CANTABRIA.xls', 'Criterio Honorarios ICA CANTABRIA 15-12-2014.pdf', 'Criterio Honorarios ICA Cantabria.pdf']
  },
  'CASTILLA LA MANCHA': {
    'GUADALAJARA': ['Criterio Honorarios ICA Guadalajara.pdf']
  },
  'CASTILLA Y LEÓN': {
    'CASTILLA Y LEON': ['CASTILLA Y LEÓN 2006.pdf', 'Criterio Honorarios ICA Castilla León 2014.pdf', 'Criterio Honorarios ICA Castilla Le｢n 2009.pdf', 'Criterio Honorarios ICA Castilla Le｢n 2016 con Escala.pdf', 'Criterios Castilla y Leon viejos pero definitvos en tablas.pdf', 'Criterios Castilla y Le｢n definitivos 2016.doc']
  },
  'CATALUÑA': {
    'BARCELONA': ['Criterio Honorarios ICA Barcelona - 2020.pdf', 'Criterio Honorarios ICA Barcelona - Antiguos.pdf', 'Criterios Tasación BARCELONA.pdf', 'Explicación minuta 2ª instancia.docx', 'Explicación minuta cuantía indeterminada.pdf', 'Explicación minuta incidente impugnación TC.docx', 'Explicación minuta incidente recurso revisión.docx'],
    'GENERAL': ['Criterio Honorarios ICA Catalu､a.pdf'],
    'GERONA': ['criterios_orientadors_lletrats_girona.pdf', 'MINUTA CI (ALLANAMIENTO).pdf'],
    'GRANOLLERS': ['Criterio Honorarios ICA Granollers.pdf'],
    'LLEIDA': ['Criterio Honorarios ICA Lleida.pdf'],
    'MATARO': ['Criterio Honorarios ICA Matar｢.pdf'],
    'SANT FELIU DE LLOBREGAT': ['Criterio Honorarios ICA Sant Feliu de Llobregat.pdf'],
    'TARRAGONA': ['Criterio Honorarios ICA Tarragona (Mayo 2011).pdf', 'Criterio Honorarios ICA Tarragona.pdf', 'MINUTA LETRADO TARRAGONA CI.pdf'],
    'TERRASSA': ['Criterio Honorarios ICA Terrassa.pdf']
  },
  'CEUTA Y MELILLA': {
    'CEUTA Y MELILLA': ['Criterio Honorarios ICA Cadiz.pdf']
  },
  'COMUNIDAD VALENCIANA': {
    'ALICANTE': ['Criterio Honorarios ICA Alicante.pdf'],
    'CASTELLON': ['Criterio Honorarios ICA Castellon 2015 - Escala.pdf', 'Criterio Honorarios ICA Castellon 2015.pdf'],
    'SUECA (VALENCIA)': ['CRITERIOS HONORARIOS 2012 SUECA.pdf', 'EscalaBaremo SUECA.pdf'],
    'VALENCIA': ['Criterio Honorarios ICA Valencia (2).pdf', 'Criterio Honorarios ICA Valencia.pdf', 'Criterio Honorarios ICA Valencia1.pdf']
  },
  'EXTREMADURA': {
    'BADAJOZ': ['Criterio Honorarios ICA Badajoz 1.pdf', 'Criterio Honorarios ICA Badajoz.pdf'],
    'CACERES': ['Criterio Honorarios ICA Cceres.pdf', 'Modificaci｢n criterios 51 y 55Criterio Honorarios ICA Cceres.pdf']
  },
  'GALICIA': {
    'A CORUÑA': ['Criterio Honorarios ICA Galicia.pdf'],
    'OURENSE': ['Criterio Honorarios ICA Ourense.pdf'],
    'PONTEVEDRA': ['Criterio Honorarios ICA Pontevedra.pdf'],
    'SANTIAGO': ['Criterio Honorarios ICA Santiago de Compostela.pdf'],
    'VIGO': ['Criterio Honorarios ICA Vigo.pdf']
  },
  'ISLAS BALEARES': {
    'ISLAS BALEARES': ['Criterio Honorarios ICA Baleares.pdf', 'Criterio Honorarios ICAB.pdf']
  },
  'ISLAS CANARIAS': {
    'ISLAS CANARIAS': ['Criterio Honorarios ICA Las Palmas de Gran Canarias.pdf', 'DOC 1 INFORME ICATF.pdf.PDF']
  },
  'LA RIOJA': {
    'LA RIOJA': ['Criterio Honorarios ICA La Rioja.pdf']
  },
  'MADRID': {
    'MADRID': ['Criterio Honorarios ICA Madrid.pdf', 'Criterios-Orientativos-Honorarios-ICAM.pdf', 'INFORME ICAM 1500+IVA.pdf']
  },
  'MURCIA': {
    'MURCIA': ['Criterio Honorarios ICA Murcia.pdf']
  },
  'NAVARRA': {
    'Estella': ['2020 HONORARIOS ESTELLA revisada 21 septiembre.pdf'],
    'Pamplona': ['Criterio Honorarios ICA Pamplona.pdf']
  },
  'PAIS VASCO': {
    'PAIS VASCO': ['Criterio Honorarios ICA Pa｡s Vasco - F・de erratas.pdf', 'Criterio Honorarios ICA Pa｡s Vasco.pdf']
  }
}
        

export default function ConsultarBaremos() {
  const [selectedCCAAKey, setSelectedCCAAKey] = useState<string | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [showChatbot, setShowChatbot] = useState(false)
  
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
    if (!selectedCCAAKey || !selectedProvince) return
    
    const filePath = `BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/${selectedCCAAKey}/${selectedProvince}/${fileName}`
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
            Accede a los criterios de honorarios reales de cada comunidad autónoma y provincia
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
              <h2 className="text-xl font-bold text-gray-900">Descargas & IA</h2>
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

                {/* Botón Chatbot */}
                {selectedProvince && (
                  <button
                    onClick={() => setShowChatbot(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-300 rounded-lg transition-all text-left group mt-4"
                  >
                    <MessageSquare className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">
                        Consultar con IA
                      </p>
                      <p className="text-xs text-gray-600">Haz preguntas sobre este baremo</p>
                    </div>
                  </button>
                )}
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

        {/* Footer Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
          <p className="text-blue-800">
            Selecciona tu comunidad autónoma y provincia para acceder a los criterios de honorarios aplicables.
          </p>
        </div>
      </div>

      {/* Chatbot Modal */}
      {showChatbot && selectedCCAAKey && selectedProvince && (
        <BaremoChatbot
          ccaa={selectedCCAAKey}
          provincia={selectedProvince}
          onClose={() => setShowChatbot(false)}
        />
      )}
    </div>
  )
}
