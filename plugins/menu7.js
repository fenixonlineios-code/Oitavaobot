let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, {
    text: '🍃 *MENUS*',
    footer: 'OITAVÃO BOT',
    buttons: [
      { buttonId: `${usedPrefix}menu search`, buttonText: { displayText: '🔍 SEARCH' }, type: 1 },
      { buttonId: `${usedPrefix}menu sticker`, buttonText: { displayText: '🖼️ STICKER' }, type: 1 },
      { buttonId: `${usedPrefix}menu8`, buttonText: { displayText: '➡️ MAIS' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['menu7']
export default handler
