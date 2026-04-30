let handler = async (m, { conn }) => {
  const target = m.mentionedJid?.[0] || m.sender

  // garante objeto do usuário
  if (!global.db.data.users[target]) {
    global.db.data.users[target] = {}
  }

  const user = global.db.data.users[target]

  // 🔥 ATIVA SEU PLANO
  user.plano18 = true

  // 🔥 SINCRONIZA COM O SISTEMA DO BOT (EVITA "LOVELY")
  user.premium = true
  user.premiumTime = Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 ano

  await conn.sendMessage(m.chat, {
    text: `💎 VIP ativado para @${target.split('@')[0]}`,
    mentions: [target]
  }, { quoted: m })
}

handler.command = ['vip']
handler.owner = true
export default handler
