import { useState, useMemo } from 'react'
import { BookOpen, Download, ExternalLink, Search, ChevronDown, ChevronRight, Calculator, History, HelpCircle, Zap } from 'lucide-react'

interface Section {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  content: string
  subsections?: Subsection[]
}

interface Subsection {
  id: string
  title: string
  content: string
}

const sections: Section[] = [
  {
    id: 'intro',
    title: 'Introducción',
    icon: <BookOpen className="h-5 w-5" />,
    description: 'Conoce TASADOR COSTAS y sus funcionalidades principales',
    content: `
      <h3>¿Qué es TASADOR COSTAS?</h3>
      <p><strong>TASADOR COSTAS</strong> es una plataforma diseñada para profesionales del ámbito jurídico que necesitan emitir tasaciones ágiles y precisas. Permite:</p>
      <ul>
        <li>Cálculo automático de <strong>costas judiciales</strong> conforme a los <em>Baremos de Honorarios</em>.</li>
        <li>Cálculo de <strong>intereses legales</strong>, <strong>judiciales</strong> y <strong>TAE</strong> — incluyendo variantes como <em>TAE + 5%</em>.</li>
        <li>Generación de <strong>informes profesionales</strong> descargables en <span class="pill">PDF</span> y <span class="pill">Excel</span>.</li>
      </ul>
      <div class="callout">
        💡 <strong>Consejo:</strong> El sistema aplica automáticamente los <strong>Baremos de Honorarios</strong> en función del municipio seleccionado, minimizando errores manuales.
      </div>
    `
  },
  {
    id: 'tasaciones',
    title: 'Tasaciones',
    icon: <Calculator className="h-5 w-5" />,
    description: 'Aprende a crear y gestionar tasaciones de costas judiciales',
    content: `
      <h3>¿Qué es una tasación?</h3>
      <p>Una tasación es el cálculo automático de las <strong>costas judiciales</strong> (gastos asociados al proceso), atendiendo a:</p>
      <ul>
        <li>Los <strong>Baremos de Honorarios</strong> del municipio.</li>
        <li>La <strong>fase de terminación</strong> (p. ej., Audiencia Previa, Sentencia).</li>
        <li>La <strong>instancia</strong> (Primera o Segunda).</li>
      </ul>
    `,
    subsections: [
      {
        id: 'crear-tasacion',
        title: 'Crear una nueva tasación',
        content: `
          <h4>Paso 1 · Acceder al formulario</h4>
          <ul>
            <li>Haz clic en la pestaña <strong>TASADOR COSTAS</strong>.</li>
            <li>Se mostrará un formulario con varios campos.</li>
          </ul>

          <h4>Paso 2 · Completar información del cliente</h4>
          <table>
            <thead><tr><th>Campo</th><th>Descripción</th><th>Ejemplo</th></tr></thead>
            <tbody>
              <tr><td><strong>Nombre cliente</strong></td><td>Parte solicitante de la tasación</td><td>Juan García López</td></tr>
              <tr><td><strong>Nº procedimiento</strong></td><td>Identificador único del juicio</td><td>2024/12345</td></tr>
              <tr><td><strong>Nombre juzgado</strong></td><td>(Opcional) Órgano judicial</td><td>Juzgado de lo Civil nº 3</td></tr>
              <tr><td><strong>Entidad demandada</strong></td><td>Organización demandada (con <em>autocomplete</em>)</td><td>AEPD, Banco Santander</td></tr>
            </tbody>
          </table>

          <h4>Paso 3 · Ubicación y proceso</h4>
          <table>
            <thead><tr><th>Campo</th><th>Descripción</th><th>Ejemplo</th></tr></thead>
            <tbody>
              <tr><td><strong>Municipio</strong></td><td>Localidad del asunto</td><td>Madrid, Barcelona</td></tr>
              <tr><td><strong>Tipo procedimiento</strong></td><td>Verbal u Ordinario</td><td>Juicio Verbal / Juicio Ordinario</td></tr>
              <tr><td><strong>Fase de terminación</strong></td><td>Etapa final</td><td>Audiencia Previa, Sentencia</td></tr>
              <tr><td><strong>Instancia</strong></td><td>Nivel judicial</td><td>Primera / Segunda Instancia</td></tr>
            </tbody>
          </table>
          <p class="note">El sistema <strong>calcula automáticamente</strong> los Baremos de Honorarios según el municipio.</p>

          <h4>Paso 4 · Generar la tasación</h4>
          <ol>
            <li>Revisa los datos introducidos.</li>
            <li>Haz clic en <strong>Generar tasación</strong>.</li>
            <li>El sistema calculará: <strong>Costas sin IVA</strong>, <strong>IVA 21%</strong> y <strong>Total</strong>.</li>
          </ol>
        `
      },
      {
        id: 'exportar-tasacion',
        title: 'Exportar y compartir',
        content: `
          <h4>Formatos disponibles</h4>
          <ul>
            <li><strong>PDF Profesional:</strong> Informe completo con formato legal</li>
            <li><strong>Excel Detallado:</strong> Datos tabulares para análisis adicional</li>
          </ul>
          <div class="callout">
            📊 <strong>Pro tip:</strong> Los informes incluyen automáticamente todos los cálculos y referencias legales.
          </div>
        `
      }
    ]
  },
  {
    id: 'interes-simple',
    title: 'Cálculo de Interés Simple',
    icon: <Zap className="h-5 w-5" />,
    description: 'Calcula intereses legales, judiciales y TAE para un período específico',
    content: `
      <h3>¿Para qué sirve?</h3>
      <p>Para una <strong>única cuantía</strong> y un <strong>período específico</strong> (fecha inicio → fecha fin), sin procesar múltiples casos.</p>

      <h3>Tipos de interés disponibles</h3>
      <ul>
        <li><strong>Interés Legal:</strong> Según el artículo 576 de la LEC</li>
        <li><strong>Interés Judicial:</strong> Aplicado por los tribunales</li>
        <li><strong>TAE:</strong> Tasa Anual Equivalente</li>
        <li><strong>TAE + 5%:</strong> Variante especial</li>
      </ul>
    `,
    subsections: [
      {
        id: 'configurar-interes-simple',
        title: 'Configurar cálculo',
        content: `
          <h4>Campos requeridos</h4>
          <ul>
            <li><strong>Cuantía:</strong> Importe base para el cálculo</li>
            <li><strong>Fecha inicio:</strong> Comienzo del período</li>
            <li><strong>Fecha fin:</strong> Finalización del período</li>
            <li><strong>Tipo de interés:</strong> Legal, Judicial, TAE, etc.</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'interes-avanzado',
    title: 'Cálculo de Interés Avanzado',
    icon: <Calculator className="h-5 w-5" />,
    description: 'Procesa múltiples cálculos de interés desde archivos Excel',
    content: `
      <h3>Procesamiento por lotes</h3>
      <p>Ideal para procesar <strong>múltiples casos</strong> de forma simultánea mediante importación de datos desde Excel.</p>

      <h3>Características principales</h3>
      <ul>
        <li>Importación masiva desde Excel</li>
        <li>Reportes personalizables</li>
        <li>Plantillas de informes</li>
        <li>Exportación a PDF/Excel</li>
      </ul>
    `,
    subsections: [
      {
        id: 'formato-excel',
        title: 'Formato del archivo Excel',
        content: `
          <h4>Columnas requeridas</h4>
          <table>
            <thead><tr><th>Columna</th><th>Descripción</th><th>Obligatorio</th></tr></thead>
            <tbody>
              <tr><td>CUANTIA</td><td>Importe base</td><td>Sí</td></tr>
              <tr><td>FECHA_INICIO</td><td>Fecha de inicio</td><td>Sí</td></tr>
              <tr><td>FECHA_FIN</td><td>Fecha de fin</td><td>Sí</td></tr>
              <tr><td>TIPO_INTERES</td><td>Tipo de interés</td><td>Sí</td></tr>
            </tbody>
          </table>
        `
      },
      {
        id: 'personalizar-reporte',
        title: 'Personalizar informes',
        content: `
          <h4>Opciones de personalización</h4>
          <ul>
            <li>Título del informe</li>
            <li>Subtítulo personalizado</li>
            <li>Notas adicionales</li>
            <li>Pie de página</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'historial',
    title: 'Historial de Tasaciones',
    icon: <History className="h-5 w-5" />,
    description: 'Gestiona y consulta todas tus tasaciones realizadas',
    content: `
      <h3>Registro completo</h3>
      <p>Registro completo de tasaciones, con búsqueda, filtros, exportación y estadísticas.</p>

      <h3>Funcionalidades disponibles</h3>
      <ul>
        <li><strong>Buscador</strong> por cliente, procedimiento o ubicación.</li>
        <li><strong>Filtros avanzados</strong> por fecha, tipo, estado.</li>
        <li><strong>Estadísticas</strong> de uso y rendimiento.</li>
        <li><strong>Exportación</strong> masiva de datos.</li>
      </ul>
    `,
    subsections: [
      {
        id: 'acciones-disponibles',
        title: 'Acciones disponibles',
        content: `
          <h4>Operaciones por tasación</h4>
          <table>
            <thead><tr><th>Acción</th><th>Descripción</th></tr></thead>
            <tbody>
              <tr><td>✏️ <strong>Editar</strong></td><td>Permite modificar datos y recalcular.</td></tr>
              <tr><td>👁️ <strong>Ver detalles</strong></td><td>Muestra información completa.</td></tr>
              <tr><td>📄 <strong>Generar PDF</strong></td><td>Crea informe profesional.</td></tr>
              <tr><td>📊 <strong>Exportar Excel</strong></td><td>Datos en formato tabular.</td></tr>
              <tr><td>🗑️ <strong>Eliminar</strong></td><td>Remover tasación (con confirmación).</td></tr>
            </tbody>
          </table>
        `
      }
    ]
  },

  {
    id: 'faq',
    title: 'Preguntas Frecuentes',
    icon: <HelpCircle className="h-5 w-5" />,
    description: 'Respuestas a las preguntas más comunes',
    content: `
      <h3>Preguntas frecuentes</h3>
      <p>Encuentra respuestas rápidas a las dudas más comunes sobre TASADOR COSTAS.</p>
    `,
    subsections: [
      {
        id: 'problemas-comunes',
        title: 'Problemas comunes',
        content: `
          <h4>¿Qué hacer si no encuentro un municipio?</h4>
          <p>Verifica que el nombre esté escrito correctamente. Si persiste el problema, contacta con soporte.</p>

          <h4>¿Cómo recalcular una tasación?</h4>
          <p>Accede al historial, selecciona la tasación y haz clic en "Editar" para modificar los datos.</p>
        `
      },
      {
        id: 'soporte',
        title: '¿Necesitas ayuda adicional?',
        content: `
          <p>Si no encuentras respuesta a tu pregunta, puedes:</p>
          <ul>
            <li>Contactar con nuestro equipo de soporte</li>
            <li>Revisar la documentación técnica</li>
            <li>Unirte a la comunidad de usuarios</li>
          </ul>
        `
      }
    ]
  }
]

export default function Help() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro']))
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState<string>('intro')

  // Filtrar secciones basado en búsqueda
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections

    return sections.filter(section => {
      const matchesTitle = section.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDescription = section.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesContent = section.content.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSubsections = section.subsections?.some(sub =>
        sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.content.toLowerCase().includes(searchTerm.toLowerCase())
      ) || false

      return matchesTitle || matchesDescription || matchesContent || matchesSubsections
    })
  }, [searchTerm])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(`section-${sectionId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Centro de Ayuda</h1>
                <p className="text-gray-600 mt-1">
                  Guía interactiva completa de TASADOR COSTAS v2.0
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/docs/TASADOR_COSTAS_v2_Manual.html"
                download
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </a>
              <a
                href="/docs/TASADOR_COSTAS_v2_Manual.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Versión Completa
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Búsqueda */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar en el manual..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Índice de secciones */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Índice</h3>
                <nav className="space-y-1">
                  {filteredSections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {section.icon}
                        <span>{section.title}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Estadísticas rápidas */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">En esta guía</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Secciones:</span>
                    <span className="font-medium">{sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subsecciones:</span>
                    <span className="font-medium">
                      {sections.reduce((acc, s) => acc + (s.subsections?.length || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última actualización:</span>
                    <span className="font-medium">2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredSections.map(section => (
                <div
                  key={section.id}
                  id={`section-${section.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Header de sección */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-600">
                          {section.icon}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Contenido expandible */}
                  {expandedSections.has(section.id) && (
                    <div className="px-6 pb-6">
                      <div
                        className="
                          prose prose-gray max-w-none
                          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-gray-800
                          [&_h4]:text-base [&_h4]:font-bold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-gray-700
                          [&_p]:text-gray-700 [&_p]:mb-4 [&_p]:leading-relaxed
                          [&_strong]:text-gray-900 [&_strong]:font-bold
                          [&_em]:text-gray-800 [&_em]:italic
                          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                          [&_li]:mb-2 [&_li]:text-gray-700
                          [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_table]:border [&_table]:border-gray-300
                          [&_th]:bg-gray-100 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_th]:border [&_th]:border-gray-300 [&_th]:text-gray-900
                          [&_td]:p-3 [&_td]:border [&_td]:border-gray-300 [&_td]:text-gray-700
                          [&_.callout]:border-l-4 [&_.callout]:border-blue-500 [&_.callout]:bg-blue-50 [&_.callout]:pl-4 [&_.callout]:py-3 [&_.callout]:my-4 [&_.callout]:text-blue-900
                          [&_.note]:text-sm [&_.note]:text-gray-600 [&_.note]:italic
                          [&_.pill]:inline-block [&_.pill]:border [&_.pill]:border-gray-300 [&_.pill]:bg-gray-100 [&_.pill]:px-2 [&_.pill]:py-1 [&_.pill]:rounded [&_.pill]:text-xs [&_.pill]:font-medium [&_.pill]:mr-2
                        "
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />

                      {/* Subsecciones */}
                      {section.subsections && section.subsections.map(subsection => (
                        <div key={subsection.id} className="mt-6 border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-bold text-gray-800 mb-3">{subsection.title}</h4>
                          <div
                            className="
                              prose prose-gray max-w-none
                              [&_h4]:text-base [&_h4]:font-bold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-gray-700
                              [&_p]:text-gray-700 [&_p]:mb-4 [&_p]:leading-relaxed
                              [&_strong]:text-gray-900 [&_strong]:font-bold
                              [&_em]:text-gray-800 [&_em]:italic
                              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                              [&_li]:mb-2 [&_li]:text-gray-700
                              [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_table]:border [&_table]:border-gray-300
                              [&_th]:bg-gray-100 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_th]:border [&_th]:border-gray-300 [&_th]:text-gray-900
                              [&_td]:p-3 [&_td]:border [&_td]:border-gray-300 [&_td]:text-gray-700
                            "
                            dangerouslySetInnerHTML={{ __html: subsection.content }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filteredSections.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-600">
                    Intenta con otros términos de búsqueda o navega por las secciones del índice.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
