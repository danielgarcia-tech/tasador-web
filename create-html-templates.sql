-- Crear tabla para plantillas HTML
CREATE TABLE IF NOT EXISTS html_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instancia TEXT NOT NULL CHECK (instancia IN ('primera', 'segunda')),
  html_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice único para asegurar una plantilla por instancia
CREATE UNIQUE INDEX IF NOT EXISTS idx_html_templates_instancia_unique
ON html_templates (instancia);

-- Insertar plantillas HTML por defecto
INSERT INTO html_templates (instancia, html_content)
VALUES
  ('primera', '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Minuta de Tasación - Primera Instancia</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { margin: 20px 0; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; }
        .value { margin-left: 10px; }
        .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MINUTA DE TASACIÓN</h1>
        <h2>PRIMERA INSTANCIA</h2>
    </div>

    <div class="content">
        <div class="field">
            <span class="label">Cliente:</span>
            <span class="value">{CLIENTA}</span>
        </div>

        <div class="field">
            <span class="label">Número de Procedimiento:</span>
            <span class="value">{NUMEROPROCEDIMIENTO}</span>
        </div>

        <div class="field">
            <span class="label">Juzgado:</span>
            <span class="value">{NOMBREJUZGADO}</span>
        </div>

        <div class="field">
            <span class="label">Entidad Demandada:</span>
            <span class="value">{ENTIDADDEMANDADA}</span>
        </div>

        <div class="field">
            <span class="label">Municipio:</span>
            <span class="value">{MUNICIPIO}</span>
        </div>

        <div class="field">
            <span class="label">Costas sin IVA:</span>
            <span class="value">{COSTASSINIVA} €</span>
        </div>

        <div class="field">
            <span class="label">IVA (21%):</span>
            <span class="value">{IVA} €</span>
        </div>

        <div class="total">
            <span class="label">TOTAL:</span>
            <span class="value">{TOTAL} €</span>
        </div>

        <div class="field">
            <span class="label">Fecha:</span>
            <span class="value">{FECHA}</span>
        </div>
    </div>
</body>
</html>'),
  ('segunda', '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Minuta de Tasación - Segunda Instancia</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { margin: 20px 0; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; }
        .value { margin-left: 10px; }
        .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MINUTA DE TASACIÓN</h1>
        <h2>SEGUNDA INSTANCIA</h2>
    </div>

    <div class="content">
        <div class="field">
            <span class="label">Cliente:</span>
            <span class="value">{CLIENTA}</span>
        </div>

        <div class="field">
            <span class="label">Número de Procedimiento:</span>
            <span class="value">{NUMEROPROCEDIMIENTO}</span>
        </div>

        <div class="field">
            <span class="label">Juzgado:</span>
            <span class="value">{NOMBREJUZGADO}</span>
        </div>

        <div class="field">
            <span class="label">Entidad Demandada:</span>
            <span class="value">{ENTIDADDEMANDADA}</span>
        </div>

        <div class="field">
            <span class="label">Municipio:</span>
            <span class="value">{MUNICIPIO}</span>
        </div>

        <div class="field">
            <span class="label">Costas sin IVA:</span>
            <span class="value">{COSTASSINIVA} €</span>
        </div>

        <div class="field">
            <span class="label">IVA (21%):</span>
            <span class="value">{IVA} €</span>
        </div>

        <div class="total">
            <span class="label">TOTAL:</span>
            <span class="value">{TOTAL} €</span>
        </div>

        <div class="field">
            <span class="label">Fecha:</span>
            <span class="value">{FECHA}</span>
        </div>
    </div>
</body>
</html>')
ON CONFLICT (instancia) DO NOTHING;

-- Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_html_templates_updated_at
    BEFORE UPDATE ON html_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();