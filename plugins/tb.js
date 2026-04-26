import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  try {
    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: '🍃 TESTE DE LISTA'
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: 'Clique abaixo'
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                title: '📋 MENU TESTE',
                hasMediaAttachment: false
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [
                  {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                      title: 'Abrir lista',
                      sections: [
                        {
                          title: 'Menus',
                          rows: [
                            {
                              title: '🎄 MAIN',
                              description: 'Abrir main',
                              id: '.menu main'
                            },
                            {
                              title: '🧰 TOOLS',
                              description: 'Abrir tools',
                              id: '.menu tools'
                            }
                          ]
                        }
                      ]
                    })
                  }
                ]
              })
            })
          }
        }
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error(e)
    m.reply('❌ Lista NÃO suportada:\n' + e.message)
  }
}

handler.command = ['testelista']
export default handler
