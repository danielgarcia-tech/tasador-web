# 🚀 Deployment en Vercel - Documentación Técnica

## Descripción General

Tasador Web está configurada para despliegue automático y continuo en Vercel. Este documento explica cómo funciona el sistema de deploy, cómo configurarlo, y cómo solucionar problemas.

## Flujo de Deploy Automático

```
┌────────────────────────────────────────────────────────────┐
│ 1. DESARROLLADOR HACE GIT COMMIT & PUSH                    │
│    $ git add .                                             │
│    $ git commit -m "Feature: nueva calculadora"            │
│    $ git push origin feature-branch                        │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────┐
│ 2. GITHUB RECIBE PUSH                                      │
│    ├─ Actualiza repositorio                               │
│    ├─ Ejecuta checks: eslint, typescript                   │
│    └─ Envia webhook a Vercel                              │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────┐
│ 3. VERCEL RECIBE WEBHOOK                                   │
│    ├─ Detecta cambios en rama                              │
│    ├─ Inicia nuevo build                                   │
│    └─ Asigna ID de deploy único                           │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────┐
│ 4. BUILD PROCESS                                           │
│                                                            │
│    a) Instalar dependencias                                │
│       $ npm ci                                             │
│       ├─ Instala versiones exactas de package-lock.json    │
│       ├─ Verifica integridad                               │
│       └─ ~3 minutos                                        │
│                                                            │
│    b) TypeScript compilation                               │
│       $ tsc -b                                             │
│       ├─ Verifica tipos                                    │
│       ├─ Genera errores si hay incompatibilidades          │
│       └─ ~30 segundos                                      │
│                                                            │
│    c) Build con Vite                                       │
│       $ vite build                                         │
│       ├─ Bundling de assets                                │
│       ├─ Minificación                                      │
│       ├─ Tree shaking                                      │
│       ├─ Sourcemaps para debugging                         │
│       └─ ~2 minutos                                        │
│                                                            │
│    d) Optimizaciones Vercel                                │
│       ├─ Image optimization                                │
│       ├─ Font optimization                                 │
│       ├─ CSS minification                                  │
│       └─ JS compression (gzip/brotli)                      │
│                                                            │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────┐
│ 5. VERIFICACIÓN DE BUILD                                   │
│    ├─ ✅ Build exitoso                                     │
│    └─ ❌ Build fallido (ver logs)                          │
└─────────────────┬──────────────────────────────────────────┘
                  │
          ┌───────┴───────┐
          │               │
        ✅                ❌
          │               │
          ↓               ↓
    ┌──────────┐    ┌──────────────────┐
    │ 6. TEST  │    │ BUILD FALLIDO    │
    │ PREVIEW  │    │ Notificar dev    │
    └────┬─────┘    │ Rol back a main  │
         │          └──────────────────┘
         ↓
┌────────────────────────────────────────────────────────────┐
│ 7. PREVIEW DEPLOYMENT                                      │
│    ├─ URL temporal: https://xxxxx-projectname.vercel.app  │
│    ├─ Disponible por 72 horas                              │
│    ├─ Ideal para testing antes de merge                    │
│    └─ Acceso compartido con team                           │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────┐
│ 8. CODE REVIEW EN GITHUB                                   │
│    ├─ Crear Pull Request                                   │
│    ├─ Revisar cambios                                      │
│    ├─ Vercel comenta en PR con link a preview              │
│    ├─ Testing en ambiente igual a producción               │
│    └─ [Approve & Merge to main]                            │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────┐
│ 9. MERGE A MAIN                                            │
│    ├─ Merge PR                                             │
│    ├─ GitHub envía webhook a Vercel                        │
│    └─ Vercel detecta cambios en master                     │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────┐
│ 10. PRODUCTION DEPLOYMENT                                  │
│    ├─ Build (mismos pasos que preview)                     │
│    ├─ Tests de deploy                                      │
│    ├─ Validar connectivity                                 │
│    └─ Deploying to CDN global...                           │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────┐
│ 11. CDN GLOBAL DISTRIBUTION                                │
│    ├─ Estados Unidos (East/West)                           │
│    ├─ Europa (Frankfurt, London)                           │
│    ├─ Asia (Singapore, Tokyo)                              │
│    ├─ LATAM (São Paulo)                                    │
│    └─ Replicación: ~30 segundos                            │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────┐
│ 12. VERIFICACIÓN POST-DEPLOY                               │
│    ├─ Health checks                                        │
│    ├─ Conectividad a Supabase                              │
│    ├─ Variables de entorno                                 │
│    ├─ SSL certificate valid                                │
│    └─ Staging URLs funcionales                             │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────┐
│ 13. LANZAMIENTO EN VIVO                                    │
│    ├─ URL principal: https://tasador-web.vercel.app       │
│    ├─ Dominio custom: https://tasador.midominio.es        │
│    ├─ Edge caching activado                                │
│    ├─ Availability: 99.99%                                 │
│    └─ SSL/TLS automático                                   │
└────────────────────────────────────────────────────────────┘
```

## Configuración de Vercel

### archivo: vercel.json

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "functions": {
    "api/**": {
      "maxDuration": 30,
      "memory": 512
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ],
  "redirects": [],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.supabase.co/:path*"
    }
  ]
}
```

### package.json - Scripts de Build

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**Explicación:**
- `npm run build`: 
  1. Compila TypeScript: `tsc -b` 
  2. Build con Vite: `vite build`
- Vite genera carpeta `dist/` con archivos optimizados
- Vercel sirve contenido estático desde `dist/`

### Estructura de Directorios para Deploy

```
tasador-web/
├── dist/                    ← Generado por Vite (output)
│   ├── index.html
│   ├── assets/
│   │   ├── app-xxxxx.js
│   │   └── styles-xxxxx.css
│   └── vite.svg
│
├── src/                     ← Código fuente
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── contexts/
│   └── ...
│
├── api/                     ← Edge Functions (opcional)
│   ├── admin/
│   │   ├── delete-user.ts
│   │   └── wipe-password.ts
│   └── ...
│
├── public/                  ← Assets estáticos
│   └── interest-rates.json
│
├── vercel.json              ← Configuración Vercel
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── ...
```

## Variables de Entorno en Vercel

### Configurar Environment Variables

#### 1. En Vercel Dashboard

```
Proyecto → Settings → Environment Variables

Agregar:
┌──────────────────────────────────────────┐
│ VITE_SUPABASE_URL                        │
│ https://xxxxxx.supabase.co               │
│                                          │
│ [Save]                                   │
│                                          │
│ VITE_SUPABASE_ANON_KEY                   │
│ ey.... (clave de 40+ caracteres)         │
│                                          │
│ [Save]                                   │
└──────────────────────────────────────────┘
```

#### 2. Ambientes diferentes

```
Production (main):
├─ VITE_SUPABASE_URL = https://xxxxx.supabase.co
└─ VITE_SUPABASE_ANON_KEY = eyJhbGc...

Preview (feature branches):
├─ VITE_SUPABASE_URL = https://xxxxx-staging.supabase.co
└─ VITE_SUPABASE_ANON_KEY = eyJhbGc... (staging key)

Development (local):
├─ .env.local
├─ VITE_SUPABASE_URL = http://localhost:54321
└─ VITE_SUPABASE_ANON_KEY = eyJhbGc...
```

### .env.example

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Vercel Analytics (opcional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxxxxx

# Speed Insights (opcional)
VERCEL_SPEED_INSIGHTS_ID=xxxxxx
```

## Conexión Vercel ↔ Supabase

### Flujo de Autenticación

```
┌──────────────┐
│   Cliente    │
│  (Browser)   │
└──────┬───────┘
       │
       │ 1. Usuario login
       │    email + password
       ↓
┌──────────────────────────────────┐
│  Vercel (tasador-web.vercel.app) │
│  - React App                      │
│  - Supabase JS Client             │
└──────────┬───────────────────────┘
           │
           │ 2. Conecta a Supabase
           │    VITE_SUPABASE_URL
           │
           ↓
┌──────────────────────────────────┐
│  Supabase API                     │
│  (xxxxxx.supabase.co)             │
│  - Valida credenciales            │
│  - Genera JWT token               │
│  - Retorna token + session        │
└──────────────────────────────────┘
           ↑
           │ 3. JWT Token
           │
           ├─ Header: Authorization: Bearer eyJhbGc...
           │
           └─ Válido por: 1 hora
              Refresh: 7 días
```

## Build Optimization

### 1. Tree Shaking

```typescript
// SÍ funciona (default export)
export default function App() { ... }
// Importado: import App from './App'
// Si no se usa: se elimina del bundle

// SÍ funciona (named export)
export function utilizarTasaciones() { ... }
// Si no se usa: se elimina del bundle

// NO funciona (side effects)
import './styles.css' // Se mantiene
```

### 2. Code Splitting

```typescript
// Vite detecta lazy imports automáticamente
const AdminPanel = lazy(() => import('./components/AdminPanel'))
const InterestCalc = lazy(() => import('./components/InterestCalculatorAdvanced'))

// Genera chunks separados:
// - admin-panel-xxx.js (descargado cuando se necesita)
// - interest-calc-xxx.js (descargado cuando se necesita)
```

### 3. Asset Optimization

```
Entrada:
├─ 1200+ lineas CSS → minificadas → 45KB gzip
├─ 8000+ lineas JS → bundled + minified → 180KB gzip
└─ Imágenes PNG → webp → 40% más pequeño

Resultado:
├─ Total inicial: 250KB
├─ Total gzip: 65KB (74% compresión)
└─ Carga en 1.2s (red 4G)
```

## Monitoreo y Logs

### Acceder a Logs

#### 1. Vercel Dashboard

```
Proyecto → Deployments

Última versión → Logs

Ver:
├─ Build logs (compilación)
├─ Edge Function logs
├─ Runtime logs
└─ Errores de deploy
```

#### 2. Logs de Build

```
BUILD COMMAND:
npm run build

OUTPUT:
✓ 48 modules transformed

dist/index.html                 0.45 kB
dist/assets/app-xxx.js       185.32 kB / gzip: 62.45 kB
dist/assets/styles-xxx.css     12.54 kB / gzip: 3.21 kB

Build complete: 2m 15s
```

#### 3. Logs de Runtime

```
Acceder a: https://tasador-web.vercel.app/
Check: Network tab en DevTools

Métrica clave:
├─ First Contentful Paint: 1.2s
├─ Largest Contentful Paint: 2.1s
├─ Cumulative Layout Shift: 0.08
└─ Time to Interactive: 2.8s
```

## Rollback (Volver a Versión Anterior)

### Si Deploy Fallido

```
1. En Vercel Dashboard → Deployments

2. Ver lista de deploys recientes
   ├─ Última (fallido)
   ├─ Anterior (exitoso) ✅
   └─ Anterior-2

3. Click en deploy anterior exitoso

4. Botón: "Redeploy"
   └─ Vuelve a deployar esa versión

5. Vercel regenera automáticamente
   └─ URL vuelve a versión anterior
```

### Si Hay Bugs en Producción

```
Opción 1: Rollback rápido (arriba)
├─ Tiempo: 3-5 minutos
└─ Vuelve a versión conocida

Opción 2: Fix & Redeploy
├─ Corregir bug en código
├─ Commit & push a main
├─ Vercel auto-deploya
└─ Tiempo: 5-7 minutos
```

## Casos de Uso Comunes

### Caso 1: Desplegar Feature Nueva

```
1. Crear rama feature
   $ git checkout -b feature/nueva-calculadora

2. Hacer cambios y commits
   $ git add .
   $ git commit -m "Feat: añadir calculadora de intereses"

3. Push a rama
   $ git push origin feature/nueva-calculadora

4. Vercel automáticamente:
   ├─ Build preview deployment
   ├─ URL: https://xxxxx-feature-xxxxx.vercel.app
   └─ Comentario en GitHub con link

5. Testear en preview

6. Crear Pull Request en GitHub

7. Merge a main → Deploy a producción
```

### Caso 2: Hotfix de Bug en Producción

```
1. Clonar latest main
   $ git pull origin main

2. Crear rama hotfix
   $ git checkout -b hotfix/bug-critico

3. Arreglar bug
   $ # editar archivos

4. Commit y push
   $ git add .
   $ git commit -m "Fix: corregir cálculo de IVA"
   $ git push origin hotfix/bug-critico

5. Crear PR desde hotfix → main

6. Review rápido

7. Merge a main → Auto deploy a producción
```

### Caso 3: Actualizar Variables de Entorno

```
Escenario: Nueva clave de Supabase

1. En Supabase:
   ├─ Generar nueva API key
   └─ Copiar clave

2. En Vercel Dashboard:
   ├─ Settings → Environment Variables
   ├─ Editar: VITE_SUPABASE_ANON_KEY
   ├─ Pegar nuevo valor
   └─ [Save]

3. Vercel detecta cambio:
   ├─ Marca todos los deploys como obsoletos
   ├─ Redeploy automático de main
   └─ Nuevo env var disponible en 1-2 minutos
```

## Troubleshooting

### Build Fallido: "TypeScript compilation failed"

```
Error: src/components/AdminPanel.tsx (25,10): 
       Property 'email' does not exist on type 'User'

Solución:
1. Revisar tipos en interfaces
2. Ejecutar localmente: npm run build
3. Fijar tipos faltantes
4. Commit y push
```

### Build Fallido: "Module not found"

```
Error: Cannot find module '@/lib/supabase'

Solución:
1. Verificar import es correcto
2. Comprobar alias en tsconfig.json
   "paths": {
     "@/*": ["./src/*"]
   }
3. Verificar archivo existe
4. Reexecute build
```

### Deploy Lento (>10 minutos)

```
Posibles causas:
├─ Instalación lenta de npm
├─ Build de assets pesados
├─ Timeout de Supabase
└─ Fila de deploys en Vercel

Optimizaciones:
├─ Usar npm ci en lugar de npm install
├─ Reducir tamaño de dependencias
├─ Lazy load componentes grandes
└─ Esperar si hay fila
```

### App No Carga en Vercel

```
Verificar:
1. URL correcta: https://tasador-web.vercel.app/
2. Status en Vercel: Ready?
3. Network tab:
   ├─ index.html → 200?
   ├─ app-xxx.js → 200?
   └─ styles-xxx.css → 200?
4. Console errors?
5. Conecta a Supabase?
   └─ Check VITE_SUPABASE_URL en Network
6. CORS issues?
```

### Variables de Entorno No Funcionan

```
Problema: app.env.VITE_SUPABASE_URL undefined

Verificar:
1. En Vercel: Settings → Environment Variables
   └─ ¿Variable existe?
2. Nombre correcto: VITE_SUPABASE_URL (case-sensitive)
3. En código: import.meta.env.VITE_SUPABASE_URL
4. Redeploy después de agregar variables
5. Hard refresh del navegador
```

## Performance Tips

```typescript
// ✅ BUENO: Lazy load componentes grandes
const AdminPanel = lazy(() => import('./components/AdminPanel'))

// ✅ BUENO: Code splitting por ruta
const routes = [
  { path: '/', element: <CalculatorContainer /> },
  { path: '/admin', element: <lazy_load_admin /> }
]

// ✅ BUENO: Cache headers en static assets
// vercel.json configura por defecto 1 año

// ❌ MALO: Importar archivos enormes globalmente
import hugeLibrary from 'huge-lib' // En el top level

// ❌ MALO: Múltiples llamadas a API en paralelo sin límites
```

## Resumen del Workflow

```
Local Development
    ↓
$ git push origin feature-branch
    ↓
Vercel Preview Deploy (automático)
    ↓
Test en https://xxxx-preview.vercel.app
    ↓
GitHub Pull Request + Code Review
    ↓
$ git merge
    ↓
Vercel Production Deploy (automático a main)
    ↓
Live en https://tasador-web.vercel.app ✅
```

## Referencias Útiles

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Build Logs**: https://vercel.com/projects
- **Environment Docs**: https://vercel.com/docs/environment-variables
- **Troubleshooting**: https://vercel.com/docs/error-codes
