# 🏛️ Tasador Web

Aplicación web profesional para la tasación automática de costas judiciales en España. Desarrollada con React, TypeScript y Supabase para ofrecer una experiencia moderna y eficiente en la gestión de tasaciones judiciales.

## ✨ Características Principales

- 🔐 **Autenticación Segura**: Sistema de login con gestión de usuarios personalizada
- 📊 **Tasación Automática**: Cálculo inteligente de costas basado en criterios ICA
- 📋 **Historial Completo**: Seguimiento detallado de todas las tasaciones realizadas
- 🏢 **Gestión de Entidades**: Base de datos completa de juzgados y entidades judiciales
- 📱 **Interfaz Moderna**: Diseño responsive con Tailwind CSS
- 🔧 **Panel Administrativo**: Herramientas avanzadas para gestión del sistema
- 📈 **Reportes y Estadísticas**: Análisis detallado de tasaciones por período
- 🔄 **Sincronización en Tiempo Real**: Actualización automática de datos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos modernos
- **React Router** - Navegación SPA

### Backend & Base de Datos
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Row Level Security (RLS)** - Seguridad a nivel de fila

### Desarrollo
- **ESLint** - Linting y calidad de código
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Compatibilidad CSS

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 o **yarn** >= 1.22.0
- **Git** >= 2.30.0
- Cuenta en **Supabase** para la base de datos

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/tasador-web.git
cd tasador-web
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno
Crear un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Configurar la base de datos
Ejecutar los scripts de configuración en orden:
```bash
# 1. Aplicar esquema de base de datos
node apply-schema.js

# 2. Desactivar RLS (si es necesario para desarrollo)
node disable-rls.js

# 3. Cargar datos iniciales
node scripts/upload-costas.js
```

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI reutilizables
│   ├── AdminPanel.tsx  # Panel de administración
│   ├── TasacionForm.tsx # Formulario principal de tasación
│   └── ...
├── contexts/           # Contextos de React
│   ├── AuthContext.tsx # Contexto de autenticación
│   └── CustomAuthContext.tsx
├── hooks/              # Hooks personalizados
│   ├── useTasaciones.ts # Hook para gestión de tasaciones
│   ├── useValoresICA.ts # Hook para valores ICA
│   └── ...
├── lib/                # Utilidades y configuración
│   ├── supabase.ts     # Cliente de Supabase
│   ├── calculator.ts   # Lógica de cálculo de costas
│   └── ...
├── styles.css          # Estilos globales
└── main.tsx           # Punto de entrada de la aplicación
```

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa del build
npm run lint         # Ejecutar ESLint

# Base de datos
npm run db:init      # Inicializar base de datos
npm run db:seed      # Cargar datos de prueba
npm run db:reset     # Resetear base de datos
```

## 🔧 Configuración

### Variables de Entorno
El proyecto utiliza las siguientes variables de entorno:

- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase

### Base de Datos
La aplicación utiliza las siguientes tablas principales:
- `usuarios_personalizados` - Usuarios del sistema
- `tasaciones` - Historial de tasaciones
- `costas` - Valores de costas por comunidad autónoma
- `valores_ica` - Valores ICA por municipio
- `entidades` - Entidades judiciales

## 🎯 Uso de la Aplicación

### Para Usuarios
1. **Login**: Inicia sesión con tus credenciales
2. **Nueva Tasación**: Completa el formulario con los datos del procedimiento
3. **Cálculo Automático**: La aplicación calcula automáticamente las costas
4. **Historial**: Revisa todas tus tasaciones anteriores

### Para Administradores
1. **Panel Admin**: Acceso a herramientas avanzadas
2. **Gestión de Datos**: Actualizar valores ICA y entidades
3. **Reportes**: Generar estadísticas y reportes
4. **Mantenimiento**: Herramientas de diagnóstico y mantenimiento

## � Documentación

### Para Usuarios Finales
- **[Manual de Usuario Completo](./docs/MANUAL_USUARIO.md)** - Guía paso a paso para:
  - ✏️ Crear tasaciones
  - 💰 Calcular intereses (simple y avanzado)
  - 📋 Gestionar historial
  - 📊 Exportar reportes

### Para Desarrolladores
- **[Documentación de Tasaciones](./docs/02-TASACIONES.md)** - Descripción técnica del módulo de tasaciones
- **[Cálculo de Intereses](./docs/03-CALCULADORA_INTERESES.md)** - Lógica y algoritmos
- **[Arquitectura General](./docs/01-ARQUITECTURA.md)** - Estructura del proyecto
- **[Deployment en Vercel](./docs/07-DEPLOYMENT_VERCEL.md)** - Guía de producción

## �🔒 Seguridad

- **Autenticación**: Sistema seguro con hash de contraseñas
- **Autorización**: Control de acceso basado en roles
- **Validación**: Validación completa de datos en frontend y backend
- **HTTPS**: Comunicación encriptada con Supabase

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

**Desarrollador**: Daniel García
**Email**: danielgarcia@ruaabogados.es


---

⭐ Si este proyecto te resulta útil, ¡dale una estrella en GitHub!

## 🧾 Generación de Minutas (server-side)

Este repositorio incluye un endpoint serverless para generar documentos Word (`/api/generate-minuta`) usando `docx-templates`.

Configuración recomendada en Vercel:

- `VITE_RENDER_SERVER_MINUTA_URL`: Si quieres apuntar a un endpoint externo, define esta URL. Si no, el cliente usará `/api/generate-minuta` por defecto.
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio para descargar plantillas privadas desde Supabase (opcional, recomendado si tus plantillas no son públicas).

El flujo recomendado para despliegue en Vercel es procesar las plantillas en el servidor (función serverless) para evitar problemas de empaquetado en el navegador y garantizar que el documento generado preserve exactamente el formato de la plantilla.

## 📝 Editor HTML para Plantillas

El sistema incluye un editor HTML WYSIWYG integrado en el panel de administración para crear plantillas de minutas personalizadas:

### Características del Editor HTML:
- **Editor visual**: Interfaz WYSIWYG con React Quill
- **Vista previa en tiempo real**: Ve los cambios instantáneamente
- **Marcadores dinámicos**: Usa marcadores como `{NOMBRE_CLIENTE}`, `{COSTAS}`, `{FECHA}`, etc.
- **Guardado automático**: Los cambios se guardan en la base de datos `word_templates`

### Cómo usar el Editor HTML:
1. Ve al panel de administración
2. En la sección "Configuración de Plantillas Word", haz clic en "Configurar Plantilla HTML"
3. Crea tu plantilla usando el editor visual
4. Usa marcadores entre llaves: `{NOMBRE_CLIENTE}`, `{COSTAS}`, `{TOTAL}`, etc.
5. La vista previa muestra cómo se verá la minuta generada
6. Guarda los cambios

### Plantilla HTML de Ejemplo:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Minuta Judicial</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .content { margin: 20px 0; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>JUZGADO DE {NOMBRE_JUZGADO}</h1>
        <h2>MINUTA JUDICIAL</h2>
    </div>
    
    <div class="content">
        <p><strong>Fecha:</strong> {FECHA}</p>
        <p><strong>Número de Procedimiento:</strong> {NUMERO_PROCEDIMIENTO}</p>
        <p><strong>Cliente:</strong> {NOMBRE_CLIENTE}</p>
        <p><strong>Entidad Demandada:</strong> {ENTIDAD_DEMANDADA}</p>
        <p><strong>Municipio:</strong> {MUNICIPIO}</p>
        
        <h3>DETALLE DE COSTAS</h3>
        <p><strong>Costas sin IVA:</strong> {COSTAS} €</p>
        <p><strong>IVA (21%):</strong> {IVA} €</p>
        <p><strong>TOTAL:</strong> {TOTAL} €</p>
    </div>
    
    <div class="footer">
        <p>Documento generado automáticamente por el sistema TASADOR</p>
    </div>
</body>
</html>
```

### Marcadores Disponibles:
- `{NOMBRE_CLIENTE}` - Nombre del cliente
- `{NUMERO_PROCEDIMIENTO}` - Número del procedimiento judicial
- `{NOMBRE_JUZGADO}` - Nombre del juzgado
- `{ENTIDAD_DEMANDADA}` - Entidad demandada
- `{MUNICIPIO}` - Municipio
- `{COSTAS}` - Importe de costas sin IVA
- `{IVA}` - Importe del IVA
- `{TOTAL}` - Total con IVA
- `{FECHA}` - Fecha actual

### Prioridad de Generación:
1. **HTML**: Si hay plantilla HTML configurada, se genera documento HTML
2. **DOCX**: Si no hay HTML pero hay plantilla DOCX, se genera documento Word
3. **Servidor**: Si está configurado `VITE_RENDER_SERVER_MINUTA_URL`, se usa el endpoint serverless

## 📝 Changelog Reciente

### 2025-09-25 - Corrección de Políticas RLS y Errores 401

**Problema resuelto**: Errores 401 Unauthorized durante la inicialización de la base de datos

**Cambios aplicados**:
- ✅ **Política RLS corregida**: Agregada política `"Anyone can view municipios"` para permitir SELECT público en tabla `municipios`
- ✅ **Upsert operations**: Las operaciones de inserción/actualización durante inicialización ahora funcionan correctamente
- ✅ **Database initialization**: La aplicación ahora se inicia sin errores de autorización
- ✅ **Consistencia de políticas**: Alineadas las políticas de `municipios` con las de `entidades`

**Contexto técnico**:
- Las operaciones `upsert` requieren permisos SELECT + INSERT + UPDATE
- La tabla `municipios` tenía políticas INSERT/UPDATE públicas pero SELECT solo para authenticated
- La tabla `entidades` ya tenía la configuración correcta con SELECT público
- La corrección permite la inicialización automática de datos de referencia

**Impacto**: 
- ✅ Eliminación completa de errores 401 durante startup
- ✅ Inicialización correcta de datos de municipios y entidades
- ✅ Experiencia de usuario mejorada sin errores de carga
