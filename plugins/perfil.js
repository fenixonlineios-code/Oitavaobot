let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (!user.registered) {
    return m.reply('🌱 Você precisa se registrar primeiro usando .registro')
  }

  let nome = user.name || 'Sem nome'
  let idade = user.age || 'Não definida'
  let coins = user.coin || 0

  m.reply(
`🌿 *Seu Perfil*

🪪 Nome: ${nome}
🎂 Idade: ${idade}
💰 Coins: ${coins.toLocaleString()}

🍃 Status: Registrado`)
}

handler.help = ['perfil']
handler.tags = ['rg']
handler.command = ['perfil', 'me']

export default handler
