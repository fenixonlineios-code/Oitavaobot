import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PHONE_API_SECRET = process.env.PHONE_API_SECRET
const PHONE_API_PORT = process.env.PHONE_API_PORT || 3333

function normalizePhone(phone = '') {
  let digits = String(phone).replace(/\D/g, '')

  if (!digits.startsWith('55')) {
    digits = '55' + digits
  }

  return digits
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function hashCode(code, telefone) {
  return crypto
    .createHash('sha256')
    .update(`${code}:${telefone}:${PHONE_API_SECRET}`)
    .digest('hex')
}

function json(res, status, data) {
  return res.status(status).json(data)
}

async function supabaseRequest(path, options = {}) {
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

export function startPhoneVerifyServer(conn) {
  const app = express()

  app.use(express.json())

  app.post('/phone/send-code', async (req, res) => {
    try {
      const secret = req.headers['x-phone-secret']

      if (secret !== PHONE_API_SECRET) {
        return json(res, 401, {
          ok: false,
          error: 'Não autorizado.'
        })
      }

      const { user_id, telefone } = req.body || {}

      if (!user_id || !telefone) {
        return json(res, 400, {
          ok: false,
          error: 'user_id e telefone são obrigatórios.'
        })
      }

      const phone = normalizePhone(telefone)
      const jid = `${phone}@s.whatsapp.net`

      const exists = await conn.onWhatsApp(jid)

      if (!exists || !exists[0] || !exists[0].exists) {
        return json(res, 400, {
          ok: false,
          error: 'Esse número não parece ter WhatsApp.'
        })
      }

      const code = generateCode()
      const codeHash = hashCode(code, phone)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      await supabaseRequest('phone_codes', {
        method: 'POST',
        headers: {
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          user_id,
          telefone: phone,
          code_hash: codeHash,
          used: false,
          expires_at: expiresAt
        })
      })

      await conn.sendMessage(jid, {
        text: `🔐 *Fênix Online*

Seu código de verificação é:

*${code}*

Ele expira em 10 minutos.

Se você não solicitou isso, ignore esta mensagem.`
      })

      return json(res, 200, {
        ok: true,
        message: 'Código enviado pelo bot.'
      })
    } catch (error) {
      console.error('Erro ao enviar código:', error)

      return json(res, 500, {
        ok: false,
        error: 'Erro ao enviar código.',
        detail: error.message
      })
    }
  })

  app.post('/phone/verify-code', async (req, res) => {
    try {
      const secret = req.headers['x-phone-secret']

      if (secret !== PHONE_API_SECRET) {
        return json(res, 401, {
          ok: false,
          error: 'Não autorizado.'
        })
      }

      const { user_id, telefone, code } = req.body || {}

      if (!user_id || !telefone || !code) {
        return json(res, 400, {
          ok: false,
          error: 'user_id, telefone e code são obrigatórios.'
        })
      }

      const phone = normalizePhone(telefone)
      const codeHash = hashCode(code, phone)
      const now = new Date().toISOString()

      const rows = await supabaseRequest(
        `phone_codes?select=*&user_id=eq.${encodeURIComponent(user_id)}&telefone=eq.${encodeURIComponent(phone)}&used=eq.false&expires_at=gt.${encodeURIComponent(now)}&order=created_at.desc&limit=1`,
        {
          method: 'GET'
        }
      )

      const record = Array.isArray(rows) ? rows[0] : null

      if (!record) {
        return json(res, 400, {
          ok: false,
          error: 'Código expirado ou inexistente.'
        })
      }

      if (record.code_hash !== codeHash) {
        return json(res, 400, {
          ok: false,
          error: 'Código incorreto.'
        })
      }

      await supabaseRequest(`phone_codes?id=eq.${record.id}`, {
        method: 'PATCH',
        headers: {
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          used: true
        })
      })

      await supabaseRequest(`profiles?id=eq.${encodeURIComponent(user_id)}`, {
        method: 'PATCH',
        headers: {
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          telefone: phone,
          telefone_verificado: true
        })
      })

      return json(res, 200, {
        ok: true,
        message: 'Telefone verificado com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao verificar código:', error)

      return json(res, 500, {
        ok: false,
        error: 'Erro ao verificar código.',
        detail: error.message
      })
    }
  })

  app.listen(PHONE_API_PORT, () => {
    console.log(`📱 API de telefone do bot rodando na porta ${PHONE_API_PORT}`)
  })
    }
