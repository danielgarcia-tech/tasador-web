import { buscarMunicipios } from '../lib/municipios'
import { buscarEntidades } from '../lib/entidades'
import { calcularCostas } from '../lib/calculator'

// Función para probar la búsqueda de municipios
export async function testBuscarMunicipios() {
  console.log('🧪 Probando búsqueda de municipios...')

  try {
    // Prueba 1: Búsqueda básica
    const resultados1 = await buscarMunicipios('madrid')
    console.log('✅ Búsqueda "madrid":', resultados1.length, 'resultados')

    // Prueba 2: Búsqueda con acentos
    const resultados2 = await buscarMunicipios('barcelona')
    console.log('✅ Búsqueda "barcelona":', resultados2.length, 'resultados')

    // Prueba 3: Búsqueda vacía
    const resultados3 = await buscarMunicipios('')
    console.log('✅ Búsqueda vacía:', resultados3.length, 'resultados')

    return true
  } catch (error) {
    console.error('❌ Error en búsqueda de municipios:', error)
    return false
  }
}

// Función para probar la búsqueda de entidades
export async function testBuscarEntidades() {
  console.log('🧪 Probando búsqueda de entidades...')

  try {
    // Prueba 1: Búsqueda básica
    const resultados1 = await buscarEntidades('banco')
    console.log('✅ Búsqueda "banco":', resultados1.length, 'resultados')

    // Prueba 2: Búsqueda por código
    const resultados2 = await buscarEntidades('BBVA')
    console.log('✅ Búsqueda "BBVA":', resultados2.length, 'resultados')

    // Prueba 3: Búsqueda vacía
    const resultados3 = await buscarEntidades('')
    console.log('✅ Búsqueda vacía:', resultados3.length, 'resultados')

    return true
  } catch (error) {
    console.error('❌ Error en búsqueda de entidades:', error)
    return false
  }
}

// Función para probar el cálculo de costas
export async function testCalculoCostas() {
  console.log('🧪 Probando cálculo de costas...')

  try {
    // Prueba 1: Juicio Ordinario - Allanamiento
    const resultado1 = calcularCostas({
      criterioICA: 'Madrid',
      tipoJuicio: 'Juicio Ordinario',
      faseTerminacion: 'Allanamiento',
      instancia: 'PRIMERA INSTANCIA'
    })
    console.log('✅ Juicio Ordinario - Allanamiento:', resultado1)

    // Prueba 2: Juicio Verbal - Alegaciones
    const resultado2 = calcularCostas({
      criterioICA: 'Madrid',
      tipoJuicio: 'Juicio Verbal',
      faseTerminacion: 'Alegaciones',
      instancia: 'PRIMERA INSTANCIA'
    })
    console.log('✅ Juicio Verbal - Alegaciones:', resultado2)

    // Prueba 3: Segunda Instancia
    const resultado3 = calcularCostas({
      criterioICA: 'Madrid',
      tipoJuicio: 'Juicio Ordinario',
      faseTerminacion: 'Juicio',
      instancia: 'SEGUNDA INSTANCIA'
    })
    console.log('✅ Segunda Instancia:', resultado3)

    return true
  } catch (error) {
    console.error('❌ Error en cálculo de costas:', error)
    return false
  }
}

// Función principal para ejecutar todas las pruebas
export async function runAllTests() {
  console.log('🚀 Iniciando pruebas del sistema de tasación...\n')

  const resultados = await Promise.all([
    testBuscarMunicipios(),
    testBuscarEntidades(),
    testCalculoCostas()
  ])

  const exitos = resultados.filter(r => r).length
  const total = resultados.length

  console.log(`\n📊 Resultados: ${exitos}/${total} pruebas pasaron`)

  if (exitos === total) {
    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!')
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisa los logs anteriores.')
  }

  return exitos === total
}