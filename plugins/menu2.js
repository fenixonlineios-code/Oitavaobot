let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, {
    text: '🍃 *MENUS*',
    footer: 'OITAVÃO BOT',
    buttons: [
      { buttonId: `${usedPrefix}menu audio`, buttonText: { displayText: '🎶 AUDIO' }, type: 1 },
      { buttonId: `${usedPrefix}menu group`, buttonText: { displayText: '🎁 GROUP' }, type: 1 },
      { buttonId: `${usedPrefix}menu3`, buttonText: { displayText: '➡️ MAIS' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['menu2']
export default handler
