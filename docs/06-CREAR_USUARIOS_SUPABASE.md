# 👤 Creación de Usuarios con Supabase - Guía Práctica

## Descripción General

Esta guía explica cómo crear usuarios en Supabase de manera segura y eficiente. Se pueden crear usuarios de dos formas:
1. **A través de la interfaz admin de Tasador Web** (Recomendado)
2. **Directamente en el dashboard de Supabase** (Para casos específicos)

## Método 1: Crear Usuario desde Panel Admin de Tasador Web (RECOMENDADO)

### Pasos

#### 1. Acceder al Panel Admin

```
1. Abrir aplicación: https://tasador-web.vercel.app/
2. Iniciar sesión con usuario administrativo
3. Hacer clic en Tab "Configuración"
4. Seleccionar "Gestión de Usuarios"
```

#### 2. Interfaz de Gestión de Usuarios

En la pantalla de "Gestión de Usuarios" verás:

```
┌─────────────────────────────────────────────┐
│  Gestión de Usuarios                        │
├─────────────────────────────────────────────┤
│                                             │
│  [Buscar usuario...]                        │
│                                             │
│  [+ Crear nuevo usuario]                    │
│                                             │
│  Tabla de usuarios:                         │
│  ├─ Email                                   │
│  ├─ Nombre                                  │
│  ├─ Rol (Admin/User/ReadOnly)               │
│  ├─ Activo (Sí/No)                          │
│  ├─ Último acceso                           │
│  └─ Acciones (Editar/Eliminar)              │
│                                             │
└─────────────────────────────────────────────┘
```

#### 3. Hacer Clic en "Crear nuevo usuario"

Se abrirá un modal/formulario:

```
┌────────────────────────────────────┐
│  Crear Nuevo Usuario               │
├────────────────────────────────────┤
│                                    │
│  Email: [_____________________]    │
│  *Requerido, debe ser email único  │
│                                    │
│  Nombre: [_____________________]   │
│  *Requerido                        │
│                                    │
│  Apellido: [_____________________] │
│  *Opcional                         │
│                                    │
│  Rol: [Admin ▼]                    │
│  Opciones:                         │
│    • Admin (acceso total)          │
│    • User (usuario normal)         │
│    • ReadOnly (solo lectura)       │
│                                    │
│  [Cancelar]  [Crear Usuario]       │
│                                    │
└────────────────────────────────────┘
```

#### 4. Completar los Datos

```typescript
{
  email: "usuario@example.com",           // Ejemplo: juan.garcia@despacho.es
  nombre: "Juan",
  apellido: "García",
  rol: "user"                             // 'admin', 'user', o 'readonly'
}
```

**Validaciones:**
- ✅ Email válido y único
- ✅ Nombre no vacío
- ✅ Rol válido seleccionado

#### 5. Hacer Clic en "Crear Usuario"

El sistema automáticamente:

```
1. Valida los datos en cliente
   ↓
2. Crea usuario en Supabase Auth
   ├─ Genera ID único (UUID)
   ├─ Crea cuenta con email
   └─ Establece estado "confirmado"
   ↓
3. Crea registro en tabla usuarios_personalizados
   ├─ Inserta: id, email, nombre, apellido, rol, activo=true
   └─ Establece fecha de creación
   ↓
4. Envía email de bienvenida
   ├─ Asunto: "Bienvenido a Tasador Web"
   ├─ Incluye: link de login
   └─ Contraseña temporal
   ↓
5. Muestra confirmación
   └─ "Usuario creado exitosamente"
```

#### 6. El Nuevo Usuario Recibe Email

**Email de bienvenida:**

```
Asunto: Bienvenido a Tasador Web

Hola Juan,

Tu cuenta ha sido creada en Tasador Web.

Datos de acceso:
Email: juan.garcia@despacho.es
Contraseña temporal: [GeneradaAleatoriamente]

Link de acceso: https://tasador-web.vercel.app/

⚠️ Por seguridad, cambia tu contraseña en el primer acceso.

¿Preguntas? Contacta al administrador.

Saludos,
Equipo Tasador Web
```

#### 7. Primer Acceso del Usuario

```
1. El usuario accede: https://tasador-web.vercel.app/
   ↓
2. Pantalla de Login
   ↓
3. Ingresan: email y contraseña temporal
   ↓
4. Sistema valida credenciales en Supabase Auth
   ↓
5. Si es primer acceso: pedir cambio de contraseña
   ├─ Nueva contraseña
   └─ Confirmar contraseña
   ↓
6. Generar JWT token
   ↓
7. Redirigir a dashboard principal
```

---

## Método 2: Crear Usuario Directamente en Supabase Dashboard

### Pasos

#### 1. Acceder a Supabase Console

```
1. Ir a: https://app.supabase.com/
2. Iniciar sesión con credenciales Supabase
3. Seleccionar proyecto "tasador-web"
```

#### 2. Navegar a Autenticación

```
En el menú lateral:
Authentication
    ├─ Users (Actualizar)
    ├─ Policies
    ├─ URL Configuration
    └─ Providers
    
Hacer clic en: Users
```

#### 3. Crear Usuario

En la pantalla de usuarios:

```
Botón en esquina superior derecha: "+ Create a new user"
```

#### 4. Completar Formulario

```
┌─────────────────────────────────────────────────────┐
│ Create a new user                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Email: [__________________________________]         │
│ *Requerido                                          │
│                                                     │
│ Password: [__________________________________]      │
│ *Dejar vacío para generar en cliente                │
│                                                     │
│ Auto Confirm User: [✓] Activado                     │
│ *Recomendado: activado                              │
│                                                     │
│ [Cancel]  [Create User]                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 5. Completar Perfil en BD

Después de crear en Auth, agregar datos en tabla `usuarios_personalizados`:

```sql
INSERT INTO usuarios_personalizados (
  id,
  email,
  nombre,
  rol,
  activo
) VALUES (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  -- ID retornado por Supabase
  'usuario@example.com',
  'Juan García',
  'user',
  true
);
```

**Obtener el ID:** Después de crear usuario en Auth, copiar el UUID mostrado.

---

## Método 3: Crear Usuarios en Masa (Bulk)

### Importar desde Excel

#### 1. Preparar archivo Excel

Estructura requerida:

```
┌─────────────────────────────────────────────────────┐
│ Email                    │ Nombre    │ Rol          │
├──────────────────────────┼───────────┼──────────────┤
│ juan.garcia@example.com  │ Juan      │ user         │
│ maria.lopez@example.com  │ María     │ user         │
│ admin@example.com        │ Admin     │ admin        │
│ readonly@example.com     │ ReadOnly  │ readonly     │
└─────────────────────────────────────────────────────┘
```

**Archivo:** `usuarios_nuevo.xlsx`

#### 2. Acceder a Panel Admin

```
Panel Admin → Gestión de Usuarios → [Importar desde Excel]
```

#### 3. Seleccionar Archivo

```
Arrastrar archivo o hacer clic para seleccionar
```

#### 4. Validar Estructura

Sistema verifica:
- ✅ Columnas requeridas presentes
- ✅ Emails válidos
- ✅ Roles válidos
- ✅ Sin duplicados en email

#### 5. Importar

```
[Vista previa de datos]
Validados: ✓ 100/100 usuarios

[Importar todos]
```

Resultado:

```
✅ Importación completada
   ├─ 100 usuarios creados
   ├─ 0 errores
   └─ Emails de bienvenida enviados
```

---

## Gestión Posterior

### Ver Usuarios

```
Admin Panel → Gestión de Usuarios

Columnas visibles:
├─ Email
├─ Nombre
├─ Rol
├─ Activo
├─ Último acceso
└─ Acciones
```

### Editar Usuario

```
Hacer clic en ✏️ (Editar)

Campos editables:
├─ Nombre
├─ Rol
├─ Estado (Activo/Inactivo)

[Guardar]
```

### Cambiar Contraseña

```
Hacer clic en Usuario

Botón: "Cambiar Contraseña"

Sistema:
1. Envía link de reset al email
2. Usuario sigue enlace
3. Ingresa nueva contraseña
4. Contraseña actualizada
```

### Resetear Contraseña (Admin)

```
Desde Panel Admin:

Botón "Resetear Contraseña" (Usuario)
    ↓
Envía email automático
    ↓
Usuario ingresa nueva contraseña mediante link
```

### Desactivar Usuario

```
Hacer clic en Usuario

Interruptor: "Activo" → OFF

Resultado:
├─ Usuario no puede iniciar sesión
├─ Sus tasaciones se mantienen (no se borran)
└─ Se puede reactivar después
```

### Eliminar Usuario

```
⚠️ CUIDADO: Operación irreversible

Hacer clic en Usuario

Botón "Eliminar Usuario"

Confirmación:
"¿Estás seguro? Se eliminarán todos los datos del usuario."

[Cancelar] [Eliminar]

Resultado:
├─ Usuario eliminado de auth
├─ Registro en usuarios_personalizados eliminado
└─ Tasaciones asociadas (decision según política)
```

---

## Tabla SQL: usuarios_personalizados

```sql
CREATE TABLE usuarios_personalizados (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información básica
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  apellidos VARCHAR(255),
  
  -- Permisos y estado
  rol VARCHAR(50) DEFAULT 'user',
  -- Valores: 'admin', 'user', 'readonly'
  
  activo BOOLEAN DEFAULT true,
  
  -- Auditoría
  ultimo_acceso TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_email (email),
  INDEX idx_rol (rol)
);

-- Row Level Security
CREATE POLICY "Users can see their own profile"
  ON usuarios_personalizados FOR SELECT
  USING (auth.uid() = id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admins can modify users"
  ON usuarios_personalizados FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admins can delete users"
  ON usuarios_personalizados FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');
```

---

## Roles y Permisos

### Admin
```typescript
{
  rol: 'admin',
  permisos: {
    usuarios: ['crear', 'editar', 'eliminar', 'ver_todos'],
    datos: ['crear', 'editar', 'eliminar', 'importar', 'exportar'],
    sistema: ['ver_logs', 'configurar']
  }
}
```

### User (Usuario Normal)
```typescript
{
  rol: 'user',
  permisos: {
    tasaciones: ['crear_propias', 'editar_propias', 'eliminar_propias', 'ver_propias'],
    calculadora: ['usar'],
    settings: ['editar_propios']
  }
}
```

### ReadOnly
```typescript
{
  rol: 'readonly',
  permisos: {
    tasaciones: ['ver_propias'],
    calculadora: ['usar']
  }
}
```

---

## Solucionar Problemas

### "Email ya existe"

```
Error: El email ya está registrado

Solución:
1. Usar email diferente
2. Si usuario ya existe, editar en lugar de crear nuevo
3. Ver detalles del usuario existente
```

### "Contraseña no válida"

```
Error: Contraseña debe tener al menos 6 caracteres

Requisitos:
├─ Mínimo 6 caracteres
├─ Sin restricciones de mayúscula/números
└─ Se puede cambiar después
```

### "Email no enviado"

```
Si el email de bienvenida no llega:

1. Verificar spam/promociones
2. Hacer clic en "Reenviar email"
3. Cambiar email si es incorrecto
4. Contactar administrador
```

### Usuario no puede iniciar sesión

```
Verificar:
1. Email correcto
2. Contraseña correcta
3. Usuario activo (no desactivado)
4. Email confirmado (si está requerido)

Si sigue sin funcionar:
→ Admin resetea contraseña
```

### "Rol no válido"

```
Valores válidos:
✅ 'admin'
✅ 'user'
✅ 'readonly'

❌ 'administrator'
❌ 'superuser'
❌ Otros valores
```

---

## Mejores Prácticas

### ✅ Seguridad

1. **Contraseñas seguras:** Generar aleatoriamente
2. **Pedir cambio:** En primer acceso
3. **2FA opcional:** Considerarlo en futuras versiones
4. **Límite de intentos:** Automático en Supabase

### ✅ Gestión

1. **Emails únicos:** Evitar duplicados
2. **Roles apropiados:** No todos admin
3. **Desactivar vs Eliminar:** Conservar histórico
4. **Auditoría:** Registrar cambios

### ✅ Comunicación

1. **Emails claros:** Instrucciones simples
2. **Links válidos:** Validez 24-48h
3. **Soporte:** Información de contacto
4. **Bienvenida:** Primera impresión

---

## Código de Ejemplo

### Crear usuario mediante API

```typescript
// src/lib/user-management.ts

export async function crearUsuario(
  email: string,
  nombre: string,
  apellido: string,
  rol: 'admin' | 'user' | 'readonly' = 'user'
): Promise<{ id: string; email: string }> {
  try {
    // 1. Crear en Supabase Auth
    const { data: authData, error: authError } = 
      await supabase.auth.admin.createUser({
        email,
        password: generarPasswordTemporal(),
        email_confirm: true,
        user_metadata: {
          nombre,
          apellido,
          rol
        }
      })

    if (authError) throw authError

    // 2. Crear en tabla usuarios_personalizados
    const { data: dbData, error: dbError } = await supabase
      .from('usuarios_personalizados')
      .insert([
        {
          id: authData.user.id,
          email,
          nombre,
          apellidos: apellido,
          rol,
          activo: true
        }
      ])
      .select()
      .single()

    if (dbError) throw dbError

    // 3. Enviar email de bienvenida
    await supabase.functions.invoke('send-welcome-email', {
      body: {
        email,
        nombre,
        rol
      }
    })

    return {
      id: authData.user.id,
      email: authData.user.email || ''
    }
  } catch (error) {
    throw new Error(`Error creando usuario: ${error.message}`)
  }
}

function generarPasswordTemporal(): string {
  return Math.random().toString(36).slice(-12)
}
```

### Hook para crear usuario

```typescript
// src/hooks/useCreateUser.ts

export function useCreateUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crear = async (
    email: string,
    nombre: string,
    apellido: string,
    rol: 'admin' | 'user' | 'readonly'
  ) => {
    setLoading(true)
    setError(null)

    try {
      const usuario = await crearUsuario(email, nombre, apellido, rol)
      return usuario
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido'
      setError(mensaje)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { crear, loading, error }
}
```

---

## Próximos Pasos

1. ✅ Usuario creado
2. 📧 Email de bienvenida enviado
3. 🔐 Usuario ingresa con credenciales
4. 🔄 Primer acceso, cambiar contraseña
5. 📊 Comenzar a usar Tasador Web
