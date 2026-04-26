let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, {
    text: '🍃 *MENUS*',
    footer: 'OITAVÃO BOT',
    buttons: [
      { buttonId: `${usedPrefix}menu game`, buttonText: { displayText: '🕹️ GAME' }, type: 1 },
      { buttonId: `${usedPrefix}menu premium`, buttonText: { displayText: '💎 PREMIUM' }, type: 1 },
      { buttonId: `${usedPrefix}menu9`, buttonText: { displayText: '➡️ MAIS' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['menu8']
export default handler
