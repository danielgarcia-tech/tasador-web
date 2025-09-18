import { supabase } from './src/lib/supabase'
import fs from 'fs'
import path from 'path'

async function applySchema() {
  try {
    console.log('Aplicando esquema de base de datos...')

    // Leer el archivo SQL
    const schemaPath = path.join(__dirname, 'supabase-schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')

    // Dividir el SQL en statements individuales
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    // Ejecutar cada statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Ejecutando:', statement.substring(0, 50) + '...')
        const { error } = await supabase.rpc('exec_sql', { sql: statement })

        if (error) {
          console.error('Error ejecutando statement:', error)
          console.error('Statement:', statement)
        } else {
          console.log('✓ Statement ejecutado correctamente')
        }
      }
    }

    console.log('Esquema aplicado exitosamente!')
  } catch (error) {
    console.error('Error aplicando esquema:', error)
  }
}

applySchema()