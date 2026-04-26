import { searchAPI, getAPI, getBestStream } from '../lib/apiAdapter.js'

const API_MAP = {
  hentaicity: 'hentaicity',
  hentaifox: 'hentaifox',
  xasiat: 'xasiat',
  javhdtoday: 'javhdtoday',
  javtsunami: 'javtsunami',
  javgiga: 'javgiga',
  missav: 'missav',
  eporner: 'eporner',
  xvideos2: 'xvideos',
  xnxx2: 'xnxx',
  spankbang: 'spankbang',
  xhamster: 'xhamster',
  pornhub: 'pornhub'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Use assim:

${usedPrefix}${command} yt bjork
${usedPrefix}${command} tiktok edit
${usedPrefix}${command} insta reels`)
  }

  conn.apiHub = conn.apiHub || {}

  const [typeRaw, ...queryParts] = text.trim().split(/\s+/)
  const type = typeRaw?.toLowerCase()
  const query = queryParts.join(' ')

  if (!API_MAP[type]) {
    return m.reply(`❌ API inválida.

Use:
yt
tiktok
insta`)
  }

  if (!query) {
    return m.reply(`❌ Digite o termo de busca.

Exemplo:
${usedPrefix}${command} ${type} bjork`)
  }

  try {
    await m.react('⏳')

    const apiName = API_MAP[type]
    const search = await searchAPI(apiName, query, 1)
    const results = search.results.slice(0, 10)

    if (!results.length) {
      await m.react('❌')
      return m.reply('❌ Nenhum resultado encontrado.')
    }

    const lista = results.map((v, i) => {
      return `*${i + 1}.* ${v.title}
⏱ ${v.duration}
👁 ${v.views}
⭐ ${v.rating}
🔗 ${v.url}`
    }).join('\n\n')

    const msg = await conn.sendMessage(m.chat, {
      text: `╭━━━〔 🔎 RESULTADOS 〕━━━⬣
┃ API: *${type.toUpperCase()}*
┃ Busca: *${query}*
╰━━━━━━━━━━━━⬣

${lista}

> Responda esta mensagem com o número para abrir.`,
      footer: 'OITAVÃO HUB',
      buttons: [
        {
          buttonId: `${usedPrefix}${command} ${type} ${query}`,
          buttonText: { displayText: '🔄 Buscar de novo' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}menu descargas`,
          buttonText: { displayText: '⬇️ Downloads' },
          type: 1
        }
      ],
      headerType: 1
    }, { quoted: m })

    conn.apiHub[m.sender] = {
      apiName,
      type,
      results,
      key: msg.key,
      timeout: setTimeout(() => delete conn.apiHub[m.sender], 120000)
    }

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`❌ Erro na busca.\n\n${String(e).slice(0, 300)}`)
  }
}

handler.before = async (m, { conn, usedPrefix }) => {
  conn.apiHub = conn.apiHub || {}

  const session = conn.apiHub[m.sender]
  if (!session) return

  if (!m.quoted || m.quoted.id !== session.key.id) return

  const n = parseInt(m.text.trim())
  if (isNaN(n) || n < 1 || n > session.results.length) {
    return m.reply('❌ Número inválido.')
  }

  try {
    await m.react('⏳')

    const item = session.results[n - 1]
    const data = await getAPI(session.apiName, item.url || item.id)

    const best = getBestStream(data.streams)

    if (!best) {
      await m.react('❌')
      return m.reply('❌ Nenhum stream disponível.')
    }

    const qualities = data.streams
      .map(s => `┃ ${s.quality} → ${s.url}`)
      .join('\n')

    await conn.sendMessage(m.chat, {
      image: { url: data.thumbnail || item.thumbnail },
      caption: `╭━━━〔 🎬 CONTEÚDO 〕━━━⬣
┃ 🎞️ *Título:* ${data.title}
┃ 📝 *Descrição:* ${data.description || 'Sem descrição'}
┃ 🏷️ *Tags:* ${data.tags?.join(', ') || 'Nenhuma'}
┃ ⭐ *Melhor qualidade:* ${best.quality}
╰━━━━━━━━━━━━⬣

*Qualidades disponíveis:*
${qualities}`,
      footer: 'OITAVÃO HUB',
      buttons: [
        {
          buttonId: `${usedPrefix}hubget ${session.apiName} ${item.url || item.id}`,
          buttonText: { displayText: '⬇️ Baixar melhor' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}hubqualities ${session.apiName} ${item.url || item.id}`,
          buttonText: { displayText: '🎚 Qualidades' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}menu descargas`,
          buttonText: { displayText: '📂 Downloads' },
          type: 1
        }
      ],
      headerType: 4
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`❌ Erro ao abrir item.\n\n${String(e).slice(0, 300)}`)
  }
}

handler.help = ['hub <api> <busca>']
handler.tags = ['descargas']
handler.command = ['hub', 'apihub']

export default handler
