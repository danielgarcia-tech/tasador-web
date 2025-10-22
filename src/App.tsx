import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/CustomAuthContext'
import Login from './components/Login'
import Layout from './components/Layout'
import CalculatorContainer from './components/CalculatorContainer'
import InterestCalculator from './components/InterestCalculator'
import InterestCalculatorAdvanced from './components/InterestCalculatorAdvanced'
import Help from './components/Help'
import HistorialTasaciones from './components/HistorialTasaciones'
import AdminPanel from './components/AdminPanel'
import LiquidEther from './components/LiquidEther'
import { initializeDatabase } from './lib/database-init'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentTab, setCurrentTab] = useState<'calculator' | 'intereses' | 'intereses-avanzado' | 'history' | 'settings' | 'help'>('calculator')

  // Inicializar base de datos al cargar la aplicación
  useEffect(() => {
    initializeDatabase()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Liquid Ether Background */}
        <div className="fixed inset-0 z-0">
          <LiquidEther
            colors={['#5227FF', '#FF9FFC', '#B19EEF']}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={16}
            iterationsPoisson={16}
            resolution={0.25}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.375}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </div>

        {/* Loading Content Overlay */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Liquid Ether Background */}
        <div className="fixed inset-0 z-0">
          <LiquidEther
            colors={['#5227FF', '#FF9FFC', '#B19EEF']}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={16}
            iterationsPoisson={16}
            resolution={0.25}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.375}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </div>

        {/* Login Content Overlay */}
        <div className="relative z-10 min-h-screen">
          <Login />
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'calculator':
        return <CalculatorContainer />
      case 'intereses':
        return <InterestCalculator />
      case 'intereses-avanzado':
        return <InterestCalculatorAdvanced />
      case 'history':
        return <HistorialTasaciones />
      case 'settings':
        return <AdminPanel />
      case 'help':
        return <Help />
      default:
        return <CalculatorContainer />
    }
  }

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
