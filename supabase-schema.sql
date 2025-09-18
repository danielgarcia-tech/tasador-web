-- Supabase SQL para crear las tablas del sistema de tasación

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (ya existe con Supabase Auth)
-- Solo creamos perfiles adicionales si necesitamos

-- Tabla de provincias y criterios ICA
CREATE TABLE IF NOT EXISTS provincias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de criterios ICA por provincia
CREATE TABLE IF NOT EXISTS criterios_ica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provincia VARCHAR(100) NOT NULL,
  criterio_ica VARCHAR(100) NOT NULL,
  allanamiento DECIMAL(10,2) NOT NULL,
  audiencia_previa DECIMAL(10,2) NOT NULL,
  juicio DECIMAL(10,2) NOT NULL,
  factor_apelacion DECIMAL(3,2) NOT NULL,
  verbal_alegaciones DECIMAL(10,2) NOT NULL,
  verbal_vista DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(provincia, criterio_ica)
);

-- Tabla de municipios
CREATE TABLE IF NOT EXISTS municipios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  criterio_ica VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(nombre, provincia)
);

-- Tabla de entidades demandadas
CREATE TABLE IF NOT EXISTS entidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(100) NOT NULL UNIQUE,
  nombre_completo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Función para crear hash de contraseña
CREATE OR REPLACE FUNCTION create_password_hash(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar contraseña
CREATE OR REPLACE FUNCTION verify_password(password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabla de usuarios personalizados
CREATE TABLE IF NOT EXISTS usuarios_personalizados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'usuario',
  activo BOOLEAN DEFAULT true,
  ultimo_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para actualizar updated_at en usuarios_personalizados
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios_personalizados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_cliente VARCHAR(200) NOT NULL,
  numero_procedimiento VARCHAR(100) NOT NULL,
  nombre_juzgado VARCHAR(300),
  entidad_demandada VARCHAR(300),
  municipio VARCHAR(200) NOT NULL,
  criterio_ica VARCHAR(100) NOT NULL,
  tipo_proceso VARCHAR(50) NOT NULL CHECK (tipo_proceso IN ('Juicio Verbal', 'Juicio Ordinario')),
  fase_terminacion VARCHAR(100) NOT NULL,
  instancia VARCHAR(50) NOT NULL CHECK (instancia IN ('PRIMERA INSTANCIA', 'SEGUNDA INSTANCIA')),
  costas DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_tasaciones_user_id ON tasaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_tasaciones_created_at ON tasaciones(created_at);
CREATE INDEX IF NOT EXISTS idx_municipios_nombre ON municipios(nombre);
CREATE INDEX IF NOT EXISTS idx_entidades_codigo ON entidades(codigo);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en tasaciones
CREATE TRIGGER update_tasaciones_updated_at 
    BEFORE UPDATE ON tasaciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener el usuario actual desde la sesión personalizada
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  -- Esta función debería ser llamada con el user_id del contexto de la aplicación
  -- Por ahora, retornamos NULL para permitir acceso temporal
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DESACTIVAR RLS TEMPORALMENTE PARA DEBUGGING
ALTER TABLE tasaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE municipios DISABLE ROW LEVEL SECURITY;
ALTER TABLE criterios_ica DISABLE ROW LEVEL SECURITY;
ALTER TABLE entidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_personalizados DISABLE ROW LEVEL SECURITY;