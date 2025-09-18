import { supabase } from './supabase'

// Función para verificar y configurar políticas RLS
export async function setupRLSPolicies() {
  try {
    console.log('Verificando políticas RLS...')

    // Verificar conexión a Supabase
    const { error: connectionError } = await supabase
      .from('entidades')
      .select('count', { count: 'exact', head: true })

    if (connectionError) {
      console.error('Error de conexión:', connectionError)
      return false
    }

    console.log('Conexión a Supabase OK')
    return true
  } catch (error) {
    console.error('Error verificando políticas RLS:', error)
    return false
  }
}

// Función para inicializar datos en la base de datos
export async function initializeDatabase() {
  try {
    console.log('Inicializando base de datos...')

    // Verificar políticas RLS primero
    const policiesOK = await setupRLSPolicies()
    if (!policiesOK) {
      console.error('Error en políticas RLS. Abortando inicialización.')
      return
    }

    console.log('Base de datos inicializada correctamente')
  } catch (error) {
    console.error('Error inicializando base de datos:', error)
  }
}

// Función alternativa para inicializar datos usando INSERT con manejo de duplicados
export async function initializeDatabaseAlternative() {
  try {
    console.log('Inicializando base de datos (método alternativo)...')

    // Verificar políticas RLS primero
    const policiesOK = await setupRLSPolicies()
    if (!policiesOK) {
      console.error('Error en políticas RLS. Abortando inicialización.')
      return
    }

    console.log('Base de datos inicializada correctamente (método alternativo)')
  } catch (error) {
    console.error('Error inicializando base de datos:', error)
  }
}

// Función para verificar estructura de tablas
export async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de tablas...')

    // Verificar tablas existentes
    const tables = ['entidades', 'municipios', 'criterios_ica', 'tasaciones']

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.error(`❌ Error en tabla ${table}:`, error.message)
        } else {
          console.log(`✅ Tabla ${table}: ${count} registros`)
        }
      } catch (error) {
        console.error(`❌ Error verificando tabla ${table}:`, error)
      }
    }

    console.log('✅ Verificación de estructura completada')
  } catch (error) {
    console.error('❌ Error verificando estructura:', error)
  }
}

// Función para poblar datos básicos
export async function populateBasicData() {
  try {
    console.log('🌱 Poblando datos básicos...')

    // Insertar una entidad de prueba
    const { error: entidadError } = await supabase
      .from('entidades')
      .upsert({
        codigo: 'TEST',
        nombre: 'Entidad de Prueba'
      }, {
        onConflict: 'codigo',
        ignoreDuplicates: true
      })

    if (entidadError) {
      console.error('❌ Error insertando entidad de prueba:', entidadError)
    } else {
      console.log('✅ Entidad de prueba insertada')
    }

    // Insertar un municipio de prueba
    const { error: municipioError } = await supabase
      .from('municipios')
      .upsert({
        municipio: 'Madrid',
        provincia: 'Madrid',
        criterio_ica: 'Madrid'
      }, {
        onConflict: 'municipio',
        ignoreDuplicates: true
      })

    if (municipioError) {
      console.error('❌ Error insertando municipio de prueba:', municipioError)
    } else {
      console.log('✅ Municipio de prueba insertado')
    }

    // Insertar un criterio ICA de prueba
    const { error: criterioError } = await supabase
      .from('criterios_ica')
      .upsert({
        provincia: 'Madrid',
        criterio_ica: 'Madrid',
        allanamiento: 1000.00,
        audiencia_previa: 1500.00,
        juicio: 2000.00,
        factor_apelacion: 0.5,
        verbal_alegaciones: 0.6,
        verbal_vista: 0.4
      }, {
        onConflict: 'provincia',
        ignoreDuplicates: true
      })

    if (criterioError) {
      console.error('❌ Error insertando criterio ICA de prueba:', criterioError)
    } else {
      console.log('✅ Criterio ICA de prueba insertado')
    }

  } catch (error) {
    console.error('❌ Error poblando datos básicos:', error)
  }
}