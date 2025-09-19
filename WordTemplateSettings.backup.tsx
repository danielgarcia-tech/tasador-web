import { useState, useEffect } from 'react';
import { Upload, Settings, CheckCircle, Save, Edit3 } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { WordMarkerDetector, WordTemplateCache } from '../services/word';
import { WordTemplateStorage } from '../services/word/WordTemplateStorage';
import { WordConfigService } from '../services/WordConfigService';
import type { WordTemplateConfig } from '../services/word';

interface WordTemplateSettingsProps {
  onConfigChange?: (config: WordTemplateConfig) => void;
}

export default function WordTemplateSettings({ onConfigChange }: WordTemplateSettingsProps): JSX.Element {
  const [config, setConfig] = useState<WordTemplateConfig>({
    primeraInstancia: {
      plantilla: null,
      plantillaUrl: null,
      marcadores: {
        "CUANTIASINIVA": "Costas",
        "CLIENTA": "Nombre Cliente",
        "ENTIDADDEMANDADA": "Entidad Demandada",
        "TOTAL": "Total",
        "NUMERO DE PROCEDIMIENTO": "Número Procedimiento",
        "NOMBREJUZGADO": "Nombre Juzgado",
        "CUANTIACONIVA": "IVA"
      }
    },
    segundaInstancia: {
      plantilla: null,
      plantillaUrl: null,
      marcadores: {
        "TOTAL CON IVA": "Total",
        "IVA": "IVA",
        "NOMBRE CLIENTE": "Nombre Cliente",
        "NUMERO DE PROCEDIMIENTO": "Número Procedimiento",
        "NOMBRE JUZGADO": "Nombre Juzgado",
        "ENTIDAD DEMANDADA": "Entidad Demandada",
        "COSTAS SIN IVA": "Costas"
      }
    }
  });

  const [detectingMarkers, setDetectingMarkers] = useState<'primera' | 'segunda' | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'primera' | 'segunda' | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Estados para el editor HTML
  const [htmlPrimera, setHtmlPrimera] = useState('');
  const [htmlSegunda, setHtmlSegunda] = useState('');
  const [showHtmlEditor, setShowHtmlEditor] = useState<'primera' | 'segunda' | null>(null);
  const [savingHtml, setSavingHtml] = useState(false);

  // Verificar configuración del bucket al montar el componente
  useEffect(() => {
    const checkBucketConfig = async () => {
      try {
        const isAccessible = await WordTemplateStorage.checkBucketAccess();
        if (!isAccessible) {
          console.warn('El bucket de Supabase no está accesible. Verifica la configuración.');
        }
      } catch (error) {
        console.error('Error verificando acceso al bucket:', error);
      }
    };

    checkBucketConfig();
  }, []);

  // Cargar configuración guardada y descargar plantillas si es necesario
  useEffect(() => {
    const loadSavedConfig = async () => {
      setLoadingTemplates(true);

      // Primero intentar cargar desde la DB
      const savedConfig = await WordConfigService.loadFromDB();

      // Si no hay configuración en DB, intentar desde el servicio local (localStorage)
      const fallbackConfig = savedConfig || WordConfigService.getCurrentConfig();

      if (fallbackConfig) {
        try {
          // Actualizar la configuración con URLs y marcadores
          setConfig({
            primeraInstancia: {
              ...fallbackConfig.primeraInstancia,
              plantilla: null // Resetear archivo temporal, se cargará desde caché
            },
            segundaInstancia: {
              ...fallbackConfig.segundaInstancia,
              plantilla: null // Resetear archivo temporal, se cargará desde caché
            }
          });

          // Luego descargar las plantillas en paralelo o desde caché
          const downloadPromises = [];

          if (fallbackConfig.primeraInstancia?.plantillaUrl) {
            const plantillaUrl = fallbackConfig.primeraInstancia.plantillaUrl;
            downloadPromises.push(
              (async () => {
                try {
                  // Intentar obtener del caché primero
                  let templateFile = WordTemplateCache.get(plantillaUrl);

                  if (!templateFile) {
                    // Si no está en caché, descargar desde el servidor
                    const templateBlob = await WordTemplateStorage.downloadTemplate(plantillaUrl);
                    const fileName = WordTemplateCache.extractFileNameFromUrl(plantillaUrl, 'plantilla-primera.docx');
                    templateFile = new File([templateBlob], fileName, {
                      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    });

                    // Guardar en caché
                    WordTemplateCache.set(plantillaUrl, templateFile, fileName);
                  }

                  setConfig(prev => ({
                    ...prev,
                    primeraInstancia: {
                      ...prev.primeraInstancia,
                      plantilla: templateFile
                    }
                  }));
                } catch (error) {
                  console.warn('Error descargando plantilla de primera instancia:', error);
                }
              })()
            );
          }

          if (fallbackConfig.segundaInstancia?.plantillaUrl) {
            const plantillaUrl = fallbackConfig.segundaInstancia.plantillaUrl;
            downloadPromises.push(
              (async () => {
                try {
                  // Intentar obtener del caché primero
                  let templateFile = WordTemplateCache.get(plantillaUrl);

                  if (!templateFile) {
                    // Si no está en caché, descargar desde el servidor
                    const templateBlob = await WordTemplateStorage.downloadTemplate(plantillaUrl);
                    const fileName = WordTemplateCache.extractFileNameFromUrl(plantillaUrl, 'plantilla-segunda.docx');
                    templateFile = new File([templateBlob], fileName, {
                      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    });

                    // Guardar en caché
                    WordTemplateCache.set(plantillaUrl, templateFile, fileName);
                  }

                  setConfig(prev => ({
                    ...prev,
                    segundaInstancia: {
                      ...prev.segundaInstancia,
                      plantilla: templateFile
                    }
                  }));
                } catch (error) {
                  console.warn('Error descargando plantilla de segunda instancia:', error);
                }
              })()
            );
          }

          // Esperar a que se descarguen todas las plantillas
          await Promise.allSettled(downloadPromises);

        } catch (error) {
          console.error('Error cargando configuración:', error);
        }
      }
      setLoadingTemplates(false);
    };

    loadSavedConfig();
  }, []);

  // Guardar configuración cuando cambie (automático) - usar servicio centralizado
  useEffect(() => {
    // Actualizar el servicio centralizado en lugar de localStorage directamente
    WordConfigService.updateConfig(config);

    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config.primeraInstancia.plantillaUrl, config.segundaInstancia.plantillaUrl, config, onConfigChange]);

  // Función para guardar manualmente
  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      // Normalizar marcadores antes de persistir
      const normalizeMarkerKey = (k: string) => k.replace(/\s+/g, ' ').trim().toUpperCase().replace(/[^A-Z0-9_ ]/g, '_');

      const normalizeMarkersObj = (markers: Record<string, string>) => {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(markers)) {
          const nk = normalizeMarkerKey(k);
          out[nk] = v;
        }
        return out;
      };

      const normalizedConfig = {
        primeraInstancia: {
          ...config.primeraInstancia,
          marcadores: normalizeMarkersObj(config.primeraInstancia.marcadores)
        },
        segundaInstancia: {
          ...config.segundaInstancia,
          marcadores: normalizeMarkersObj(config.segundaInstancia.marcadores)
        }
      };

      // Usar el servicio centralizado en lugar de localStorage directamente
      WordConfigService.updateConfig(normalizedConfig as any);
      setHasUnsavedChanges(false); // Resetear indicador después de guardar

      // Además, persistir en la base de datos por instancia (usar la versión normalizada)
      if (normalizedConfig.primeraInstancia.plantillaUrl) {
        await WordConfigService.saveToDB(
          'primera',
          normalizedConfig.primeraInstancia.plantillaUrl,
          normalizedConfig.primeraInstancia.plantilla?.name || WordTemplateCache.extractFileNameFromUrl(normalizedConfig.primeraInstancia.plantillaUrl, 'plantilla-primera.docx'),
          normalizedConfig.primeraInstancia.marcadores
        );
      }
      if (normalizedConfig.segundaInstancia.plantillaUrl) {
        await WordConfigService.saveToDB(
          'segunda',
          normalizedConfig.segundaInstancia.plantillaUrl,
          normalizedConfig.segundaInstancia.plantilla?.name || WordTemplateCache.extractFileNameFromUrl(normalizedConfig.segundaInstancia.plantillaUrl, 'plantilla-segunda.docx'),
          normalizedConfig.segundaInstancia.marcadores
        );
      }

      // Mostrar confirmación
      alert('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  // Funciones para manejar HTML templates
  const loadHtmlTemplates = async () => {
    try {
      const htmlPrimera = await WordConfigService.loadHtmlTemplate('primera');
      const htmlSegunda = await WordConfigService.loadHtmlTemplate('segunda');
      setHtmlPrimera(htmlPrimera || '');
      setHtmlSegunda(htmlSegunda || '');
    } catch (error) {
      console.error('Error cargando templates HTML:', error);
    }
  };

  const handleSaveHtmlTemplate = async (instancia: 'primera' | 'segunda') => {
    setSavingHtml(true);
    try {
      const htmlContent = instancia === 'primera' ? htmlPrimera : htmlSegunda;
      await WordConfigService.saveHtmlTemplate(instancia, htmlContent);
      alert(`Plantilla HTML de ${instancia} instancia guardada correctamente`);
      setShowHtmlEditor(null);
    } catch (error) {
      console.error('Error guardando template HTML:', error);
      alert('Error al guardar la plantilla HTML');
    } finally {
      setSavingHtml(false);
    }
  };

  // Cargar HTML templates al montar
  useEffect(() => {
    loadHtmlTemplates();
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    instancia: 'primera' | 'segunda'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!WordMarkerDetector.isValidWordFile(file)) {
      alert('Por favor, selecciona un archivo Word válido (.docx o .doc)');
      return;
    }

    try {
      setUploading(instancia);
      setDetectingMarkers(instancia);

      // Subir archivo al bucket de Supabase
      const templateUrl = await WordTemplateStorage.uploadTemplate(file, instancia);

      // Detectar marcadores en el archivo
      const markers = await WordMarkerDetector.detectMarkers(file);

      // Actualizar configuración con el archivo y la URL
      setConfig(prev => ({
        ...prev,
        [instancia === 'primera' ? 'primeraInstancia' : 'segundaInstancia']: {
          plantilla: file,
          plantillaUrl: templateUrl,
          marcadores: prev[instancia === 'primera' ? 'primeraInstancia' : 'segundaInstancia'].marcadores
        }
      }));

      // Agregar al caché para futuros usos
      WordTemplateCache.set(templateUrl, file, file.name);

      // Persistir en DB
      await WordConfigService.saveToDB(instancia, templateUrl, file.name, (await WordConfigService.getCurrentConfig())?.[instancia === 'primera' ? 'primeraInstancia' : 'segundaInstancia'].marcadores || {});

      // Si se encontraron marcadores, mostrar información
      if (markers.length > 0) {
        alert(`Plantilla subida correctamente. Se encontraron ${markers.length} marcadores: ${markers.join(', ')}`);
      } else {
        alert('Plantilla subida correctamente, pero no se encontraron marcadores <<MARCADOR>> en el documento.');
      }

    } catch (error) {
      console.error('Error procesando archivo:', error);
      alert('Error al procesar el archivo Word. Verifica que sea un documento válido.');
    } finally {
      setUploading(null);
      setDetectingMarkers(null);
    }
  };

  const updateMarkerMapping = (
    instancia: 'primera' | 'segunda',
    marker: string,
    field: string
  ) => {
    setConfig(prev => ({
      ...prev,
      [instancia === 'primera' ? 'primeraInstancia' : 'segundaInstancia']: {
        ...prev[instancia === 'primera' ? 'primeraInstancia' : 'segundaInstancia'],
        marcadores: {
          ...prev[instancia === 'primera' ? 'primeraInstancia' : 'segundaInstancia'].marcadores,
          [marker]: field
        }
      }
    }));
    setHasUnsavedChanges(true); // Marcar que hay cambios sin guardar
  };

  const renderInstanciaConfig = (instancia: 'primera' | 'segunda') => {
    const instanciaData = instancia === 'primera' ? config.primeraInstancia : config.segundaInstancia;
    const instanciaName = instancia === 'primera' ? 'Primera Instancia' : 'Segunda Instancia';

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{instanciaName}</h3>

        {/* Upload de plantilla */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plantilla Word
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".docx,.doc"
              onChange={(e) => handleFileUpload(e, instancia)}
              className="hidden"
              id={`plantilla-${instancia}`}
              disabled={detectingMarkers === instancia}
            />
            <label
              htmlFor={`plantilla-${instancia}`}
              className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${
                detectingMarkers === instancia || uploading === instancia ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>
                {uploading === instancia
                  ? 'Subiendo plantilla...'
                  : detectingMarkers === instancia
                    ? 'Detectando marcadores...'
                    : loadingTemplates
                      ? 'Cargando plantilla...'
                      : instanciaData.plantilla
                        ? instanciaData.plantilla.name
                        : instanciaData.plantillaUrl
                          ? WordTemplateCache.extractFileNameFromUrl(instanciaData.plantillaUrl, `Plantilla ${instanciaName}`)
                          : 'Seleccionar plantilla'
                }
              </span>
            </label>
            {(instanciaData.plantilla || instanciaData.plantillaUrl) && (
              <CheckCircle className={`h-5 w-5 ${instanciaData.plantilla ? 'text-green-500' : 'text-blue-500'}`} />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona un archivo Word (.docx) con marcadores en formato &lt;&lt;MARCADOR&gt;&gt;
            {instanciaData.plantillaUrl && !instanciaData.plantilla && !loadingTemplates && (
              <span className="text-blue-600 block mt-1">
                ⚠️ Plantilla guardada en servidor. Recargando...
              </span>
            )}
            {instanciaData.plantilla && instanciaData.plantillaUrl && (
              <span className="text-green-600 block mt-1">
                ✅ Plantilla cargada y lista para usar
              </span>
            )}
          </p>
        </div>

        {/* Configuración de plantilla HTML */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plantilla HTML
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHtmlEditor(instancia)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>Configurar Plantilla HTML</span>
            </button>
            {(instancia === 'primera' ? htmlPrimera : htmlSegunda) && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Configura una plantilla HTML personalizada con marcadores en formato &lt;&lt;MARCADOR&gt;&gt;
          </p>
        </div>

        {/* Configuración de marcadores */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mapeo de Marcadores
          </label>
          <div className="space-y-3">
            {Object.entries(instanciaData.marcadores).map(([marker, field]) => (
              <div key={marker} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={marker}
                    onChange={(e) => {
                      // Si cambia el marcador, actualizar el mapeo
                      const newMarker = e.target.value.toUpperCase();
                      const currentMapping = instanciaData.marcadores;
                      delete currentMapping[marker];
                      currentMapping[newMarker] = field;
                      updateMarkerMapping(instancia, newMarker, field);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                    placeholder="MARCADOR"
                  />
                </div>
                <span className="text-gray-500">→</span>
                <div className="flex-1">
                  <select
                    value={field}
                    onChange={(e) => updateMarkerMapping(instancia, marker, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="Costas">Costas</option>
                    <option value="IVA">IVA</option>
                    <option value="Total">Total</option>
                    <option value="Nombre Cliente">Nombre Cliente</option>
                    <option value="Número Procedimiento">Número Procedimiento</option>
                    <option value="Nombre Juzgado">Nombre Juzgado</option>
                    <option value="Entidad Demandada">Entidad Demandada</option>
                    <option value="Municipio">Municipio</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">Configuración de Plantillas Word</h4>
            <p className="text-blue-700 text-sm">
              Configura las plantillas Word y el mapeo de marcadores para generar minutas automáticamente.
              Los marcadores deben estar en formato <code>&lt;&lt;MARCADOR&gt;&gt;</code> en el documento Word.
            </p>
            {loadingTemplates && (
              <p className="text-blue-600 text-sm mt-2 flex items-center">
                <div className="w-4 h-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Cargando plantillas guardadas...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Configuración de primera instancia */}
      {renderInstanciaConfig('primera')}

      {/* Configuración de segunda instancia */}
      {renderInstanciaConfig('segunda')}

      {/* Botón de guardar - Siempre visible cuando hay cambios */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-800">Guardar Configuración</h4>
              <p className="text-yellow-700 text-sm">
                {hasUnsavedChanges
                  ? "Hay cambios en los marcadores que no se han guardado."
                  : "Los marcadores se guardan automáticamente. Haz clic para confirmar el guardado."
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 ${
              hasUnsavedChanges
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {hasUnsavedChanges ? 'Guardar Cambios' : 'Confirmar Guardado'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Información Importante</h4>
        <ul className="text-gray-700 text-sm space-y-1">
          <li>• Las plantillas deben ser archivos Word (.docx) con marcadores en formato &lt;&lt;MARCADOR&gt;&gt;</li>
          <li>• El marcador &lt;&lt;FECHA&gt;&gt; se reemplaza automáticamente con la fecha actual</li>
          <li>• Las plantillas se suben al servidor y se guardan permanentemente</li>
          <li>• Las URLs de las plantillas se guardan automáticamente al subir archivos</li>
          <li>• Los cambios en los marcadores requieren guardar manualmente usando el botón</li>
          <li>• El botón de guardar está siempre disponible para confirmar cambios</li>
          <li>• Las plantillas verdes están cargadas en memoria, las azules están guardadas en el servidor</li>
        </ul>
      </div>

      {/* Modal del Editor HTML */}
      {showHtmlEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Editor de Plantilla HTML - {showHtmlEditor === 'primera' ? 'Primera' : 'Segunda'} Instancia
              </h2>
              <button
                onClick={() => setShowHtmlEditor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex h-[70vh]">
              {/* Editor */}
              <div className="flex-1 p-6 border-r">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Editor HTML</h3>
                <ReactQuill
                  theme="snow"
                  value={showHtmlEditor === 'primera' ? htmlPrimera : htmlSegunda}
                  onChange={showHtmlEditor === 'primera' ? setHtmlPrimera : setHtmlSegunda}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'indent': '-1'}, { 'indent': '+1' }],
                      ['link'],
                      [{ 'color': [] }, { 'background': [] }],
                      [{ 'align': [] }],
                      ['clean']
                    ],
                  }}
                  className="h-[500px] mb-4"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowHtmlEditor(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSaveHtmlTemplate(showHtmlEditor)}
                    disabled={savingHtml}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingHtml ? 'Guardando...' : 'Guardar Plantilla'}
                  </button>
                </div>
              </div>

              {/* Vista Previa */}
              <div className="flex-1 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vista Previa</h3>
                <div className="border rounded-lg p-4 h-[500px] overflow-auto bg-gray-50">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: showHtmlEditor === 'primera' ? htmlPrimera : htmlSegunda
                    }}
                    className="prose max-w-none"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Marcadores disponibles:</strong></p>
                  <ul className="mt-2 space-y-1">
                    <li><code>&lt;&lt;CUANTIASINIVA&gt;&gt;</code> - Costas sin IVA</li>
                    <li><code>&lt;&lt;CUANTIACONIVA&gt;&gt;</code> - Costas con IVA</li>
                    <li><code>&lt;&lt;CLIENTA&gt;&gt;</code> - Nombre del cliente</li>
                    <li><code>&lt;&lt;ENTIDADDEMANDADA&gt;&gt;</code> - Entidad demandada</li>
                    <li><code>&lt;&lt;TOTAL&gt;&gt;</code> - Total</li>
                    <li><code>&lt;&lt;NUMERO DE PROCEDIMIENTO&gt;&gt;</code> - Número de procedimiento</li>
                    <li><code>&lt;&lt;NOMBREJUZGADO&gt;&gt;</code> - Nombre del juzgado</li>
                    <li><code>&lt;&lt;FECHA&gt;&gt;</code> - Fecha actual (automática)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}