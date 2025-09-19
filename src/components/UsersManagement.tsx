import { useState, useEffect } from 'react'
import { User, Plus, Trash2, Key, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'

interface Usuario {
  id: string
  email: string
  nombre?: string
  rol: 'admin' | 'usuario'
  activo?: boolean
  created_at: string
  ultimo_login?: string
}

export default function UsersManagement() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({ 
    email: '', 
    password: '', 
    nombre: '', 
    rol: 'usuario' as 'admin' | 'usuario' 
  })
  const [showPassword, setShowPassword] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      
      // Obtener usuarios de la tabla usuarios_personalizados
      const { data: usuarios, error } = await supabase
        .from('usuarios_personalizados')
        .select('*')
        .order('created_at', { ascending: false })
        
      if (error) {
        console.error('Error obteniendo usuarios:', error)
        showNotification('error', 'Error al cargar usuarios')
        return
      }

      setUsuarios(usuarios || [])
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      showNotification('error', 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUser.email || !newUser.password || !newUser.nombre) {
      showNotification('error', 'Email, nombre y contraseña son requeridos')
      return
    }

    try {
      setCreatingUser(true)
      console.log('Creando usuario:', newUser.email)
      
      // Crear hash de la contraseña
      const passwordHash = await bcrypt.hash(newUser.password, 10)
      console.log('Hash generado exitosamente')
      
      // Insertar usuario en la tabla usuarios_personalizados
      const { data, error } = await supabase
        .from('usuarios_personalizados')
        .insert({
          email: newUser.email,
          nombre: newUser.nombre,
          password_hash: passwordHash,
          rol: newUser.rol,
          activo: true
        })
        .select('id, email, nombre')

      console.log('Resultado de inserción:', { data, error })

      if (error) {
        console.error('Error creando usuario:', error)
        showNotification('error', `Error al crear usuario: ${error.message}`)
        return
      }

      showNotification('success', 'Usuario creado exitosamente')
      setNewUser({ email: '', password: '', nombre: '', rol: 'usuario' })
      setShowCreateForm(false)
      cargarUsuarios()
      
    } catch (error) {
      console.error('Error creando usuario:', error)
      showNotification('error', `Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setCreatingUser(false)
    }
  }

  const eliminarUsuario = async (id: string, email: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el usuario ${email}?`)) {
      return
    }

    try {
      // Eliminar usuario de la tabla usuarios_personalizados
      const { error } = await supabase
        .from('usuarios_personalizados')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error eliminando usuario:', error)
        showNotification('error', `Error al eliminar usuario: ${error.message}`)
        return
      }

      showNotification('success', 'Usuario eliminado exitosamente')
      cargarUsuarios()
      
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      showNotification('error', 'Error al eliminar usuario')
    }
  }

  const restablecerPassword = async (id: string, email: string) => {
    const nuevaPassword = window.prompt(`Ingrese la nueva contraseña para ${email}:`)
    
    if (!nuevaPassword) {
      return
    }

    if (nuevaPassword.length < 6) {
      showNotification('error', 'La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      console.log('Restableciendo contraseña para usuario:', id, email)
      
      // Crear hash de la nueva contraseña
      const passwordHash = await bcrypt.hash(nuevaPassword, 10)
      console.log('Hash generado exitosamente')
      
      // Actualizar contraseña en usuarios_personalizados
      const { data, error } = await supabase
        .from('usuarios_personalizados')
        .update({ 
          password_hash: passwordHash,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select('id, email, updated_at')

      console.log('Resultado de actualización:', { data, error })

      if (error) {
        console.error('Error restableciendo contraseña:', error)
        showNotification('error', `Error al restablecer contraseña: ${error.message}`)
        return
      }

      if (!data || data.length === 0) {
        console.error('No se encontró el usuario para actualizar')
        showNotification('error', 'Error: No se encontró el usuario para actualizar la contraseña')
        return
      }

      showNotification('success', 'Contraseña restablecida exitosamente')
      console.log('Contraseña actualizada exitosamente para:', email, 'en:', data[0].updated_at)
      
    } catch (error) {
      console.error('Error general restableciendo contraseña:', error)
      showNotification('error', `Error al restablecer contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const cambiarRol = async (id: string, nuevoRol: 'admin' | 'usuario') => {
    try {
      // Actualizar rol en usuarios_personalizados
      const { error } = await supabase
        .from('usuarios_personalizados')
        .update({ rol: nuevoRol })
        .eq('id', id)

      if (error) {
        console.error('Error cambiando rol:', error)
        showNotification('error', `Error al cambiar rol: ${error.message}`)
        return
      }

      showNotification('success', 'Rol actualizado exitosamente')
      cargarUsuarios()
      
    } catch (error) {
      console.error('Error cambiando rol:', error)
      showNotification('error', 'Error al cambiar rol')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notificaciones */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="h-6 w-6 mr-2" />
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600 mt-1">Administrar usuarios del sistema</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Usuario</h3>
          <form onSubmit={crearUsuario} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="input"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
              
              <div>
                <label className="label">Nombre *</label>
                <input
                  type="text"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                  className="input"
                  placeholder="Nombre completo del usuario"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Contraseña *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="input pr-10"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="label">Rol *</label>
                <select
                  value={newUser.rol}
                  onChange={(e) => setNewUser({ ...newUser, rol: e.target.value as 'admin' | 'usuario' })}
                  className="input"
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={creatingUser}
                className="btn-primary disabled:opacity-50"
              >
                {creatingUser ? 'Creando...' : 'Crear Usuario'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Usuarios Registrados ({usuarios.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {usuario.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {usuario.id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {usuario.nombre || 'Sin nombre'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={usuario.rol}
                      onChange={(e) => cambiarRol(usuario.id, e.target.value as 'admin' | 'usuario')}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="usuario">Usuario</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(usuario.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.ultimo_login 
                      ? new Date(usuario.ultimo_login).toLocaleDateString('es-ES')
                      : 'Nunca'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => restablecerPassword(usuario.id, usuario.email)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      title="Restablecer contraseña"
                    >
                      <Key className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => eliminarUsuario(usuario.id, usuario.email)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center ml-2"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}