import { useState, useEffect } from 'react'

export interface BaremoFile {
  id: string
  name: string
  path: string
  size: number
  lastModified: Date
  type: string
  category: string
  description?: string
  tags?: string[]
}

export function useBaremosHonorarios() {
  const [baremos, setBaremos] = useState<BaremoFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string>('')

  // Datos de ejemplo - en producción esto vendría de una API
  useEffect(() => {
    const mockBaremos: BaremoFile[] = [
      {
        id: '1',
        name: 'Baremo_Procuradores_2024.pdf',
        path: '/baremos/procuradores/Baremo_Procuradores_2024.pdf',
        size: 2457600,
        lastModified: new Date('2024-01-15'),
        type: 'pdf',
        category: 'Procuradores',
        description: 'Baremo oficial de honorarios para procuradores 2024',
        tags: ['procuradores', 'honorarios', '2024', 'oficial']
      },
      {
        id: '2',
        name: 'Honorarios_Graduados_Sociales.xlsx',
        path: '/baremos/graduados_sociales/Honorarios_Graduados_Sociales.xlsx',
        size: 512000,
        lastModified: new Date('2024-02-20'),
        type: 'xlsx',
        category: 'Graduados Sociales',
        description: 'Tabla de honorarios para graduados sociales',
        tags: ['graduados sociales', 'honorarios', 'tasas']
      },
      {
        id: '3',
        name: 'Tarifas_Administradores_Concursales.pdf',
        path: '/baremos/administradores/Tarifas_Administradores_Concursales.pdf',
        size: 1843200,
        lastModified: new Date('2024-03-10'),
        type: 'pdf',
        category: 'Administradores Concursales',
        description: 'Tarifas aplicables a administradores concursales',
        tags: ['administradores', 'concursal', 'quiebra', 'tarifas']
      },
      {
        id: '4',
        name: 'Baremo_Notarios_2024.docx',
        path: '/baremos/notarios/Baremo_Notarios_2024.docx',
        size: 768000,
        lastModified: new Date('2024-01-30'),
        type: 'docx',
        category: 'Notarios',
        description: 'Baremo de aranceles notariales 2024',
        tags: ['notarios', 'aranceles', '2024', 'oficial']
      },
      {
        id: '5',
        name: 'Honorarios_Peritos_Judiciales.pdf',
        path: '/baremos/peritos/Honorarios_Peritos_Judiciales.pdf',
        size: 1536000,
        lastModified: new Date('2024-04-05'),
        type: 'pdf',
        category: 'Peritos Judiciales',
        description: 'Guía de honorarios para peritos judiciales',
        tags: ['peritos', 'judicial', 'honorarios', 'expertos']
      },
      {
        id: '6',
        name: 'Tarifas_Abogados_2024.xlsx',
        path: '/baremos/abogados/Tarifas_Abogados_2024.xlsx',
        size: 987000,
        lastModified: new Date('2024-02-14'),
        type: 'xlsx',
        category: 'Abogados',
        description: 'Tarifas orientativas para servicios de abogados',
        tags: ['abogados', 'tarifas', 'orientativas', '2024']
      },
      {
        id: '7',
        name: 'Baremo_Mediadores_Familiares.pdf',
        path: '/baremos/mediadores/Baremo_Mediadores_Familiares.pdf',
        size: 1456000,
        lastModified: new Date('2024-03-22'),
        type: 'pdf',
        category: 'Mediadores',
        description: 'Honorarios para mediadores familiares',
        tags: ['mediadores', 'familiares', 'divorcio', 'custodia']
      }
    ]

    setBaremos(mockBaremos)
  }, [])

  const selectFolder = async (folderPath?: string) => {
    try {
      setLoading(true)
      setError(null)

      // En un entorno real, aquí se abriría un diálogo del sistema
      // o se recibiría la ruta desde un input
      const path = folderPath || '/baremos'
      setSelectedFolder(path)

      // Aquí iría la lógica para leer archivos del sistema de archivos
      // Por ahora simulamos que ya tenemos los datos cargados

      return path
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al seleccionar carpeta'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const searchBaremos = (query: string): BaremoFile[] => {
    if (!query.trim()) return baremos

    const searchTerm = query.toLowerCase()
    return baremos.filter(baremo =>
      baremo.name.toLowerCase().includes(searchTerm) ||
      baremo.category.toLowerCase().includes(searchTerm) ||
      baremo.description?.toLowerCase().includes(searchTerm) ||
      baremo.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  const getBaremosByCategory = (category: string): BaremoFile[] => {
    return baremos.filter(baremo => baremo.category === category)
  }

  const openBaremo = async (baremo: BaremoFile) => {
    try {
      // En un entorno real, aquí se abriría el archivo con la aplicación apropiada
      // o se mostraría en un visor integrado

      // Simulación: abrir en nueva ventana o descargar
      if (baremo.type === 'pdf') {
        window.open(baremo.path, '_blank')
      } else {
        // Para otros tipos, mostrar alerta
        alert(`Abriendo ${baremo.name} con la aplicación correspondiente`)
      }
    } catch (err) {
      throw new Error(`Error al abrir el baremo: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  const downloadBaremo = async (baremo: BaremoFile) => {
    try {
      // En un entorno real, aquí se descargaría el archivo
      // Simulación: crear un enlace de descarga
      const link = document.createElement('a')
      link.href = baremo.path
      link.download = baremo.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      throw new Error(`Error al descargar el baremo: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  const getCategories = (): string[] => {
    return [...new Set(baremos.map(baremo => baremo.category))]
  }

  return {
    baremos,
    loading,
    error,
    selectedFolder,
    selectFolder,
    searchBaremos,
    getBaremosByCategory,
    openBaremo,
    downloadBaremo,
    getCategories
  }
}