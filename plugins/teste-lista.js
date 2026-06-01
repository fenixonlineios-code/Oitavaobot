let handler = async (m, { conn, usedPrefix }) => {
  try {
    await conn.sendMessage(m.chat, {
      text: '🧪 *Teste de Lista*\n\nEscolha uma opção abaixo:',
      footer: 'OITAVÃO BOT',
      title: 'Menu de teste',
      buttonText: 'Abrir lista',
      sections: [
        {
          title: '🌸 Menus principais',
          rows: [
            {
              title: '📜 Menu principal',
              description: 'Abrir o menu do bot',
              rowId: `${usedPrefix}menu`
            },
            {
              title: '👤 Perfil',
              description: 'Ver seu perfil',
              rowId: `${usedPrefix}perfil`
            },
            {
              title: '🫢 Fofocas',
              description: 'Abrir central de fofocas',
              rowId: `${usedPrefix}fofoca`
            }
          ]
        },
        {
          title: '🧪 Testes',
          rows: [
            {
              title: '🏓 Ping',
              description: 'Testar velocidade do bot',
              rowId: `${usedPrefix}ping`
            },
            {
              title: '🔊 Estourar áudio',
              description: 'Use respondendo a um áudio',
              rowId: `${usedPrefix}estourar`
            }
          ]
        }
      ]
    }, { quoted: m })
  } catch (e) {
    console.error('ERRO LISTA:', e)
    m.reply('❌ Não consegui enviar a lista.')
  }
}

handler.command = ['testelista', 'lista']
handler.tags = ['tools']
handler.help = ['testelista']

export default handler
