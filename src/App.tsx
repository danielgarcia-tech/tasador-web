import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/CustomAuthContext'
import Login from './components/Login'
import Layout from './components/Layout'
import TasacionForm from './components/TasacionForm'
import HistorialTasaciones from './components/HistorialTasaciones'
import AdminPanel from './components/AdminPanel'
import { initializeDatabase } from './lib/database-init'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentTab, setCurrentTab] = useState<'calculator' | 'history' | 'settings'>('calculator')

  // Inicializar base de datos al cargar la aplicación
  useEffect(() => {
    initializeDatabase()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'calculator':
        return <TasacionForm />
      case 'history':
        return <HistorialTasaciones />
      case 'settings':
        return <AdminPanel />
      default:
        return <TasacionForm />
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
