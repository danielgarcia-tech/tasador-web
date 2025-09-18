import { mcpClient } from '../lib/mcp-client'

export async function diagnoseDatabaseIssues() {
  console.log('🔍 Iniciando diagnóstico completo de base de datos con MCP...')

  try {
    // 1. Verificar conexión MCP
    console.log('1. Verificando conexión MCP...')
    const connectionResult = await mcpClient.executeTool('list_tables', {})
    console.log('Conexión MCP:', connectionResult.success ? '✅ OK' : '❌ Error')

    if (!connectionResult.success) {
      console.error('Error de conexión MCP:', connectionResult.error)
      return
    }

    // 2. Diagnosticar base de datos completa
    console.log('2. Ejecutando diagnóstico de base de datos...')
    const diagResult = await mcpClient.executeTool('diagnose_database', {
      checkTables: true,
      checkData: true,
      checkRLS: true
    })

    console.log('Resultado del diagnóstico:')
    console.log('- Estado general:', diagResult.overallStatus)
    console.log('- Tablas encontradas:', Object.keys(diagResult.tableStatus || {}))
    console.log('- Recomendaciones:', diagResult.recommendations || [])

    // 3. Verificar estructura de tablas
    console.log('3. Verificando estructura de tablas...')
    const tables = ['entidades', 'municipios', 'criterios_ica', 'tasaciones']

    for (const table of tables) {
      console.log(`Verificando tabla: ${table}`)
      const tableResult = await mcpClient.executeTool('query_table_mcp', {
        table,
        columns: ['*'],
        limit: 1
      })

      if (tableResult.success) {
        console.log(`✅ Tabla ${table}: ${tableResult.data?.length || 0} registros encontrados`)
      } else {
        console.log(`❌ Error en tabla ${table}:`, tableResult.error)
      }
    }

    // 4. Verificar políticas RLS
    console.log('4. Verificando políticas RLS...')
    const rlsResult = await mcpClient.executeTool('execute_sql_mcp', {
      query: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname;
      `
    })

    if (rlsResult.success) {
      console.log('Políticas RLS encontradas:')
      console.log(rlsResult.data)
    } else {
      console.log('Error verificando políticas RLS:', rlsResult.error)
    }

    // 5. Probar inserción de datos de prueba
    console.log('5. Probando inserción de datos de prueba...')

    // Probar inserción en entidades
    const testEntity = await mcpClient.executeTool('execute_sql_mcp', {
      query: `
        INSERT INTO entidades (codigo, nombre_completo)
        VALUES ('TEST_MCP', 'Entidad de Prueba MCP')
        ON CONFLICT (codigo) DO NOTHING;
      `
    })

    console.log('Inserción entidad de prueba:', testEntity.success ? '✅ OK' : '❌ Error')
    if (!testEntity.success) {
      console.error('Error detallado:', testEntity.error)
    }

    // Probar inserción en municipios
    const testMunicipio = await mcpClient.executeTool('execute_sql_mcp', {
      query: `
        INSERT INTO municipios (municipio, criterio_ica)
        VALUES ('MUNICIPIO_TEST_MCP', 'CRITERIO_TEST')
        ON CONFLICT (municipio) DO NOTHING;
      `
    })

    console.log('Inserción municipio de prueba:', testMunicipio.success ? '✅ OK' : '❌ Error')
    if (!testMunicipio.success) {
      console.error('Error detallado:', testMunicipio.error)
    }

    console.log('✅ Diagnóstico MCP completado')

  } catch (error) {
    console.error('Error en diagnóstico MCP:', error)
  }
}

// Función para ejecutar diagnóstico desde el navegador
export function runBrowserDiagnosis() {
  if (typeof window !== 'undefined') {
    diagnoseDatabaseIssues()
  }
}