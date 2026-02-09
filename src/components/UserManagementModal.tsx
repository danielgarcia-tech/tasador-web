import { useState } from 'react'
import { X, Plus, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Usuario {
  id: string
  email: string
  nombre?: string
  rol: 'admin' | 'usuario'
  activo?: boolean
  created_at: string
}

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated?: () => void
  onUserUpdated?: () => void
}

type ModalMode = 'create' | 'edit-password' | 'view'

export default function UserManagementModal({
  isOpen,
  onClose,
  onUserCreated,
  onUserUpdated
}: UserManagementModalProps) {
  const [mode, setMode] = useState<ModalMode>('create')
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Formulario de creación
  const [createForm, setCreateForm] = useState({
    email: '',
    nombre: '',
    password: '',
    confirmPassword: '',
    rol: 'usuario' as 'admin' | 'usuario'
  })

  // Formulario de cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const resetForms = () => {
    setCreateForm({
      email: '',
      nombre: '',
      password: '',
      confirmPassword: '',
      rol: 'usuario'
    })
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setSelectedUser(null)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!createForm.email || !createForm.nombre || !createForm.password) {
      showNotification('error', 'Todos los campos son requeridos')
      return
    }

    if (createForm.password.length < 6) {
      showNotification('error', 'La contraseña debe tener mínimo 6 caracteres')
      return
    }

    if (createForm.password !== createForm.confirmPassword) {
      showNotification('error', 'Las contraseñas no coinciden')
      return
    }

    try {
      setLoading(true)
      
      // Usar RPC para crear usuario con crypt() en PostgreSQL
      // Esto asegura que el hash sea compatible con verify_password
      const { error } = await supabase.rpc('create_user_with_password', {
        p_email: createForm.email.trim(),
        p_nombre: createForm.nombre.trim(),
        p_password: createForm.password,
        p_rol: createForm.rol
      }) as { error: any }

      if (error) {
        console.error('Error creating user:', error)
        showNotification('error', `Error: ${error.message || 'No se pudo crear el usuario'}`)
        return
      }

      showNotification('success', `✅ Usuario ${createForm.email} creado exitosamente`)
      resetForms()
      setMode('create')
      
      if (onUserCreated) onUserCreated()
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (error) {
      showNotification('error', `Error al crear usuario: ${error instanceof Error ? error.message : 'Desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) return

    // Validaciones
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      showNotification('error', 'La nueva contraseña es requerida')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification('error', 'La contraseña debe tener mínimo 6 caracteres')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'Las contraseñas no coinciden')
      return
    }

    try {
      setLoading(true)

      // Usar RPC para actualizar contraseña con crypt() en PostgreSQL
      const { error } = await supabase.rpc('update_user_password', {
        p_user_id: selectedUser.id,
        p_new_password: passwordForm.newPassword
      })

      if (error) {
        console.error('Error updating password:', error)
        showNotification('error', `Error: ${error.message || 'No se pudo actualizar la contraseña'}`)
        return
      }

      showNotification('success', `✅ Contraseña actualizada para ${selectedUser.email}`)
      resetForms()
      setMode('create')
      
      if (onUserUpdated) onUserUpdated()
      
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (error) {
      showNotification('error', `Error al cambiar contraseña: ${error instanceof Error ? error.message : 'Desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-blue-800">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              {mode === 'create' && (
                <>
                  <Plus className="h-6 w-6 mr-2" />
                  Crear Nuevo Usuario
                </>
              )}
              {mode === 'edit-password' && (
                <>
                  <Lock className="h-6 w-6 mr-2" />
                  Cambiar Contraseña
                </>
              )}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {mode === 'create' && 'Registra un nuevo usuario en el sistema'}
              {mode === 'edit-password' && selectedUser && `Actualiza la contraseña de ${selectedUser.email}`}
            </p>
          </div>
          <button
            onClick={() => {
              resetForms()
              onClose()
            }}
            className="text-white hover:bg-blue-500 rounded-lg p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Notificación */}
        {notification && (
          <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center space-x-3 ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            )}
            <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {notification.message}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {mode === 'create' && (
            <form onSubmit={handleCreateUser} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="usuario@empresa.es"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">El email será único en el sistema</p>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  placeholder="Juan García López"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  value={createForm.confirmPassword}
                  onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                  placeholder="Repite la contraseña"
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Rol del Usuario *
                </label>
                <select
                  value={createForm.rol}
                  onChange={(e) => setCreateForm({ ...createForm, rol: e.target.value as 'admin' | 'usuario' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="usuario">👤 Usuario (acceso normal)</option>
                  <option value="admin">🔐 Administrador (acceso completo)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {createForm.rol === 'admin'
                    ? 'El administrador puede gestionar usuarios, configuración y datos del sistema'
                    : 'El usuario solo puede acceder a funcionalidades de tasaciones e informes'}
                </p>
              </div>

              {/* Botones */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>{loading ? 'Creando...' : 'Crear Usuario'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForms()
                    onClose()
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {mode === 'edit-password' && selectedUser && (
            <form onSubmit={handleChangePassword} className="space-y-5">
              {/* Usuario actual */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Usuario:</strong> {selectedUser.email}
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  <strong>Nombre:</strong> {selectedUser.nombre || 'Sin nombre'}
                </p>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repite la nueva contraseña"
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              {/* Advertencia */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p><strong>Importante:</strong> El usuario deberá usar la nueva contraseña en su próximo acceso.</p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Lock className="h-5 w-5" />
                  <span>{loading ? 'Actualizando...' : 'Cambiar Contraseña'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForms()
                    setMode('create')
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Atrás
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
