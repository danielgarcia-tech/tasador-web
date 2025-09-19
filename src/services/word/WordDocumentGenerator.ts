import { WordMarkerReplacer } from './WordMarkerReplacer';
import { WordTemplateStorage } from './WordTemplateStorage';
import { WordTemplateCache } from './WordTemplateCache';
import { WordConfigService } from '../WordConfigService';
import { saveAs } from 'file-saver';

/**
 * Configuración de plantillas Word
 */
export interface WordTemplateConfig {
  primeraInstancia: {
    plantilla: File | null;
    plantillaUrl: string | null;
    marcadores: Record<string, string>;
  };
  segundaInstancia: {
    plantilla: File | null;
    plantillaUrl: string | null;
    marcadores: Record<string, string>;
  };
}

/**
 * Datos de una tasación para generar el documento
 */
export interface TasacionData {
  id: string;
  nombreCliente: string;
  numeroProcedimiento: string;
  nombreJuzgado: string;
  entidadDemandada: string;
  municipio: string;
  instancia: 'PRIMERA INSTANCIA' | 'SEGUNDA INSTANCIA';
  costas: number;
  iva: number;
  total: number;
  fecha: string;
}

/**
 * Servicio principal para generar documentos Word de minutas
 */
export class WordDocumentGenerator {
  private config: WordTemplateConfig;

  constructor(config: WordTemplateConfig) {
    this.config = config;
  }

  /**
   * Actualiza la configuración de plantillas
   * @param config Nueva configuración
   */
  updateConfig(config: WordTemplateConfig): void {
    this.config = config;
  }

  /**
   * Genera un documento Word/HTML para una tasación específica
   * @param tasacion Datos de la tasación
   * @param download Si debe descargar automáticamente el archivo
   * @returns Promise que se resuelve cuando se completa la generación
   */
  async generateDocument(tasacion: TasacionData, download: boolean = true): Promise<void> {
    try {
      // Determinar qué configuración usar según la instancia
      const configInstancia = tasacion.instancia === 'PRIMERA INSTANCIA'
        ? this.config.primeraInstancia
        : this.config.segundaInstancia;

      const instanciaKey = tasacion.instancia === 'PRIMERA INSTANCIA' ? 'primera' : 'segunda';

      // Verificar si hay plantilla HTML configurada (para fallback)
      const htmlTemplate = await WordConfigService.loadHtmlTemplate(instanciaKey);

      // Verificar si hay plantilla Word configurada primero
      if (configInstancia.plantillaUrl) {
        // Si hay plantilla Word, usar la lógica DOCX existente
        console.debug('WordDocumentGenerator: generando documento Word con plantilla DOCX');
        // Continuar con la lógica existente para DOCX
      } else if (htmlTemplate) {
        // Si no hay plantilla Word pero sí HTML, generar documento HTML
        console.debug('WordDocumentGenerator: generando documento HTML con plantilla configurada');
        const generatedHtml = this.generateHtmlDocument(htmlTemplate, tasacion, configInstancia.marcadores);

        if (download) {
          const fileName = this.generateFileName(tasacion).replace('.docx', '.html');
          const htmlBlob = new Blob([generatedHtml], { type: 'text/html' });
          saveAs(htmlBlob, fileName);
        }

        console.log(`Documento HTML generado exitosamente: ${this.generateFileName(tasacion).replace('.docx', '.html')}`);
        return;
      }

      // Lógica para plantilla Word (DOCX)
      let templateFile = configInstancia.plantilla;

      // Si no hay archivo en memoria pero hay URL, intentar obtener del caché primero
      if (!templateFile && configInstancia.plantillaUrl) {
        // Intentar obtener del caché primero
        templateFile = WordTemplateCache.get(configInstancia.plantillaUrl);
        
        // Si no está en caché, descargar desde el bucket
        if (!templateFile) {
          try {
            const templateBlob = await WordTemplateStorage.downloadTemplate(configInstancia.plantillaUrl);
            const fileName = WordTemplateCache.extractFileNameFromUrl(configInstancia.plantillaUrl, 'template.docx');
            templateFile = new File([templateBlob], fileName, { 
              type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            });
            
            // Guardar en caché para futuros usos
            WordTemplateCache.set(configInstancia.plantillaUrl, templateFile, fileName);
          } catch (error) {
            console.error('Error descargando plantilla desde el servidor:', error);
            throw new Error(`Error al descargar la plantilla para ${tasacion.instancia.toLowerCase()}`);
          }
        }
      }

      if (!templateFile) {
        throw new Error(`No se ha configurado la plantilla para ${tasacion.instancia.toLowerCase()}`);
      }

      // Preparar el mapeo de marcadores con los datos de la tasación
      const markerMapping = this.prepareMarkerMapping(tasacion, configInstancia.marcadores);

      // Generar fecha actual si no está especificada
      const fechaActual = tasacion.fecha || WordMarkerReplacer.generateCurrentDate();

      // Reemplazar marcadores en la plantilla
      let generatedDoc: Blob

  // Si existe una URL de render server o se fuerza el uso de servidor mediante VITE_FORCE_SERVER_MINUTA,
  // delegar la generación al servidor (recomendado para Vercel).
  // IMPORTANT: No asumimos que '/api/generate-minuta' está disponible en el dev server de Vite.
  const env = (import.meta as any).env || {};
  const serverRenderUrl = env.VITE_RENDER_SERVER_MINUTA_URL || null;
  const forceServer = env.VITE_FORCE_SERVER_MINUTA === 'true' || env.VITE_FORCE_SERVER_MINUTA === '1';
  const useServerRender = !!(serverRenderUrl || forceServer);

      if (useServerRender) {
        try {
          const targetUrl = serverRenderUrl || '/api/generate-minuta';
          console.debug('WordDocumentGenerator: delegando generación al servidor', { targetUrl, forceServer });

          // Preparar body JSON
          const formBody: any = {
            plantillaUrl: configInstancia.plantillaUrl,
            fileName: templateFile.name,
            data: { ...markerMapping, fecha: fechaActual }
          };

          const resp = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formBody)
          });

          if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Servidor de render falló: ${resp.status} ${resp.statusText} - ${text}`);
          }

          const blob = await resp.blob();
          generatedDoc = blob;
        } catch (err) {
          console.error('WordDocumentGenerator: error al generar en servidor', err);
          throw err;
        }
      } else {
        try {
          console.debug('WordDocumentGenerator: reemplazando marcadores en cliente', {
            plantillaUrl: configInstancia.plantillaUrl,
            fileName: templateFile.name,
            marcadorPreview: Object.keys(markerMapping).slice(0, 10),
            marcadorValuesPreview: Object.fromEntries(Object.entries(markerMapping).slice(0, 10))
          })

          generatedDoc = await WordMarkerReplacer.replaceMarkers(
            templateFile,
            markerMapping,
            { fecha: fechaActual }
          )
        } catch (err) {
          console.error('WordDocumentGenerator: error al reemplazar marcadores', {
            error: err,
            plantillaUrl: configInstancia.plantillaUrl,
            marcadorCount: Object.keys(markerMapping).length,
            marcadores: markerMapping
          })
          throw err
        }
      }

      if (download) {
        // Generar nombre del archivo
        const fileName = this.generateFileName(tasacion);

        // Descargar el archivo
        saveAs(generatedDoc, fileName);
      }

      console.log(`Documento generado exitosamente: ${this.generateFileName(tasacion)}`);

    } catch (error) {
      console.error('Error generando documento Word:', error);
      throw error;
    }
  }

  /**
   * Genera múltiples documentos Word para varias tasaciones
   * @param tasaciones Lista de tasaciones
   * @param download Si debe descargar automáticamente los archivos
   */
  async generateMultipleDocuments(tasaciones: TasacionData[], download: boolean = true): Promise<void> {
    const promises = tasaciones.map(tasacion =>
      this.generateDocument(tasacion, download)
    );

    try {
      await Promise.all(promises);
      console.log(`Se generaron ${tasaciones.length} documentos exitosamente`);
    } catch (error) {
      console.error('Error generando múltiples documentos:', error);
      throw error;
    }
  }

  /**
   * Prepara el mapeo de marcadores con los datos de la tasación
   * @param tasacion Datos de la tasación
   * @param marcadoresConfig Configuración de marcadores
   * @returns Mapeo listo para usar
   */
  private prepareMarkerMapping(
    tasacion: TasacionData,
    marcadoresConfig: Record<string, string>
  ): Record<string, string> {
    const mapping: Record<string, string> = {};

    // Mapear campos de tasación a marcadores configurados
    for (const [marcador, campo] of Object.entries(marcadoresConfig)) {
      let valor = '';

      switch (campo.toLowerCase()) {
        case 'costas':
        case 'cuantiasiniva':
        case 'costas sin iva':
          valor = tasacion.costas.toFixed(2);
          break;
        case 'iva':
        case 'cuantiaconiva':
          valor = tasacion.iva.toFixed(2);
          break;
        case 'total':
          valor = tasacion.total.toFixed(2);
          break;
        case 'nombre cliente':
        case 'clienta':
          valor = tasacion.nombreCliente;
          break;
        case 'numero procedimiento':
        case 'numero de procedimiento':
          valor = tasacion.numeroProcedimiento;
          break;
        case 'nombre juzgado':
        case 'nombrejuzgado':
          valor = tasacion.nombreJuzgado;
          break;
        case 'entidad demandada':
        case 'entidaddemandada':
          valor = tasacion.entidadDemandada;
          break;
        case 'municipio':
          valor = tasacion.municipio;
          break;
        default:
          valor = 'SIN_VALOR';
      }

      mapping[marcador] = valor;
    }

    return mapping;
  }

  /**
   * Genera el nombre del archivo según el patrón del TASADOR V3
   * @param tasacion Datos de la tasación
   * @returns Nombre del archivo
   */
  private generateFileName(tasacion: TasacionData): string {
    const sufijo = tasacion.instancia === 'PRIMERA INSTANCIA' ? '_1ªINSTANCIA' : '_2ªINSTANCIA';

    // Sanitizar nombres para el archivo
    const cliente = tasacion.nombreCliente.replace(/[^a-zA-Z0-9]/g, '_');
    const entidad = tasacion.entidadDemandada.replace(/[^a-zA-Z0-9]/g, '_');
    const municipio = tasacion.municipio.replace(/[^a-zA-Z0-9]/g, '_');

    return `TC_${cliente}_VS_${entidad}_${municipio}${sufijo}.docx`;
  }

  /**
   * Genera un documento HTML reemplazando marcadores en la plantilla
   * @param htmlTemplate Plantilla HTML con marcadores
   * @param tasacion Datos de la tasación
   * @param marcadoresConfig Configuración de marcadores
   * @returns HTML generado con datos reemplazados
   */
  private generateHtmlDocument(
    htmlTemplate: string,
    tasacion: TasacionData,
    marcadoresConfig: Record<string, string>
  ): string {
    let html = htmlTemplate;

    // Preparar el mapeo de marcadores con los datos de la tasación
    const markerMapping = this.prepareMarkerMapping(tasacion, marcadoresConfig);

    // Generar fecha actual si no está especificada
    const fechaActual = tasacion.fecha || WordMarkerReplacer.generateCurrentDate();
    markerMapping['FECHA'] = fechaActual;

    // Reemplazar marcadores en el HTML (formato <<MARCADOR>>)
    Object.entries(markerMapping).forEach(([marker, value]) => {
      const regex = new RegExp(`<<${marker}>>`, 'gi');
      html = html.replace(regex, String(value));
    });

    return html;
  }

  /**
   * Valida que la configuración sea correcta
   * @returns true si es válida
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.primeraInstancia.plantilla) {
      errors.push('Falta configurar la plantilla para primera instancia');
    }

    if (!this.config.segundaInstancia.plantilla) {
      errors.push('Falta configurar la plantilla para segunda instancia');
    }

    if (Object.keys(this.config.primeraInstancia.marcadores).length === 0) {
      errors.push('Faltan marcadores configurados para primera instancia');
    }

    if (Object.keys(this.config.segundaInstancia.marcadores).length === 0) {
      errors.push('Faltan marcadores configurados para segunda instancia');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}