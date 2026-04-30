let handler = async (m, { args }) => {
  let target = args[0]

  if (!target) return m.reply('Use: /vip numero@s.whatsapp.net')

  let user = global.db.data.users[target]
  if (!user) return m.reply('Usuário não encontrado')

  user.acesso18 = true

  m.reply('💎 VIP liberado')
}

handler.command = ['vip']
handler.owner = true
export default handler
