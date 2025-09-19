import createReport from 'docx-templates';

/**
 * Servicio para reemplazar marcadores en documentos Word
 */
export class WordMarkerReplacer {
  /**
   * Reemplaza marcadores en un documento Word con datos proporcionados
   * @param templateFile Archivo DOCX configurado como plantilla
   * @param markerMapping Mapeo de marcadores a valores para reemplazar
   * @param additionalData Datos adicionales como fecha
   * @returns Promise con el archivo Word generado con marcadores reemplazados
   */
  static async replaceMarkers(
    templateFile: File,
    markerMapping: Record<string, string>,
    additionalData: { fecha?: string } = {}
  ): Promise<Blob> {
    console.debug('WordMarkerReplacer: Iniciando proceso de reemplazo de marcadores en plantilla DOCX');
    console.debug('WordMarkerReplacer: Archivo plantilla', {
      name: templateFile.name,
      size: templateFile.size,
      type: templateFile.type
    });

    try {
      console.debug('WordMarkerReplacer: Procesando plantilla DOCX con docx-templates para preservar formato exacto');

      // Leer el archivo de plantilla DOCX
      const templateBuffer = await templateFile.arrayBuffer();

      // Convertir ArrayBuffer a Uint8Array para docx-templates
      const templateUint8Array = new Uint8Array(templateBuffer);

      // Preparar los datos para el reemplazo de marcadores
      const data = Object.fromEntries(
        Object.entries({ ...markerMapping, ...additionalData }).map(([key, value]) => [
          key,
          String(value ?? '')
        ])
      );

      console.debug('WordMarkerReplacer: Marcadores preparados para reemplazo', {
        templateFileName: templateFile.name,
        templateFileSize: templateFile.size,
        markerCount: Object.keys(data).length,
        markers: Object.keys(data),
        sampleData: Object.fromEntries(Object.entries(data).slice(0, 3))
      });

      // Reemplazar marcadores en la plantilla manteniendo el formato exacto
      const reportBuffer = await createReport({
        template: templateUint8Array,
        data: data,
        cmdDelimiter: ['<<', '>>'], // Delimitadores estándar: <<MARCADOR>>
        failFast: false, // No fallar al primer error
        noSandbox: false, // Usar sandbox por seguridad
      });

      // Generar el documento Word final
      const resultBlob = new Blob([new Uint8Array(reportBuffer)], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      console.debug('WordMarkerReplacer: Documento Word generado exitosamente', {
        originalSize: templateBuffer.byteLength,
        resultSize: resultBlob.size,
        formato: 'DOCX preservado'
      });

      return resultBlob;

    } catch (error) {
      console.error('WordMarkerReplacer: ERROR en docx-templates:', error);
      console.error('WordMarkerReplacer: Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        templateFile: templateFile.name,
        templateSize: templateFile.size,
        markerCount: Object.keys(markerMapping).length
      });

      // IMPORTANTE: Si falla docx-templates, algo está mal con la plantilla
      // No usar fallbacks que generen documentos básicos
      throw new Error(`Error procesando la plantilla Word: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera la fecha actual en formato español
   * @returns Fecha en formato "día de mes de año"
   */
  static generateCurrentDate(): string {
    const now = new Date();
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    return `${day} de ${month} de ${year}`;
  }
}