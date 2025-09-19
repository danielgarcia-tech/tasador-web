import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  nombre: string
  rol: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (email: string, password: string, nombre: string) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Buscar usuario en la tabla personalizada
      const { data: userData, error: fetchError } = await supabase
        .from('usuarios_personalizados')
        .select('*')
        .eq('email', email)
        .eq('activo', true)
        .single()

      if (fetchError || !userData) {
        return { success: false, error: 'Usuario no encontrado o inactivo' }
      }

      // Verificar contraseña usando la función crypt de PostgreSQL
      const { data: authData, error: authError } = await supabase
        .rpc('verify_password', {
          password: password,
          password_hash: userData.password_hash
        })

      if (authError || !authData) {
        return { success: false, error: 'Contraseña incorrecta' }
      }

      // Actualizar último login
      await supabase
        .from('usuarios_personalizados')
        .update({ ultimo_login: new Date().toISOString() })
        .eq('id', userData.id)

      // Crear objeto de usuario
      const userObj: User = {
        id: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        rol: userData.rol
      }

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(userObj))
      setUser(userObj)

      return { success: true }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  const register = async (email: string, password: string, nombre: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verificar si el email ya existe
      const { data: existingUser } = await supabase
        .from('usuarios_personalizados')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        return { success: false, error: 'El email ya está registrado' }
      }

      // Crear hash de la contraseña usando PostgreSQL
      const { data: hashData, error: hashError } = await supabase
        .rpc('create_password_hash', {
          password: password
        })

      if (hashError) {
        return { success: false, error: 'Error al procesar la contraseña' }
      }

      // Insertar nuevo usuario
      const { data: newUser, error: insertError } = await supabase
        .from('usuarios_personalizados')
        .insert({
          email,
          password_hash: hashData,
          nombre,
          rol: 'usuario'
        })
        .select()
        .single()

      if (insertError) {
        return { success: false, error: 'Error al crear el usuario' }
      }

      // Crear objeto de usuario
      const userObj: User = {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        rol: newUser.rol
      }

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(userObj))
      setUser(userObj)

      return { success: true }
    } catch (error) {
      console.error('Error en registro:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  const refreshUser = async (): Promise<void> => {
    try {
      if (!user) return

      // Obtener información actualizada del usuario desde la base de datos
      const { data: userData, error } = await supabase
        .from('usuarios_personalizados')
        .select('*')
        .eq('id', user.id)
        .eq('activo', true)
        .single()

      if (error || !userData) {
        console.error('Error al refrescar usuario:', error)
        return
      }

      // Crear objeto de usuario actualizado
      const updatedUser: User = {
        id: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        rol: userData.rol
      }

      // Actualizar localStorage y estado
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)

      console.log('Usuario actualizado:', updatedUser)
    } catch (error) {
      console.error('Error al refrescar usuario:', error)
    }
  }

  const logout = async (): Promise<void> => {
    localStorage.removeItem('user')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}