/**
 * Servicio de caché para plantillas Word
 * Mantiene las plantillas descargadas en memoria para evitar re-descargas constantes
 */
export class WordTemplateCache {
  private static cache = new Map<string, File>();
  private static urlToFileName = new Map<string, string>();

  /**
   * Obtiene una plantilla del caché
   * @param url URL de la plantilla
   * @returns File de la plantilla o null si no está en caché
   */
  static get(url: string): File | null {
    return this.cache.get(url) || null;
  }

  /**
   * Almacena una plantilla en el caché
   * @param url URL de la plantilla
   * @param file Archivo de la plantilla
   * @param fileName Nombre original del archivo (opcional)
   */
  static set(url: string, file: File, fileName?: string): void {
    this.cache.set(url, file);
    if (fileName) {
      this.urlToFileName.set(url, fileName);
    }
  }

  /**
   * Obtiene el nombre de archivo original para una URL
   * @param url URL de la plantilla
   * @returns Nombre del archivo o null si no está disponible
   */
  static getFileName(url: string): string | null {
    return this.urlToFileName.get(url) || null;
  }

  /**
   * Verifica si una plantilla está en caché
   * @param url URL de la plantilla
   * @returns true si está en caché, false en caso contrario
   */
  static has(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Elimina una plantilla del caché
   * @param url URL de la plantilla
   */
  static remove(url: string): void {
    this.cache.delete(url);
    this.urlToFileName.delete(url);
  }

  /**
   * Limpia todo el caché
   */
  static clear(): void {
    this.cache.clear();
    this.urlToFileName.clear();
  }

  /**
   * Obtiene el tamaño actual del caché
   * @returns Número de plantillas en caché
   */
  static size(): number {
    return this.cache.size;
  }

  /**
   * Obtiene una lista de todas las URLs en caché
   * @returns Array de URLs
   */
  static getUrls(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Extrae el nombre de archivo de una URL de Supabase
   * @param url URL de la plantilla
   * @param fallback Nombre de fallback si no se puede extraer
   * @returns Nombre del archivo
   */
  static extractFileNameFromUrl(url: string, fallback: string): string {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const decodedFileName = decodeURIComponent(fileName);
      const nameParts = decodedFileName.split('-');
      if (nameParts.length >= 4) {
        const originalName = nameParts.slice(3).join('-');
        return originalName.length > 0 ? originalName : fallback;
      }
      return decodedFileName;
    } catch {
      return fallback;
    }
  }
}