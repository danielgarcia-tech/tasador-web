import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, Download, MapPin, File } from 'lucide-react'

interface FileInfo {
  name: string
  path: string
}

interface Province {
  name: string
  files: FileInfo[]
}

interface Community {
  name: string
  provinces: { [key: string]: Province }
}

// Mapeo manual de archivos reales presentes en PUBLIC
const BAREMOS_DATA: { [key: string]: Community } = {
  ANDALUCIA: {
    name: 'Andalucía',
    provinces: {
      ALMERIA: {
        name: 'Almería',
        files: [
          { name: '2023 Colegio Almería - Criterios ICA Barcelona.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ANDALUCIA/ALMERIA/2023 Colegio Almería - Criterios ICA Barcelona.pdf' },
          { name: 'Criterio Honorarios ICA Almería.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ANDALUCIA/ALMERIA/Criterio Honorarios ICA Almer｡a.pdf' }
        ]
      },
      CADIZ: {
        name: 'Cádiz',
        files: [
          { name: 'Criterio Honorarios ICA Cadiz.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ANDALUCIA/CÁDIZ/Criterio Honorarios ICA Cadiz.pdf' }
        ]
      },
      CORDOBA: {
        name: 'Córdoba',
        files: [
          { name: 'Criterio Honorarios ICA Córdoba.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ANDALUCIA/CORDOBA/Criterio Honorarios ICA C｢rdoba.pdf' }
        ]
      },
      GRANADA: {
        name: 'Granada',
        files: [
          { name: 'Criterio Honorarios ICA Granada.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ANDALUCIA/GRANADA/Criterio Honorarios ICA Granada.pdf' }
        ]
      },
      HUELVA: {
        name: 'Huelva',
        files: [
          { name: 'Criterio Honorarios ICA Huelva.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ANDALUCIA/HUELVA/Criterio Honorarios ICA Huelva.pdf' }
        ]
      },
      JAEN: {
        name: 'Jaén',
        files: [
          { name: 'Criterio Honorarios ICA Jaén.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ANDALUCIA/JAEN/Criterio Honorarios ICA Jaén.pdf' }
        ]
      },
      JEREZ: {
        name: 'Jerez',
        files: [
          { name: 'Criterio Honorarios ICA Jerez.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ANDALUCIA/JEREZ/Criterio Honorarios ICA Jerez.pdf' }
        ]
      },
      MALAGA: {
        name: 'Málaga',
        files: [
          { name: 'Criterio Honorarios ICA Málaga.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ANDALUCIA/MALAGA/Criterio Honorarios ICA Mlaga.pdf' }
        ]
      },
      SEVILLA: {
        name: 'Sevilla',
        files: [
          { name: 'Criterio Honorarios ICA Sevilla.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ANDALUCIA/SEVILLA/Criterio Honorarios ICA Sevilla.pdf' },
          { name: 'Criterios Tasación SEVILLA.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ANDALUCIA/SEVILLA/Criterios Tasación SEVILLA.pdf' }
        ]
      }
    }
  },
  ARAGON: {
    name: 'Aragón',
    provinces: {
      HUESCA: {
        name: 'Huesca',
        files: [
          { name: 'Criterio Honorarios ICA Huesca.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ARAGÓN/HUESCA/Criterio Honorarios ICA Huesca.pdf' }
        ]
      },
      TERUEL: {
        name: 'Teruel',
        files: [
          { name: 'Criterio Honorarios ICA Teruel.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ARAGÓN/TERUEL/Criterio Honorarios ICA Teruel.pdf' }
        ]
      },
      ZARAGOZA: {
        name: 'Zaragoza',
        files: [
          { name: 'Criterio Honorarios ICA Zaragoza 2001.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ARAGÓN/ZARAGOZA/Criterio Honorarios ICA Zaragoza 2001.pdf' },
          { name: 'Criterio Honorarios ICA Zaragoza 2011.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ARAGÓN/ZARAGOZA/Criterio Honorarios ICA Zaragoza 2011.pdf' },
          { name: 'DICTAMEN COSTAS EXCESIVAS ZARAGOZA.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ARAGÓN/ZARAGOZA/DICTAMEN COSTAS EXCESIVAS ZARAGOZA.pdf' }
        ]
      }
    }
  },
  ASTURIAS: {
    name: 'Asturias',
    provinces: {
      GIJON: {
        name: 'Gijón',
        files: [
          { name: 'CRITERIOS DE HONORARIOS ICA GIJON.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ASTURIAS/GIJÓN/CRITERIOS DE HONORARIOS ICA GIJON.pdf' }
        ]
      },
      OVIEDO: {
        name: 'Oviedo',
        files: [
          { name: 'Criterios-honorarios-2011-ICAO OVIEDO.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ASTURIAS/OVIEDO/Criterios-honorarios-2011-ICAO OVIEDO.pdf' }
        ]
      }
    }
  },
  CANTABRIA: {
    name: 'Cantabria',
    provinces: {
      CANTABRIA: {
        name: 'Cantabria',
        files: [
          { name: 'Criterio Honorarios ICA CANTABRIA - ESCALA ICA CANTABRIA.xls', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CANTABRIA/Criterio Honorarios ICA CANTABRIA - ESCALA ICA CANTABRIA.xls' },
          { name: 'Criterio Honorarios ICA CANTABRIA 15-12-2014.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CANTABRIA/Criterio Honorarios ICA CANTABRIA 15-12-2014.pdf' },
          { name: 'Criterio Honorarios ICA Cantabria.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CANTABRIA/Criterio Honorarios ICA Cantabria.pdf' }
        ]
      }
    }
  },
  CASTILLA_LA_MANCHA: {
    name: 'Castilla-La Mancha',
    provinces: {
      GUADALAJARA: {
        name: 'Guadalajara',
        files: [
          { name: 'Criterio Honorarios ICA Guadalajara.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CASTILLA LA MANCHA/GUADALAJARA/Criterio Honorarios ICA Guadalajara.pdf' }
        ]
      }
    }
  },
  CASTILLA_Y_LEON: {
    name: 'Castilla y León',
    provinces: {
      CASTILLA_Y_LEON: {
        name: 'Castilla y León',
        files: [
          { name: 'CASTILLA Y LEÓN 2006.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CASTILLA Y LEÓN/CASTILLA Y LEÓN 2006.pdf' },
          { name: 'Criterio Honorarios ICA Castilla León 2014.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CASTILLA Y LEÓN/Criterio Honorarios ICA Castilla León 2014.pdf' },
          { name: 'Criterios Castilla y Leon viejos pero definitvos en tablas.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CASTILLA Y LEÓN/Criterios Castilla y Leon viejos pero definitvos en tablas.pdf' },
          { name: 'Criterios Castilla y León definitivos 2016.doc', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CASTILLA Y LEÓN/Criterios Castilla y Le｢n definitivos 2016.doc' }
        ]
      }
    }
  },
  CATALUNA: {
    name: 'Cataluña',
    provinces: {
      BARCELONA: {
        name: 'Barcelona',
        files: [
          { name: 'Criterio Honorarios ICA Barcelona - 2020.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/BARCELONA/Criterio Honorarios ICA Barcelona - 2020.pdf' },
          { name: 'Criterio Honorarios ICA Barcelona - Antiguos.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/BARCELONA/Criterio Honorarios ICA Barcelona - Antiguos.pdf' },
          { name: 'Criterios Tasación BARCELONA.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/BARCELONA/Criterios Tasación BARCELONA.pdf' },
          { name: 'Explicación minuta 2ª instancia.docx', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/BARCELONA/Explicación minuta 2ª instancia.docx' },
          { name: 'Explicación minuta cuantía indeterminada.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/BARCELONA/Explicación minuta cuantía indeterminada.pdf' }
        ]
      },
      GERONA: {
        name: 'Gerona',
        files: [
          { name: 'criterios_orientadors_lletrats_girona.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/GERONA/criterios_orientadors_lletrats_girona.pdf' },
          { name: 'MINUTA CI (ALLANAMIENTO).pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/GERONA/MINUTA CI (ALLANAMIENTO).pdf' }
        ]
      },
      GRANOLLERS: {
        name: 'Granollers',
        files: [
          { name: 'Criterio Honorarios ICA Granollers.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/GRANOLLERS/Criterio Honorarios ICA Granollers.pdf' }
        ]
      },
      LLEIDA: {
        name: 'Lleida',
        files: [
          { name: 'Criterio Honorarios ICA Lleida.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/LLEIDA/Criterio Honorarios ICA Lleida.pdf' }
        ]
      },
      MATARO: {
        name: 'Mataró',
        files: [
          { name: 'Criterio Honorarios ICA Mataró.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/MATARO/Criterio Honorarios ICA Matar｢.pdf' }
        ]
      },
      SANT_FELIU: {
        name: 'Sant Feliu de Llobregat',
        files: [
          { name: 'Criterio Honorarios ICA Sant Feliu de Llobregat.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/SANT FELIU DE LLOBREGAT/Criterio Honorarios ICA Sant Feliu de Llobregat.pdf' }
        ]
      },
      TARRAGONA: {
        name: 'Tarragona',
        files: [
          { name: 'Criterio Honorarios ICA Tarragona (Mayo 2011).pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/TARRAGONA/Criterio Honorarios ICA Tarragona (Mayo 2011).pdf' },
          { name: 'Criterio Honorarios ICA Tarragona.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/TARRAGONA/Criterio Honorarios ICA Tarragona.pdf' },
          { name: 'MINUTA LETRADO TARRAGONA CI.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/TARRAGONA/MINUTA LETRADO TARRAGONA CI.pdf' }
        ]
      },
      TERRASSA: {
        name: 'Terrassa',
        files: [
          { name: 'Criterio Honorarios ICA Terrassa.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CATALUÑA/TERRASSA/Criterio Honorarios ICA Terrassa.pdf' }
        ]
      }
    }
  },
  CEUTA_MELILLA: {
    name: 'Ceuta y Melilla',
    provinces: {
      CEUTA_MELILLA: {
        name: 'Ceuta y Melilla',
        files: [
          { name: 'Criterio Honorarios ICA Cadiz.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/CEUTA Y MELILLA/Criterio Honorarios ICA Cadiz.pdf' }
        ]
      }
    }
  },
  COMUNIDAD_VALENCIANA: {
    name: 'Comunidad Valenciana',
    provinces: {
      ALICANTE: {
        name: 'Alicante',
        files: [
          { name: 'Criterio Honorarios ICA Alicante.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/COMUNIDAD VALENCIANA/ALICANTE/Criterio Honorarios ICA Alicante.pdf' }
        ]
      },
      CASTELLON: {
        name: 'Castellón',
        files: [
          { name: 'Criterio Honorarios ICA Castellon 2015 - Escala.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/COMUNIDAD VALENCIANA/CASTELLON/Criterio Honorarios ICA Castellon 2015 - Escala.pdf' },
          { name: 'Criterio Honorarios ICA Castellon 2015.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/COMUNIDAD VALENCIANA/CASTELLON/Criterio Honorarios ICA Castellon 2015.pdf' }
        ]
      },
      SUECA: {
        name: 'Sueca (Valencia)',
        files: [
          { name: 'CRITERIOS HONORARIOS 2012 SUECA.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/COMUNIDAD VALENCIANA/SUECA (VALENCIA)/CRITERIOS HONORARIOS 2012 SUECA.pdf' },
          { name: 'EscalaBaremo SUECA.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/COMUNIDAD VALENCIANA/SUECA (VALENCIA)/EscalaBaremo SUECA.pdf' }
        ]
      },
      VALENCIA: {
        name: 'Valencia',
        files: [
          { name: 'Criterio Honorarios ICA Valencia (2).pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/COMUNIDAD VALENCIANA/VALENCIA/Criterio Honorarios ICA Valencia (2).pdf' },
          { name: 'Criterio Honorarios ICA Valencia.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/COMUNIDAD VALENCIANA/VALENCIA/Criterio Honorarios ICA Valencia.pdf' },
          { name: 'Criterio Honorarios ICA Valencia1.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/COMUNIDAD VALENCIANA/VALENCIA/Criterio Honorarios ICA Valencia1.pdf' }
        ]
      }
    }
  },
  EXTREMADURA: {
    name: 'Extremadura',
    provinces: {
      BADAJOZ: {
        name: 'Badajoz',
        files: [
          { name: 'Criterio Honorarios ICA Badajoz 1.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/EXTREMADURA/BADAJOZ/Criterio Honorarios ICA Badajoz 1.pdf' },
          { name: 'Criterio Honorarios ICA Badajoz.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/EXTREMADURA/BADAJOZ/Criterio Honorarios ICA Badajoz.pdf' }
        ]
      },
      CACERES: {
        name: 'Cáceres',
        files: [
          { name: 'Criterio Honorarios ICA Cáceres.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/EXTREMADURA/CACERES/Criterio Honorarios ICA Cceres.pdf' }
        ]
      }
    }
  },
  GALICIA: {
    name: 'Galicia',
    provinces: {
      OURENSE: {
        name: 'Ourense',
        files: [
          { name: 'Criterio Honorarios ICA Ourense.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/GALICIA/OURENSE/Criterio Honorarios ICA Ourense.pdf' }
        ]
      },
      PONTEVEDRA: {
        name: 'Pontevedra',
        files: [
          { name: 'Criterio Honorarios ICA Pontevedra.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/GALICIA/PONTEVEDRA/Criterio Honorarios ICA Pontevedra.pdf' }
        ]
      },
      SANTIAGO: {
        name: 'Santiago de Compostela',
        files: [
          { name: 'Criterio Honorarios ICA Santiago de Compostela.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/GALICIA/SANTIAGO/Criterio Honorarios ICA Santiago de Compostela.pdf' }
        ]
      },
      VIGO: {
        name: 'Vigo',
        files: [
          { name: 'Criterio Honorarios ICA Vigo.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/GALICIA/VIGO/Criterio Honorarios ICA Vigo.pdf' }
        ]
      }
    }
  },
  ISLAS_BALEARES: {
    name: 'Islas Baleares',
    provinces: {
      BALEARES: {
        name: 'Islas Baleares',
        files: [
          { name: 'Criterio Honorarios ICA Baleares.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ISLAS BALEARES/Criterio Honorarios ICA Baleares.pdf' },
          { name: 'Criterio Honorarios ICAB.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ISLAS BALEARES/Criterio Honorarios ICAB.pdf' }
        ]
      }
    }
  },
  ISLAS_CANARIAS: {
    name: 'Islas Canarias',
    provinces: {
      LAS_PALMAS: {
        name: 'Las Palmas',
        files: [
          { name: 'Criterio Honorarios ICA Las Palmas de Gran Canarias.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ISLAS CANARIAS/Criterio Honorarios ICA Las Palmas de Gran Canarias.pdf' },
          { name: 'DOC 1 INFORME ICATF.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/ISLAS CANARIAS/DOC 1 INFORME ICATF.pdf.PDF' }
        ]
      }
    }
  },
  LA_RIOJA: {
    name: 'La Rioja',
    provinces: {
      LA_RIOJA: {
        name: 'La Rioja',
        files: [
          { name: 'Criterio Honorarios ICA La Rioja.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/LA RIOJA/Criterio Honorarios ICA La Rioja.pdf' }
        ]
      }
    }
  },
  MADRID: {
    name: 'Madrid',
    provinces: {
      MADRID: {
        name: 'Madrid',
        files: [
          { name: 'Criterio Honorarios ICA Madrid.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/MADRID/Criterio Honorarios ICA Madrid.pdf' },
          { name: 'Criterios-Orientativos-Honorarios-ICAM.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/MADRID/Criterios-Orientativos-Honorarios-ICAM.pdf' },
          { name: 'INFORME ICAM 1500+IVA.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/MADRID/INFORME ICAM 1500+IVA.pdf' }
        ]
      }
    }
  },
  MURCIA: {
    name: 'Murcia',
    provinces: {
      MURCIA: {
        name: 'Murcia',
        files: [
          { name: 'Criterio Honorarios ICA Murcia.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/MURCIA/Criterio Honorarios ICA Murcia.pdf' }
        ]
      }
    }
  },
  NAVARRA: {
    name: 'Navarra',
    provinces: {
      ESTELLA: {
        name: 'Estella',
        files: [
          { name: '2020 HONORARIOS ESTELLA revisada 21 septiembre.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/NAVARRA/Estella/2020 HONORARIOS ESTELLA revisada 21 septiembre.pdf' }
        ]
      },
      PAMPLONA: {
        name: 'Pamplona',
        files: [
          { name: 'Criterio Honorarios ICA Pamplona.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/NAVARRA/Pamplona/Criterio Honorarios ICA Pamplona.pdf' }
        ]
      }
    }
  },
  PAIS_VASCO: {
    name: 'País Vasco',
    provinces: {
      PAIS_VASCO: {
        name: 'País Vasco',
        files: [
          { name: 'Criterio Honorarios ICA País Vasco - Fe de erratas.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/PAIS VASCO/Criterio Honorarios ICA Pa｡s Vasco - F・de erratas.pdf' },
          { name: 'Criterio Honorarios ICA País Vasco.pdf', path: 'BAREMOS HONORARIOS/CRITERIOS TASACIÓN COSTAS/PAIS VASCO/Criterio Honorarios ICA Pa｡s Vasco.pdf' }
        ]
      }
    }
  }
}

export default function ConsultarBaremos() {
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [files, setFiles] = useState<FileInfo[]>([])

  const communities = useMemo(() => Object.values(BAREMOS_DATA), [])
  const communityKey = useMemo(
    () => Object.keys(BAREMOS_DATA).find(key => BAREMOS_DATA[key].name === selectedCommunity),
    [selectedCommunity]
  )
  const currentCommunity = useMemo(() => communityKey ? BAREMOS_DATA[communityKey] : null, [communityKey])
  const provinces = useMemo(() => currentCommunity ? Object.values(currentCommunity.provinces) : [], [currentCommunity])

  useEffect(() => {
    if (selectedCommunity && selectedProvince && currentCommunity) {
      const provinceKey = Object.keys(currentCommunity.provinces).find(
        key => currentCommunity.provinces[key].name === selectedProvince
      )
      if (provinceKey) {
        setFiles(currentCommunity.provinces[provinceKey].files)
      }
    }
  }, [selectedCommunity, selectedProvince, currentCommunity])

  const handleDownload = (file: FileInfo) => {
    const link = document.createElement('a')
    link.href = `/${file.path}`
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
              {communities.map(community => (
                <button
                  key={community.name}
                  onClick={() => {
                    setSelectedCommunity(community.name)
                    setSelectedProvince(null)
                    setFiles([])
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all border-l-4 flex items-center justify-between ${
                    selectedCommunity === community.name
                      ? 'bg-blue-100 border-blue-600 text-blue-900 font-medium'
                      : 'hover:bg-gray-50 border-transparent text-gray-700'
                  }`}
                >
                  <span>{community.name}</span>
                  {selectedCommunity === community.name && (
                    <ChevronRight className="h-5 w-5" />
                  )}
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

            {!selectedCommunity ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Selecciona una comunidad primero</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {provinces.length === 0 ? (
                  <p className="text-gray-500 text-sm py-8 text-center">No hay provincias disponibles</p>
                ) : (
                  provinces.map(province => (
                    <button
                      key={province.name}
                      onClick={() => setSelectedProvince(province.name)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all border-l-4 flex items-center justify-between ${
                        selectedProvince === province.name
                          ? 'bg-green-100 border-green-600 text-green-900 font-medium'
                          : 'hover:bg-gray-50 border-transparent text-gray-700'
                      }`}
                    >
                      <span>{province.name}</span>
                      {selectedProvince === province.name && (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                  ))
                )}
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
                <p className="text-sm">Selecciona una provincia para ver los archivos</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No hay archivos disponibles para esta provincia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => handleDownload(file)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-300 rounded-lg transition-all text-left group"
                  >
                    <File className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-green-700">
                        {file.name}
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
            <div className="text-3xl font-bold text-blue-600">{Object.keys(BAREMOS_DATA).length}</div>
            <p className="text-sm text-gray-600 mt-2">CCAA Disponibles</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {Object.values(BAREMOS_DATA).reduce((acc, cc) => acc + Object.keys(cc.provinces).length, 0)}
            </div>
            <p className="text-sm text-gray-600 mt-2">Provincias/Zonas</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {Object.values(BAREMOS_DATA).reduce(
                (acc, cc) => acc + Object.values(cc.provinces).reduce((a, p) => a + p.files.length, 0),
                0
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">Documentos</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">📚</div>
            <p className="text-sm text-gray-600 mt-2">Actualizado 2025</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">ℹ️ Información Importante</h3>
          <p className="text-blue-800">
            Los baremos de honorarios están organizados por comunidad autónoma y provincia. Selecciona tu ubicación para acceder a los criterios de honorarios aplicables según los estándares ICA (Índices de Costas de Aranceles) de cada jurisdicción.
          </p>
        </div>
      </div>
    </div>
  )
}
