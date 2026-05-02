import fetch from 'node-fetch'

const API_ASSISTENTE = 'https://tpgb.online/api/assistente'

async function before(m, { conn }) {
  const body = (m.text || '').trim()
  if (!body) return false

  // ignora comandos normais
  if (/^[./#!]/.test(body)) return false

  const lower = body.toLowerCase()
  const botJid = conn.user?.jid

  const mentionedList =
    Array.isArray(m.mentionedJid)
      ? m.mentionedJid
      : Array.isArray(m.message?.extendedTextMessage?.contextInfo?.mentionedJid)
        ? m.message.extendedTextMessage.contextInfo.mentionedJid
        : []

  const mentioned = mentionedList.includes(botJid)

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

console.log('━━━━━━━━━━━━━━━━━━━━')
console.log('🤖 ASSISTENTE DEBUG')
console.log('URL FINAL:', API_ASSISTENTE)
console.log('MENSAGEM:', body)
console.log('SENDER:', m.sender)
console.log('CHAT:', m.chat)
console.log('━━━━━━━━━━━━━━━━━━━━')

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

export default { before }
