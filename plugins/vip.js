let handler = async (m, { conn, args }) => {
  let target = m.mentionedJid[0] || m.sender

  if (!global.db.data.users[target]) {
    global.db.data.users[target] = {}
  }

  global.db.data.users[target].plano18 = true

  m.reply('💎 VIP ativado')
}

handler.command = ['vip']
handler.owner = true
export default handler
