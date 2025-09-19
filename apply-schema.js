const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase (deberías tener estas variables de entorno)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
  try {
    console.log('Aplicando esquema de base de datos...');

    // Leer el archivo SQL
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Ejecutar el SQL completo
    console.log('Ejecutando esquema SQL...');
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL });

    if (error) {
      console.error('Error ejecutando esquema:', error);
      console.log('Intentando ejecutar statements individuales...');

      // Si falla, intentar ejecutar statements individuales
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Ejecutando:', statement.substring(0, 50) + '...');
          try {
            const { error: stmtError } = await supabase.from('_supabase_exec_sql').insert({ sql: statement });
            if (stmtError) {
              console.error('Error en statement:', stmtError);
            } else {
              console.log('✓ Statement ejecutado');
            }
          } catch (e) {
            console.error('Error ejecutando statement individual:', e.message);
          }
        }
      }
    } else {
      console.log('✓ Esquema aplicado exitosamente');
    }

  } catch (error) {
    console.error('Error aplicando esquema:', error);
  }
}

applySchema();