let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, {
    text: '🍃 *MENUS*',
    footer: 'OITAVÃO BOT',
    buttons: [
      { buttonId: `${usedPrefix}menu downloads`, buttonText: { displayText: '⬇️ DOWNLOADS' }, type: 1 },
      { buttonId: `${usedPrefix}menu admin`, buttonText: { displayText: '🧦 ADMIN' }, type: 1 },
      { buttonId: `${usedPrefix}menu6`, buttonText: { displayText: '➡️ MAIS' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['menu5']
export default handler
