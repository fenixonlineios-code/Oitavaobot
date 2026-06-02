import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: `🔐 *Recuperação de senha*

Clique no botão abaixo para alterar a senha da sua conta.`
          }),

          footer: proto.Message.InteractiveMessage.Footer.create({
            text: 'OITAVÃO BOT'
          }),

          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
              {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                  display_text: '🔐 Alterar senha',
                  copy_code: 'https://fenix.tpgb.online/Public/Esqueci-Senha',
                  id: 'test'
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

handler.command = ['mudarsenha']
handler.tags = ['main']
handler.help = ['mudarsenha']

export default handler
