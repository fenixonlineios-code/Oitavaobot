import fetch from 'node-fetch'

const SITE_URL = 'https://tpgb.online'
const FOFOCAS_URL = `${SITE_URL}/fofocas.html`

let handler = async (m, { conn, text, command, usedPrefix }) => {
  // comando principal com botões
  if (command === 'fofocas') {
    return conn.sendMessage(m.chat, {
      text: `🫢 *Central de Fofocas*

Escolha uma opção:`,
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

  // botão de enviar
  if (command === 'enviarfofoca') {
    return m.reply(`📝 *Enviar fofoca*

Use assim:

${usedPrefix}fofoca sua fofoca aqui

Exemplo:
${usedPrefix}fofoca disseram que alguém sumiu da call 👀`)
  }

  // enviar fofoca pelo bot
  if (command === 'fofoca') {
    if (!text) {
      return m.reply(`🫢 Escreve a fofoca depois do comando.

Exemplo:
${usedPrefix}fofoca disseram que...`)
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

  // botão de ver fofocas
  if (command === 'verfofocas') {
    return m.reply(`👀 Veja as fofocas aqui:

${FOFOCAS_URL}`)
  }
}

handler.command = ['fofocas', 'fofoca', 'enviarfofoca', 'verfofocas']
handler.tags = ['fun']
handler.help = ['fofocas', 'fofoca <texto>']

export default handler
