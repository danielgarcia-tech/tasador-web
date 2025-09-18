import { buscarMunicipios, obtenerTodosMunicipios } from './lib/municipios'

async function testMunicipios() {
  console.log('🧪 Probando funciones de municipios...')

  try {
    // Probar búsqueda de municipios
    console.log('Buscando municipios con "madrid"...')
    const resultadosMadrid = await buscarMunicipios('madrid')
    console.log(`✅ Encontrados ${resultadosMadrid.length} municipios con "madrid"`)
    if (resultadosMadrid.length > 0) {
      console.log('📍 Primer resultado:', resultadosMadrid[0])
    }

    // Probar obtener todos los municipios
    console.log('Obteniendo todos los municipios...')
    const todosMunicipios = await obtenerTodosMunicipios()
    console.log(`✅ Total de municipios: ${todosMunicipios.length}`)

    console.log('✅ Todas las pruebas pasaron correctamente!')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  }
}

// Ejecutar pruebas
testMunicipios()