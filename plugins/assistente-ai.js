import fetch from 'node-fetch'

const API_ASSISTENTE = 'https://tpgb.online/api/assistente'

async function before(m, { conn }) {
  const body = (m.text || '').trim()
  if (!body) return false

  // ignora comandos com prefixo
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

  // Em grupo, só responde se chamar o bot
  if (m.isGroup) {
    const chamou =
      mentioned ||
      lower.startsWith('bot ') ||
      lower.startsWith('oitavão ') ||
      lower.startsWith('oitavao ')

    if (!chamou) return false
  }

  try {

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

    console.log('STATUS:', res.status)
    console.log('CONTENT-TYPE:', res.headers.get('content-type'))

    const raw = await res.text()
    console.log('RESPOSTA RAW:', raw.slice(0, 1000))

    let data
    try {
      data = JSON.parse(raw)
    } catch {
      await m.react?.('❌')
      await m.reply('❌ A API respondeu algo que não é JSON. Veja o log RAW.')
      return true
    }

    if (!res.ok) {
      await m.react?.('❌')
      await m.reply(`❌ Erro na API: ${res.status}\n\n${data.resposta || raw.slice(0, 300)}`)
      return true
    }

    await conn.sendMessage(m.chat, {
      text: data.resposta || 'Não veio resposta.'
    }, { quoted: m })

    return true

  } catch (e) {
    console.error('ERRO ASSISTENTE IA:', e)
    await m.react?.('❌')
    return true
  }
}

export default { before }
