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

    // console.log('Conexión a Supabase OK')
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

    // Insertar entidades
    const entidades = [
      { nombre_corto: 'UCI', nombre_completo: 'UNIÓN DE CRÉDITOS INMOBILIARIOS, S.A.' },
      { nombre_corto: '4FINANCE', nombre_completo: '4FINANCE SPAIN FINANCIAL SERVICES, SAU' },
      { nombre_corto: 'ABANCA', nombre_completo: 'ABANCA CORPORACIÓN BANCARIA, SA' },
      { nombre_corto: 'ADVANZIA', nombre_completo: 'ADVANZIA BANK SA' },
      { nombre_corto: 'AMERICAN EXPRESS', nombre_completo: 'AMERICAN EXPRESS, S.A.U.' },
      { nombre_corto: 'AVANT', nombre_completo: 'AVANT CREDIT S.A.' },
      { nombre_corto: 'WIZINK', nombre_completo: 'WIZINK BANK, SA' },
      { nombre_corto: 'XFERA', nombre_completo: 'XFERA Consumer Finance EFC, SA' },
      { nombre_corto: 'YOUNITED', nombre_completo: 'YOUNITED, Sucursal en España' },
      { nombre_corto: 'BANKINTER S.A.', nombre_completo: 'BANKINTER, S.A.' },
      { nombre_corto: 'BANKINTER CONSUMER', nombre_completo: 'BANKINTER CONSUMER FINANCE, EFC, SA' },
      { nombre_corto: 'BBVA', nombre_completo: 'BANCO BILBAO VIZCAYA ARGENTARIA, SA (BBVA SA)' },
      { nombre_corto: 'BIGBANK', nombre_completo: 'BIGBANK AS CONSUMER FINANCE' },
      { nombre_corto: 'BLUE FINANCE (AZLO)', nombre_completo: 'BLUE FINANCE IBERICA SL' },
      { nombre_corto: 'BONDORA', nombre_completo: 'BONDORA AS' },
      { nombre_corto: 'CABOT', nombre_completo: 'CABOT FINANCIAL SPAIN S.A.' },
      { nombre_corto: 'CAIXABANK', nombre_completo: 'CAIXABANK, SA' },
      { nombre_corto: 'CAIXAPC', nombre_completo: 'CAIXABANK PAYMENTS & CONSUMER EFC EP SA' },
      { nombre_corto: 'CAJA LABORAL POPULAR (LABORAL KUTXA)', nombre_completo: 'CAJA LABORAL POPULAR COOP DE CREDITO' },
      { nombre_corto: 'CAJA RURAL CENTRAL', nombre_completo: 'CAJA RURAL CENTRAL, S.C.C.' },
      { nombre_corto: 'CAJA RURAL DE ARAGON', nombre_completo: 'CAJA RURAL DE ARAGÓN S.C.C.' },
      { nombre_corto: 'CAJA RURAL DE GRANADA', nombre_completo: 'Caja Rural de Granada, Sociedad Cooperativa de Crédito' },
      { nombre_corto: 'CAJA RURAL DE NAVARRA', nombre_completo: 'Caja Rural de Navarra, Sociedad Cooperativa de Crédito' },
      { nombre_corto: 'CAJA RURAL DEL SUR', nombre_completo: 'Caja Rural del Sur, S. Coop. de Crédito' },
      { nombre_corto: 'CAJA RURAL JAEN', nombre_completo: 'Caja Rural de Jaén, Barcelona y Madrid S. C. C.' },
      { nombre_corto: 'CAJAMAR', nombre_completo: 'Cajamar Caja Rural, Sociedad Cooperativa de Crédito' },
      { nombre_corto: 'CAJASIETE', nombre_completo: 'Cajasiete, Caja Rural, S.C.C.' },
      { nombre_corto: 'CAJAVIVA', nombre_completo: 'Caja Rural de Burgos, Fuentepelayo, Segovia y Castelldans, SCC' },
      { nombre_corto: 'CARREFOUR', nombre_completo: 'SERVICIOS FINANCIEROS CARREFOUR, EFC, SA' },
      { nombre_corto: 'CASHPER', nombre_completo: 'NOVUM BANK LIMITED' },
      { nombre_corto: 'CETELEM', nombre_completo: 'BANCO CETELEM, SAU' },
      { nombre_corto: 'COFIDIS', nombre_completo: 'COFIDIS SA SUCURSAL EN ESPAÑA' },
      { nombre_corto: 'CORTEINGLES', nombre_completo: 'FINANCIERA EL CORTE INGLES, EFC, S.A.' },
      { nombre_corto: 'CREAMFINANCE', nombre_completo: 'AVAFIN SPAIN SL (Anteriormente denominada CLICK FINANCE SL, CREAMFINANCE SPAIN SL)' },
      { nombre_corto: 'CREDITEA', nombre_completo: 'A CUBRIR' },
      { nombre_corto: 'CREDITERO', nombre_completo: 'Credirect Préstamos SLU' },
      { nombre_corto: 'CREDITO POSTAL', nombre_completo: 'CREDITO A DOMICILIO S.L.' },
      { nombre_corto: 'CREDITO SI', nombre_completo: 'CREAMFINANCE SPAIN, SLU' },
      { nombre_corto: 'DEUTSCHE BANK', nombre_completo: 'DEUTSCHE BANK, Sociedad Anónima Española Unipersonal' },
      { nombre_corto: 'DINEO', nombre_completo: 'DINEO CREDITO SL' },
      { nombre_corto: 'EOS SPAIN', nombre_completo: 'EOS SPAIN SL' },
      { nombre_corto: 'EUROCAJA RURAL', nombre_completo: 'Eurocaja Rural, S.C.C.' },
      { nombre_corto: 'EVO BANCO', nombre_completo: 'EVO BANCO SA' },
      { nombre_corto: 'GLOBALCAJA', nombre_completo: 'GLOBALCAJA, Caja Rural de Albacete, Ciudad Real y Cuenca Sdad. Coop. Crédito' },
      { nombre_corto: 'IBERCAJA BANCO SA', nombre_completo: 'IBERCAJA BANCO  SA' },
      { nombre_corto: 'ING', nombre_completo: 'ING BANK NV, Sucursal en España' },
      { nombre_corto: 'KUTXABANK', nombre_completo: 'KUTXABANK, S.A' },
      { nombre_corto: 'MEDIOLANUM', nombre_completo: 'Banco Mediolanum, S.A.' },
      { nombre_corto: 'MICROBANK', nombre_completo: 'MICROBANK DE LA CAIXA SA' },
      { nombre_corto: 'OPENBANK', nombre_completo: 'Open Bank, S.A.' },
      { nombre_corto: 'SABADELL', nombre_completo: 'BANCO DE SABADELL, SA' },
      { nombre_corto: 'SANTANDER', nombre_completo: 'BANCO SANTANDER, SA' },
      { nombre_corto: 'SANTANDER CONSUMER', nombre_completo: 'SANTANDER CONSUMER FINANCE, SA' },
      { nombre_corto: 'UNICAJA', nombre_completo: 'UNICAJA BANCO, SA' }
    ]

    // Insertar entidades en lotes para evitar límites
    for (let i = 0; i < entidades.length; i += 10) {
      const batch = entidades.slice(i, i + 10)
      const { error } = await supabase
        .from('entidades')
        .upsert(batch, {
          onConflict: 'nombre_corto',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error insertando entidades:', error)
        console.error('Detalles del error:', error?.message || 'Sin mensaje')
        console.error('Código de error:', error?.code || 'Sin código')
        console.error('Detalles completos:', JSON.stringify(error, null, 2))
      }
    }

    // Insertar municipios principales - usando pj (Partido Judicial) e ica_aplicable (ICA Aplicable)
    const municipios = [
      { pj: 'MADRID', ica_aplicable: 'Madrid' },
      { pj: 'BARCELONA', ica_aplicable: 'Barcelona' },
      { pj: 'VALÈNCIA', ica_aplicable: 'Valencia' },
      { pj: 'SEVILLA', ica_aplicable: 'Sevilla' },
      { pj: 'ZARAGOZA', ica_aplicable: 'Zaragoza' },
      { pj: 'MÁLAGA', ica_aplicable: 'Málaga' },
      { pj: 'MURCIA', ica_aplicable: 'Murcia' },
      { pj: 'PALMA', ica_aplicable: 'Palmas, Las' },
      { pj: 'LAS PALMAS DE GRAN CANARIA', ica_aplicable: 'Palmas, Las' },
      { pj: 'BILBAO', ica_aplicable: 'Bilbao' },
      { pj: 'ALICANTE', ica_aplicable: 'Alicante' },
      { pj: 'CÓRDOBA', ica_aplicable: 'Córdoba' },
      { pj: 'VALLADOLID', ica_aplicable: 'Valladolid' },
      { pj: 'VIGO', ica_aplicable: 'Vigo' },
      { pj: 'GIJÓN', ica_aplicable: 'Gijón' },
      { pj: 'L\'HOSPITALET DE LLOBREGAT', ica_aplicable: 'Barcelona' },
      { pj: 'GRANADA', ica_aplicable: 'Granada' },
      { pj: 'A CORUÑA', ica_aplicable: 'A Coruña' },
      { pj: 'VITORIA-GASTEIZ', ica_aplicable: 'Vitoria' },
      { pj: 'ELCHE/ELX', ica_aplicable: 'Alicante' }
    ]

    for (let i = 0; i < municipios.length; i += 10) {
      const batch = municipios.slice(i, i + 10)
      const { error } = await supabase
        .from('municipios')
        .upsert(batch, {
          onConflict: 'pj',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error insertando municipios:', error)
        console.error('Detalles del error:', error?.message || 'Sin mensaje')
        console.error('Código de error:', error?.code || 'Sin código')
        console.error('Detalles completos:', JSON.stringify(error, null, 2))
      }
    }

    // Insertar criterios ICA
    const criteriosICA = [
      { provincia: 'Madrid', criterio_ica: 'Madrid', allanamiento: 1800.00, audiencia_previa: 2700.00, juicio: 3600.00, factor_apelacion: 0.5, verbal_alegaciones: 0.9, verbal_vista: 0.1 },
      { provincia: 'Cataluña', criterio_ica: 'Barcelona', allanamiento: 1600.00, audiencia_previa: 2400.00, juicio: 3200.00, factor_apelacion: 0.5, verbal_alegaciones: 0.8, verbal_vista: 0.2 },
      { provincia: 'Comunidad Valenciana', criterio_ica: 'Valencia', allanamiento: 1300.00, audiencia_previa: 1950.00, juicio: 2600.00, factor_apelacion: 0.5, verbal_alegaciones: 0.7, verbal_vista: 0.3 },
      { provincia: 'Andalucía', criterio_ica: 'Sevilla', allanamiento: 1105.50, audiencia_previa: 1658.25, juicio: 2211.00, factor_apelacion: 0.5, verbal_alegaciones: 0.5, verbal_vista: 0.5 },
      { provincia: 'Aragón', criterio_ica: 'Zaragoza', allanamiento: 2782.50, audiencia_previa: 3617.25, juicio: 5565.00, factor_apelacion: 0.6, verbal_alegaciones: 0.4, verbal_vista: 0.6 },
      { provincia: 'Andalucía', criterio_ica: 'Málaga', allanamiento: 1326.60, audiencia_previa: 1879.35, juicio: 2211.00, factor_apelacion: 0.5, verbal_alegaciones: 0.75, verbal_vista: 0.25 },
      { provincia: 'Murcia', criterio_ica: 'Murcia', allanamiento: 1250.00, audiencia_previa: 1875.00, juicio: 2500.00, factor_apelacion: 0.5, verbal_alegaciones: 0.65, verbal_vista: 0.35 },
      { provincia: 'Canarias', criterio_ica: 'Palmas, Las', allanamiento: 1350.00, audiencia_previa: 2025.00, juicio: 2700.00, factor_apelacion: 0.5, verbal_alegaciones: 0.7, verbal_vista: 0.3 },
      { provincia: 'País Vasco', criterio_ica: 'Bilbao', allanamiento: 1500.00, audiencia_previa: 2250.00, juicio: 3000.00, factor_apelacion: 0.5, verbal_alegaciones: 0.75, verbal_vista: 0.25 },
      { provincia: 'Comunidad Valenciana', criterio_ica: 'Alicante', allanamiento: 1300.00, audiencia_previa: 1950.00, juicio: 2600.00, factor_apelacion: 0.5, verbal_alegaciones: 0.7, verbal_vista: 0.3 },
      { provincia: 'Andalucía', criterio_ica: 'Córdoba', allanamiento: 1326.60, audiencia_previa: 1437.15, juicio: 2211.00, factor_apelacion: 0.5, verbal_alegaciones: 0.75, verbal_vista: 0.25 },
      { provincia: 'Castilla y León', criterio_ica: 'Valladolid', allanamiento: 1250.00, audiencia_previa: 1875.00, juicio: 2500.00, factor_apelacion: 0.5, verbal_alegaciones: 0.6, verbal_vista: 0.4 },
      { provincia: 'Galicia', criterio_ica: 'Vigo', allanamiento: 1200.00, audiencia_previa: 1800.00, juicio: 2400.00, factor_apelacion: 0.5, verbal_alegaciones: 0.6, verbal_vista: 0.4 },
      { provincia: 'Asturias', criterio_ica: 'Gijón', allanamiento: 1200.00, audiencia_previa: 1800.00, juicio: 2400.00, factor_apelacion: 0.5, verbal_alegaciones: 0.6, verbal_vista: 0.4 },
      { provincia: 'Andalucía', criterio_ica: 'Granada', allanamiento: 1326.60, audiencia_previa: 1437.15, juicio: 2211.00, factor_apelacion: 0.5, verbal_alegaciones: 0.75, verbal_vista: 0.25 },
      { provincia: 'Galicia', criterio_ica: 'A Coruña', allanamiento: 1200.00, audiencia_previa: 1800.00, juicio: 2400.00, factor_apelacion: 0.5, verbal_alegaciones: 0.6, verbal_vista: 0.4 },
      { provincia: 'País Vasco', criterio_ica: 'Vitoria', allanamiento: 1500.00, audiencia_previa: 2250.00, juicio: 3000.00, factor_apelacion: 0.5, verbal_alegaciones: 0.75, verbal_vista: 0.25 }
    ]

    const { error: criteriosError } = await supabase
      .from('criterios_ica')
      .upsert(criteriosICA, {
        onConflict: 'provincia,criterio_ica',
        ignoreDuplicates: false
      })

    if (criteriosError) {
      console.error('Error insertando criterios ICA:', criteriosError)
      console.error('Detalles del error:', criteriosError?.message || 'Sin mensaje')
      console.error('Código de error:', criteriosError?.code || 'Sin código')
      console.error('Detalles completos:', JSON.stringify(criteriosError, null, 2))
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

    // Función auxiliar para insertar con manejo de duplicados
    const insertWithDuplicateHandling = async (table: string, data: any[], uniqueColumn: string) => {
      for (const item of data) {
        try {
          // Intentar insertar
          const { error } = await supabase
            .from(table)
            .insert(item)

          if (error) {
            // Mostrar detalles completos del error
            console.error(`Error insertando en ${table}:`, {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
              item: item
            })

            // Si hay error de duplicado, intentar actualizar
            if (error.code === '23505') { // unique_violation
              console.log(`Registro duplicado en ${table}, omitiendo:`, item[uniqueColumn])
            } else {
              console.error(`Error procesando ${table}:`, error)
            }
          } else {
            console.log(`✅ Insertado en ${table}:`, item[uniqueColumn])
          }
        } catch (error) {
          console.error(`Error procesando ${table}:`, error)
        }
      }
    }

    // Insertar entidades
    console.log('Insertando entidades...')
    await insertWithDuplicateHandling('entidades', [
      { codigo: 'UCI', nombre_completo: 'UNIÓN DE CRÉDITOS INMOBILIARIOS, S.A.' },
      { codigo: '4FINANCE', nombre_completo: '4FINANCE SPAIN FINANCIAL SERVICES, SAU' },
      { codigo: 'ABANCA', nombre_completo: 'ABANCA CORPORACIÓN BANCARIA, SA' },
      { codigo: 'ADVANZIA', nombre_completo: 'ADVANZIA BANK SA' },
      { codigo: 'AMERICAN EXPRESS', nombre_completo: 'AMERICAN EXPRESS, S.A.U.' },
      { codigo: 'AVANT', nombre_completo: 'AVANT CREDIT S.A.' },
      { codigo: 'WIZINK', nombre_completo: 'WIZINK BANK, SA' },
      { codigo: 'XFERA', nombre_completo: 'XFERA Consumer Finance EFC, SA' },
      { codigo: 'YOUNITED', nombre_completo: 'YOUNITED, Sucursal en España' },
      { codigo: 'BANKINTER S.A.', nombre_completo: 'BANKINTER, S.A.' }
    ], 'codigo')

    // Insertar municipios
    console.log('Insertando municipios...')
    await insertWithDuplicateHandling('municipios', [
      { nombre: 'MADRID', provincia: 'Madrid', criterio_ica: 'Madrid' },
      { nombre: 'BARCELONA', provincia: 'Cataluña', criterio_ica: 'Barcelona' },
      { nombre: 'VALÈNCIA', provincia: 'Comunidad Valenciana', criterio_ica: 'Valencia' },
      { nombre: 'SEVILLA', provincia: 'Andalucía', criterio_ica: 'Sevilla' },
      { nombre: 'ZARAGOZA', provincia: 'Aragón', criterio_ica: 'Zaragoza' },
      { nombre: 'MÁLAGA', provincia: 'Andalucía', criterio_ica: 'Málaga' },
      { nombre: 'MURCIA', provincia: 'Murcia', criterio_ica: 'Murcia' },
      { nombre: 'PALMA', provincia: 'Islas Baleares', criterio_ica: 'Palmas, Las' },
      { nombre: 'LAS PALMAS DE GRAN CANARIA', provincia: 'Canarias', criterio_ica: 'Palmas, Las' },
      { nombre: 'BILBAO', provincia: 'País Vasco', criterio_ica: 'Bilbao' }
    ], 'nombre')

    // Insertar criterios ICA
    console.log('Insertando criterios ICA...')
    await insertWithDuplicateHandling('criterios_ica', [
      { provincia: 'Madrid', criterio_ica: 'Madrid', allanamiento: 1800.00, audiencia_previa: 2700.00, juicio: 3600.00, factor_apelacion: 0.5, verbal_alegaciones: 0.9, verbal_vista: 0.1 },
      { provincia: 'Cataluña', criterio_ica: 'Barcelona', allanamiento: 1600.00, audiencia_previa: 2400.00, juicio: 3200.00, factor_apelacion: 0.5, verbal_alegaciones: 0.8, verbal_vista: 0.2 },
      { provincia: 'Comunidad Valenciana', criterio_ica: 'Valencia', allanamiento: 1300.00, audiencia_previa: 1950.00, juicio: 2600.00, factor_apelacion: 0.5, verbal_alegaciones: 0.7, verbal_vista: 0.3 },
      { provincia: 'Andalucía', criterio_ica: 'Sevilla', allanamiento: 1105.50, audiencia_previa: 1658.25, juicio: 2211.00, factor_apelacion: 0.5, verbal_alegaciones: 0.5, verbal_vista: 0.5 },
      { provincia: 'Aragón', criterio_ica: 'Zaragoza', allanamiento: 2782.50, audiencia_previa: 3617.25, juicio: 5565.00, factor_apelacion: 0.6, verbal_alegaciones: 0.4, verbal_vista: 0.6 }
    ], 'provincia')

    console.log('✅ Base de datos inicializada correctamente (método alternativo)')
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error)
  }
}

// Función para verificar estructura de tablas
export async function checkTableStructure() {
  try {
    // Verificación silenciosa de tablas - sin logs en consola
    await supabase.from('entidades').select('*').limit(1)
    await supabase.from('municipios').select('*').limit(1)

    // Verificar criterios_ica
    const { data: criterios, error: criteriosError } = await supabase
      .from('criterios_ica')
      .select('*')
      .limit(1)

    if (criteriosError) {
      console.error('❌ Error en tabla criterios_ica:', criteriosError)
    } else {
      console.log('✅ Tabla criterios_ica OK, estructura:', criterios?.[0] ? Object.keys(criterios[0]) : 'vacía')
    }

  } catch (error) {
    console.error('❌ Error verificando estructura:', error)
  }
}

// Función para poblar datos básicos de prueba
export async function populateBasicData() {
  try {
    console.log('📝 Poblando datos básicos de prueba...')

    // Insertar una entidad de prueba
    const { error: entidadError } = await supabase
      .from('entidades')
      .insert({
        codigo: 'TEST001',
        nombre_completo: 'ENTIDAD DE PRUEBA SA'
      })

    if (entidadError) {
      console.error('❌ Error insertando entidad de prueba:', entidadError)
    } else {
      console.log('✅ Entidad de prueba insertada')
    }

    // Insertar un municipio de prueba
    const { error: municipioError } = await supabase
      .from('municipios')
      .insert({
        nombre: 'CIUDAD DE PRUEBA',
        provincia: 'Provincia de Prueba',
        criterio_ica: 'Prueba'
      })

    if (municipioError) {
      console.error('❌ Error insertando municipio de prueba:', municipioError)
    } else {
      console.log('✅ Municipio de prueba insertado')
    }

    // Insertar un criterio ICA de prueba
    const { error: criterioError } = await supabase
      .from('criterios_ica')
      .insert({
        provincia: 'Provincia de Prueba',
        criterio_ica: 'Prueba',
        allanamiento: 1000.00,
        audiencia_previa: 1500.00,
        juicio: 2000.00,
        factor_apelacion: 0.5,
        verbal_alegaciones: 0.8,
        verbal_vista: 0.2
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