let handler = async (m, { conn, args }) => {
  let user = global.db.data.users[m.sender]

  if (user.registered) {
    return m.reply('🌿 Você já está registrado.')
  }

  if (!args[0]) {
    return m.reply(`🌾 *Uso correto:*
/registro Nome.Idade

🪴 *Exemplo:*
/registro Pietro.17`)
  }

  let [nome, idade] = args.join(' ').split('.')

  if (!nome || !idade) {
    return m.reply('🍂 Formato inválido. Use: Nome.Idade')
  }

  idade = parseInt(idade)

  if (isNaN(idade)) {
    return m.reply('🌱 Idade inválida.')
  }

  if (idade < 10 || idade > 50) {
    return m.reply('🍃 Idade deve ser entre 10 e 50.')
  }

  // salva
  user.name = nome.trim()
  user.age = idade
  user.registered = true

  // bônus
  user.coin = (user.coin || 0) + 500

  // tenta mandar botão
  try {
    await conn.sendMessage(m.chat, {
      text: `🌿 *Registro concluído*

🪪 Nome: ${nome}
🎂 Idade: ${idade}
💰 Bônus: 500 coins

Escolha uma opção:`,
      footer: '₢OitavãoBOT',
      buttons: [
        { buttonId: '/perfil', buttonText: { displayText: '👤 Perfil' }, type: 1 },
        { buttonId: '/menu', buttonText: { displayText: '📋 Menu' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })

  } catch (e) {
    // fallback (se botão não funcionar)
    await m.reply(`🌿 *Registro concluído*

🪪 Nome: ${nome}
🎂 Idade: ${idade}
💰 Bônus: 500 coins

Use:
/perfil
/menu`)
  }
}

handler.help = ['registro <nome.idade>']
handler.tags = ['rg']
handler.command = ['registro', 'reg']

export default handler
