import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: path.join(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  console.error('Asegúrate de tener configurado el archivo .env.local con:');
  console.error('VITE_SUPABASE_URL=tu_url_de_supabase');
  console.error('VITE_SUPABASE_ANON_KEY=tu_clave_anonima');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Leer el archivo JSON
const valoresPath = path.join(__dirname, '..', '..', 'valores_pordefecto.json');

if (!fs.existsSync(valoresPath)) {
  console.error('❌ Error: No se encuentra el archivo valores_pordefecto.json');
  process.exit(1);
}

const valoresData = JSON.parse(fs.readFileSync(valoresPath, 'utf8'));

async function uploadCostasData() {
  try {
    const records = [];

    // Procesar los datos del JSON
    for (const [ccaa, partidos] of Object.entries(valoresData.valores_ica)) {
      for (const [partidoJudicial, valores] of Object.entries(partidos)) {
        const record = {
          ccaa: ccaa,
          ica: partidoJudicial,
          allanamiento: valores.Allanamiento,
          audiencia_previa: valores['Audiencia Previa'],
          juicio: valores.Juicio,
          factor_apelacion: valores['Factor Apelacion'],
          verbal_alegaciones: valores.verbalalegaciones,
          verbal_vista: valores.verbalvista
        };

        records.push(record);
      }
    }

    console.log(`📊 Procesando ${records.length} registros de costas por ICA...`);

    // Insertar los datos en lotes para evitar límites
    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('costasxica')
        .upsert(batch, {
          onConflict: 'ccaa,ica',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`❌ Error en el lote ${Math.floor(i/batchSize) + 1}:`, error);
        return;
      } else {
        totalInserted += batch.length;
        console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} insertado correctamente (${batch.length} registros)`);
      }
    }

    console.log(`\n🎉 ¡Carga completada exitosamente!`);
    console.log(`📈 Total de registros insertados: ${totalInserted}`);

    // Mostrar resumen por comunidad autónoma
    const summary = {};
    records.forEach(record => {
      if (!summary[record.ccaa]) {
        summary[record.ccaa] = 0;
      }
      summary[record.ccaa]++;
    });

    console.log('\n📋 Resumen por Comunidad Autónoma:');
    Object.entries(summary).forEach(([ccaa, count]) => {
      console.log(`   ${ccaa}: ${count} partidos judiciales`);
    });

  } catch (error) {
    console.error('❌ Error al procesar los datos:', error);
  }
}

uploadCostasData();