let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  
  const theme = {
  footer: '🌺'
}

  if (!user.registered) {
    return m.reply('${theme.footer} Você precisa se registrar primeiro usando .registro')
  }

  let nome = user.name || 'Sem nome'
  let idade = user.age || 'Não definida'
  let coins = user.coin || 0

  m.reply(
`${theme.footer} *Seu Perfil*

🪪 Nome: ${nome}
🎂 Idade: ${idade}
💰 Coins: ${coins.toLocaleString()}

${theme.footer} Status: Registrado`)
}

handler.help = ['perfil']
handler.tags = ['rg']
handler.command = ['perfil', 'me']

export default handler
