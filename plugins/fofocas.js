import fetch from 'node-fetch'

const SITE_URL = 'https://tpgb.online'
const FOFOCAS_URL = `${SITE_URL}/Oitavão/Fofocas`

let handler = async (m, { conn, text, command, usedPrefix }) => {
  // CENTRAL: só mostra botões
  if (command === 'fofoca' || command === 'fofocas') {
    return conn.sendMessage(m.chat, {
      text: `🫢 *Central de Fofocas*

Escolha uma opção abaixo:`,
      footer: 'OITAVÃO BOT',
      buttons: [
        {
          buttonId: `${usedPrefix}enviarfofoca`,
          buttonText: { displayText: '📝 Enviar fofoca' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}verfofocas`,
          buttonText: { displayText: '👀 Ver fofocas' },
          type: 1
        }
      ],
      headerType: 1
    }, { quoted: m })
  }

  // botão "Enviar fofoca"
  if (command === 'enviarfofoca') {
    return m.reply(`📝 *Enviar fofoca*

Use assim:

${usedPrefix}fofocar sua fofoca aqui

Exemplo:
${usedPrefix}fofocar disseram que alguém sumiu da call 👀`)
  }

  // comando real que envia
  if (command === 'fofocar') {
    if (!text) {
      return m.reply(`🫢 Escreve a fofoca depois do comando.

Exemplo:
${usedPrefix}fofocar disseram que...`)
    }

    const res = await fetch(`${SITE_URL}/Oitavão/fofoca`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: text })
    })

    if (!res.ok) {
      console.log(await res.text().catch(() => 'Erro sem resposta'))
      return m.reply('❌ Não consegui enviar a fofoca agora.')
    }

    return m.reply('🔥 Fofoca enviada!')
  }

  // botão "Ver fofocas"
  if (command === 'verfofocas') {
    return m.reply(`👀 Veja as fofocas aqui:

${FOFOCAS_URL}`)
  }
}

handler.command = ['fofoca', 'fofocas', 'enviarfofoca', 'fofocar', 'verfofocas']
handler.tags = ['fun']
handler.help = ['fofoca', 'fofocar <texto>']

export default handler
