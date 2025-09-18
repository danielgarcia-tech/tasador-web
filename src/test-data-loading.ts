import { obtenerTodosMunicipios, buscarMunicipios } from './lib/municipios'
import { obtenerTodasEntidades, buscarEntidades } from './lib/entidades'

async function testDataLoading() {
  console.log('🧪 Probando carga de datos desde base de datos...')
  
  try {
    // Probar municipios
    console.log('\n📍 Probando municipios:')
    const todosMunicipios = await obtenerTodosMunicipios()
    console.log(`✅ Total municipios cargados: ${todosMunicipios.length}`)
    if (todosMunicipios.length > 0) {
      console.log('🏙️ Primeros 3 municipios:', todosMunicipios.slice(0, 3))
    }

    // Buscar Madrid
    const municipiosMadrid = await buscarMunicipios('madrid')
    console.log(`🔍 Municipios con "madrid": ${municipiosMadrid.length}`)
    if (municipiosMadrid.length > 0) {
      console.log('📍 Resultados Madrid:', municipiosMadrid)
    }

    // Probar entidades
    console.log('\n🏦 Probando entidades:')
    const todasEntidades = await obtenerTodasEntidades()
    console.log(`✅ Total entidades cargadas: ${todasEntidades.length}`)
    if (todasEntidades.length > 0) {
      console.log('🏛️ Primeras 3 entidades:', todasEntidades.slice(0, 3))
    }

    // Buscar BBVA
    const entidadesBBVA = await buscarEntidades('bbva')
    console.log(`🔍 Entidades con "bbva": ${entidadesBBVA.length}`)
    if (entidadesBBVA.length > 0) {
      console.log('🏦 Resultados BBVA:', entidadesBBVA)
    }

    console.log('\n✅ ¡Todas las pruebas completadas!')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  }
}

// Ejecutar las pruebas
testDataLoading()