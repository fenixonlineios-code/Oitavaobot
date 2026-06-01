import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix }) => {
  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: `🩷 *OITAVÃO BOT*

Escolha uma opção abaixo.

Você pode abrir a lista completa ou usar os botões rápidos.`
          }),

          footer: proto.Message.InteractiveMessage.Footer.create({
            text: 'OITAVÃO BOT'
          }),

          header: proto.Message.InteractiveMessage.Header.create({
            title: 'Menu principal',
            subtitle: 'Lista + botões',
            hasMediaAttachment: false
          }),

          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
              {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: '📜 Abrir lista',
                  sections: [
                    {
                      title: '🌸 Principais',
                      rows: [
                        {
                          title: '🏠 Menu principal',
                          description: 'Abrir menu completo',
                          id: `${usedPrefix}menu`
                        },
                        {
                          title: '👤 Perfil',
                          description: 'Ver seu perfil',
                          id: `${usedPrefix}perfil`
                        },
                        {
                          title: '🫢 Fofocas',
                          description: 'Central de fofocas',
                          id: `${usedPrefix}fofoca`
                        }
                      ]
                    },
                    {
                      title: '🎨 Criação',
                      rows: [
                        {
                          title: '🖼️ Sticker',
                          description: 'Criar figurinha',
                          id: `${usedPrefix}sticker`
                        },
                        {
                          title: '🔊 Estourar áudio',
                          description: 'Aumentar grave/volume',
                          id: `${usedPrefix}estourar`
                        }
                      ]
                    },
                    {
                      title: '🛠️ Ferramentas',
                      rows: [
                        {
                          title: '🏓 Ping',
                          description: 'Testar velocidade',
                          id: `${usedPrefix}ping`
                        },
                        {
                          title: '👑 Dono',
                          description: 'Falar com o dono',
                          id: `${usedPrefix}owner`
                        }
                      ]
                    }
                  ]
                })
              },
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '👤 Perfil',
                  id: `${usedPrefix}perfil`
                })
              },
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '🫢 Fofocas',
                  id: `${usedPrefix}fofoca`
                })
              }
            ]
          })
        })
      }
    }
  }, { quoted: m })

  await conn.relayMessage(m.chat, msg.message, {
    messageId: msg.key.id
  })
}

handler.command = ['menuinterativo', 'menui']
handler.tags = ['main']
handler.help = ['menuinterativo']

export default handler
