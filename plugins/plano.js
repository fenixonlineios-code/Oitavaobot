let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  let registrado = user.registered ? '✅ Sim' : '❌ Não'
  let plano = user.plano18 ? '💎 VIP' : '🆓 Free'

  let texto = `
🩷 *SEU PERFIL*

👤 Nome: ${user.name || 'Sem nome'}
🪪 Registrado: ${registrado}
💎 Plano: ${plano}
`

  await conn.sendMessage(m.chat, {
    text: texto,
    footer: 'OITAVÃO BOT',
    buttons: [
      { buttonId: '.menu', buttonText: { displayText: '📂 Menu' }, type: 1 },
      { buttonId: '.owner', buttonText: { displayText: '📞 Contato dono' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['plano', 'situação']
export default handler
