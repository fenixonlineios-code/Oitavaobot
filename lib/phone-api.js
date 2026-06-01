import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import crypto from 'crypto'

let apiStarted = false

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PHONE_API_PORT = process.env.PORT || 3000
const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://fenix.tpgb.online'

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

function hashCode(code, phone, userId) {
  return crypto
    .createHash('sha256')
    .update(`${code}:${phone}:${userId}:${SUPABASE_SERVICE_ROLE_KEY}`)
    .digest('hex')
}

function json(res, status, data) {
  return res.status(status).json(data)
}

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

async function getUserFromAccessToken(accessToken) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    return null
  }

  return await response.json()
}

function getAccessToken(req) {
  const auth = req.headers.authorization || ''

  if (!auth.startsWith('Bearer ')) {
    return null
  }

  return auth.replace('Bearer ', '').trim()
}

async function updateProfilePhone(userId, phone, verified) {
  await supabaseRest(`profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({
      telefone: phone,
      telefone_verificado: verified
    })
  })
}

export function startPhoneApi(getConn) {
  if (apiStarted) return
  apiStarted = true

  const app = express()

  app.use(express.json())

  app.use(cors({
    origin: SITE_ORIGIN,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))

  app.get('/', (req, res) => {
    res.send('Fênix Phone API online')
  })

  app.post('/phone/send-code', async (req, res) => {
    try {
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return json(res, 500, {
          ok: false,
          error: 'Variáveis do Supabase não configuradas no bot.'
        })
      }

      const conn = typeof getConn === 'function' ? getConn() : getConn

      if (!conn) {
        return json(res, 500, {
          ok: false,
          error: 'Bot ainda não está conectado.'
        })
      }

      const accessToken = getAccessToken(req)

      if (!accessToken) {
        return json(res, 401, {
          ok: false,
          error: 'Token ausente.'
        })
      }

      const user = await getUserFromAccessToken(accessToken)

      if (!user || !user.id) {
        return json(res, 401, {
          ok: false,
          error: 'Usuário não autenticado.'
        })
      }

      const { telefone } = req.body || {}

      if (!telefone) {
        return json(res, 400, {
          ok: false,
          error: 'Telefone obrigatório.'
        })
      }

      const phone = normalizePhone(telefone)

      if (phone.length < 12) {
        return json(res, 400, {
          ok: false,
          error: 'Telefone inválido.'
        })
      }

      const jid = `${phone}@s.whatsapp.net`

      const exists = await conn.onWhatsApp(jid)

      if (!exists || !exists[0] || !exists[0].exists) {
        return json(res, 400, {
          ok: false,
          error: 'Esse número não parece ter WhatsApp.'
        })
      }

      const code = generateCode()
      const codeHash = hashCode(code, phone, user.id)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      await supabaseRest('phone_codes', {
        method: 'POST',
        headers: {
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          user_id: user.id,
          telefone: phone,
          code_hash: codeHash,
          used: false,
          expires_at: expiresAt
        })
      })

      await updateProfilePhone(user.id, phone, false)

      await conn.sendMessage(jid, {
        text: `🔐 *Fênix Online*

Seu código de verificação é:

*${code}*

Ele expira em 10 minutos.

Se você não solicitou isso, ignore esta mensagem.`
      })

      return json(res, 200, {
        ok: true,
        message: 'Código enviado pelo WhatsApp.'
      })
    } catch (error) {
      console.error('Erro em /phone/send-code:', error)

      return json(res, 500, {
        ok: false,
        error: 'Erro ao enviar código.',
        detail: error.message
      })
    }
  })

  app.post('/phone/verify-code', async (req, res) => {
    try {
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return json(res, 500, {
          ok: false,
          error: 'Variáveis do Supabase não configuradas no bot.'
        })
      }

      const accessToken = getAccessToken(req)

      if (!accessToken) {
        return json(res, 401, {
          ok: false,
          error: 'Token ausente.'
        })
      }

      const user = await getUserFromAccessToken(accessToken)

      if (!user || !user.id) {
        return json(res, 401, {
          ok: false,
          error: 'Usuário não autenticado.'
        })
      }

      const { telefone, code } = req.body || {}

      if (!telefone || !code) {
        return json(res, 400, {
          ok: false,
          error: 'Telefone e código são obrigatórios.'
        })
      }

      const phone = normalizePhone(telefone)
      const codeHash = hashCode(String(code).trim(), phone, user.id)
      const now = new Date().toISOString()

      const rows = await supabaseRest(
        `phone_codes?select=*&user_id=eq.${encodeURIComponent(user.id)}&telefone=eq.${encodeURIComponent(phone)}&used=eq.false&expires_at=gt.${encodeURIComponent(now)}&order=created_at.desc&limit=1`,
        { method: 'GET' }
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

      await supabaseRest(`phone_codes?id=eq.${record.id}`, {
        method: 'PATCH',
        headers: {
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          used: true
        })
      })

      await updateProfilePhone(user.id, phone, true)

      return json(res, 200, {
        ok: true,
        message: 'Telefone verificado com sucesso.'
      })
    } catch (error) {
      console.error('Erro em /phone/verify-code:', error)

      return json(res, 500, {
        ok: false,
        error: 'Erro ao verificar código.',
        detail: error.message
      })
    }
  })

  app.listen(PHONE_API_PORT, '0.0.0.0', () => {
  console.log(`📱 API de telefone rodando na porta ${PHONE_API_PORT}`)
})
}
