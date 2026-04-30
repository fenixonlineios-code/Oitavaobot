let handler = async (m, { conn, usedPrefix }) => {
  let user = global.db.data.users[m.sender]

  // 🔒 BLOQUEIO
  if (!user.plano18) {
    return conn.sendMessage(m.chat, {
      text: `
🔒 *MENU 18 BLOQUEADO*

Esse conteúdo é exclusivo 💎

Clique abaixo para ver seu status ou falar com o dono.
`,
      footer: 'OITAVÃO BOT',
      buttons: [
        { buttonId: '.plano', buttonText: { displayText: '👤 Ver perfil' }, type: 1 },
        { buttonId: '.owner', buttonText: { displayText: '📞 Falar com dono' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  // 🔥 MENU LIBERADO
  let texto = `
🔥 *MENU 18*

Escolha um comando:

🌶️ ${usedPrefix}videoxxx
🌶️ ${usedPrefix}vxxx
🌶️ ${usedPrefix}hubget xvideos id
`

  await conn.sendMessage(m.chat, {
    text: texto,
    footer: 'OITAVÃO BOT',
    buttons: [
      { buttonId: `${usedPrefix}menu nsfw`, buttonText: { displayText: '🔥 Ver Mais' }, type: 1 },
      { buttonId: `${usedPrefix}hubget`, buttonText: { displayText: '📥 Baixar' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['menu18check', 'nsfwmenucheck']
handler.tags = ['main']

export default handler
