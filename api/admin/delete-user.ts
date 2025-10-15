import { createClient } from '@supabase/supabase-js'

// Este archivo corre en el servidor (serverless). Asegúrate de definir en el
// entorno de despliegue las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
// (no exponer SUPABASE_SERVICE_ROLE_KEY al cliente).

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('delete-user: falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en entorno')
}

const supabaseAdmin = createClient(SUPABASE_URL || '', SERVICE_ROLE_KEY || '')

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).setHeader('Allow', 'POST').send('Method Not Allowed')
    return
  }

  try {
    const { id } = req.body || {}
    if (!id) return res.status(400).send({ error: 'Missing id in body' })

    // Verificar token del solicitante (header Authorization: Bearer <token>)
    const authHeader = (req.headers?.authorization || '').replace('Bearer ', '').trim()
    if (!authHeader) return res.status(401).send({ error: 'Missing access token' })

    // Obtener usuario que solicita la operación
    const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(authHeader)
    const requestingUser = userRes?.user
    if (userErr || !requestingUser) {
      return res.status(401).send({ error: 'Invalid token' })
    }

    const requestingUserId = requestingUser.id

    // Comprobar que el solicitante es admin en usuarios_personalizados
    const { data: adminRow, error: adminErr } = await supabaseAdmin
      .from('usuarios_personalizados')
      .select('id, rol')
      .eq('id', requestingUserId)
      .single()

    if (adminErr || !adminRow || adminRow.rol !== 'admin') {
      return res.status(403).send({ error: 'Not authorized' })
    }

    // Ejecutar delete con service role
    const { error: delErr } = await supabaseAdmin
      .from('usuarios_personalizados')
      .delete()
      .eq('id', id)

    if (delErr) return res.status(500).send({ error: 'Delete failed', details: delErr })

    // Opcional: eliminar del auth users si tu flujo lo requiere
    // await supabaseAdmin.auth.admin.deleteUser(id)

    return res.status(200).send({ success: true })
  } catch (error) {
    console.error('delete-user handler error', error)
    return res.status(500).send({ error: error instanceof Error ? error.message : String(error) })
  }
}
