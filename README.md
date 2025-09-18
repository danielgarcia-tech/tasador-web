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

## 🔒 Seguridad

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
**LinkedIn**: [Tu LinkedIn]

---

⭐ Si este proyecto te resulta útil, ¡dale una estrella en GitHub!
