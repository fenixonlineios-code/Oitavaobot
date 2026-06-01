let handler = async (m, { conn, command, usedPrefix }) => {
  if (command === 'menulista' || command === 'menu') {
    // 1️⃣ PRIMEIRO MANDA A LISTA
    await conn.sendMessage(m.chat, {
      text: `🩷 *OITAVÃO BOT*

Escolha uma categoria na lista abaixo:`,
      image: { url: 'https://i.ibb.co/5W62jvz2/IMG-9525.jpg' },
      gifPlayback: true,
      caption: texto,
      footer: 'OITAVÃO BOT',
      title: 'Menu principal',
      buttonText: 'Abrir lista',
      sections: [
        {
          title: 'Principais',
          rows: [
            {
              title: '🏠 Menu principal',
              description: 'Menu inicial do bot',
              rowId: `${usedPrefix}menu main`
            },
            {
              title: '🧰 Tools',
              description: 'Menu de ferramentas',
              rowId: `${usedPrefix}perfil`
            },
            {
              title: '🎶 Audio',
              description: 'Menu de áudios e sons',
              rowId: `${usedPrefix}menu audio`
            }
          ]
        },
        {
          title: 'Administração,
          rows: [
            {
              title: '🎁 Group',
              description: 'Menu para grupos',
              rowId: `${usedPrefix}menu group`
            },
            {
              title: '👑 Owner',
              description: 'Menu para o Dono da aplicação',
              rowId: `${usedPrefix}menu owner`
            }
          ]
        },
        {
          title: '️Ferramentas',
          rows: [
            {
              title: '📘 Info',
              description: 'Menu de informações,
              rowId: `${usedPrefix}menu info`
            },
            {
              title: '✨️ Anime',
              description: 'Menu anime e mangás',
              rowId: `${usedPrefix}menu anime`
            }
          ]
        }
      ]
    }, { quoted: m })

    // 2️⃣ DEPOIS MANDA OS BOTÕES
    return conn.sendMessage(m.chat, {
      text: `✨ *Ações rápidas*

Use os botões abaixo:`,
      footer: 'OITAVÃO BOT',
      buttons: [
        {
          buttonId: `${usedPrefix}perfil`,
          buttonText: { displayText: '👤 Perfil' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}menu7`,
          buttonText: { displayText: '⏭️ Próximo Menu' },
          type: 1
        }
      ],
      headerType: 1
    }, { quoted: m })
  }
}

handler.command = ['menu', 'menulista']
handler.tags = ['main']
handler.help = ['menu']

export default handler
