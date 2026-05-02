import fetch from 'node-fetch'

const API_ASSISTENTE = 'https://tpgb.online/api/assistente'

let handler = async (m, { conn }) => {
  const body = (m.text || '').trim()
  if (!body) return

  // não responder comandos normais
  if (/^[./#!]/.test(body)) return

  const botJid = conn.user?.jid
  const mentioned = m.mentionedJid?.includes(botJid)

  const lower = body.toLowerCase()

  // No grupo, só responde se chamar
  if (m.isGroup) {
    const chamou =
      mentioned ||
      lower.startsWith('bot ') ||
      lower.startsWith('oitavão ') ||
      lower.startsWith('oitavao ')

    if (!chamou) return
  }

  try {
    await m.react('💭')

    const res = await fetch(API_ASSISTENTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensagem: body,
        nome: m.pushName || 'usuário',
        jid: m.sender
      })
    })

    if (!res.ok) {
      console.log('ERRO ASSISTENTE:', await res.text())
      await m.react('❌')
      return
    }

    const data = await res.json()

    await conn.sendMessage(m.chat, {
      text: data.resposta || 'Não consegui responder agora.'
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
  }
}

handler.before = async (m, extra) => {
  return await handler(m, extra)
}

export default handler
