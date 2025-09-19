import { useState, useEffect } from 'react';
import { WordConfigService } from '../services/WordConfigService';
import type { WordTemplateConfig } from '../services/word';

export default function WordTemplateSettings() {
  const [config, setConfig] = useState<WordTemplateConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeInstancia, setActiveInstancia] = useState<'primera' | 'segunda'>('primera');
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (config && activeInstancia) {
      loadHtmlTemplate();
    }
  }, [config, activeInstancia]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const loadedConfig = await WordConfigService.loadFromDB();
      setConfig(loadedConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const loadHtmlTemplate = async () => {
    try {
      const template = await WordConfigService.loadHtmlTemplate(activeInstancia);
      setHtmlTemplate(template || getDefaultTemplate());
    } catch (err) {
      console.error('Error loading HTML template:', err);
      setHtmlTemplate(getDefaultTemplate());
    }
  };

  const getDefaultTemplate = () => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Minuta de Tasación</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { margin: 20px 0; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; }
        .value { margin-left: 10px; }
        .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MINUTA DE TASACIÓN</h1>
        <h2>{INSTANCIA}</h2>
    </div>

    <div class="content">
        <div class="field">
            <span class="label">Cliente:</span>
            <span class="value">{CLIENTA}</span>
        </div>

        <div class="field">
            <span class="label">Número de Procedimiento:</span>
            <span class="value">{NUMEROPROCEDIMIENTO}</span>
        </div>

        <div class="field">
            <span class="label">Juzgado:</span>
            <span class="value">{NOMBREJUZGADO}</span>
        </div>

        <div class="field">
            <span class="label">Entidad Demandada:</span>
            <span class="value">{ENTIDADDEMANDADA}</span>
        </div>

        <div class="field">
            <span class="label">Municipio:</span>
            <span class="value">{MUNICIPIO}</span>
        </div>

        <div class="field">
            <span class="label">Costas sin IVA:</span>
            <span class="value">{COSTASSINIVA} €</span>
        </div>

        <div class="field">
            <span class="label">IVA (21%):</span>
            <span class="value">{IVA} €</span>
        </div>

        <div class="total">
            <span class="label">TOTAL:</span>
            <span class="value">{TOTAL} €</span>
        </div>

        <div class="field">
            <span class="label">Fecha:</span>
            <span class="value">{FECHA}</span>
        </div>
    </div>
</body>
</html>`;
  };

  const saveHtmlTemplate = async () => {
    try {
      setSaving(true);
      await WordConfigService.saveHtmlTemplate(activeInstancia, htmlTemplate);
      alert('Plantilla HTML guardada correctamente');
    } catch (err) {
      console.error('Error saving HTML template:', err);
      alert('Error al guardar la plantilla HTML');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className='text-center py-8'>Cargando configuración...</div>;
  }

  if (error) {
    return <div className='text-center py-8 text-red-600'>Error: {error}</div>;
  }

  if (!config) {
    return <div className='text-center py-8'>No se encontró configuración</div>;
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold'>Configuración de Plantillas HTML</h2>

      {/* Selector de Instancia */}
      <div className='flex space-x-4 mb-6'>
        <button
          onClick={() => setActiveInstancia('primera')}
          className={`px-4 py-2 rounded-md ${
            activeInstancia === 'primera'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Primera Instancia
        </button>
        <button
          onClick={() => setActiveInstancia('segunda')}
          className={`px-4 py-2 rounded-md ${
            activeInstancia === 'segunda'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Segunda Instancia
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Editor HTML */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-medium mb-4'>Editor HTML</h3>
          <textarea
            value={htmlTemplate}
            onChange={(e) => setHtmlTemplate(e.target.value)}
            className='w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm'
            placeholder='Escribe tu plantilla HTML aquí...'
          />
          <div className='mt-4 flex justify-end'>
            <button
              onClick={saveHtmlTemplate}
              disabled={saving}
              className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50'
            >
              {saving ? 'Guardando...' : 'Guardar Plantilla'}
            </button>
          </div>
        </div>

        {/* Vista Previa */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-medium mb-4'>Vista Previa</h3>
          <div className='border border-gray-300 rounded-md h-96 overflow-auto'>
            <iframe
              srcDoc={htmlTemplate.replace(/\{([^}]+)\}/g, (match, key) => {
                const sampleData: Record<string, string> = {
                  CLIENTA: 'Juan Pérez García',
                  NUMEROPROCEDIMIENTO: '1234/2024',
                  NOMBREJUZGADO: 'Juzgado de Primera Instancia nº 1 de Madrid',
                  ENTIDADDEMANDADA: 'Banco XYZ S.A.',
                  MUNICIPIO: 'Madrid',
                  INSTANCIA: activeInstancia === 'primera' ? 'PRIMERA INSTANCIA' : 'SEGUNDA INSTANCIA',
                  COSTASSINIVA: '1.250,00',
                  IVA: '262,50',
                  TOTAL: '1.512,50',
                  FECHA: new Date().toLocaleDateString('es-ES')
                };
                return sampleData[key] || match;
              })}
              className='w-full h-full border-0'
              title='Vista previa de la plantilla'
            />
          </div>
        </div>
      </div>

      {/* Información de marcadores disponibles */}
      <div className='bg-blue-50 p-6 rounded-lg'>
        <h3 className='text-lg font-medium mb-4 text-blue-800'>Marcadores Disponibles</h3>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-2 text-sm'>
          <div><code className='bg-blue-100 px-2 py-1 rounded'>{'{CLIENTA}'}</code></div>
          <div><code className='bg-blue-100 px-2 py-1 rounded'>{'{NUMEROPROCEDIMIENTO}'}</code></div>
          <div><code className='bg-blue-100 px-2 py-1 rounded'>{'{NOMBREJUZGADO}'}</code></div>
          <div><code className='bg-blue-100 px-2 py-1 rounded'>{'{ENTIDADDEMANDADA}'}</code></div>
          <div><code className='bg-blue-100 px-2 py-1 rounded'>{'{MUNICIPIO}'}</code></div>
          <div><code className='bg-blue-100 px-2 py-1 rounded'>{'{INSTANCIA}'}</code></div>
          <div><code className='bg-blue-100 px-2 py-1 rounded'>{'{COSTASSINIVA}'}</code></div>
          <div><code className='bg-blue-100 px-2 py-1 rounded'>{'{IVA}'}</code></div>
          <div><code className='bg-blue-100 px-2 py-1 rounded'>{'{TOTAL}'}</code></div>
          <div><code className='bg-blue-100 px-2 py-1 rounded'>{'{FECHA}'}</code></div>
        </div>
        <p className='text-blue-700 mt-4 text-sm'>
          Usa estos marcadores en tu plantilla HTML. Serán reemplazados con los datos reales al generar el documento.
        </p>
      </div>
    </div>
  );
}
