let handler = async (m, { conn }) => {
  let target = m.mentionedJid[0]

  if (!target) return m.reply('Marque alguém')

  if (!global.db.data.users[target]) {
    global.db.data.users[target] = { plano18: true }
  } else {
    global.db.data.users[target].plano18 = true
  }

  m.reply('💎 Acesso liberado')
}

handler.command = ['acesso18']
handler.owner = true
export default handler
