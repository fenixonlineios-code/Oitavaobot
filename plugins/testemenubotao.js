let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, {
    text: `🍃 *MENU TESTE BOTÃO*

Se isso ficar “Aguardando a mensagem”, o problema é botão na sua base.`,
    footer: 'OITAVÃO BOT',
    buttons: [
      {
        buttonId: `${usedPrefix}menu main`,
        buttonText: { displayText: '🎄 MAIN' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}menu tools`,
        buttonText: { displayText: '🧰 TOOLS' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}menu descargas`,
        buttonText: { displayText: '⬇️ DOWNLOADS' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['testemenubotao']
handler.help = ['testemenubotao']
handler.tags = ['test']

export default handler
