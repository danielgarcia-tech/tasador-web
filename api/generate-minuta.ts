import createReport from 'docx-templates';
import fs from 'fs';
import path from 'path';

// Simple cache directory for downloaded templates (ephemeral on serverless)
const CACHE_DIR = path.join('/tmp', 'word-templates-cache');
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function downloadTemplateToCache(url: string, fileName: string) {
  const cachedPath = path.join(CACHE_DIR, fileName);
  if (fs.existsSync(cachedPath)) {
    return fs.promises.readFile(cachedPath);
  }

  const headers: Record<string,string> = {};
  // If template is stored in Supabase private bucket, allow passing a service role key
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && url.includes('supabase')) {
    headers['apiKey'] = serviceKey;
    headers['Authorization'] = `Bearer ${serviceKey}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Error descargando plantilla: ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Cache the file
  try {
    await fs.promises.writeFile(cachedPath, buffer);
  } catch (e) {
    // caching is best-effort
    console.warn('No se pudo guardar plantilla en cache:', e);
  }

  return buffer;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).setHeader('Allow', 'POST').send('Method Not Allowed');
    return;
  }

  try {
    const { plantillaUrl, fileName, data } = req.body || {};
    if (!plantillaUrl) {
      res.status(400).send({ error: 'Falta plantillaUrl en body' });
      return;
    }

    const realFileName = fileName || path.basename(new URL(plantillaUrl).pathname || 'template.docx');

    console.debug('generate-minuta: descargando plantilla', { plantillaUrl, fileName: realFileName });
    const templateBuffer: Buffer = await downloadTemplateToCache(plantillaUrl, realFileName);

    console.debug('generate-minuta: plantilla descargada, tamaño:', templateBuffer.length);

    // Prepare data (ensure strings)
    const safeData = Object.fromEntries(Object.entries(data || {}).map(([k, v]) => [k, v == null ? '' : v]));

    // Run docx-templates createReport
    const reportBuffer = await createReport({
      template: templateBuffer,
      data: safeData,
      cmdDelimiter: ['<<', '>>'],
      failFast: true,
    });

    const outBuffer = Buffer.from(reportBuffer);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${realFileName.replace(/"/g, '')}"`);
    res.status(200).send(outBuffer);
  } catch (error) {
    console.error('generate-minuta: error', error);
    res.status(500).send({ error: error instanceof Error ? error.message : String(error) });
  }
}
