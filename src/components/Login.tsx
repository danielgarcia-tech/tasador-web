import { useState } from 'react'
import { useAuth } from '../contexts/CustomAuthContext'
import logoRua from '../assets/logo-rua.png'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await login(email, password)

      if (!result.success) {
        setMessage(result.error || 'Error desconocido')
      }
      // Si es exitoso, el contexto se encargará de redirigir
    } catch (error: any) {
      setMessage(error.message || 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={logoRua} 
              alt="TASADOR COSTAS" 
              className="h-16 w-auto"
            />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            TASADOR COSTAS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema profesional de tasación de costas
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {message && (
              <div className={`text-sm text-center ${
                message.includes('error') || message.includes('Error') || message.includes('incorrecta')
                  ? 'text-danger-600'
                  : 'text-success-600'
              }`}>
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Sistema desarrollado para profesionales del derecho
          </p>
        </div>
      </div>
    </div>
  )
}