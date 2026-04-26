let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, {
    text: '🍃 *MENUS*',
    footer: 'OITAVÃO BOT',
    buttons: [
      { buttonId: `${usedPrefix}menu info`, buttonText: { displayText: '📘 INFO' }, type: 1 },
      { buttonId: `${usedPrefix}menu internet`, buttonText: { displayText: '🌐 INTERNET' }, type: 1 },
      { buttonId: `${usedPrefix}menu5`, buttonText: { displayText: '➡️ MAIS' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['menu4']
export default handler
