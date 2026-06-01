let handler = async (m, { conn, usedPrefix }) => {
  try {
    await conn.sendMessage(m.chat, {
      text: 'Olá! Eu sou a assistente virtual do Fênix Online. Para começar, escolha o serviço para o qual deseja atendimento. *Novidade!* Agora você também pode pedir a *mudança de senha* da sua conta por *aqui*, *basta nos mandar /mudarsenha* 💬',
      footer: 'OITAVÃO BOT',
      title: 'Bem Vindo(a) ao nosso Portal!',
      buttonText: 'Ver Opções',
      sections: [
        {
          title: 'Solicitações em destaque',
          rows: [
            {
              title: '🔒 Alteração de Senha',
              description: 'Alterar senha do portal Fênix Online',
              rowId: `${usedPrefix}mudarsenha`
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

handler.command = ['Fênix', 'fênix', 'fenix', 'Fenix']
handler.tags = ['tools']
handler.help = ['Fênix']

export default handler
