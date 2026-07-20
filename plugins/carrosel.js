import fs from 'fs'

let handler = async (m, { conn }) => {
  await conn.sendMessage(
    m.chat,
    {
      text: '🌸 Oitavão Bot',
      footer: 'Deslize para o lado',
      cards: [
        {
          image: {
            url: 'https://i.ibb.co/5W62jvz2/IMG-9525.jpg'
          },
          title: '📜 Menu',
          caption: 'Comandos principais',
          nativeFlow: [
            {
              text: 'Abrir Menu',
              id: '.menu'
            },
            {
              text: 'Site',
              url: 'https://google.com'
            }
          ]
        },

        {
          image: {
            url: 'https://i.ibb.co/5W62jvz2/IMG-9525.jpg'
          },
          title: '🧰 Ferramentas',
          caption: 'Comandos úteis',
          nativeFlow: [
            {
              text: 'Abrir Tools',
              id: '.tools'
            }
          ]
        },

        {
          image: {
            url: 'https://i.ibb.co/5W62jvz2/IMG-9525.jpg'
          },
          title: '🎵 Downloads',
          caption: 'Baixe músicas e vídeos',
          nativeFlow: [
            {
              text: 'Abrir Downloads',
              id: '.play'
            }
          ]
        }
      ]
    },
    { quoted: m }
  )
}

handler.command = ['carousel']
export default handler
