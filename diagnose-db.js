import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lbwujmkkiuwjdmqmvthj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid3VqbWtraXV3amRtcW12dGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDM0MjIsImV4cCI6MjA3MzY3OTQyMn0.r9IocW9WJPJ8iH167r7MgqO-uGOF67Bxuqx_dTmqeTE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnoseDatabase() {
  try {
    console.log('🔍 Diagnóstico de base de datos...\n')

    // Verificar conexión básica
    console.log('1. Verificando conexión básica...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('tasaciones')
      .select('count', { count: 'exact', head: true })

    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError)
    } else {
      console.log('✅ Conexión básica exitosa')
    }

    // Verificar tabla usuarios_personalizados
    console.log('\n2. Verificando tabla usuarios_personalizados...')
    const { data: users, error: usersError } = await supabase
      .from('usuarios_personalizados')
      .select('*')
      .limit(1)

    if (usersError) {
      console.error('❌ Error en tabla usuarios_personalizados:', usersError)
    } else {
      console.log('✅ Tabla usuarios_personalizados existe')
      console.log('Usuarios encontrados:', users?.length || 0)
    }

    // Verificar tabla tasaciones
    console.log('\n3. Verificando tabla tasaciones...')
    const { data: tasaciones, error: tasacionesError } = await supabase
      .from('tasaciones')
      .select('*')
      .limit(1)

    if (tasacionesError) {
      console.error('❌ Error en tabla tasaciones:', tasacionesError)
    } else {
      console.log('✅ Tabla tasaciones existe')
      console.log('Tasaciones encontradas:', tasaciones?.length || 0)
    }

    // Verificar políticas RLS
    console.log('\n4. Verificando políticas RLS...')
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'tasaciones' })

    if (policiesError) {
      console.log('⚠️ No se pudo verificar políticas RLS (función no existe)')
    } else {
      console.log('Políticas RLS:', policies)
    }

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
  }
}

diagnoseDatabase()