import { LogOut, Calculator, FileText, Settings, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/CustomAuthContext'
import logoRua from '../assets/logo-rua.png'
import LiquidEther from './LiquidEther'

interface LayoutProps {
  children: React.ReactNode
  currentTab: 'calculator' | 'intereses' | 'history' | 'settings'
  onTabChange: (tab: 'calculator' | 'intereses' | 'history' | 'settings') => void
}

export default function Layout({ children, currentTab, onTabChange }: LayoutProps) {
  const { user, logout } = useAuth()

  const tabs = [
    { id: 'calculator' as const, label: 'TASADOR COSTAS', icon: Calculator },
    { id: 'intereses' as const, label: 'CALCULADOR INTERESES', icon: TrendingUp },
    { id: 'history' as const, label: 'Historial', icon: FileText },
    { id: 'settings' as const, label: 'Configuración', icon: Settings },
  ]

  // Botones ocultos (desactivados de la UI principal)
  // { id: 'database' as const, label: 'Base de Datos', icon: Database },
  // { id: 'tests' as const, label: 'Pruebas', icon: TestTube },
  // { id: 'mcp' as const, label: 'MCP Control', icon: Cpu },

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Liquid Ether Background */}
      <div className="fixed inset-0 z-0">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={logoRua} 
                alt="TASADOR COSTAS" 
                className="h-8 w-8"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  TASADOR COSTAS
                </h1>
                <p className="text-sm text-gray-500">
                  Sistema profesional de tasación judicial
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Bienvenido, <span className="font-medium">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    currentTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            © 2025 Sistema de Tasación de Costas Judiciales. Desarrollado para profesionales del derecho.
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}