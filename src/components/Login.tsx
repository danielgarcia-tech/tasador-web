import { useState } from 'react'
import { useAuth } from '../contexts/CustomAuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let result
      if (isSignUp) {
        result = await register(email, password, nombre)
      } else {
        result = await login(email, password)
      }

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Calculadora de Costas Judiciales
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema profesional de tasación de costas
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="nombre" className="label">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  className="input"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            )}

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
                {loading ? 'Cargando...' : (isSignUp ? 'Registrarse' : 'Iniciar sesión')}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {isSignUp
                  ? '¿Ya tienes cuenta? Inicia sesión'
                  : '¿No tienes cuenta? Regístrate'
                }
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