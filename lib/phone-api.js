import express from 'express'
import cors from 'cors'

let apiStarted = false

function json(res, status, data) {
  return res.status(status).json(data)
}

function normalizePhone(phone = '') {
  let digits = String(phone).replace(/\D/g, '')
  if (!digits.startsWith('55')) digits = '55' + digits
  return digits
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/* ===========================
   WHATSAPP (ADAPTA AO SEU BOT)
=========================== */
async function getWhatsappJid(conn, phone) {
  const exists = await conn.onWhatsApp(phone)
  if (!exists?.[0]?.exists) return null
  return exists[0].jid
}

async function sendCodeMessage(conn, jid, code) {
  const text = `🔐 Seu código de verificação:\n\n${code}\n\nExpira em 10 minutos.`
  return await conn.sendMessage(jid, { text })
}

/* ===========================
   API
=========================== */
export function startPhoneApi(getConn) {
  if (apiStarted) return
  apiStarted = true

  const app = express()

  app.use(express.json())
  app.use(cors())

  app.get('/', (_, res) => {
    res.send('API online')
  })

  /* ===========================
     ENVIAR CÓDIGO (SEM TOKEN)
  ============================ */
  app.post('/phone/send-code', async (req, res) => {
    try {
      const conn = typeof getConn === 'function' ? getConn() : getConn

      if (!conn) {
        return json(res, 500, {
          ok: false,
          error: 'Bot offline'
        })
      }

      const { telefone } = req.body || {}

      if (!telefone) {
        return json(res, 400, {
          ok: false,
          error: 'Telefone obrigatório'
        })
      }

      const phone = normalizePhone(telefone)

      const jid = await getWhatsappJid(conn, phone)

      if (!jid) {
        return json(res, 400, {
          ok: false,
          error: 'Número não tem WhatsApp'
        })
      }

      const code = generateCode()

      await sendCodeMessage(conn, jid, code)

      return json(res, 200, {
        ok: true,
        message: 'Código enviado',
        code // opcional (pode remover depois)
      })

    } catch (err) {
      return json(res, 500, {
        ok: false,
        error: err.message
      })
    }
  })

  /* ===========================
     VERIFICAR CÓDIGO (LOCAL)
     -> simples (sem banco)
  ============================ */
  let codes = {}

  app.post('/phone/verify-code', async (req, res) => {
    const { telefone, code } = req.body || {}

    const phone = normalizePhone(telefone)

    if (!codes[phone]) {
      return json(res, 400, {
        ok: false,
        error: 'Código não encontrado'
      })
    }

    if (codes[phone] !== code) {
      return json(res, 400, {
        ok: false,
        error: 'Código inválido'
      })
    }

    delete codes[phone]

    return json(res, 200, {
      ok: true,
      message: 'Verificado com sucesso'
    })
  })

  /* ===========================
     INTERCEPTA ENVIO PRA SALVAR CÓDIGO
  ============================ */
  const originalSend = async (conn, jid, code) => {
    codes[jid.replace(/\D/g, '')] = code
    return sendCodeMessage(conn, jid, code)
  }

  app.listen(process.env.PORT || 3000, () => {
    console.log('🔥 API rodando')
  })
}
