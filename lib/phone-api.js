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
   WHATSAPP (SEU BOT)
=========================== */
async function getWhatsappJid(conn, phone) {
  const exists = await conn.onWhatsApp(phone)
  if (!exists?.[0]?.exists) return null
  return exists[0].jid
}

async function sendCodeMessage(conn, jid, code, mode = 'register') {
  const title =
    mode === 'register'
      ? 'Seu código de verificação de telefone é:'
      : 'Seu código de verificação é:'

  const messageText = `🔐 *Fênix Online*

${title}

*${code}*

Toque no botão abaixo para copiar o código.

Ele expira em 10 minutos.

Se você não solicitou isso, ignore esta mensagem.`

  try {
    return await conn.sendNCarousel(
  jid,
  messageText,
  'Fênix Online',
  null,
  [],
  code,
  [],
  [],
  null
)
  } catch (error) {
    console.error(error)

    return await conn.sendMessage(jid, {
      text: messageText
    })
  }
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

  /* MEMÓRIA DOS CÓDIGOS */
  const codes = {}

  app.get('/', (_, res) => {
    res.send('API online')
  })

  /* ===========================
     ENVIAR CÓDIGO
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

      /* salva código em memória */
      codes[phone] = {
        code,
        expires: Date.now() + 10 * 60 * 1000
      }

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

  /* ===========================
     VERIFICAR CÓDIGO
  ============================ */
  app.post('/phone/verify-code', (req, res) => {
    const { telefone, code } = req.body || {}

    const phone = normalizePhone(telefone)

    const saved = codes[phone]

    if (!saved) {
      return json(res, 400, {
        ok: false,
        error: 'Código não encontrado'
      })
    }

    if (Date.now() > saved.expires) {
      delete codes[phone]
      return json(res, 400, {
        ok: false,
        error: 'Código expirou'
      })
    }

    if (saved.code !== String(code)) {
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
     START
  ============================ */
  app.listen(process.env.PORT || 3000, () => {
    console.log('🔥 API rodando na porta 3000')
  })
}
