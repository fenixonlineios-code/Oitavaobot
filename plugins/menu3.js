let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, {
    text: '🍃 *MENUS*',
    footer: 'OITAVÃO BOT',
    buttons: [
      { buttonId: `${usedPrefix}menu owner`, buttonText: { displayText: '👑 OWNER' }, type: 1 },
      { buttonId: `${usedPrefix}menu fun`, buttonText: { displayText: '🎮 FUN' }, type: 1 },
      { buttonId: `${usedPrefix}menu4`, buttonText: { displayText: '➡️ MAIS' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['menu3']
export default handler
