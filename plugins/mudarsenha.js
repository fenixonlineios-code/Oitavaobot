let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, {
    text: '*Altere a senha de sua conta no link abaixo*',
    footer: 'OITAVÃO BOT',
    buttons: [
{
  name: 'cta_url',
  buttonParamsJson: JSON.stringify({
    display_text: '🫢 Ver fofocas',
    url: 'https://tpgb.online/Oitavão/Fofocas.html'
  })
}
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['mudarsenha']
export default handler
