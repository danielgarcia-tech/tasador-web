import { supabase } from '../lib/supabase'
import type { WordTemplateConfig } from './word';

/**
 * Servicio global de configuración de plantillas Word
 * Mantiene la configuración sincronizada entre componentes y la DB
 */
export class WordConfigService {
  private static listeners: Array<(config: WordTemplateConfig) => void> = [];
  private static currentConfig: WordTemplateConfig | null = null;

  /**
   * Carga la configuración desde la tabla `word_templates` en Supabase
   * Busca la entrada más reciente para cada instancia (primera/segunda)
   */
  static async loadFromDB(): Promise<WordTemplateConfig | null> {
    try {
      const { data: primeraData, error: primeraError } = await supabase
        .from('word_templates')
        .select('*')
        .eq('instancia', 'primera')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (primeraError) {
        console.warn('Error leyendo primera instancia de word_templates:', primeraError);
      }

      const { data: segundaData, error: segundaError } = await supabase
        .from('word_templates')
        .select('*')
        .eq('instancia', 'segunda')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (segundaError) {
        console.warn('Error leyendo segunda instancia de word_templates:', segundaError);
      }

      // Construir configuración completa
      const config: WordTemplateConfig = {
        primeraInstancia: {
          plantilla: null,
          plantillaUrl: primeraData?.plantilla_url || null,
          marcadores: primeraData?.marcadores || {
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
          plantillaUrl: segundaData?.plantilla_url || null,
          marcadores: segundaData?.marcadores || {
            "TOTAL CON IVA": "Total",
            "IVA": "IVA",
            "NOMBRE CLIENTE": "Nombre Cliente",
            "NUMERO DE PROCEDIMIENTO": "Número Procedimiento",
            "NOMBRE JUZGADO": "Nombre Juzgado",
            "ENTIDAD DEMANDADA": "Entidad Demandada",
            "COSTAS SIN IVA": "Costas"
          }
        }
      };

      this.currentConfig = config;
      return config;
    } catch (error) {
      console.error('Error cargando configuración desde DB:', error);
      return null;
    }
  }

  /**
   * Guarda o actualiza la configuración para una instancia en la DB
   */
  static async saveToDB(instancia: 'primera' | 'segunda', plantillaUrl: string, fileName: string, marcadores: Record<string, string>): Promise<boolean> {
    try {
      // Intentar update por instancia (si existe una fila actual, actualizamos la más reciente)
      const { data: existing, error: existingError } = await supabase
        .from('word_templates')
        .select('id')
        .eq('instancia', instancia)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingError) {
        console.warn('Error buscando entrada existente en word_templates:', existingError);
      }

      if (existing && existing.id) {
        const { error: updateError } = await supabase
          .from('word_templates')
          .update({ plantilla_url: plantillaUrl, file_name: fileName, marcadores })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error actualizando word_templates:', updateError);
          return false;
        }

        return true;
      }

      // Si no existe, insertar nueva fila
      const { error: insertError } = await supabase
        .from('word_templates')
        .insert({ instancia, plantilla_url: plantillaUrl, file_name: fileName, marcadores });

      if (insertError) {
        console.error('Error insertando en word_templates:', insertError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving to DB:', error);
      return false;
    }
  }

  /**
   * Obtiene la configuración actual (se mantiene compatibilidad con la versión previa que usa localStorage)
   */
  static getCurrentConfig(): WordTemplateConfig | null {
    if (this.currentConfig) {
      return this.currentConfig;
    }

    try {
      const savedConfig = localStorage.getItem('wordTemplateConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);

        // Crear configuración completa con valores por defecto
        const fullConfig: WordTemplateConfig = {
          primeraInstancia: {
            plantilla: null,
            plantillaUrl: parsedConfig.primeraInstancia?.plantillaUrl || null,
            marcadores: parsedConfig.primeraInstancia?.marcadores || {
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
            plantillaUrl: parsedConfig.segundaInstancia?.plantillaUrl || null,
            marcadores: parsedConfig.segundaInstancia?.marcadores || {
              "TOTAL CON IVA": "Total",
              "IVA": "IVA",
              "NOMBRE CLIENTE": "Nombre Cliente",
              "NUMERO DE PROCEDIMIENTO": "Número Procedimiento",
              "NOMBRE JUZGADO": "Nombre Juzgado",
              "ENTIDAD DEMANDADA": "Entidad Demandada",
              "COSTAS SIN IVA": "Costas"
            }
          }
        };

        this.currentConfig = fullConfig;
        return fullConfig;
      }
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
    }

    return null;
  }

  /**
   * Actualiza la configuración y notifica a todos los listeners
   */
  static updateConfig(config: WordTemplateConfig): void {
    this.currentConfig = config;

    // Guardar en localStorage (solo URLs y marcadores)
    const configToSave = {
      primeraInstancia: {
        marcadores: config.primeraInstancia.marcadores,
        plantillaUrl: config.primeraInstancia.plantillaUrl
      },
      segundaInstancia: {
        marcadores: config.segundaInstancia.marcadores,
        plantillaUrl: config.segundaInstancia.plantillaUrl
      }
    };

    localStorage.setItem('wordTemplateConfig', JSON.stringify(configToSave));

    // Notificar a todos los listeners
    this.notifyListeners(config);
  }

  /**
   * Suscribe un listener a cambios de configuración
   */
  static subscribe(listener: (config: WordTemplateConfig) => void): () => void {
    this.listeners.push(listener);

    // Enviar configuración actual al listener inmediatamente
    const currentConfig = this.getCurrentConfig();
    if (currentConfig) {
      listener(currentConfig);
    }

    // Retornar función de cancelación de suscripción
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifica a todos los listeners sobre cambios de configuración
   */
  private static notifyListeners(config: WordTemplateConfig): void {
    this.listeners.forEach(listener => {
      try {
        listener(config);
      } catch (error) {
        console.error('Error notificando listener:', error);
      }
    });
  }

  /**
   * Limpia el caché de configuración (fuerza recarga desde localStorage/DB)
   */
  static clearCache(): void {
    this.currentConfig = null;
  }

  /**
   * Verifica si la configuración actual es válida
   */
  static isConfigValid(config?: WordTemplateConfig): boolean {
    const configToCheck = config || this.getCurrentConfig();
    if (!configToCheck) return false;

    const hasFirstInstance = !!(configToCheck.primeraInstancia.plantillaUrl || configToCheck.primeraInstancia.plantilla);
    const hasSecondInstance = !!(configToCheck.segundaInstancia.plantillaUrl || configToCheck.segundaInstancia.plantilla);

    return hasFirstInstance || hasSecondInstance;
  }

  /**
   * Carga la plantilla HTML para una instancia desde la DB
   */
  static async loadHtmlTemplate(instancia: 'primera' | 'segunda'): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('html_templates')
        .select('html_content')
        .eq('instancia', instancia)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn(`Error leyendo HTML template para ${instancia}:`, error);
        return null;
      }

      return data?.html_content || null;
    } catch (error) {
      console.error(`Error cargando HTML template para ${instancia}:`, error);
      return null;
    }
  }

  /**
   * Guarda la plantilla HTML para una instancia en la DB
   */
  static async saveHtmlTemplate(instancia: 'primera' | 'segunda', htmlTemplate: string): Promise<boolean> {
    try {
      // Buscar entrada existente
      const { data: existing, error: existingError } = await supabase
        .from('html_templates')
        .select('id')
        .eq('instancia', instancia)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingError) {
        console.warn('Error buscando entrada existente para HTML template:', existingError);
      }

      if (existing && existing.id) {
        // Actualizar entrada existente
        const { error: updateError } = await supabase
          .from('html_templates')
          .update({ html_content: htmlTemplate })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error actualizando HTML template:', updateError);
          return false;
        }
      } else {
        // Crear nueva entrada
        const { error: insertError } = await supabase
          .from('html_templates')
          .insert({
            instancia,
            html_content: htmlTemplate
          });

        if (insertError) {
          console.error('Error insertando HTML template:', insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error guardando HTML template:', error);
      return false;
    }
  }

  /**
   * Obtiene el número de listeners activos (para debugging)
   */
  static getListenerCount(): number {
    return this.listeners.length;
  }
}