import { supabase } from '../../lib/supabase';

export class WordTemplateStorage {
  private static readonly BUCKET_NAME = 'word-templates';

  /**
   * Sube un archivo de plantilla Word al bucket
   * @param file Archivo a subir
   * @param instancia Instancia (primera/segunda)
   * @returns URL pública del archivo subido
   */
  static async uploadTemplate(
    file: File,
    instancia: 'primera' | 'segunda'
  ): Promise<string> {
    try {
      // Verificar autenticación del usuario personalizado
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Usuario no autenticado. Debe iniciar sesión para subir plantillas.');
      }

      let user;
      try {
        user = JSON.parse(userData);
      } catch (error) {
        localStorage.removeItem('user');
        throw new Error('Sesión inválida. Debe volver a iniciar sesión.');
      }

      // Verificar que el usuario tenga permisos (opcional, dependiendo de tu lógica de roles)
      if (!user.id || !user.email) {
        throw new Error('Usuario inválido. Debe volver a iniciar sesión.');
      }

      // Generar nombre único para el archivo
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Reemplazar caracteres especiales con _
        .replace(/\s+/g, '_') // Reemplazar espacios con _
        .toLowerCase(); // Convertir a minúsculas

      const fileName = `${instancia}-instancia-${Date.now()}-${sanitizedFileName}`;

      // Subir archivo al bucket
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Error al subir la plantilla: ${error.message}`);
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading template:', error);
      throw error;
    }
  }

  /**
   * Descarga un archivo de plantilla desde el bucket
   * @param url URL pública del archivo
   * @returns Blob del archivo
   */
  static async downloadTemplate(url: string): Promise<Blob> {
    try {
      console.debug('WordTemplateStorage: descargando plantilla', { url });
      
      const response = await fetch(url);
      
      console.debug('WordTemplateStorage: respuesta de descarga', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      console.debug('WordTemplateStorage: plantilla descargada exitosamente', {
        blobSize: blob.size,
        blobType: blob.type
      });

      return blob;
    } catch (error) {
      console.error('WordTemplateStorage: error descargando plantilla:', error);
      throw new Error(`Error al descargar la plantilla: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Elimina un archivo de plantilla del bucket
   * @param url URL del archivo a eliminar
   */
  static async deleteTemplate(url: string): Promise<void> {
    try {
      // Verificar autenticación del usuario personalizado
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Usuario no autenticado. Debe iniciar sesión para eliminar plantillas.');
      }

      // Extraer el nombre del archivo de la URL
      // La URL tiene el formato: https://.../word-templates/nombre-del-archivo
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Decodificar el nombre del archivo en caso de que tenga caracteres especiales
      const decodedFileName = decodeURIComponent(fileName);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([decodedFileName]);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Error al eliminar la plantilla: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Verifica si el bucket existe y está accesible
   * @returns true si el bucket está disponible
   */
  static async checkBucketAccess(): Promise<boolean> {
    try {
      // @ts-ignore
      const { data: _, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });

      if (error) {
        console.error('Supabase bucket access error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking bucket access:', error);
      return false;
    }
  }
}