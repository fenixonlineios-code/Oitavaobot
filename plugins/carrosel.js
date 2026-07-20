let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    text: '🌸 OITAVÃO BOT',
    footer: 'Deslize para o lado 👉',

    cards: [
      {
        image: {
          url: 'https://i.ibb.co/5W62jvz2/IMG-9525.jpg'
        },
        title: '📜 Menu Principal',
        caption: 'Comandos principais',

        nativeFlow: [
          {
            text: 'Abrir',
            id: '.menu'
          }
        ]
      },

      {
        image: {
          url: 'https://i.ibb.co/5W62jvz2/IMG-9525.jpg'
        },
        title: '🧰 Ferramentas',
        caption: 'Utilidades',

        nativeFlow: [
          {
            text: 'Abrir',
            id: '.tools'
          }
        ]
      },

      {
        image: {
          url: 'https://i.ibb.co/5W62jvz2/IMG-9525.jpg'
        },
        title: '🎵 Downloads',
        caption: 'Baixar músicas',

        nativeFlow: [
          {
            text: 'Abrir',
            id: '.play'
          }
        ]
      }
    ]
  }, { quoted: m })
}

handler.command = ['carousel']
export default handler
