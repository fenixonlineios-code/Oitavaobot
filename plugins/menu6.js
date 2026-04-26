let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, {
    text: '🍃 *MENUS*',
    footer: 'OITAVÃO BOT',
    buttons: [
      { buttonId: `${usedPrefix}menu anime`, buttonText: { displayText: '✨ ANIME' }, type: 1 },
      { buttonId: `${usedPrefix}menu nsfw`, buttonText: { displayText: '🚫 NSFW' }, type: 1 },
      { buttonId: `${usedPrefix}menu7`, buttonText: { displayText: '➡️ MAIS' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['menu6']
export default handler

