import fetch from 'node-fetch'

const API_ASSISTENTE = 'https://tpgb.online/api/assistente'

async function before(m, { conn }) {
  const body = (m.text || '').trim()
  if (!body) return false

  // ignora comandos com prefixo
  if (/^[./#!]/.test(body)) return false

  const lower = body.toLowerCase()
  const botJid = conn.user?.jid

  const mentioned =
    m.mentionedJid?.includes(botJid) ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(botJid)

  // em grupo só responde se chamar
  if (m.isGroup) {
    const chamou =
      mentioned ||
      lower.startsWith('bot ') ||
      lower.startsWith('oitavão ') ||
      lower.startsWith('oitavao ')

    if (!chamou) return false
  }

  try {
    await m.react?.('💭')

    const res = await fetch(API_ASSISTENTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensagem: body,
        nome: m.pushName || m.name || 'usuário',
        jid: m.sender
      })
    })

    if (!res.ok) {
      console.log('ERRO ASSISTENTE:', await res.text())
      await m.react?.('❌')
      return true
    }

    const data = await res.json()

    await conn.sendMessage(m.chat, {
      text: data.resposta || 'Não consegui responder agora.'
    }, { quoted: m })

    await m.react?.('✅')
    return true

  } catch (e) {
    console.error('ERRO ASSISTENTE IA:', e)
    await m.react?.('❌')
    return true
  }
}

export default {
  before
}
