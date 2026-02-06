# 👤 Creación de Usuarios con Supabase - Guía Práctica

## Descripción General

Esta guía explica cómo crear usuarios en Supabase de manera segura y eficiente para Tasador Web. El sistema utiliza una tabla personalizada `usuarios_personalizados` para la gestión de usuarios con autenticación mediante email y contraseña encriptada.

## ⚡ Métodos de Creación

Se pueden crear usuarios de tres formas:
1. **SQL directo con MCP de Supabase** (Más rápido para usuarios individuales) ⭐ RECOMENDADO
2. **A través de la interfaz admin de Tasador Web** (Interfaz amigable)
3. **Directamente en el dashboard de Supabase** (Máximo control)

---

## Método 1: Crear Usuario con SQL directo (RECOMENDADO) ⭐

### Descripción

Este es el método más rápido y directo para crear usuarios. Utiliza el MCP de Supabase o el SQL Editor para insertar usuarios directamente en la tabla `usuarios_personalizados`.

### Pasos

#### 1. Acceder a SQL Editor

```
Opción A: Usar VS Code con MCP de Supabase (integrado)
Opción B: Dashboard Supabase → SQL Editor
```

#### 2. Ejecutar Query de Creación

**Plantilla SQL:**

```sql
-- Crear usuario con contraseña encriptada
INSERT INTO usuarios_personalizados (
  email,
  password_hash,
  nombre,
  rol,
  activo
) VALUES (
  'usuario@example.com',                    -- Email del usuario
  crypt('ContraseñaSegura123', gen_salt('bf')),  -- Contraseña encriptada con bcrypt
  'Nombre Completo',                        -- Nombre del usuario
  'user',                                   -- Rol: 'admin', 'user', o 'readonly'
  true                                      -- Usuario activo desde el inicio
) RETURNING id, email, nombre, rol, activo, created_at;
```

**Ejemplo Real:**

```sql
-- Crear usuario para Juan García
INSERT INTO usuarios_personalizados (
  email,
  password_hash,
  nombre,
  rol,
  activo
) VALUES (
  'juan.garcia@despacho.es',
  crypt('JuanGarcia2026.', gen_salt('bf')),
  'Juan García López',
  'user',
  true
) RETURNING id, email, nombre, rol, activo, created_at;
```

#### 3. Verificar Creación

El sistema devolverá:

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "juan.garcia@despacho.es",
  "nombre": "Juan García López",
  "rol": "user",
  "activo": true,
  "created_at": "2026-02-05T10:30:00.000Z"
}
```

### Ventajas de este Método

✅ **Rápido**: Creación inmediata sin navegación de UI  
✅ **Control total**: Defines exactamente todos los parámetros  
✅ **Contraseñas personalizadas**: Puedes establecer la contraseña que quieras  
✅ **Sin dependencias**: No requiere que el panel admin esté implementado  
✅ **Auditable**: El RETURNING muestra exactamente qué se creó

### Crear Múltiples Usuarios a la Vez

```sql
-- Crear varios usuarios en una sola operación
INSERT INTO usuarios_personalizados (email, password_hash, nombre, rol, activo)
VALUES 
  ('usuario1@empresa.es', crypt('Pass123.', gen_salt('bf')), 'Usuario Uno', 'user', true),
  ('usuario2@empresa.es', crypt('Pass456.', gen_salt('bf')), 'Usuario Dos', 'user', true),
  ('admin@empresa.es', crypt('Admin789.', gen_salt('bf')), 'Admin Principal', 'admin', true)
RETURNING id, email, nombre, rol;
```

---

## Método 2: Crear Usuario desde Panel Admin de Tasador Web

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
   ├─ Email válido y único
   ├─ Nombre no vacío
   └─ Rol válido
   ↓
2. Genera contraseña temporal segura
   └─ Formato: 12 caracteres alfanuméricos
   ↓
3. Crea registro en tabla usuarios_personalizados
   ├─ Genera ID único (UUID)
   ├─ Inserta: email, password_hash (bcrypt), nombre, rol
   ├─ Establece: activo=true, created_at=NOW()
   └─ Hash de contraseña con bcrypt
   ↓
4. Muestra credenciales al administrador
   ├─ Email del usuario
   ├─ Contraseña temporal generada
   └─ Instrucción: "Enviar credenciales al usuario"
   ↓
5. Muestra confirmación
   └─ "✅ Usuario creado exitosamente"
```

#### 6. Comunicar Credenciales al Usuario

**El administrador debe enviar manualmente (por email/mensaje seguro):**

```
Asunto: Acceso a Tasador Web

Hola Juan,

Tu cuenta ha sido creada en Tasador Web.

📧 Email: juan.garcia@despacho.es
🔑 Contraseña temporal: Abc123Xyz789

🔗 Acceso: https://tasador-web.vercel.app/

⚠️ Por seguridad, cambia tu contraseña en el primer acceso desde:
   Menú → Perfil → Cambiar Contraseña

Saludos,
Equipo Administración
```

**Nota**: Considera usar canales seguros para enviar contraseñas (WhatsApp cifrado, email con seguimiento, etc.)

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

## Método 3: Crear Usuario Directamente en Supabase Dashboard

### Pasos

#### 1. Acceder a Supabase Console

```
1. Ir a: https://app.supabase.com/
2. Iniciar sesión con credenciales Supabase
3. Seleccionar proyecto "tasador-web"
```

#### 2. Navegar a SQL Editor

```
En el menú lateral:
SQL Editor
```

#### 3. Usar Query de Creación

Copia y pega la siguiente query, modificando los valores:

```sql
-- Crear usuario directamente
INSERT INTO usuarios_personalizados (
  email,
  password_hash,
  nombre,
  rol,
  activo
) VALUES (
  'usuario@example.com',                      -- Email del usuario
  crypt('ContraseñaSegura123', gen_salt('bf')), -- Contraseña encriptada
  'Juan García',                              -- Nombre completo
  'user',                                     -- Rol
  true                                        -- Activo
) RETURNING id, email, nombre, rol, created_at;
```

#### 4. Ejecutar Query

Presiona **RUN** o `Ctrl + Enter` para ejecutar.

#### 5. Verificar Resultado

La query devolverá el ID del usuario creado y sus datos.

---

## Método 4: Crear Usuarios en Masa (Bulk)

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

### Estructura Completa

```sql
CREATE TABLE usuarios_personalizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Autenticación
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  
  -- Información del usuario
  nombre VARCHAR(255),
  
  -- Permisos y estado
  rol VARCHAR(50) DEFAULT 'user',
  -- Valores permitidos: 'admin', 'user', 'readonly'
  
  activo BOOLEAN DEFAULT true,
  
  -- Auditoría
  ultimo_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_usuarios_email ON usuarios_personalizados(email);
CREATE INDEX idx_usuarios_rol ON usuarios_personalizados(rol);
CREATE INDEX idx_usuarios_activo ON usuarios_personalizados(activo);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at 
  BEFORE UPDATE ON usuarios_personalizados
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### Verificar Estructura

```sql
-- Ver estructura de la tabla
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'usuarios_personalizados'
ORDER BY ordinal_position;
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

### Crear usuario mediante SQL desde aplicación

```typescript
// src/lib/user-management.ts

export async function crearUsuario(
  email: string,
  nombre: string,
  password: string,
  rol: 'admin' | 'user' | 'readonly' = 'user'
): Promise<{ id: string; email: string; password: string }> {
  try {
    // Crear usuario en usuarios_personalizados con contraseña encriptada
    const { data, error } = await supabase.rpc('crear_usuario', {
      p_email: email,
      p_password: password,
      p_nombre: nombre,
      p_rol: rol
    })

    if (error) throw error

    return {
      id: data.id,
      email: data.email,
      password: password // Devolver para comunicar al usuario
    }
  } catch (error) {
    throw new Error(`Error creando usuario: ${error.message}`)
  }
}

function generarPasswordTemporal(): string {
  // Generar contraseña de 12 caracteres (letras y números)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
```

### Función SQL reutilizable

```sql
-- Crear función para simplificar la creación de usuarios
CREATE OR REPLACE FUNCTION crear_usuario(
  p_email VARCHAR,
  p_password VARCHAR,
  p_nombre VARCHAR,
  p_rol VARCHAR DEFAULT 'user'
)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  nombre VARCHAR,
  rol VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO usuarios_personalizados (
    email,
    password_hash,
    nombre,
    rol,
    activo
  ) VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    p_nombre,
    p_rol,
    true
  )
  RETURNING 
    usuarios_personalizados.id,
    usuarios_personalizados.email,
    usuarios_personalizados.nombre,
    usuarios_personalizados.rol,
    usuarios_personalizados.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uso:
-- SELECT * FROM crear_usuario('nuevo@empresa.es', 'Password123', 'Nuevo Usuario', 'user');
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

## Queries Útiles para Gestión

### Listar todos los usuarios

```sql
SELECT 
  id,
  email,
  nombre,
  rol,
  activo,
  ultimo_login,
  created_at
FROM usuarios_personalizados
ORDER BY created_at DESC;
```

### Buscar usuario por email

```sql
SELECT * FROM usuarios_personalizados
WHERE email = 'usuario@example.com';
```

### Cambiar contraseña de usuario

```sql
UPDATE usuarios_personalizados
SET 
  password_hash = crypt('NuevaContraseña123', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'usuario@example.com'
RETURNING id, email, nombre;
```

### Cambiar rol de usuario

```sql
UPDATE usuarios_personalizados
SET rol = 'admin', updated_at = NOW()
WHERE email = 'usuario@example.com'
RETURNING id, email, nombre, rol;
```

### Desactivar usuario

```sql
UPDATE usuarios_personalizados
SET activo = false, updated_at = NOW()
WHERE email = 'usuario@example.com'
RETURNING id, email, activo;
```

### Reactivar usuario

```sql
UPDATE usuarios_personalizados
SET activo = true, updated_at = NOW()
WHERE email = 'usuario@example.com'
RETURNING id, email, activo;
```

### Eliminar usuario

```sql
-- ⚠️ CUIDADO: Esta operación es permanente
DELETE FROM usuarios_personalizados
WHERE email = 'usuario@example.com'
RETURNING id, email, nombre;
```

### Verificar credenciales (para testing)

```sql
-- Verificar si el password coincide
SELECT 
  id,
  email,
  nombre,
  rol,
  password_hash = crypt('ContraseñaAProbar', password_hash) AS password_correcto
FROM usuarios_personalizados
WHERE email = 'usuario@example.com';
```

### Estadísticas de usuarios

```sql
-- Resumen de usuarios por rol
SELECT 
  rol,
  COUNT(*) as total,
  COUNT(CASE WHEN activo THEN 1 END) as activos,
  COUNT(CASE WHEN NOT activo THEN 1 END) as inactivos
FROM usuarios_personalizados
GROUP BY rol
ORDER BY rol;
```

---

## Próximos Pasos

1. ✅ Usuario creado en `usuarios_personalizados`
2. 📧 Comunicar credenciales al usuario de forma segura
3. 🔐 Usuario ingresa con email y contraseña
4. 🔄 Recomendar cambio de contraseña en primer acceso
5. 📊 Comenzar a usar Tasador Web

---

## Resumen de Comandos Rápidos

### Crear usuario individual

```sql
INSERT INTO usuarios_personalizados (email, password_hash, nombre, rol, activo)
VALUES ('nuevo@empresa.es', crypt('Pass123.', gen_salt('bf')), 'Nuevo Usuario', 'user', true)
RETURNING *;
```

### Crear múltiples usuarios

```sql
INSERT INTO usuarios_personalizados (email, password_hash, nombre, rol, activo)
VALUES 
  ('user1@empresa.es', crypt('Pass1.', gen_salt('bf')), 'Usuario 1', 'user', true),
  ('user2@empresa.es', crypt('Pass2.', gen_salt('bf')), 'Usuario 2', 'user', true),
  ('admin@empresa.es', crypt('Admin.', gen_salt('bf')), 'Administrador', 'admin', true)
RETURNING id, email, nombre, rol;
```

### Verificar usuario existe

```sql
SELECT EXISTS(
  SELECT 1 FROM usuarios_personalizados WHERE email = 'usuario@empresa.es'
) AS usuario_existe;
```
