import { useState, useEffect } from 'react'
import { Settings, MapPin, Building2, Calculator, FileText, RefreshCw, Users, TrendingUp, BarChart3, Database } from 'lucide-react'
import { useAuth } from '../contexts/CustomAuthContext'
import { supabase } from '../lib/supabase'
import EntidadesTable from './EntidadesTable'
import MunicipioICATable from './MunicipioICATable'
import CostasXICATable from './CostasXICATable'
import Costas24kTable from './Costas24kTable'
import WordTemplateSettings from './WordTemplateSettings.tsx'
import UsersManagement from './UsersManagement'
import InteresesLegalesTable from './InteresesLegalesTable.tsx'
import FormulasCalculoTable from './FormulasCalculoTable'
import BaremosHonorarios from './BaremosHonorarios'

type AdminSection = 'dashboard' | 'entidades' | 'municipio_ica' | 'costasxica' | 'costas24k' | 'word_templates' | 'users' | 'intereses_legales' | 'formulas_calculo' | 'baremos_honorarios'

export default function AdminPanel() {
  const { user, refreshUser } = useAuth()
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalTasaciones: 0,
    totalUsuarios: 0,
    totalMunicipios: 0,
    totalEntidades: 0,
    totalFormulas: 0
  })

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [tasacionesResult, usuariosResult, municipiosResult, entidadesResult, formulasResult] = await Promise.all([
          supabase.from('tasaciones').select('id', { count: 'exact', head: true }),
          supabase.from('usuarios_personalizados').select('id', { count: 'exact', head: true }),
          supabase.from('municipios_ica').select('id', { count: 'exact', head: true }),
          supabase.from('entidades').select('id', { count: 'exact', head: true }),
          supabase.from('formulas_calculo').select('id', { count: 'exact', head: true })
        ])

        setStats({
          totalTasaciones: tasacionesResult.count || 0,
          totalUsuarios: usuariosResult.count || 0,
          totalMunicipios: municipiosResult.count || 0,
          totalEntidades: entidadesResult.count || 0,
          totalFormulas: formulasResult.count || 0
        })
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      }
    }

    if (user?.rol === 'admin') {
      loadStats()
    }
  }, [user])

  const handleRefreshUser = async () => {
    setRefreshing(true)
    try {
      await refreshUser()
      // Recargar la página para aplicar los cambios
      window.location.reload()
    } catch (error) {
      console.error('Error al refrescar usuario:', error)
      alert('Error al refrescar la información del usuario')
    } finally {
      setRefreshing(false)
    }
  }

  if (!user || user.rol !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-500 mb-4">
            Solo los administradores pueden acceder a esta sección.
          </p>
          {user && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Usuario actual: {user.email}
              </p>
              <p className="text-sm text-gray-400">
                Rol actual: {user.rol}
              </p>
              <button
                onClick={handleRefreshUser}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Refrescando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refrescar Usuario
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderEntidades = () => (
    <EntidadesTable isAdmin={true} />
  )

  const renderMunicipioICA = () => (
    <MunicipioICATable isAdmin={true} />
  )

  const renderCostasXICA = () => (
    <CostasXICATable isAdmin={true} />
  )

  const renderCostas24k = () => (
    <Costas24kTable isAdmin={true} />
  )

  const renderWordTemplates = () => (
    <WordTemplateSettings />
  )

  const renderUsers = () => (
    <UsersManagement />
  )

  const renderInteresesLegales = () => (
    <InteresesLegalesTable />
  )

  const renderFormulasCalculo = () => (
    <FormulasCalculoTable isAdmin={true} />
  )

  const renderBaremosHonorarios = () => (
    <BaremosHonorarios />
  )

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Estadísticas principales */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calculator className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Tasaciones
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalTasaciones}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Usuarios Registrados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalUsuarios}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Municipios Configurados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalMunicipios}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Entidades
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalEntidades}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Fórmulas de Cálculo
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalFormulas}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Database className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Estado del Sistema
                  </dt>
                  <dd className="text-lg font-medium text-green-600">
                    Operativo
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveSection('municipio_ica')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin className="h-8 w-8 text-blue-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Municipios PJ-ICA</div>
                <div className="text-sm text-gray-500">Configurar municipios y valores ICA</div>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('costasxica')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calculator className="h-8 w-8 text-green-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Costas por ICA</div>
                <div className="text-sm text-gray-500">Gestionar criterios de cálculo</div>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('costas24k')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calculator className="h-8 w-8 text-blue-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Costas 2025+</div>
                <div className="text-sm text-gray-500">Gestionar valores 2025 en adelante</div>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('formulas_calculo')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Fórmulas de Cálculo</div>
                <div className="text-sm text-gray-500">Administrar fórmulas matemáticas</div>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('users')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-red-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Gestión de Usuarios</div>
                <div className="text-sm text-gray-500">Administrar usuarios del sistema</div>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('entidades')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building2 className="h-8 w-8 text-indigo-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Entidades</div>
                <div className="text-sm text-gray-500">Gestionar entidades bancarias</div>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('word_templates')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-8 w-8 text-orange-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Plantillas HTML</div>
                <div className="text-sm text-gray-500">Configurar plantillas de documentos</div>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('baremos_honorarios')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-8 w-8 text-indigo-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Baremos Honorarios</div>
                <div className="text-sm text-gray-500">Consultar baremos profesionales</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard()
      case 'entidades':
        return renderEntidades()
      case 'municipio_ica':
        return renderMunicipioICA()
      case 'costasxica':
        return renderCostasXICA()
      case 'costas24k':
        return renderCostas24k()
      case 'word_templates':
        return renderWordTemplates()
      case 'users':
        return renderUsers()
      case 'intereses_legales':
        return renderInteresesLegales()
      case 'formulas_calculo':
        return renderFormulasCalculo()
      case 'baremos_honorarios':
        return renderBaremosHonorarios()
      default:
        return <div>Sección no implementada</div>
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
        <p className="text-gray-600">Gestión de configuración del sistema</p>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'dashboard'
                ? 'bg-indigo-100 text-indigo-700 border-indigo-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Dashboard</span>
          </button>

          <hr className="my-2" />
          
          {/* Configuración Principal */}
          <div className="px-3 py-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Configuración Principal
            </h4>
          </div>
          
          <button
            onClick={() => setActiveSection('entidades')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'entidades'
                ? 'bg-indigo-100 text-indigo-700 border-indigo-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Building2 className="h-5 w-5" />
            <span>Entidades</span>
          </button>
          
          <button
            onClick={() => setActiveSection('municipio_ica')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'municipio_ica'
                ? 'bg-green-100 text-green-700 border-green-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MapPin className="h-5 w-5" />
            <span>Municipios PJ-ICA</span>
          </button>
          
          <button
            onClick={() => setActiveSection('costasxica')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'costasxica'
                ? 'bg-green-100 text-green-700 border-green-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calculator className="h-5 w-5" />
            <span>Costas por ICA</span>
          </button>
          
          <button
            onClick={() => setActiveSection('costas24k')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'costas24k'
                ? 'bg-blue-100 text-blue-700 border-blue-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calculator className="h-5 w-5" />
            <span>Costas 2025+</span>
          </button>
          
          <button
            onClick={() => setActiveSection('intereses_legales')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'intereses_legales'
                ? 'bg-blue-100 text-blue-700 border-blue-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Intereses Legales</span>
          </button>
          
          <button
            onClick={() => setActiveSection('formulas_calculo')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'formulas_calculo'
                ? 'bg-purple-100 text-purple-700 border-purple-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calculator className="h-5 w-5" />
            <span>Fórmulas de Cálculo</span>
          </button>

          <button
            onClick={() => setActiveSection('baremos_honorarios')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'baremos_honorarios'
                ? 'bg-orange-100 text-orange-700 border-orange-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Baremos Honorarios</span>
          </button>

          <hr className="my-2" />
          
          {/* Configuración Avanzada */}
          <div className="px-3 py-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Configuración Avanzada
            </h4>
          </div>
          
          <button
            onClick={() => setActiveSection('word_templates')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'word_templates'
                ? 'bg-purple-100 text-purple-700 border-purple-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Plantillas HTML</span>
          </button>

          <hr className="my-2" />
          
          {/* Sistema */}
          <div className="px-3 py-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Sistema
            </h4>
          </div>
          
          <button
            onClick={() => setActiveSection('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'users'
                ? 'bg-red-100 text-red-700 border-red-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Gestión de Usuarios</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}