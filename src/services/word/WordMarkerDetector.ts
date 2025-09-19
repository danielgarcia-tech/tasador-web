import mammoth from 'mammoth';

/**
 * Servicio para detectar marcadores en plantillas Word
 */
export class WordMarkerDetector {
  /**
   * Detecta marcadores (<<MARCADOR>>) en un archivo Word
   * @param file Archivo Word a analizar
   * @returns Promise con lista de marcadores encontrados
   */
  static async detectMarkers(file: File): Promise<string[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });

      const text = result.value;
      const markers = new Set<string>();

      // Buscar patrones <<MARCADOR>>
      const markerRegex = /<<([^>>]+)>>/g;
      let match;

      while ((match = markerRegex.exec(text)) !== null) {
        const marker = match[1].toUpperCase();
        // Excluir marcadores especiales como FECHA
        if (marker !== 'FECHA') {
          markers.add(marker);
        }
      }

      return Array.from(markers).sort();
    } catch (error) {
      console.error('Error detectando marcadores:', error);
      throw new Error('No se pudieron detectar los marcadores en el archivo Word');
    }
  }

  /**
   * Valida si un archivo es un documento Word válido
   * @param file Archivo a validar
   * @returns true si es válido
   */
  static isValidWordFile(file: File): boolean {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    const validExtensions = ['.docx', '.doc'];

    return validTypes.includes(file.type) ||
           validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  }
}