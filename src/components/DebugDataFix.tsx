import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const DebugDataFix: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const addStatus = (message: string) => {
    setStatus(prev => prev + '\n' + message);
    console.log(message);
  };

  const clearStatus = () => {
    setStatus('');
  };

  const testDirectInsert = async () => {
    setIsLoading(true);
    clearStatus();
    addStatus('🔍 Probando inserción directa...');

    try {
      // Insertar un criterio ICA simple
      const testData = {
        provincia: 'Test',
        criterio_ica: 'Test-' + Date.now(),
        allanamiento: 1000.00,
        audiencia_previa: 1500.00,
        juicio: 2000.00,
        factor_apelacion: 0.5,
        verbal_alegaciones: 0.8,
        verbal_vista: 0.2
      };

      const { data, error } = await supabase
        .from('criterios_ica')
        .insert(testData)
        .select();

      if (error) {
        addStatus(`❌ Error: ${error.message}`);
        addStatus(`Code: ${error.code}`);
        addStatus(`Details: ${error.details}`);
        addStatus(`Hint: ${error.hint}`);
      } else {
        addStatus(`✅ Inserción exitosa: ${JSON.stringify(data)}`);
      }

    } catch (error) {
      addStatus(`❌ Exception: ${error}`);
    }

    setIsLoading(false);
  };

  const testUpsert = async () => {
    setIsLoading(true);
    clearStatus();
    addStatus('🔍 Probando upsert...');

    try {
      // Intentar upsert con datos reales
      const criteriosTest = [
        { 
          provincia: 'Madrid', 
          criterio_ica: 'Madrid', 
          allanamiento: 1800.00, 
          audiencia_previa: 2700.00, 
          juicio: 3600.00, 
          factor_apelacion: 0.5, 
          verbal_alegaciones: 0.9, 
          verbal_vista: 0.1 
        }
      ];

      const { data, error } = await supabase
        .from('criterios_ica')
        .upsert(criteriosTest, {
          onConflict: 'provincia,criterio_ica',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        addStatus(`❌ Error: ${error.message}`);
        addStatus(`Code: ${error.code}`);
        addStatus(`Details: ${error.details}`);
        addStatus(`Hint: ${error.hint}`);
      } else {
        addStatus(`✅ Upsert exitoso: ${JSON.stringify(data)}`);
      }

    } catch (error) {
      addStatus(`❌ Exception: ${error}`);
    }

    setIsLoading(false);
  };

  const insertCorrectEntidades = async () => {
    setIsLoading(true);
    clearStatus();
    addStatus('🔍 Insertando entidades corregidas...');

    try {
      const entidades = [
        { nombre_corto: 'UCI', nombre_completo: 'UNIÓN DE CRÉDITOS INMOBILIARIOS, S.A.' },
        { nombre_corto: 'CAIXABANK', nombre_completo: 'CAIXABANK, SA' },
        { nombre_corto: 'SANTANDER', nombre_completo: 'BANCO SANTANDER, SA' },
        { nombre_corto: 'BBVA', nombre_completo: 'BANCO BILBAO VIZCAYA ARGENTARIA, SA (BBVA SA)' },
        { nombre_corto: 'SABADELL', nombre_completo: 'BANCO DE SABADELL, SA' }
      ];

      for (const entidad of entidades) {
        const { data: _, error } = await supabase
          .from('entidades')
          .upsert(entidad, {
            onConflict: 'nombre_corto',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          addStatus(`❌ Error con ${entidad.nombre_corto}: ${error.message}`);
        } else {
          addStatus(`✅ ${entidad.nombre_corto} insertada correctamente`);
        }
      }

    } catch (error) {
      addStatus(`❌ Exception: ${error}`);
    }

    setIsLoading(false);
  };

  const insertCorrectCriterios = async () => {
    setIsLoading(true);
    clearStatus();
    addStatus('🔍 Insertando criterios ICA corregidos...');

    try {
      const criterios = [
        { provincia: 'Madrid', criterio_ica: 'Madrid', allanamiento: 1800.00, audiencia_previa: 2700.00, juicio: 3600.00, factor_apelacion: 0.5, verbal_alegaciones: 0.9, verbal_vista: 0.1 },
        { provincia: 'Cataluña', criterio_ica: 'Barcelona', allanamiento: 1600.00, audiencia_previa: 2400.00, juicio: 3200.00, factor_apelacion: 0.5, verbal_alegaciones: 0.8, verbal_vista: 0.2 },
        { provincia: 'Comunidad Valenciana', criterio_ica: 'Valencia', allanamiento: 1300.00, audiencia_previa: 1950.00, juicio: 2600.00, factor_apelacion: 0.5, verbal_alegaciones: 0.7, verbal_vista: 0.3 },
        { provincia: 'Andalucía', criterio_ica: 'Sevilla', allanamiento: 1105.50, audiencia_previa: 1658.25, juicio: 2211.00, factor_apelacion: 0.5, verbal_alegaciones: 0.5, verbal_vista: 0.5 },
        { provincia: 'Aragón', criterio_ica: 'Zaragoza', allanamiento: 2782.50, audiencia_previa: 3617.25, juicio: 5565.00, factor_apelacion: 0.6, verbal_alegaciones: 0.4, verbal_vista: 0.6 }
      ];

      for (const criterio of criterios) {
        const { data: _, error } = await supabase
          .from('criterios_ica')
          .upsert(criterio, {
            onConflict: 'provincia,criterio_ica',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          addStatus(`❌ Error con ${criterio.provincia}-${criterio.criterio_ica}: ${error.message}`);
        } else {
          addStatus(`✅ ${criterio.provincia}-${criterio.criterio_ica} insertado correctamente`);
        }
      }

    } catch (error) {
      addStatus(`❌ Exception: ${error}`);
    }

    setIsLoading(false);
  };

  const checkCounts = async () => {
    setIsLoading(true);
    clearStatus();
    addStatus('🔍 Verificando conteos...');

    try {
      // Contar entidades
      const { count: entidadesCount, error: entidadesError } = await supabase
        .from('entidades')
        .select('*', { count: 'exact', head: true });

      if (entidadesError) {
        addStatus(`❌ Error contando entidades: ${entidadesError.message}`);
      } else {
        addStatus(`📊 Entidades: ${entidadesCount}`);
      }

      // Contar criterios_ica
      const { count: criteriosCount, error: criteriosError } = await supabase
        .from('criterios_ica')
        .select('*', { count: 'exact', head: true });

      if (criteriosError) {
        addStatus(`❌ Error contando criterios_ica: ${criteriosError.message}`);
      } else {
        addStatus(`📊 Criterios ICA: ${criteriosCount}`);
      }

      // Contar municipios_ica
      const { count: municipiosCount, error: municipiosError } = await supabase
        .from('municipios_ica')
        .select('*', { count: 'exact', head: true });

      if (municipiosError) {
        addStatus(`❌ Error contando municipios_ica: ${municipiosError.message}`);
      } else {
        addStatus(`📊 Municipios ICA: ${municipiosCount}`);
      }

    } catch (error) {
      addStatus(`❌ Exception: ${error}`);
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🛠️ Debug Data Fix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button 
            onClick={testDirectInsert}
            disabled={isLoading}
            variant="outline"
          >
            Test Insert
          </Button>
          
          <Button 
            onClick={testUpsert}
            disabled={isLoading}
            variant="outline"
          >
            Test Upsert
          </Button>
          
          <Button 
            onClick={insertCorrectEntidades}
            disabled={isLoading}
            variant="default"
          >
            Fix Entidades
          </Button>
          
          <Button 
            onClick={insertCorrectCriterios}
            disabled={isLoading}
            variant="default"
          >
            Fix Criterios
          </Button>
          
          <Button 
            onClick={checkCounts}
            disabled={isLoading}
            variant="secondary"
          >
            Check Counts
          </Button>
          
          <Button 
            onClick={clearStatus}
            disabled={isLoading}
            variant="destructive"
          >
            Clear Log
          </Button>
        </div>

        {status && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Status Log:</h3>
            <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
              {status}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugDataFix;