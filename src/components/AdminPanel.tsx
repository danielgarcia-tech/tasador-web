import { useState } from 'react'
import { Settings, MapPin, Building2, Calculator } from 'lucide-react'
import { useAuth } from '../contexts/CustomAuthContext'
import EntidadesTable from './EntidadesTable'
import MunicipioICATable from './MunicipioICATable'
import CostasXICATable from './CostasXICATable'

type AdminSection = 'valores_ica' | 'criterios_ica' | 'municipios' | 'entidades' | 'municipio_ica' | 'costasxica'

export default function AdminPanel() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<AdminSection>('municipio_ica')

  if (!user || user.rol !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-500">
            Solo los administradores pueden acceder a esta sección.
          </p>
        </div>
      </div>
    )
  }

  const renderCriteriosICA = () => (
    <CostasXICATable isAdmin={true} />
  )

  const renderValoresICA = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Nota:</h4>
        <p className="text-blue-700">
          Esta sección era para valores ICA legacy. Los valores actuales se encuentran en la sección "Costas por ICA".
        </p>
      </div>
      <CostasXICATable isAdmin={true} />
    </div>
  )

  const renderMunicipios = () => (
    <MunicipioICATable isAdmin={true} />
  )

  const renderEntidades = () => (
    <EntidadesTable isAdmin={true} />
  )

  const renderMunicipioICA = () => (
    <MunicipioICATable isAdmin={true} />
  )

  const renderCostasXICA = () => (
    <CostasXICATable isAdmin={true} />
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'criterios_ica':
        return renderCriteriosICA()
      case 'valores_ica':
        return renderValoresICA()
      case 'municipios':
        return renderMunicipios()
      case 'entidades':
        return renderEntidades()
      case 'municipio_ica':
        return renderMunicipioICA()
      case 'costasxica':
        return renderCostasXICA()
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
            onClick={() => setActiveSection('criterios_ica')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'criterios_ica'
                ? 'bg-primary-100 text-primary-700 border-primary-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calculator className="h-5 w-5" />
            <span>Criterios ICA</span>
          </button>
          
          <button
            onClick={() => setActiveSection('valores_ica')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'valores_ica'
                ? 'bg-primary-100 text-primary-700 border-primary-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calculator className="h-5 w-5" />
            <span>Valores ICA (Legacy)</span>
          </button>
          
          <button
            onClick={() => setActiveSection('municipios')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'municipios'
                ? 'bg-primary-100 text-primary-700 border-primary-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MapPin className="h-5 w-5" />
            <span>Municipios (Old)</span>
          </button>
          
          <button
            onClick={() => setActiveSection('entidades')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === 'entidades'
                ? 'bg-primary-100 text-primary-700 border-primary-200 border'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Building2 className="h-5 w-5" />
            <span>Entidades</span>
          </button>

          <hr className="my-2" />
          
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
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}