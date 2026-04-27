import { getAPI, getBestStream } from '../lib/apiAdapter.js'

let handler = async (m, { conn, args }) => {
  const apiName = args[0]
  const input = args.slice(1).join(' ')

  if (!apiName || !input) {
    return m.reply('Use: /hubget api link-ou-id')
  }

  try {
    await m.react('⏳')

    const data = await getAPI(apiName, input)
    const stream = getBestStream(data.streams)

    if (!stream?.url) {
      await m.react('❌')
      return m.reply('❌ Nenhum stream encontrado.')
    }

    await conn.sendMessage(m.chat, {
      video: { url: stream.url },
      mimetype: 'video/mp4',
      caption: `🎬 *${data.title}*\n📺 Qualidade: ${stream.quality}`
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`❌ Erro ao baixar.\n\n${String(e).slice(0, 300)}`)
  }
}

handler.command = ['hubget']
handler.tags = ['nsfw']
handler.help = ['hubget <api> <id/link> (apis disponiveis: xvideos, xnxx, pornhub, xhamster, hentaicity e mais)']

export default handler
