import { useState, useMemo } from 'react'
import { BookOpen, Download, ExternalLink, Search, Calculator, History, HelpCircle, Zap } from 'lucide-react'

interface Section {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  content: string
  subsections?: Subsection[]
}

interface Subsection {
  id: string
  title: string
  content: string
}

const sections: Section[] = [
  {
    id: 'intro',
    title: 'Introducción',
    icon: <BookOpen className="h-5 w-5" />,
    description: 'Bienvenido al sistema de tasación del Departamento de Ejecuciones y Tasaciones',
    content: `
      <h3>Bienvenido a TASADOR COSTAS</h3>
      <p><strong>TASADOR COSTAS</strong> es la herramienta oficial del <strong>Departamento de Ejecuciones y Tasaciones de RUA Abogados</strong> para la gestión profesional de tasaciones de costas judiciales.</p>
      
      <h3>Funcionalidades principales</h3>
      <ul>
        <li>Cálculo automático de <strong>costas judiciales</strong> conforme a los <em>Baremos de Honorarios</em> oficiales por comunidad autónoma y municipio</li>
        <li>Cálculo preciso de <strong>intereses legales</strong> y <strong>judiciales</strong> con tipos vigentes actualizados</li>
        <li>Generación de <strong>informes profesionales</strong> descargables en <span class="pill">PDF</span> y <span class="pill">Excel</span> listos para presentación judicial</li>
        <li>Historial completo de tasaciones con búsqueda avanzada y estadísticas</li>
        <li>Consulta de baremos oficiales con chatbot inteligente potenciado por ChatGPT</li>
      </ul>
      
      <div class="callout">
        💡 <strong>Importante:</strong> El sistema aplica automáticamente los <strong>Baremos de Honorarios</strong> vigentes en función del municipio seleccionado, garantizando precisión y conformidad legal en cada tasación.
      </div>
      
      <h3>Soporte técnico</h3>
      <p>Para reportar problemas técnicos, errores o sugerencias de mejora, utiliza nuestro formulario oficial:</p>
      <p>
        <a href="https://justiflow.com/form/reportetasador" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          🔗 Formulario de Reporte de Problemas
        </a>
      </p>
    `
  },
  {
    id: 'tasaciones',
    title: 'Tasaciones de Costas',
    icon: <Calculator className="h-5 w-5" />,
    description: 'Cómo crear y gestionar tasaciones de costas judiciales profesionales',
    content: `
      <h3>¿Qué es una tasación de costas?</h3>
      <p>Una tasación de costas es el cálculo detallado y fundamentado de los <strong>gastos procesales</strong> generados en un procedimiento judicial, incluyendo:</p>
      <ul>
        <li><strong>Honorarios de abogado</strong> según los Baremos oficiales del colegio correspondiente</li>
        <li><strong>Derechos de procurador</strong> conforme a la normativa vigente</li>
        <li><strong>Gastos y suplidos</strong> del procedimiento (tasas, notificaciones, etc.)</li>
        <li><strong>Fase procesal</strong> en la que finaliza el procedimiento (Audiencia Previa, Sentencia, etc.)</li>
        <li><strong>Instancia</strong> judicial (Primera o Segunda)</li>
      </ul>
      
      <div class="callout">
        ⚖️ <strong>Importante para RUA Abogados:</strong> Todas las tasaciones se calculan automáticamente aplicando los baremos oficiales vigentes, asegurando conformidad legal y precisión en cada cálculo.
      </div>
    `,
    subsections: [
      {
        id: 'crear-tasacion',
        title: 'Crear una nueva tasación',
        content: `
          <h4>Paso 1 · Acceder al módulo de tasaciones</h4>
          <ul>
            <li>Haz clic en la pestaña <strong>TASADOR COSTAS</strong> del menú principal</li>
            <li>Se mostrará el formulario de nueva tasación con todos los campos necesarios</li>
          </ul>

          <h4>Paso 2 · Datos del expediente y cliente</h4>
          <table>
            <thead><tr><th>Campo</th><th>Descripción</th><th>Ejemplo</th></tr></thead>
            <tbody>
              <tr><td><strong>Nombre cliente</strong></td><td>Nombre completo de la parte solicitante</td><td>Juan García López</td></tr>
              <tr><td><strong>Nº procedimiento</strong></td><td>Número de expediente judicial</td><td>PO 234/2024</td></tr>
              <tr><td><strong>Nombre juzgado</strong></td><td>Órgano judicial competente (opcional)</td><td>Juzgado de lo Civil nº 3 de Madrid</td></tr>
              <tr><td><strong>Entidad demandada</strong></td><td>Parte contraria (con autocompletado)</td><td>Banco Santander, AEPD, etc.</td></tr>
            </tbody>
          </table>

          <h4>Paso 3 · Configuración del procedimiento</h4>
          <table>
            <thead><tr><th>Campo</th><th>Descripción</th><th>Ejemplo</th></tr></thead>
            <tbody>
              <tr><td><strong>Municipio</strong></td><td>Localidad del juzgado (determina el baremo aplicable)</td><td>Madrid, Barcelona, Valencia</td></tr>
              <tr><td><strong>Tipo procedimiento</strong></td><td>Clase de juicio</td><td>Juicio Verbal / Juicio Ordinario</td></tr>
              <tr><td><strong>Fase de terminación</strong></td><td>Momento procesal en que finaliza</td><td>Audiencia Previa, Sentencia, Recurso</td></tr>
              <tr><td><strong>Instancia</strong></td><td>Nivel de la jurisdicción</td><td>Primera Instancia / Segunda Instancia</td></tr>
            </tbody>
          </table>
          
          <div class="callout">
            ⚠️ <strong>Importante:</strong> La selección del <strong>municipio</strong> es crítica, ya que determina qué baremo oficial de honorarios se aplicará en el cálculo. Verifica siempre que coincida con el juzgado competente.
          </div>

          <h4>Paso 4 · Generar la tasación</h4>
          <ol>
            <li>Revisa cuidadosamente todos los datos introducidos</li>
            <li>Haz clic en el botón <strong>Generar tasación</strong></li>
            <li>El sistema calculará automáticamente:
              <ul>
                <li><strong>Honorarios sin IVA</strong> según baremo oficial</li>
                <li><strong>IVA (21%)</strong> sobre los honorarios</li>
                <li><strong>Total de la tasación</strong></li>
              </ul>
            </li>
            <li>La tasación se guardará automáticamente en el historial para futuras consultas</li>
          </ol>
        `
      },
      {
        id: 'tablas-costas-fecha',
        title: 'Tablas de costas por fecha de demanda',
        content: `
          <h4>¿Por qué existen diferentes tablas de costas?</h4>
          <p>Debido a la <strong>Ley 10/2023, de 6 de diciembre</strong>, que modifica la cuantía indeterminada incrementándola de <strong>18.000€ a 24.000€</strong>, el sistema utiliza <strong>dos tablas diferentes</strong> de costas judiciales según la fecha de presentación de la demanda.</p>

          <div class="callout">
            📅 <strong>Fecha de corte: 3 de abril de 2025</strong>
          </div>

          <h4>Selección automática de tabla</h4>
          <table>
            <thead><tr><th>Fecha de Demanda</th><th>Tabla Aplicada</th><th>Cuantía Indeterminada</th></tr></thead>
            <tbody>
              <tr><td><strong>📅 Anterior al 3 de abril de 2025</strong></td><td><strong>18k (pre-2025)</strong></td><td>18.000€</td></tr>
              <tr><td><strong>📅 Posterior al 3 de abril de 2025</strong></td><td><strong>24k (2025+)</strong></td><td>24.000€</td></tr>
            </tbody>
          </table>

          <h4>¿Cómo funciona?</h4>
          <ol>
            <li><strong>Campo obligatorio:</strong> Introduce la fecha exacta de presentación de la demanda en el campo "Fecha de Demanda"</li>
            <li><strong>Selección automática:</strong> El sistema compara la fecha con el 3 de abril de 2025</li>
            <li><strong>Tabla aplicada:</strong> Se utiliza automáticamente la tabla correspondiente (18k o 24k)</li>
            <li><strong>Indicador visual:</strong> En el resumen de cálculo verás claramente qué tabla se aplicó</li>
          </ol>

          <h4>Ejemplos prácticos</h4>
          <div class="example">
            <strong>📅 Demanda del 15 de marzo de 2025:</strong><br>
            → Se aplica tabla <strong>18k</strong> (fecha anterior al 3 de abril)<br>
            → Cuantía indeterminada: <strong>18.000€</strong>
          </div>
          
          <div class="example">
            <strong>📅 Demanda del 10 de abril de 2025:</strong><br>
            → Se aplica tabla <strong>24k</strong> (fecha posterior al 3 de abril)<br>
            → Cuantía indeterminada: <strong>24.000€</strong>
          </div>

          <h4>¿Dónde veo qué tabla se aplicó?</h4>
          <ul>
            <li><strong>En el resumen de tasación:</strong> Aparece "💼 Tipo de costas aplicadas: 18k (pre-2025)" o "24k (2025+)"</li>
            <li><strong>En el historial:</strong> Columna "Tipo Costas" muestra la tabla utilizada</li>
          </ul>

          <div class="callout warning">
            ⚠️ <strong>Importante:</strong> Es fundamental introducir la fecha exacta de la demanda, ya que las cuantías pueden variar significativamente entre tablas y afecta directamente al resultado final de la tasación.
          </div>

          <div class="callout">
            💡 <strong>Si no introduces fecha:</strong> El sistema asume tabla 18k por defecto y se mostrará como "18k (Sin fecha)" en el historial. Recomendamos siempre especificar la fecha para máxima precisión.
          </div>
        `
      },
      {
        id: 'exportar-tasacion',
        title: 'Exportar y compartir tasaciones',
        content: `
          <h4>Formatos de exportación disponibles</h4>
          <ul>
            <li><strong>PDF Profesional:</strong> Informe completo con formato oficial, membrete y todos los cálculos detallados, listo para presentación judicial</li>
            <li><strong>Excel Detallado:</strong> Datos tabulares con todas las partidas desglosadas, ideal para análisis interno y auditoría</li>
          </ul>
          
          <h4>Uso en el departamento</h4>
          <p>Los informes generados están listos para:</p>
          <ul>
            <li>Presentación ante tribunales y juzgados</li>
            <li>Envío a clientes como justificante de costas</li>
            <li>Archivo en el expediente del cliente</li>
            <li>Auditoría interna del departamento</li>
          </ul>
          
          <div class="callout">
            📊 <strong>Recomendación:</strong> Genera siempre ambos formatos (PDF + Excel) para cada tasación: el PDF para presentación oficial y el Excel para revisión interna y trazabilidad.
          </div>
        `
      }
    ]
  },
  {
    id: 'consultar-baremos',
    title: 'Consultar Baremos de Honorarios',
    icon: <BookOpen className="h-5 w-5" />,
    description: 'Acceso a baremos oficiales por comunidad autónoma y municipio',
    content: `
      <h3>Baremos de Honorarios Oficiales</h3>
      <p>Los <strong>Baremos de Honorarios</strong> son las tablas oficiales aprobadas por los colegios profesionales que regulan los honorarios mínimos y orientativos de abogados, procuradores y graduados sociales en cada demarcación territorial.</p>

      <h3>¿Por qué son importantes?</h3>
      <ul>
        <li><strong>Fundamentación legal:</strong> Toda tasación de costas debe basarse en los baremos oficiales vigentes</li>
        <li><strong>Precisión territorial:</strong> Cada colegio profesional puede tener baremos diferentes</li>
        <li><strong>Actualización normativa:</strong> Los baremos se actualizan periódicamente y deben consultarse en su versión vigente</li>
        <li><strong>Defensa ante tribunales:</strong> Las tasaciones deben poder justificarse con los documentos oficiales</li>
      </ul>

      <h3>Funcionalidades del módulo</h3>
      <ul>
        <li><strong>Consulta organizada:</strong> Baremos clasificados por Comunidad Autónoma y municipio/demarcación</li>
        <li><strong>Documentos oficiales:</strong> Acceso directo a PDFs y documentación oficial de cada colegio</li>
        <li><strong>Búsqueda rápida:</strong> Localiza baremos específicos mediante el buscador integrado</li>
        <li><strong>Chatbot inteligente:</strong> Asistente con IA (ChatGPT) especializado en interpretación de baremos</li>
        <li><strong>Integración automática:</strong> Los baremos consultados se aplican automáticamente en las tasaciones</li>
      </ul>

      <div class="callout">
        📋 <strong>Para el equipo de RUA Abogados:</strong> Es fundamental verificar que el baremo consultado corresponda exactamente al municipio del juzgado competente. En caso de duda, consulta con el chatbot o contacta con soporte técnico.
      </div>
    `,
    subsections: [
      {
        id: 'navegacion-baremos',
        title: 'Cómo navegar por los baremos',
        content: `
          <h4>Paso 1 · Seleccionar Comunidad Autónoma</h4>
          <p>Elige la comunidad autónoma correspondiente al territorio donde se desarrolla el procedimiento judicial.</p>

          <h4>Paso 2 · Elegir municipio o demarcación</h4>
          <p>Selecciona el municipio específico o la demarcación territorial aplicable.</p>

          <h4>Paso 3 · Consultar documentos</h4>
          <p>Accede a los documentos oficiales disponibles para esa jurisdicción.</p>
        `
      },
      {
        id: 'actualizaciones-baremos',
        title: 'Últimas actualizaciones y mejoras',
        content: `
          <h4>🆕 Separación de Ceuta y Melilla</h4>
          <p>Se han separado las ciudades autónomas de <strong>Ceuta</strong> y <strong>Melilla</strong> en entradas independientes, permitiendo una consulta más precisa y específica para cada territorio.</p>
          <ul>
            <li><strong>Ceuta:</strong> Acceso directo a baremos específicos de Ceuta</li>
            <li><strong>Melilla:</strong> Documentación propia de Melilla con criterios actualizados</li>
          </ul>

          <h4>🆕 Incorporación de Castilla-La Mancha GENERAL</h4>
          <p>Se ha añadido una nueva categoría <strong>GENERAL</strong> para Castilla-La Mancha, complementando la información específica de Guadalajara con criterios aplicables a toda la comunidad autónoma.</p>
          <ul>
            <li><strong>Guadalajara:</strong> Baremos específicos del partido judicial</li>
            <li><strong>GENERAL:</strong> Criterios aplicables a toda Castilla-La Mancha</li>
          </ul>

          <h4>🔧 Mejoras técnicas</h4>
          <ul>
            <li>Mejor organización de la estructura de archivos</li>
            <li>Optimización de la navegación entre comunidades</li>
            <li>Actualización de enlaces y referencias documentales</li>
          </ul>
        `
      },
      {
        id: 'uso-baremos-tasaciones',
        title: 'Uso en tasaciones de costas',
        content: `
          <h4>Integración automática</h4>
          <p>Los baremos consultados se aplican automáticamente en el cálculo de tasaciones, asegurando:</p>
          <ul>
            <li><strong>Precisión legal:</strong> Aplicación correcta de cuantías según normativa</li>
            <li><strong>Actualización constante:</strong> Baremos siempre vigentes</li>
            <li><strong>Consistencia:</strong> Misma fuente documental para consulta y cálculo</li>
          </ul>

          <h4>Referencias cruzadas</h4>
          <p>Cada tasación incluye referencias a los baremos aplicados, facilitando la justificación y verificación de los cálculos realizados.</p>
        `
      },
      {
        id: 'chatbot-baremos',
        title: 'Chatbot inteligente de baremos',
        content: `
          <h4>🤖 Asistente especializado con ChatGPT</h4>
          <p>El módulo de consulta de baremos integra un <strong>chatbot inteligente</strong> potenciado por <strong>ChatGPT de OpenAI</strong>, específicamente entrenado para interpretar y consultar baremos de honorarios de toda España.</p>

          <h4>¿Qué puede hacer el chatbot?</h4>
          <ul>
            <li><strong>Consultas específicas:</strong> Pregunta sobre honorarios concretos por cuantía, fase procesal o municipio</li>
            <li><strong>Comparaciones territoriales:</strong> Analiza diferencias entre baremos de distintas comunidades autónomas</li>
            <li><strong>Interpretación de criterios:</strong> Explica cómo aplicar las tablas de honorarios en casos complejos</li>
            <li><strong>Actualización normativa:</strong> Información sobre cambios recientes en los baremos</li>
            <li><strong>Casos prácticos:</strong> Ejemplos de aplicación en situaciones reales del departamento</li>
          </ul>

          <h4>Cómo utilizar el chatbot eficazmente</h4>
          <ol>
            <li>Accede al módulo <strong>"CONSULTAR BAREMOS"</strong></li>
            <li>Localiza el panel del chatbot en la interfaz principal</li>
            <li>Formula tu pregunta de manera clara y específica, incluyendo:
              <ul>
                <li>Comunidad autónoma y/o municipio</li>
                <li>Tipo de procedimiento (verbal/ordinario)</li>
                <li>Cuantía aproximada (si aplica)</li>
                <li>Fase procesal de interés</li>
              </ul>
            </li>
            <li>El asistente responderá basándose en los documentos oficiales cargados en el sistema</li>
          </ol>

          <div class="callout">
            💡 <strong>Ejemplo de consulta efectiva:</strong> "¿Cuál es el honorario de abogado para un juicio ordinario de 15.000€ que termina en sentencia en primera instancia en Madrid?"
          </div>

          <h4>Tecnología y precisión</h4>
          <p>El chatbot utiliza modelos avanzados de lenguaje natural (GPT-4) de OpenAI, combinados con una base de conocimientos especializada que contiene todos los baremos oficiales actualizados de los colegios de abogados de España. Esto garantiza respuestas precisas, contextualizadas y alineadas con la normativa vigente.</p>
          
          <h4>Limitaciones y recomendaciones</h4>
          <ul>
            <li>El chatbot es una herramienta de <strong>consulta orientativa</strong></li>
            <li>Para tasaciones oficiales, siempre revisa el documento oficial del baremo correspondiente</li>
            <li>En caso de discrepancia, prevalece el documento oficial del colegio profesional</li>
            <li>Para consultas muy específicas o complejas, contacta con el soporte técnico del departamento</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'interes-simple',
    title: 'Cálculo de Interés Legal',
    icon: <Zap className="h-5 w-5" />,
    description: 'Calcula intereses legales y judiciales para un período específico',
    content: `
      <h3>¿Para qué sirve este módulo?</h3>
      <p>El módulo de <strong>Cálculo de Interés Legal</strong> permite calcular de forma precisa los intereses aplicables a una deuda o cantidad principal durante un período determinado, aplicando los tipos de interés legal vigentes en cada año.</p>

      <h3>Tipos de interés calculables</h3>
      <ul>
        <li><strong>Interés Legal del Dinero:</strong> Establecido anualmente por la Ley de Presupuestos Generales del Estado (art. 576 LEC)</li>
        <li><strong>Interés de Demora Tributario:</strong> Aplicable a deudas con la Administración Pública</li>
        <li><strong>Interés Judicial:</strong> Tipo aplicado por los tribunales en ejecución de sentencias (normalmente interés legal + 2 puntos)</li>
        <li><strong>TAE (Tasa Anual Equivalente):</strong> Para cálculos financieros específicos</li>
        <li><strong>TAE + 5%:</strong> Variante especial aplicable en algunos contratos</li>
      </ul>
      
      <h3>Características del sistema</h3>
      <ul>
        <li><strong>Cálculo automático por tramos:</strong> El sistema divide automáticamente el período en años y aplica el tipo vigente en cada año</li>
        <li><strong>Actualización de tipos:</strong> Los tipos de interés legal se actualizan automáticamente cada ejercicio fiscal</li>
        <li><strong>Precisión legal:</strong> Cálculos conformes a la normativa procesal civil española</li>
        <li><strong>Informe detallado:</strong> Desglose completo por años y conceptos</li>
      </ul>

      <div class="callout">
        ⚖️ <strong>Importante:</strong> Este módulo es ideal para cálculos individuales. Para procesar múltiples cálculos simultáneamente, utiliza el módulo de <strong>Cálculo de Interés Avanzado</strong> (importación Excel).
      </div>
    `,
    subsections: [
      {
        id: 'configurar-interes-simple',
        title: 'Configurar el cálculo',
        content: `
          <h4>Datos necesarios</h4>
          <table>
            <thead><tr><th>Campo</th><th>Descripción</th><th>Ejemplo</th></tr></thead>
            <tbody>
              <tr><td><strong>Cuantía principal</strong></td><td>Importe sobre el que se calcularán los intereses</td><td>10.000,00 €</td></tr>
              <tr><td><strong>Fecha de inicio</strong></td><td>Fecha desde la que se devengan intereses</td><td>05/08/2021</td></tr>
              <tr><td><strong>Fecha de fin</strong></td><td>Fecha hasta la que se calculan intereses (puede ser hoy)</td><td>27/10/2025</td></tr>
              <tr><td><strong>Tipo de interés</strong></td><td>Modalidad aplicable (Legal, Judicial, TAE, etc.)</td><td>Interés Legal del Dinero</td></tr>
            </tbody>
          </table>
          
          <h4>Proceso de cálculo</h4>
          <ol>
            <li>Introduce todos los datos requeridos en el formulario</li>
            <li>Haz clic en <strong>Calcular Interés</strong></li>
            <li>El sistema:
              <ul>
                <li>Divide el período en tramos anuales automáticamente</li>
                <li>Aplica el tipo de interés vigente en cada año</li>
                <li>Suma todos los intereses devengados</li>
                <li>Presenta un desglose detallado por años</li>
              </ul>
            </li>
            <li>Revisa el resultado y descarga el informe en PDF o Excel</li>
          </ol>
          
          <div class="callout">
            💡 <strong>Consejo para el departamento:</strong> Siempre especifica la fecha de fin como "hoy" si el cálculo es para una ejecución en curso, así obtendrás el importe actualizado a fecha actual.
          </div>
        `
      },
      {
        id: 'ejemplos-interes',
        title: 'Ejemplos y fórmulas de cálculo de interés',
        content: `
          <h4>Ejemplo de Cálculo de Interés Legal</h4>
          <p><strong>Supuesto:</strong> Cuantía de 10.000€, período del 01/01/2023 al 01/01/2024, interés legal del 3,25%.</p>
          <pre>
Interés = Cuantía × (Interés legal anual / 100) × (Días / 365)
Interés = 10.000 × (3,25 / 100) × (366 / 365) = 325,34€
          </pre>

          <h4>Ejemplo de Cálculo de Interés Legal en varios años</h4>
          <p><strong>Supuesto:</strong> Cuantía de 10.000€, período del 05/08/2021 al 27/10/2025. El interés legal puede variar cada año:</p>
          <pre>
Cálculo por tramos anuales:
- 2021 (05/08/2021 a 31/12/2021): Interés legal 3,00%
- 2022 (01/01/2022 a 31/12/2022): Interés legal 3,00%
- 2023 (01/01/2023 a 31/12/2023): Interés legal 3,25%
- 2024 (01/01/2024 a 31/12/2024): Interés legal 3,25%
- 2025 (01/01/2025 a 27/10/2025): Interés legal 3,25%

Para cada tramo:
Interés = Cuantía × (Interés legal anual / 100) × (Días del tramo / 365)

Ejemplo de cálculo:
- 2021: 10.000 × (3,00 / 100) × (149 / 365) = 122,05€
- 2022: 10.000 × (3,00 / 100) × (365 / 365) = 300,00€
- 2023: 10.000 × (3,25 / 100) × (365 / 365) = 325,00€
- 2024: 10.000 × (3,25 / 100) × (366 / 365) = 326,58€
- 2025: 10.000 × (3,25 / 100) × (299 / 365) = 266,16€

Total interés: 1.339,79€
          </pre>

          <h4>Interés Judicial</h4>
          <p>Si la sentencia se dicta el 01/04/2025 y la deuda no se paga, se aplica el <strong>interés judicial</strong> desde esa fecha hasta el pago efectivo. El interés judicial es normalmente el <strong>interés legal del dinero incrementado en 2 puntos porcentuales</strong> (por ejemplo, si el interés legal es 3,25%, el judicial sería 5,25%).</p>
          <pre>
Supuesto: Sentencia dictada el 01/04/2025, cuantía de 10.000€
Interés judicial aplicable: 5,25% (3,25% legal + 2 puntos)

Interés judicial desde 01/04/2025 hasta 27/10/2025 (210 días):
Interés = 10.000 × (5,25 / 100) × (210 / 365) = 302,74€
          </pre>

          <h4>Aplicación práctica en RUA Abogados</h4>
          <ul>
            <li><strong>Ejecuciones de sentencia:</strong> Calcula el interés judicial desde la fecha de la sentencia hasta el cobro efectivo</li>
            <li><strong>Reclamaciones previas:</strong> Aplica el interés legal desde la fecha del hecho causante hasta la presentación de la demanda</li>
            <li><strong>Actualización periódica:</strong> Recalcula los intereses periódicamente para mantener actualizado el saldo deudor</li>
          </ul>

          <h4>Notas técnicas</h4>
          <ul>
            <li>El sistema calcula automáticamente los tramos anuales y aplica el tipo de interés legal vigente en cada año.</li>
            <li>El interés judicial se aplica desde la fecha de la sentencia si la deuda no se paga, con el tipo correspondiente.</li>
            <li>Todos los cálculos se basan en la normativa vigente y los valores oficiales de interés legal y judicial.</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'interes-avanzado',
    title: 'Cálculo de Interés Avanzado (Lotes)',
    icon: <Calculator className="h-5 w-5" />,
    description: 'Procesa múltiples cálculos de interés simultáneamente desde archivos Excel',
    content: `
      <h3>Procesamiento masivo de cálculos</h3>
      <p>El módulo de <strong>Cálculo de Interés Avanzado</strong> permite al Departamento de Ejecuciones y Tasaciones procesar <strong>múltiples casos simultáneamente</strong> mediante importación de datos estructurados desde archivos Excel.</p>

      <h3>¿Cuándo utilizar este módulo?</h3>
      <ul>
        <li>Cuando necesitas calcular intereses para <strong>varios expedientes a la vez</strong></li>
        <li>Para <strong>liquidaciones masivas</strong> de procedimientos de ejecución</li>
        <li>Cuando los cálculos requieren <strong>diferentes cuantías, fechas y tipos de interés</strong> para cada caso</li>
        <li>Para generar <strong>informes consolidados</strong> de múltiples expedientes</li>
      </ul>

      <h3>Características del procesamiento por lotes</h3>
      <ul>
        <li><strong>Importación desde Excel:</strong> Carga masiva de datos estructurados en formato tabla</li>
        <li><strong>Cálculo automático:</strong> Procesa todos los casos de forma simultánea y precisa</li>
        <li><strong>Informes personalizables:</strong> Genera documentos con el formato y membrete de RUA Abogados</li>
        <li><strong>Exportación múltiple:</strong> Descarga resultados en PDF profesional y Excel detallado</li>
        <li><strong>Trazabilidad completa:</strong> Cada cálculo incluye el desglose por años y tipos aplicados</li>
      </ul>

      <div class="callout">
        🚀 <strong>Ventaja para el departamento:</strong> Este módulo reduce drásticamente el tiempo de procesamiento de liquidaciones masivas, permitiendo gestionar decenas de expedientes en minutos en lugar de horas.
      </div>
    `,
    subsections: [
      {
        id: 'formato-excel',
        title: 'Formato del archivo Excel',
        content: `
          <h4>Estructura requerida del archivo</h4>
          <p>El archivo Excel debe contener las siguientes columnas:</p>
          
          <ul>
            <li><strong>FECHA_INICIO (obligatoria):</strong> Fecha de inicio del devengo (formato DD/MM/AAAA)</li>
            <li><strong>Columnas de CUANTIA (obligatorias):</strong> Puedes tener múltiples columnas con nombres como CUANTIA, CONCEPTO1_MONTO, CONCEPTO2_MONTO, etc. El sistema procesará cada columna de forma independiente</li>
            <li><strong>CONCEPTO (opcional):</strong> Descripción del movimiento o concepto</li>
          </ul>

          <h4>Concepto clave: Cada fila = un movimiento independiente</h4>
          <p>El sistema interpreta <strong>cada fila del Excel como un movimiento independiente</strong>. Si tienes múltiples columnas de cuantía (ej: CONCEPTO1_MONTO, CONCEPTO2_MONTO), el sistema creará un cálculo de intereses para cada columna, pero siempre dentro del mismo período (FECHA_INICIO a FECHA_FIN).</p>

          <h4>Ejemplo de estructura correcta con múltiples cuantías</h4>
          <pre>
| FECHA_INICIO | CONCEPTO1_MONTO | CONCEPTO2_MONTO | FECHA_FIN  | CONCEPTO              |
|--------------|-----------------|-----------------|------------|----------------------|
| 05/08/2021   | 10000.00        | 5500.00         | 27/10/2025 | Procedimiento civil   |
| 01/01/2023   | 7200.00         | 3000.50         | 31/12/2024 | Procedimiento penal   |
          </pre>

          <h4>Validaciones automáticas</h4>
          <ul>
            <li>✅ Formato correcto de fechas (DD/MM/AAAA)</li>
            <li>✅ Cuantías numéricas válidas (sin símbolos de moneda €, sin separadores de miles)</li>
            <li>✅ Presencia de la columna FECHA_INICIO</li>
          </ul>

          <div class="callout">
            💡 <strong>Tip:</strong> Usa el punto (.) como separador decimal en las cuantías. El sistema generará un resultado de cálculo para cada columna de cuantía detectada, permitiendo análisis por concepto.
          </div>
        `
      },
      {
        id: 'personalizar-reporte',
        title: 'Personalizar informes de lotes',
        content: `
          <h4>Opciones de personalización disponibles</h4>
          <p>Antes de generar el informe consolidado, puedes personalizar los siguientes elementos:</p>
          
          <table>
            <thead><tr><th>Elemento</th><th>Descripción</th><th>Uso recomendado</th></tr></thead>
            <tbody>
              <tr>
                <td><strong>Título del informe</strong></td>
                <td>Encabezado principal del documento</td>
                <td>"Liquidación de Intereses - Expedientes Octubre 2025"</td>
              </tr>
              <tr>
                <td><strong>Subtítulo</strong></td>
                <td>Texto complementario bajo el título</td>
                <td>"Departamento de Ejecuciones - RUA Abogados"</td>
              </tr>
              <tr>
                <td><strong>Notas adicionales</strong></td>
                <td>Observaciones o aclaraciones</td>
                <td>"Cálculo conforme al art. 576 LEC y tipos vigentes BOE"</td>
              </tr>
              <tr>
                <td><strong>Pie de página</strong></td>
                <td>Texto al final de cada página</td>
                <td>"RUA Abogados | Departamento de Ejecuciones y Tasaciones"</td>
              </tr>
            </tbody>
          </table>

          <h4>Formato del informe generado</h4>
          <ul>
            <li><strong>Portada:</strong> Con membrete, título, subtítulo y fecha de generación</li>
            <li><strong>Resumen ejecutivo:</strong> Total de casos procesados, suma de intereses calculados</li>
            <li><strong>Detalle por expediente:</strong> Desglose completo de cada cálculo con tramos anuales</li>
            <li><strong>Anexos:</strong> Tabla consolidada con todos los resultados</li>
          </ul>

          <div class="callout">
            📄 <strong>Recomendación:</strong> Personaliza siempre el título y subtítulo para identificar claramente el lote de expedientes procesados. Esto facilita el archivo y la trazabilidad interna del departamento.
          </div>
        `
      },
      {
        id: 'multiples-columnas',
        title: '⭐ Usar múltiples columnas de cuantía (v2.1)',
        content: `
          <h4>Nueva funcionalidad: Procesamiento por columna</h4>
          <p>A partir de la versión 2.1, es posible seleccionar <strong>múltiples columnas como "Cuantía"</strong> en un mismo archivo Excel, procesando cada columna de forma independiente.</p>

          <h4>¿Por qué es útil esta funcionalidad?</h4>
          <ul>
            <li><strong>Sin duplicación de filas:</strong> Un mismo cliente o expediente puede tener múltiples deudas sin repetir filas</li>
            <li><strong>Procesamiento independiente:</strong> Cada columna se calcula por separado con su propio resultado</li>
            <li><strong>Informes claros:</strong> El PDF muestra la columna origen de cada cálculo</li>
            <li><strong>Ahorro de tiempo:</strong> Procesa lotes más complejos en una única importación</li>
          </ul>

          <h4>Ejemplo de uso</h4>
          <p><strong>Archivo Excel con múltiples conceptos de deuda:</strong></p>
          <p><em>Nota: Fecha Fin se proporciona en la ventana modal de configuración, no en el Excel</em></p>
          <pre>
| Concepto  | Prima Seguro | Interés    | Comisiones      | Fecha Inicio |
|-----------|--------------|------------|-----------------|--------------|
| Caso A    | 10,000€      | 5,000€     | 3,000€          | 01/01/2023   |
| Caso B    | 8,500€       | 3,200€     | 2,100€          | 15/03/2023   |
| Caso C    | 12,000€      | 6,500€     | 4,000€          | 01/09/2023   |
          </pre>

          <p><strong>Configuración en TASADOR:</strong></p>
          <ul>
            <li>Columnas de Cuantía: <strong>[✓ Prima Seguro] [✓ Interés] [✓ Comisiones]</strong></li>
            <li>Concepto: Concepto</li>
            <li>Fecha Inicio: Fecha Inicio</li>
            <li>Fecha Fin: <em>(se proporciona en la ventana modal, no en Excel)</em></li>
          </ul>

          <p><strong>Resultado: 9 cálculos independientes (3 casos × 3 columnas)</strong></p>
          <table>
            <thead><tr><th>Concepto</th><th>Tipo Concepto</th><th>Capital</th><th>Intereses Calculados</th></tr></thead>
            <tbody>
              <tr><td>Caso A</td><td>Prima Seguro</td><td>10,000€</td><td>600€</td></tr>
              <tr><td>Caso A</td><td>Interés</td><td>5,000€</td><td>300€</td></tr>
              <tr><td>Caso A</td><td>Comisiones</td><td>3,000€</td><td>180€</td></tr>
              <tr><td>Caso B</td><td>Prima Seguro</td><td>8,500€</td><td>510€</td></tr>
              <tr><td>Caso B</td><td>Interés</td><td>3,200€</td><td>192€</td></tr>
              <tr><td>Caso B</td><td>Comisiones</td><td>2,100€</td><td>126€</td></tr>
              <tr><td colspan="3" style="text-align: right; font-weight: bold;">TOTAL INTERESES:</td><td style="font-weight: bold;">1,908€</td></tr>
            </tbody>
          </table>

          <h4>Pasos para usar múltiples columnas</h4>
          <ol>
            <li>Carga tu archivo Excel como de costumbre</li>
            <li>En la sección <strong>"Mapeo de Columnas"</strong>, localiza el selector de <strong>"Columnas de Cuantía"</strong></li>
            <li>Selecciona la <strong>primera columna de cuantía</strong> del dropdown</li>
            <li>Haz clic en el botón <strong>"+ Agregar Columna de Cuantía"</strong></li>
            <li>Selecciona la <strong>segunda columna</strong> del nuevo dropdown</li>
            <li>Repite el paso anterior para cada columna adicional que necesites procesar</li>
            <li>Las columnas vacías se ignorarán automáticamente durante el procesamiento</li>
          </ol>

          <h4>Campos opcionales</h4>
          <ul>
            <li><strong>Fecha Fin:</strong> No es necesaria en el Excel. Se proporciona en la ventana modal de configuración y se aplica a todos los cálculos</li>
            <li><strong>Fecha Sentencia:</strong> Solo es requerida si utilizas la modalidad de <strong>Interés Judicial</strong>. Para otras modalidades (Legal, TAE, TAE+5%), es completamente opcional</li>
          </ul>

          <h4>Características importantes</h4>
          <ul>
            <li>✅ Cada columna se procesa <strong>INDEPENDIENTEMENTE</strong></li>
            <li>✅ Las celdas vacías se saltan automáticamente sin error</li>
            <li>✅ Compatible con <strong>todas las modalidades</strong> de interés (Legal, Judicial, TAE, TAE+5%)</li>
            <li>✅ Ideal para casos complejos con múltiples conceptos de deuda</li>
            <li>✅ Los PDF muestran claramente el origen de cada cálculo</li>
            <li>✅ La tabla de resumen agrupa inteligentemente por concepto + columna</li>
          </ul>

          <div class="callout">
            🎯 <strong>Caso de uso típico:</strong> Liquidación de una persona física o jurídica con múltiples procedimientos, cada uno generando diferentes tipos de deuda (civil, penal, mercantil, tributaria). Todo se procesa en un único lote sin necesidad de duplicar filas.
          </div>
        `
      },
      {
        id: 'personalizar-pdf-avanzado',
        title: 'Personalización avanzada de informes PDF',
        content: `
          <h4>Opciones de personalización disponibles (v2.1+)</h4>
          <p>El sistema permite personalizar cada aspecto del informe PDF generado, permitiendo crear documentos profesionales según los estándares de RUA Abogados.</p>

          <h4>Secciones del informe PDF (seleccionables)</h4>
          <p>Puedes elegir qué secciones incluir en el PDF generado:</p>
          <ul>
            <li>☑️ <strong>Resumen Ejecutivo:</strong> Datos principales, período de cálculo, modalidades utilizadas</li>
            <li>☑️ <strong>Parámetros de Cálculo:</strong> Configuración específica utilizada (TAE, fechas, tipos de interés)</li>
            <li>☑️ <strong>Metodología de Cálculo:</strong> Explicación de fórmulas y cálculos aplicados</li>
            <li>☑️ <strong>Resultados por Modalidad:</strong> Desglose de intereses para cada tipo (Legal, Judicial, TAE)</li>
            <li>☑️ <strong>Tabla Resumen por Concepto:</strong> Consolidado de todos los cálculos por concepto</li>
            <li>☑️ <strong>Análisis Gráfico:</strong> Gráficos de evolución temporal e intereses por modalidad</li>
            <li>☑️ <strong>Detalle de Cálculos:</strong> Desglose año a año de cada expediente procesado</li>
          </ul>

          <h4>Flujo de personalización</h4>
          <ol>
            <li>Tras procesar el lote y ver los resultados, haz clic en <strong>"Personalizar Informe"</strong></li>
            <li>Completa los campos de texto (títulos, notas, información adicional, pie)</li>
            <li>Selecciona qué secciones deseas incluir usando los checkboxes</li>
            <li>Opcionalmente, <strong>guarda esta configuración como plantilla</strong> para reutilizarla</li>
            <li>Haz clic en <strong>"Descargar PDF"</strong> para generar el documento personalizado</li>
          </ol>

          <h4>Validaciones de personalización</h4>
          <ul>
            <li>✅ El sistema verifica que los títulos no estén vacíos (mínimo 3 caracteres)</li>
            <li>✅ Las fechas de generación se añaden automáticamente</li>
            <li>✅ El logo de RUA Abogados se inserta automáticamente en la portada</li>
            <li>✅ Todas las tablas se formatean automáticamente para legibilidad</li>
            <li>✅ Los números se formatean según la localización española (ej: 1.234,56€)</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'historial',
    title: 'Historial de Tasaciones',
    icon: <History className="h-5 w-5" />,
    description: 'Gestiona, consulta y exporta todas las tasaciones realizadas por el departamento',
    content: `
      <h3>Registro completo del departamento</h3>
      <p>El módulo de <strong>Historial</strong> almacena todas las tasaciones generadas por el Departamento de Ejecuciones y Tasaciones de RUA Abogados, permitiendo consulta, búsqueda, edición y exportación de datos históricos.</p>

      <h3>Funcionalidades principales</h3>
      <ul>

        <li><strong>Búsqueda avanzada:</strong> Localiza tasaciones por nombre de cliente, número de procedimiento, juzgado o entidad demandada</li>
        <li><strong>Filtros inteligentes:</strong> Filtra por fecha de creación, municipio, tipo de procedimiento o estado</li>
        <li><strong>Ordenación flexible:</strong> Ordena por fecha, cuantía, cliente o cualquier campo</li>
        <li><strong>Estadísticas del departamento:</strong> Visualiza totales, promedios y tendencias de tasaciones</li>
        <li><strong>Exportación masiva:</strong> Descarga datos consolidados en Excel para análisis externo</li>
        <li><strong>Auditoría completa:</strong> Registro de fecha de creación, modificaciones y usuario responsable</li>
      </ul>

      <div class="callout">
        📊 <strong>Para el equipo:</strong> El historial es tu archivo digital de todas las tasaciones. Úsalo regularmente para consultar expedientes previos, reutilizar datos y generar estadísticas para la dirección del despacho.
      </div>
    `,
    subsections: [
      {
        id: 'acciones-disponibles',
        title: 'Acciones disponibles para cada tasación',
        content: `
          <h4>Operaciones sobre tasaciones guardadas</h4>
          <p>Para cada tasación del historial, puedes realizar las siguientes acciones:</p>
          
          <table>
            <thead><tr><th>Acción</th><th>Descripción</th><th>Uso típico</th></tr></thead>
            <tbody>
              <tr>
                <td>✏️ <strong>Editar</strong></td>
                <td>Modifica datos de la tasación y recalcula automáticamente</td>
                <td>Corrección de errores, actualización de datos del expediente</td>
              </tr>
              <tr>
                <td>👁️ <strong>Ver detalles</strong></td>
                <td>Muestra toda la información completa de la tasación</td>
                <td>Revisión rápida sin necesidad de descargar PDF</td>
              </tr>
              <tr>
                <td>📄 <strong>Generar PDF</strong></td>
                <td>Crea informe profesional listo para presentación judicial</td>
                <td>Presentación ante tribunales, envío a clientes</td>
              </tr>
              <tr>
                <td>📊 <strong>Exportar Excel</strong></td>
                <td>Descarga datos en formato tabular editable</td>
                <td>Análisis interno, integración con otros sistemas</td>
              </tr>
              <tr>
                <td>🗑️ <strong>Eliminar</strong></td>
                <td>Borra permanentemente la tasación (requiere confirmación)</td>
                <td>Limpieza de tasaciones de prueba o erróneas</td>
              </tr>
              <tr>
                <td>📋 <strong>Duplicar</strong></td>
                <td>Crea una copia de la tasación para reutilizar datos</td>
                <td>Expedientes similares, mismo cliente o juzgado</td>
              </tr>
            </tbody>
          </table>

          <h4>Buenas prácticas del departamento</h4>
          <ul>
            <li><strong>Verifica antes de eliminar:</strong> La eliminación es permanente, asegúrate de que no necesitas la tasación</li>
            <li><strong>Usa la función duplicar:</strong> Para expedientes similares, duplica y modifica en lugar de crear desde cero</li>
            <li><strong>Exporta periódicamente:</strong> Genera copias de seguridad en Excel de las tasaciones importantes</li>
            <li><strong>Revisa los detalles:</strong> Antes de presentar una tasación oficial, revisa siempre los detalles completos</li>
          </ul>

          <div class="callout">
            ⚠️ <strong>Importante:</strong> Las acciones de edición y eliminación quedan registradas en el sistema para auditoría y trazabilidad. Mantén siempre la integridad de los datos del departamento.
          </div>
        `
      }
    ]
  },

  {
    id: 'liquidaciones',
    title: 'Historial de Liquidaciones',
    icon: <Download className="h-5 w-5" />,
    description: 'Gestiona, consulta y descarga los informes de liquidaciones de intereses generados',
    content: `
      <h3>Gestión profesional de liquidaciones de intereses</h3>
      <p>El módulo de <strong>Historial de Liquidaciones</strong> permite visualizar, filtrar, exportar y descargar todos los informes PDF de liquidaciones de intereses calculados por el Departamento de Ejecuciones y Tasaciones de RUA Abogados.</p>

      <h3>Funcionalidades principales</h3>
      <ul>
        <li><strong>Historial completo:</strong> Acceso a todas las liquidaciones de intereses (legales, judiciales y TAE) generadas</li>
        <li><strong>Estadísticas en tiempo real:</strong> Visualiza totales consolidados de expedientes liquidados e intereses recuperados por tipo</li>
        <li><strong>Búsqueda y filtrado avanzado:</strong> Localiza liquidaciones por referencia Aranzadi, usuario, modalidad, rango de fechas e importes</li>
        <li><strong>Descarga de informes PDF:</strong> Acceso instantáneo a todos los informes generados desde el bucket de almacenamiento</li>
        <li><strong>Exportación a Excel:</strong> Descarga datos consolidados filtrados para análisis interno</li>
        <li><strong>Detalles completos:</strong> Visualiza toda la información de cada liquidación en un modal especializado</li>
        <li><strong>Gestión de registros:</strong> Edita o elimina liquidaciones según necesidades del departamento</li>
      </ul>

      <div class="callout">
        📊 <strong>Para el equipo:</strong> El historial de liquidaciones es tu repositorio central de cálculos de intereses. Úsalo para consultar expedientes previos, analizar tendencias y reutilizar liquidaciones similares.
      </div>
    `,
    subsections: [
      {
        id: 'acceder-liquidaciones',
        title: 'Cómo acceder al Historial de Liquidaciones',
        content: `
          <h4>Paso 1 · Navega a la sección Historial</h4>
          <ul>
            <li>Haz clic en la pestaña <strong>HISTORIAL</strong> del menú principal</li>
            <li>Se abrirá el módulo de historial de tasaciones</li>
          </ul>

          <h4>Paso 2 · Selecciona "Historial Liquidaciones"</h4>
          <ul>
            <li>Dentro de la sección Historial, encontrarás un selector/tab con opciones</li>
            <li>Haz clic en <strong>"Historial Liquidaciones"</strong></li>
            <li>Se mostrará la tabla completa con todas las liquidaciones registradas</li>
          </ul>

          <h4>Paso 3 · Explora las estadísticas</h4>
          <p>En la parte superior verás <strong>4 tarjetas de estadísticas</strong> con información consolidada:</p>
          <ul>
            <li>📦 <strong>Expedientes Liquidados:</strong> Total de liquidaciones registradas</li>
            <li>💰 <strong>Total Int. Legales Recuperados:</strong> Suma de todos los intereses legales</li>
            <li>⚖️ <strong>Total Int. Judiciales Recuperados:</strong> Suma de todos los intereses judiciales</li>
            <li>📈 <strong>Total Intereses Recuperados:</strong> Suma consolidada de todos los tipos de intereses (legales + judiciales + TAE)</li>
          </ul>
        `
      },
      {
        id: 'filtros-liquidaciones',
        title: 'Filtros y búsqueda avanzada',
        content: `
          <h4>Filtros disponibles</h4>
          <table>
            <thead><tr><th>Filtro</th><th>Descripción</th><th>Ejemplo</th></tr></thead>
            <tbody>
              <tr>
                <td><strong>📌 Ref. Aranzadi</strong></td>
                <td>Búsqueda por referencia de procedimiento (búsqueda en vivo)</td>
                <td>PO 234/2024, ABC-2025, etc.</td>
              </tr>
              <tr>
                <td><strong>👤 Usuario</strong></td>
                <td>Filtro por nombre del usuario que creó la liquidación</td>
                <td>Juan García, María López</td>
              </tr>
              <tr>
                <td><strong>🏷️ Modalidad</strong></td>
                <td>Tipo de intereses calculados</td>
                <td>Todas, Con Int. Legales, Con Int. Judicial, Con TAE</td>
              </tr>
              <tr>
                <td><strong>📅 Rango de fechas</strong></td>
                <td>Filtro por período de creación (fecha desde / fecha hasta)</td>
                <td>01/01/2025 - 31/01/2025</td>
              </tr>
              <tr>
                <td><strong>💵 Rango de intereses</strong></td>
                <td>Filtro por importes mínimo y máximo</td>
                <td>De €0 a €50.000</td>
              </tr>
            </tbody>
          </table>

          <h4>Cómo usar los filtros</h4>
          <ol>
            <li>Completa los campos de filtro según lo que busques</li>
            <li>Los resultados se actualizan automáticamente</li>
            <li>Las estadísticas se recalculan en tiempo real según los filtros aplicados</li>
            <li>Haz clic en <strong>"Limpiar filtros"</strong> para volver a ver todos los registros</li>
          </ol>
        `
      },
      {
        id: 'acciones-liquidaciones',
        title: 'Acciones disponibles',
        content: `
          <h4>Operaciones en la tabla principal</h4>
          <table>
            <thead><tr><th>Acción</th><th>Botón</th><th>Descripción</th></tr></thead>
            <tbody>
              <tr>
                <td><strong>Ver detalles</strong></td>
                <td>👁️ <strong>Ojo</strong></td>
                <td>Abre un modal con toda la información completa de la liquidación incluyendo informes descargables</td>
              </tr>
              <tr>
                <td><strong>Eliminar</strong></td>
                <td>🗑️ <strong>Papelera</strong></td>
                <td>Elimina la liquidación (requiere confirmación)</td>
              </tr>
              <tr>
                <td><strong>Descargar Excel</strong></td>
                <td>📥 <strong>Download</strong></td>
                <td>Exporta el conjunto completo de liquidaciones filtradas a archivo Excel</td>
              </tr>
              <tr>
                <td><strong>Actualizar</strong></td>
                <td>🔄 <strong>Refresh</strong></td>
                <td>Recarga los datos desde el servidor</td>
              </tr>
            </tbody>
          </table>

          <h4>Modal de detalles (4 secciones)</h4>
          <p>Al hacer clic en <strong>👁️ Ver detalles</strong>, se abre un modal completo dividido en 4 secciones:</p>

          <h5>1️⃣ Información Principal (Azul)</h5>
          <ul>
            <li>📌 Referencia Aranzadi</li>
            <li>👤 Usuario responsable</li>
            <li>📊 Porcentaje TAE aplicado</li>
          </ul>

          <h5>2️⃣ Intereses Calculados (Verde)</h5>
          <p>Muestra cada tipo de interés en tarjetas de color:</p>
          <ul>
            <li><strong style="color: #10b981;">💚 Intereses Legales:</strong> €X.XX</li>
            <li><strong style="color: #2563eb;">💙 Interés Judicial:</strong> €X.XX</li>
            <li><strong style="color: #8b5cf6;">💜 TAE CTO:</strong> €X.XX</li>
            <li><strong style="color: #ec4899;">💗 TAE+5:</strong> €X.XX</li>
          </ul>
          <p><strong>Barra de Total:</strong> Suma consolidada de todos los intereses</p>

          <h5>3️⃣ Fechas del Cálculo (Ámbar)</h5>
          <ul>
            <li>📅 Fecha fin del cálculo</li>
            <li>⚖️ Fecha de sentencia</li>
            <li>🕒 Fecha y hora de creación</li>
            <li>✏️ Última modificación</li>
          </ul>

          <h5>4️⃣ Informes Generados (Púrpura) ⭐ [NUEVOS]</h5>
          <p>Sección especializada para descargar PDFs:</p>
          <ul>
            <li><strong>Lista de informes:</strong> Muestra todos los archivos PDF generados relacionados con esta liquidación</li>
            <li><strong>Nombre de archivo:</strong> Formato <code>timestamp_refaranzadi.pdf</code></li>
            <li><strong>Fecha de generación:</strong> Cuándo se creó el informe</li>
            <li><strong>Botón 📥 Descargar:</strong> Descarga instantánea del PDF desde el Storage</li>
          </ul>

          <div class="callout">
            📝 <strong>Los informes se generan automáticamente</strong> cuando exportas a PDF desde la Calculadora Avanzada de Intereses, y se almacenan en el bucket <code>informes_liquidaciones</code> para acceso permanente.
          </div>
        `
      },
      {
        id: 'descarga-pdfs',
        title: 'Descarga de informes PDF desde Storage',
        content: `
          <h4>¿Dónde se almacenan los PDFs?</h4>
          <p>Todos los informes de liquidaciones se guardan automáticamente en el <strong>bucket de almacenamiento Supabase</strong> llamado <code>informes_liquidaciones</code>.</p>

          <h4>Cómo descargar un informe</h4>
          <ol>
            <li>Accede al <strong>Historial de Liquidaciones</strong></li>
            <li>Localiza la liquidación deseada usando filtros o búsqueda</li>
            <li>Haz clic en el botón <strong>👁️ Ver detalles</strong></li>
            <li>Desplázate hasta la sección <strong>Informes Generados (púrpura)</strong></li>
            <li>Haz clic en el botón <strong>📥 Descargar</strong> junto al archivo deseado</li>
            <li>El archivo PDF se descargará automáticamente a tu carpeta de descargas</li>
          </ol>

          <h4>Denominación de archivos</h4>
          <p>Los PDFs se guardan con el siguiente formato de nombre:</p>
          <p><strong>Formato:</strong> <code>{timestamp}_{ref_aranzadi}.pdf</code></p>
          <p><strong>Ejemplo:</strong> <code>1770369596840_PO_234_2024.pdf</code></p>
          <ul>
            <li><strong>Timestamp:</strong> Fecha y hora exacta de generación (milisegundos desde época)</li>
            <li><strong>Ref Aranzadi:</strong> Referencia del procedimiento (espacios y caracteres especiales reemplazados por guiones bajos)</li>
          </ul>

          <h4>Almacenamiento permanente</h4>
          <ul>
            <li>✅ <strong>Acceso permanente:</strong> Los informes se guardan indefinidamente en Storage</li>
            <li>✅ <strong>Sin límite de descargas:</strong> Puedes descargar el mismo archivo múltiples veces</li>
            <li>✅ <strong>Versionado:</strong> Cada generación de PDF crea un nuevo archivo (no sobrescribe)</li>
            <li>⚠️ <strong>Eliminación:</strong> Si eliminas la liquidación, también se elimina la relación con sus informes, pero los archivos siguen en Storage</li>
          </ul>

          <div class="callout">
            💾 <strong>Recomendación:</strong> Descarga periódicamente copias de seguridad de los informes importantes. El almacenamiento en Cloud es muy seguro, pero es buena práctica mantener backups locales de documentos críticos.
          </div>
        `
      },
      {
        id: 'estadisticas',
        title: 'Lectura de estadísticas',
        content: `
          <h4>Las 4 tarjetas de estadísticas en tiempo real</h4>

          <h5>📦 Expedientes Liquidados</h5>
          <p><strong>Qué muestra:</strong> Cantidad total de liquidaciones registradas</p>
          <p><strong>Cálculo:</strong> Número de registros en la tabla después de aplicar filtros</p>
          <p><strong>Uso:</strong> Para saber cuántas liquidaciones has procesado en el período seleccionado</p>

          <h5>💚 Total Int. Legales Recuperados</h5>
          <p><strong>Qué muestra:</strong> Suma de todos los intereses legales en las liquidaciones filtradas</p>
          <p><strong>Cálculo:</strong> ∑(intereses_legales) para todos los registros</p>
          <p><strong>Uso:</strong> Analizar el total recuperado en concepto de intereses legales</p>
          <p><strong>Ejemplo:</strong> Si tienes 3 liquidaciones con €1.000, €2.500 y €500 en intereses legales respectivamente, el total será €4.000</p>

          <h5>⚖️ Total Int. Judiciales Recuperados</h5>
          <p><strong>Qué muestra:</strong> Suma de todos los intereses judiciales en las liquidaciones filtradas</p>
          <p><strong>Cálculo:</strong> ∑(interes_judicial) para todos los registros</p>
          <p><strong>Uso:</strong> Analizar el total recuperado en concepto de intereses judiciales</p>

          <h5>📈 Total Intereses Recuperados</h5>
          <p><strong>Qué muestra:</strong> Suma consolidada de <strong>TODOS</strong> los tipos de intereses</p>
          <p><strong>Cálculo:</strong> ∑(intereses_legales + interes_judicial + tae_cto + tae_mas_5)</p>
          <p><strong>Uso:</strong> Obtener el total global de intereses recuperados para reportes ejecutivos</p>

          <h4>Actualización dináminca de estadísticas</h4>
          <ul>
            <li>✅ Se actualizan automáticamente al aplicar/cambiar filtros</li>
            <li>✅ Se recalculan al eliminar una liquidación</li>
            <li>✅ Se refrescan al actualizar los datos</li>
            <li>✅ Siempre muestran datos consistentes con la tabla visible</li>
          </ul>

          <div class="callout">
            🎯 <strong>Consejo:</strong> Usa los filtros para segmentar por período, usuario o modalidad, y observa cómo cambian las estadísticas. Es una forma excelente de generar reportes rápidos para la dirección del despacho.
          </div>
        `
      }
    ]
  },

  {
    id: 'faq',
    title: 'Preguntas Frecuentes',
    icon: <HelpCircle className="h-5 w-5" />,
    description: 'Respuestas a las preguntas más comunes del departamento',
    content: `
      <h3>Preguntas frecuentes del equipo</h3>
      <p>Encuentra respuestas rápidas a las dudas más habituales del Departamento de Ejecuciones y Tasaciones de RUA Abogados sobre el uso de TASADOR COSTAS.</p>
    `,
    subsections: [
      {
        id: 'problemas-comunes',
        title: 'Problemas comunes y soluciones',
        content: `
          <h4>¿Qué hacer si no encuentro un municipio en el selector?</h4>
          <p><strong>Solución:</strong></p>
          <ul>
            <li>Verifica que el nombre esté escrito correctamente (sin tildes innecesarias)</li>
            <li>Busca por la provincia si el municipio es pequeño</li>
            <li>Comprueba si el municipio tiene baremo propio o usa el baremo provincial/autonómico</li>
            <li>Si el problema persiste, reporta la incidencia mediante el formulario de soporte</li>
          </ul>

          <h4>¿Cómo recalcular una tasación ya generada?</h4>
          <p><strong>Solución:</strong></p>
          <ol>
            <li>Accede al módulo <strong>Historial de Tasaciones</strong></li>
            <li>Localiza la tasación mediante el buscador o filtros</li>
            <li>Haz clic en el botón <strong>✏️ Editar</strong></li>
            <li>Modifica los datos necesarios (cuantía, fase, fechas, etc.)</li>
            <li>Haz clic en <strong>Guardar cambios</strong> para recalcular automáticamente</li>
          </ol>

          <h4>¿Por qué el PDF generado no incluye el membrete de RUA Abogados?</h4>
          <p><strong>Solución:</strong> El membrete se configura en el panel de administración. Contacta con el responsable técnico del departamento para verificar la configuración de plantillas corporativas.</p>

          <h4>¿Cómo importo un archivo Excel con errores de formato?</h4>
          <p><strong>Solución:</strong></p>
          <ul>
            <li>Revisa que las columnas tengan exactamente los nombres requeridos (CUANTIA, FECHA_INICIO, FECHA_FIN, TIPO_INTERES)</li>
            <li>Verifica que las fechas sigan el formato DD/MM/AAAA</li>
            <li>Elimina símbolos de moneda (€) y separadores de miles en las cuantías</li>
            <li>Usa el punto (.) como separador decimal, no la coma (,)</li>
            <li>Descarga la plantilla de ejemplo desde el módulo de Interés Avanzado</li>
          </ul>

          <h4>¿Puedo exportar todas las tasaciones del mes en un solo archivo?</h4>
          <p><strong>Solución:</strong> Sí, en el módulo de Historial, aplica el filtro de fechas para seleccionar el mes deseado y luego usa el botón de <strong>Exportación masiva a Excel</strong>. Obtendrás un archivo consolidado con todas las tasaciones del período.</p>
        `
      },
      {
        id: 'soporte',
        title: 'Soporte técnico y ayuda adicional',
        content: `
          <h3>¿Necesitas ayuda técnica?</h3>
          <p>Si no encuentras respuesta a tu pregunta en esta documentación, el Departamento de Ejecuciones y Tasaciones de RUA Abogados dispone de los siguientes canales de soporte:</p>

          <h4>🔧 Formulario oficial de reporte de problemas</h4>
          <p>Para reportar incidencias técnicas, errores del sistema o sugerencias de mejora:</p>
          <p>
            <a href="https://justiflow.com/form/reportetasador" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 12px 0;">
              📝 Formulario de Reporte de Problemas
            </a>
          </p>
          <p><strong>Incluye siempre:</strong></p>
          <ul>
            <li>Descripción detallada del problema o error</li>
            <li>Pasos para reproducir la incidencia</li>
            <li>Capturas de pantalla si aplica</li>
            <li>Módulo afectado (Tasaciones, Interés Legal, Baremos, etc.)</li>
            <li>Tu nombre y contacto para seguimiento</li>
          </ul>

          <h4>📚 Recursos adicionales</h4>
          <ul>
            <li><strong>Manual técnico completo:</strong> Descarga el PDF del manual desde el botón superior de esta sección</li>
            <li><strong>Chatbot de baremos:</strong> Consulta dudas específicas sobre honorarios y baremos oficiales</li>
            <li><strong>Tutoriales en vídeo:</strong> (Próximamente) Guías visuales paso a paso</li>
          </ul>

          <h4>⏱️ Tiempos de respuesta</h4>
          <ul>
            <li><strong>Incidencias críticas:</strong> Respuesta en 24 horas laborables</li>
            <li><strong>Consultas generales:</strong> Respuesta en 48-72 horas laborables</li>
            <li><strong>Mejoras y sugerencias:</strong> Evaluación mensual del equipo técnico</li>
          </ul>

          <div class="callout">
            💡 <strong>Consejo:</strong> Antes de reportar un problema, consulta esta sección de Preguntas Frecuentes. La mayoría de incidencias comunes tienen solución inmediata aquí.
          </div>
        `
      }
    ]
  }
]

export default function Help() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro']))
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState<string>('intro')

  // Filtrar secciones basado en búsqueda
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections

    return sections.filter(section => {
      const matchesTitle = section.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDescription = section.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesContent = section.content.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSubsections = section.subsections?.some(sub =>
        sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.content.toLowerCase().includes(searchTerm.toLowerCase())
      ) || false

      return matchesTitle || matchesDescription || matchesContent || matchesSubsections
    })
  }, [searchTerm])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(`section-${sectionId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Centro de Ayuda</h1>
                <p className="text-gray-600 mt-1">
                  Documentación completa para el Departamento de Ejecuciones y Tasaciones · RUA Abogados
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/docs/TASADOR_COSTAS_v2_Manual.html"
                download
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </a>
              <a
                href="/docs/TASADOR_COSTAS_v2_Manual.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Versión Completa
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Búsqueda */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar en el manual..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Índice de secciones */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Índice</h3>
                <nav className="space-y-1">
                  {filteredSections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {section.icon}
                        <span>{section.title}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Estadísticas rápidas */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">En esta guía</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Secciones:</span>
                    <span className="font-medium">{sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subsecciones:</span>
                    <span className="font-medium">
                      {sections.reduce((acc, s) => acc + (s.subsections?.length || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última actualización:</span>
                    <span className="font-medium">2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredSections.map(section => (
                <div
                  key={section.id}
                  id={`section-${section.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Header de sección */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-600">
                          {section.icon}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <span className="text-2xl font-bold">
                          {expandedSections.has(section.id) ? '−' : '+'}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Contenido expandible */}
                  {expandedSections.has(section.id) && (
                    <div className="px-6 pb-6">
                      <div
                        className="
                          prose prose-gray max-w-none
                          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-gray-800
                          [&_h4]:text-base [&_h4]:font-bold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-gray-700
                          [&_p]:text-gray-700 [&_p]:mb-4 [&_p]:leading-relaxed
                          [&_strong]:text-gray-900 [&_strong]:font-bold
                          [&_em]:text-gray-800 [&_em]:italic
                          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                          [&_li]:mb-2 [&_li]:text-gray-700
                          [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_table]:border [&_table]:border-gray-300
                          [&_th]:bg-gray-100 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_th]:border [&_th]:border-gray-300 [&_th]:text-gray-900
                          [&_td]:p-3 [&_td]:border [&_td]:border-gray-300 [&_td]:text-gray-700
                          [&_.callout]:border-l-4 [&_.callout]:border-blue-500 [&_.callout]:bg-blue-50 [&_.callout]:pl-4 [&_.callout]:py-3 [&_.callout]:my-4 [&_.callout]:text-blue-900
                          [&_.note]:text-sm [&_.note]:text-gray-600 [&_.note]:italic
                          [&_.pill]:inline-block [&_.pill]:border [&_.pill]:border-gray-300 [&_.pill]:bg-gray-100 [&_.pill]:px-2 [&_.pill]:py-1 [&_.pill]:rounded [&_.pill]:text-xs [&_.pill]:font-medium [&_.pill]:mr-2
                        "
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />

                      {/* Subsecciones */}
                      {section.subsections && section.subsections.map(subsection => (
                        <div key={subsection.id} className="mt-6 border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-bold text-gray-800 mb-3">{subsection.title}</h4>
                          <div
                            className="
                              prose prose-gray max-w-none
                              [&_h4]:text-base [&_h4]:font-bold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-gray-700
                              [&_p]:text-gray-700 [&_p]:mb-4 [&_p]:leading-relaxed
                              [&_strong]:text-gray-900 [&_strong]:font-bold
                              [&_em]:text-gray-800 [&_em]:italic
                              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                              [&_li]:mb-2 [&_li]:text-gray-700
                              [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_table]:border [&_table]:border-gray-300
                              [&_th]:bg-gray-100 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_th]:border [&_th]:border-gray-300 [&_th]:text-gray-900
                              [&_td]:p-3 [&_td]:border [&_td]:border-gray-300 [&_td]:text-gray-700
                            "
                            dangerouslySetInnerHTML={{ __html: subsection.content }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filteredSections.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-600">
                    Intenta con otros términos de búsqueda o navega por las secciones del índice.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
