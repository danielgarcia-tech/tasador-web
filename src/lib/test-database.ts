import { initializeDatabaseAlternative, checkTableStructure, populateBasicData } from './database-init'
import { buscarMunicipios, obtenerCriteriosICA } from './municipios'
import { buscarEntidades } from './entidades'
import { supabase } from './supabase'

// Función para probar la inicialización y búsqueda de datos
export async function testDatabaseInitialization() {
  try {
    console.log('🧪 Iniciando pruebas de base de datos...')

    // 1. Verificar estructura de tablas
    console.log('🔍 Verificando estructura de tablas...')
    await checkTableStructure()

    // 2. Poblar datos básicos de prueba
    console.log('📝 Poblando datos básicos...')
    await populateBasicData()

    // 3. Inicializar base de datos completa
    console.log('📝 Inicializando base de datos...')
    await initializeDatabaseAlternative()

    // 4. Probar búsqueda de municipios
    console.log('🏙️ Probando búsqueda de municipios...')
    const municipiosMadrid = await buscarMunicipios('Madrid')
    console.log(`✅ Municipios encontrados con "Madrid": ${municipiosMadrid.length}`)
    if (municipiosMadrid.length > 0) {
      console.log('📍 Primer municipio:', municipiosMadrid[0])
    }

    // Probar búsqueda de municipios de prueba
    const municipiosPrueba = await buscarMunicipios('PRUEBA')
    console.log(`✅ Municipios encontrados con "PRUEBA": ${municipiosPrueba.length}`)

    // 5. Probar búsqueda de entidades
    console.log('🏢 Probando búsqueda de entidades...')
    const entidadesBanco = await buscarEntidades('BANCO')
    console.log(`✅ Entidades encontradas con "BANCO": ${entidadesBanco.length}`)
    if (entidadesBanco.length > 0) {
      console.log('🏦 Primera entidad:', entidadesBanco[0])
    }

    // Probar búsqueda de entidades de prueba
    const entidadesPrueba = await buscarEntidades('TEST')
    console.log(`✅ Entidades encontradas con "TEST": ${entidadesPrueba.length}`)

    // 6. Probar obtener criterios ICA
    console.log('📊 Probando obtención de criterios ICA...')
    const criterios = await obtenerCriteriosICA()
    console.log(`✅ Criterios ICA encontrados: ${criterios.length}`)
    if (criterios.length > 0) {
      console.log('📈 Primer criterio:', criterios[0])
    }

    // 7. Verificar tablas directamente
    console.log('🔍 Verificando tablas directamente...')
    const { data: entidadesCount, error: entidadesError } = await supabase
      .from('entidades')
      .select('count', { count: 'exact', head: true })

    const { data: municipiosCount, error: municipiosError } = await supabase
      .from('municipios')
      .select('count', { count: 'exact', head: true })

    const { data: criteriosCount, error: criteriosError } = await supabase
      .from('criterios_ica')
      .select('count', { count: 'exact', head: true })

    if (!entidadesError) console.log(`📊 Total entidades en BD: ${entidadesCount}`)
    if (!municipiosError) console.log(`📊 Total municipios en BD: ${municipiosCount}`)
    if (!criteriosError) console.log(`📊 Total criterios ICA en BD: ${criteriosCount}`)

    console.log('✅ Todas las pruebas completadas exitosamente!')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  }
}

// Ejecutar pruebas si se llama directamente
if (typeof window !== 'undefined') {
  // En el navegador, exponer la función globalmente
  (window as any).testDatabaseInitialization = testDatabaseInitialization
}