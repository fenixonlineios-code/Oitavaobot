import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import crypto from 'crypto'

let apiStarted = false

const SUPABASE_URL = String(process.env.SUPABASE_URL || '')
  .trim()
  .replace(/^["']|["']$/g, '')
  .replace(/;$/, '')
  .replace(/\/$/, '')

const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '')
  .trim()
  .replace(/^["']|["']$/g, '')
  .replace(/^Bearer\s+/i, '')
  .replace(/;$/, '')

const PHONE_API_PORT = process.env.PORT || 3000

function normalizePhone(phone = '') {
  let digits = String(phone).replace(/\D/g, '')
  if (!digits.startsWith('55')) digits = '55' + digits
  return digits
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function json(res, status, data) {
  return res.status(status).json(data)
}

/* ---------------- SUPABASE ---------------- */

async function supabaseRest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  const text = await response.text()
  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    throw new Error(typeof data === 'string' ? data : JSON.stringify(data))
  }

  return data
}

/* ---------------- WHATSAPP ---------------- */

async function getWhatsappJid(conn, phone) {
  const exists = await conn.onWhatsApp(phone)
  if (!exists?.[0]?.exists) return null
  return exists[0].jid
}

async function sendCodeMessage(conn, jid, code) {
  const text = `🔐 Código de verificação:\n\n${code}\n\nExpira em 10 minutos.`
  return await conn.sendMessage(jid, { text })
}

/* ---------------- REGRA 3 DIAS ---------------- */

function canSendAgain(lastDate) {
  if (!lastDate) return true

  const last = new Date(lastDate).getTime()
  const now = Date.now()

  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000

  return now - last > THREE_DAYS
}

/* ---------------- API ---------------- */

export function startPhoneApi(getConn) {
  if (apiStarted) return
  apiStarted = true

  const app = express()

  app.use(express.json())
  app.use(cors())

  app.get('/', (_, res) => {
    res.send('API online')
  })

  /* ================================
     ENVIO DE CÓDIGO (COM 3 DIAS)
  ================================= */
  app.post('/phone/register-send-code', async (req, res) => {
    try {
      const conn = typeof getConn === 'function' ? getConn() : getConn
      if (!conn) {
        return json(res, 500, { ok: false, error: 'Bot offline' })
      }

      const { email, telefone } = req.body || {}

      if (!email || !telefone) {
        return json(res, 400, { ok: false, error: 'Dados obrigatórios' })
      }

      const phone = normalizePhone(telefone)
      const cleanEmail = String(email).toLowerCase()

      /* 🔎 verifica último envio */
      const last = await supabaseRest(
        `phone_codes?select=created_at&telefone=eq.${phone}&order=created_at.desc&limit=1`,
        { method: 'GET' }
      )

      const lastSentAt = last?.[0]?.created_at

      if (!canSendAgain(lastSentAt)) {
        return json(res, 429, {
          ok: false,
          error: 'Só pode pedir código a cada 3 dias.'
        })
      }

      const jid = await getWhatsappJid(conn, phone)

      if (!jid) {
        return json(res, 400, {
          ok: false,
          error: 'Número sem WhatsApp'
        })
      }

      const code = generateCode()

      await supabaseRest('phone_codes', {
        method: 'POST',
        body: JSON.stringify({
          email: cleanEmail,
          telefone: phone,
          code,
          created_at: new Date().toISOString()
        })
      })

      await sendCodeMessage(conn, jid, code)

      return json(res, 200, {
        ok: true,
        message: 'Código enviado'
      })
    } catch (err) {
      return json(res, 500, {
        ok: false,
        error: err.message
      })
    }
  })

  /* ================================
     VERIFICAR CÓDIGO
  ================================= */
  app.post('/phone/register-verify-code', async (req, res) => {
    try {
      const { email, telefone, code } = req.body || {}

      const phone = normalizePhone(telefone)
      const cleanEmail = String(email).toLowerCase()

      const rows = await supabaseRest(
        `phone_codes?select=*&telefone=eq.${phone}&email=eq.${cleanEmail}&order=created_at.desc&limit=1`,
        { method: 'GET' }
      )

      const record = rows?.[0]

      if (!record || record.code !== code) {
        return json(res, 400, { ok: false, error: 'Código inválido' })
      }

      return json(res, 200, {
        ok: true,
        message: 'Verificado'
      })
    } catch (err) {
      return json(res, 500, {
        ok: false,
        error: err.message
      })
    }
  })

  app.listen(PHONE_API_PORT, '0.0.0.0', () => {
    console.log('API rodando na porta', PHONE_API_PORT)
  })
}
