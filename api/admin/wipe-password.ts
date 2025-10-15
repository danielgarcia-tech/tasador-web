import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('wipe-password: falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en entorno')
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

    const authHeader = (req.headers?.authorization || '').replace('Bearer ', '').trim()
    if (!authHeader) return res.status(401).send({ error: 'Missing access token' })

    const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(authHeader)
    const requestingUser = userRes?.user
    if (userErr || !requestingUser) {
      return res.status(401).send({ error: 'Invalid token' })
    }

    const requestingUserId = requestingUser.id

    const { data: adminRow, error: adminErr } = await supabaseAdmin
      .from('usuarios_personalizados')
      .select('id, rol')
      .eq('id', requestingUserId)
      .single()

    if (adminErr || !adminRow || adminRow.rol !== 'admin') {
      return res.status(403).send({ error: 'Not authorized' })
    }

    // Actualizar password_hash a NULL
    const { error: updErr } = await supabaseAdmin
      .from('usuarios_personalizados')
      .update({ password_hash: null, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updErr) return res.status(500).send({ error: 'Update failed', details: updErr })

    return res.status(200).send({ success: true })
  } catch (error) {
    console.error('wipe-password handler error', error)
    return res.status(500).send({ error: error instanceof Error ? error.message : String(error) })
  }
}
