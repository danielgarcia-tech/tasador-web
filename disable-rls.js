import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lbwujmkkiuwjdmqmvthj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid3VqbWtraXV3amRtcW12dGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDM0MjIsImV4cCI6MjA3MzY3OTQyMn0.r9IocW9WJPJ8iH167r7MgqO-uGOF67Bxuqx_dTmqeTE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function disableRLS() {
  try {
    console.log('🔧 Desactivando RLS para debugging...\n')

    const sqlStatements = [
      'ALTER TABLE tasaciones DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE municipios DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE criterios_ica DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE entidades DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE usuarios_personalizados DISABLE ROW LEVEL SECURITY;'
    ]

    for (const sql of sqlStatements) {
      console.log('Ejecutando:', sql)
      const { error } = await supabase.rpc('exec_sql', { sql })

      if (error) {
        console.error('❌ Error:', error)
      } else {
        console.log('✅ Ejecutado correctamente')
      }
    }

    console.log('\n🎉 RLS desactivado. Ahora probando consulta...')

    // Probar consulta
    const { data, error } = await supabase
      .from('tasaciones')
      .select('*')
      .limit(5)

    if (error) {
      console.error('❌ Error en consulta de prueba:', error)
    } else {
      console.log('✅ Consulta exitosa. Tasaciones encontradas:', data?.length || 0)
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

disableRLS()