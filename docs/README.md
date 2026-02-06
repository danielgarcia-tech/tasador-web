# 📚 Documentación Técnica - Tasador Web

Bienvenido a la documentación técnica de Tasador Web. Este directorio contiene guías completas sobre la arquitectura, funcionalidades y operación del sistema.

## 📑 Índice de Documentos

### 🏗️ [1. Diagrama de Arquitectura](./01-ARQUITECTURA.md)
**Descripción:** Visión general de la arquitectura del sistema
- Arquitectura de tres capas (Frontend, Backend, Base de Datos)
- Flujos de datos principales
- Componentes principales
- Patrones y tecnologías clave
- Diagrama de despliegue

**Leer si:** Necesitas entender cómo está estructurado el sistema en general

---

### 📋 [2. Funcionalidad de Tasaciones](./02-TASACIONES.md)
**Descripción:** Documentación completa del módulo de tasaciones
- Flujo de tasación paso a paso
- Estructura de datos (tablas SQL)
- Componentes principales (TasacionForm, calculator.ts)
- Búsqueda de municipios y entidades
- Generación de documentos Word
- Validación y manejo de errores
- Testing

**Leer si:** Trabajas en el módulo de tasaciones o necesitas entender cómo se calculan

---

### 🧮 [3. Calculadora de Intereses](./03-CALCULADORA_INTERESES.md)
**Descripción:** Guía técnica de la calculadora avanzada de intereses
- Flujo de cálculo
- Fórmulas matemáticas (simple y compuesta)
- Tipos de interés predefinidos
- Capitalización e IVA
- Interfaz y componentes
- Casos de uso comunes
- Performance y optimizaciones

**Leer si:** Necesitas entender cómo funcionan los cálculos de intereses

---

### 📚 [4. Historial de Tasaciones](./04-HISTORIAL_TASACIONES.md)
**Descripción:** Documentación del módulo de historial y gestión
- Flujo de historial completo
- Filtros y búsqueda en vivo
- Acciones disponibles (editar, eliminar, exportar)
- Acciones masivas (bulk operations)
- Estadísticas y resumen
- Paginación
- Performance optimizations

**Leer si:** Trabajas en historial, filtrado o exportación de datos

---

### ⚙️ [5. Panel de Configuración Admin](./05-PANEL_ADMIN.md)
**Descripción:** Guía completa del panel administrativo
- Dashboard con estadísticas
- Gestión de Entidades
- Gestión de Municipios ICA
- Gestión de Costas x ICA
- Gestión de Intereses Legales
- Gestión de Fórmulas de Cálculo
- Gestión de Baremos de Honorarios
- Configuración de Templates Word
- Gestión de Usuarios
- Operaciones de importación/exportación
- Roles y permisos

**Leer si:** Eres administrador o trabajas en el panel admin

---

### 👤 [6. Creación de Usuarios con Supabase](./06-CREAR_USUARIOS_SUPABASE.md)
**Descripción:** Guía práctica para crear y gestionar usuarios
- Método 1: Crear usuario desde Panel Admin (RECOMENDADO)
- Método 2: Crear usuario directamente en Supabase Dashboard
- Método 3: Crear usuarios en masa (Bulk)
- Gestión posterior (editar, resetear contraseña, desactivar)
- Tabla SQL usuarios_personalizados
- Roles y permisos disponibles
- Solucionar problemas comunes
- Ejemplos de código

**Leer si:** Necesitas crear nuevos usuarios o gestionar accesos

---

### 🚀 [7. Deployment en Vercel](./07-DEPLOYMENT_VERCEL.md)
**Descripción:** Documentación del sistema de deploy automático
- Flujo completo de deploy automático
- Configuración de Vercel (vercel.json)
- Variables de entorno
- Conexión Vercel ↔ Supabase
- Optimizaciones de build
- Monitoreo y logs
- Rollback y hotfixes
- Troubleshooting común
- Performance tips

**Leer si:** Necesitas desplegar cambios, gestionar releases o solucionar problemas de deploy

---

### 💾 [8. Historial de Liquidaciones](./08-HISTORIAL_LIQUIDACIONES.md)
**Descripción:** Documentación técnica del módulo de gestión de liquidaciones
- Componentes principales y estructura
- Tablas de base de datos (tasador_historial_liquidaciones, tasador_relacion_informes_liquidaciones)
- Storage de archivos (bucket informes_liquidaciones)
- Funcionalidades (guardar, auto-guardado de PDFs, descarga)
- Estadísticas en tiempo real (4 tarjetas)
- Botones y acciones disponibles
- Filtros avanzados (7 tipos)
- Visor modal de detalles con 4 secciones
- Integración con PDF (generación y almacenamiento)
- Descarga de informes desde Storage

**Leer si:** Trabajas con liquidaciones de intereses, necesitas entender cómo se almacenan PDFs o quieres implementar descarga de informes

---

## 🎯 Guías Rápidas por Rol

### Para Desarrolladores Frontend
1. Leer: [Arquitectura](./01-ARQUITECTURA.md) (Visión general)
2. Leer: [Tasaciones](./02-TASACIONES.md) (Componentes y hooks)
3. Leer: [Calculadora de Intereses](./03-CALCULADORA_INTERESES.md) (Lógica)
4. Leer: [Historial Liquidaciones](./08-HISTORIAL_LIQUIDACIONES.md) (Gestión PDFs)
5. Leer: [Deployment](./07-DEPLOYMENT_VERCEL.md) (Cómo deployar)

### Para Administradores
1. Leer: [Arquitectura](./01-ARQUITECTURA.md) (Entender el sistema)
2. Leer: [Panel Admin](./05-PANEL_ADMIN.md) (Gestión completa)
3. Leer: [Crear Usuarios](./06-CREAR_USUARIOS_SUPABASE.md) (Gestión de accesos)
4. Leer: [Historial Liquidaciones](./08-HISTORIAL_LIQUIDACIONES.md) (Ver y exportar liquidaciones)
5. Leer: [Deployment](./07-DEPLOYMENT_VERCEL.md) (Monitoreo)

### Para DevOps / Backend
1. Leer: [Arquitectura](./01-ARQUITECTURA.md) (Componentes backend)
2. Leer: [Deployment](./07-DEPLOYMENT_VERCEL.md) (CI/CD)
3. Leer: [Crear Usuarios](./06-CREAR_USUARIOS_SUPABASE.md) (Auth)
4. Leer: [Historial Liquidaciones](./08-HISTORIAL_LIQUIDACIONES.md) (Storage y base de datos)
5. Leer: [Panel Admin](./05-PANEL_ADMIN.md) (Configuración)

### Para Product Managers / QA
1. Leer: [Arquitectura](./01-ARQUITECTURA.md) (Visión general)
2. Leer: [Tasaciones](./02-TASACIONES.md) (Funcionalidad principal)
3. Leer: [Calculadora de Intereses](./03-CALCULADORA_INTERESES.md) (Funcionalidad secundaria)
4. Leer: [Historial](./04-HISTORIAL_TASACIONES.md) (Gestión de datos)
5. Leer: [Historial Liquidaciones](./08-HISTORIAL_LIQUIDACIONES.md) (Informes y estadísticas)

---

## 🔑 Conceptos Clave

### ICA (Índice de Costas de Aranceles)
- Criterio oficial para determinar costas judiciales
- Varía según municipio/provincia
- Utilizado para búsquedas en tabla `costas_x_ica`
- Ver: [Tasaciones](./02-TASACIONES.md#tabla-costas_x_ica)

### RLS (Row Level Security)
- Política de seguridad de Supabase
- Cada usuario solo ve sus propios datos
- Implementado a nivel de base de datos
- Ver: [Arquitectura](./01-ARQUITECTURA.md#seguridad)

### Edge Functions
- Funciones serverless ejecutadas en Deno
- Deploy automático desde `/supabase/functions`
- Ver: [Arquitectura](./01-ARQUITECTURA.md#nivel-de-datos)

### JWT Token
- Token de autenticación con expiración
- Válido por 1 hora, refresh válido 7 días
- Enviado en headers `Authorization: Bearer`
- Ver: [Crear Usuarios](./06-CREAR_USUARIOS_SUPABASE.md)

### Vite
- Build tool usado para compilación
- Genera bundles optimizados en `dist/`
- Ver: [Deployment](./07-DEPLOYMENT_VERCEL.md#build-process)

---

## 📊 Tabla de Contenidos Rápida

| Documento | Páginas | Temas Principales |
|-----------|---------|------------------|
| Arquitectura | - | Diagrama, capas, flujos |
| Tasaciones | - | CRUD, cálculo, validación |
| Intereses | - | Fórmulas, tipos, capitalización |
| Historial Tasaciones | - | Filtros, búsqueda, exportación |
| Panel Admin | - | CRUD datos, gestión usuarios |
| Crear Usuarios | - | Métodos, roles, gestión |
| Deployment | - | CI/CD, Vercel, troubleshooting |
| Historial Liquidaciones | - | PDFs, almacenamiento, estadísticas |

---

## 🔗 Enlaces Importantes

### Acceso a Aplicación
- **Producción:** https://tasador-web.vercel.app/
- **Staging:** https://tasador-web-staging.vercel.app/ (si aplica)
- **Local:** http://localhost:5173

### Herramientas Externas
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Console:** https://app.supabase.com/
- **GitHub Repositorio:** https://github.com/danielgarcia-tech/tasador-web
- **GitHub Actions:** Workflows automáticos

### Documentación Externa
- **React Docs:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **Vite:** https://vitejs.dev/guide/
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 📝 Notas Importantes

### ⚠️ Seguridad
- **Nunca** pushear `.env.local` a Git
- **Nunca** compartir API keys públicamente
- **Siempre** usar RLS policies en tablas sensibles
- **Siempre** validar inputs en cliente y servidor

### ✅ Mejores Prácticas
- Hacer commit con mensajes descriptivos
- Crear PR antes de mergear a main
- Testear en preview antes de deploy
- Documentar cambios importantes
- Usar feature branches para desarrollo

### 🔄 Workflow Estándar
```
1. Crear rama feature desde main
2. Hacer cambios locales
3. Push a rama → Vercel preview deploy
4. Test en preview
5. Crear PR en GitHub
6. Code review
7. Merge a main → Deploy a producción
```

---

## ❓ FAQ

**P: ¿Dónde veo los logs de deploy?**
R: En Vercel Dashboard → Deployments → [Versión] → Logs

**P: ¿Cómo agrego nueva funcionalidad?**
R: 1. Crear rama feature, 2. Hacer cambios, 3. PR, 4. Review, 5. Merge

**P: ¿Dónde se guardan datos del usuario?**
R: En Supabase PostgreSQL, tabla `tasaciones` (con RLS policy)

**P: ¿Qué pasa si falla un deploy?**
R: Vercel lo detecta, notifica en Slack (si configurado), y marcas deploy anterior como stable

**P: ¿Puedo revertir a una versión anterior?**
R: Sí, en Vercel Dashboard → [Deploy anterior] → Redeploy

**P: ¿Cómo cambio variables de entorno?**
R: En Vercel → Settings → Environment Variables → Editar y guardar → Auto-redeploy

**P: ¿Quién puede acceder al admin panel?**
R: Solo usuarios con rol 'admin' en tabla `usuarios_personalizados`

---

## 📞 Soporte

Si tienes preguntas sobre la documentación:
1. Busca en el índice de contenidos
2. Usa Ctrl+F para buscar keywords
3. Revisa la sección FAQ
4. Contacta al equipo de desarrollo

---

**Última actualización:** Octubre 2025
**Versión:** 1.0
**Mantenedor:** Equipo de Desarrollo Tasador Web
