let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, {
    text: '🍃 *ÚLTIMOS MENUS*',
    footer: 'OITAVÃO BOT',
    buttons: [
      { buttonId: `${usedPrefix}menu bot`, buttonText: { displayText: '🤖 BOT' }, type: 1 },
      { buttonId: `${usedPrefix}menu rg`, buttonText: { displayText: '🪪 RG' }, type: 1 },
      { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '⬅️ VOLTAR' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['menu9']
export default handler
