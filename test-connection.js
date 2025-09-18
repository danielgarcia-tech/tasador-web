import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lbwujmkkiuwjdmqmvthj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid3VqbWtraXV3amRtcW12dGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDM0MjIsImV4cCI6MjA3MzY3OTQyMn0.r9IocW9WJPJ8iH167r7MgqO-uGOF67Bxuqx_dTmqeTE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('🧪 Probando conexión a Supabase...\n')

    // Probar consulta básica
    const { data: tasaciones, error } = await supabase
      .from('tasaciones')
      .select('id, nombre_cliente, numero_procedimiento, total')
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('❌ Error en consulta:', error)
      return
    }

    console.log('✅ Conexión exitosa!')
    console.log('📊 Tasaciones encontradas:', tasaciones?.length || 0)
    console.log('📋 Primeras 3 tasaciones:')
    tasaciones?.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.nombre_cliente} - ${t.numero_procedimiento} - €${t.total}`)
    })

    // Probar consulta con JOIN
    const { data: withUsers, error: joinError } = await supabase
      .from('tasaciones')
      .select(`
        id,
        nombre_cliente,
        numero_procedimiento,
        total,
        usuarios_personalizados!inner(nombre, rol)
      `)
      .order('created_at', { ascending: false })
      .limit(2)

    if (joinError) {
      console.error('❌ Error en JOIN:', joinError)
    } else {
      console.log('\n👥 Tasaciones con usuarios:')
      withUsers?.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.nombre_cliente} - Usuario: ${t.usuarios_personalizados?.nombre || 'N/A'}`)
      })
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

testConnection()