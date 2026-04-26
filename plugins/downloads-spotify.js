import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `🎋 *Por favor, envie o nome de uma música ou artista.*\n\nExemplo:\n${usedPrefix}splay Hunter Björk`,
      m
    )
  }

  try {
    await m.react('🕒')

    const searchUrl = `${global.APIs.delirius.url}/search/spotify?q=${encodeURIComponent(text)}&limit=1`
    const search = await axios.get(searchUrl, { timeout: 15000 })

    if (!search.data.status || !search.data.data?.length) {
      throw 'Não encontrei essa música.'
    }

    const data = search.data.data[0]
    const {
      title,
      artist,
      album,
      duration,
      popularity,
      publish,
      url: spotifyUrl,
      image
    } = data

    const caption =
      `「🌳」Baixando *<${title}>*\n\n` +
      `> 🍄 Artista » *${artist}*\n` +
      (album ? `> 🌾 Álbum » *${album}*\n` : '') +
      (duration ? `> 🎍 Duração » *${duration}*\n` : '') +
      (popularity ? `> 🎅 Popularidade » *${popularity}*\n` : '') +
      (publish ? `> 🌿 Publicado » *${publish}*\n` : '') +
      `> ☕ Link » ${spotifyUrl}`

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: '🎇 ✧ Spotify • Music ✧ 🎇',
          body: artist,
          thumbnailUrl: image,
          sourceUrl: spotifyUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    const apiDownload = `${global.APIs.light.url}/download/spotify/v2?url=${encodeURIComponent(spotifyUrl)}`
    const dlRes = await axios.get(apiDownload, { timeout: 20000 })

    if (!dlRes.data.status || !dlRes.data.result?.download_url) {
      throw 'Não consegui obter o link de download.'
    }

    const { download_url } = dlRes.data.result

    const audioRes = await fetch(download_url)
    if (!audioRes.ok) throw 'Erro ao baixar o áudio.'

    const buffer = await audioRes.buffer()

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `${safeFileName(title)}.mp3`,
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: '✿ Spotify Downloader',
          thumbnailUrl: image,
          sourceUrl: spotifyUrl,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      text: `🎧 *Música enviada com sucesso!*\n\n*${title}* — ${artist}\n\nEscolha uma opção:`,
      footer: 'OITAVÃO BOT',
      buttons: [
        {
          buttonId: `${usedPrefix}splay ${text}`,
          buttonText: { displayText: '🔁 Repetir' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}splay ${artist}`,
          buttonText: { displayText: '👤 Mais do artista' },
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

    await m.react('✔️')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    conn.reply(
      m.chat,
      `☕ Erro ao buscar ou baixar a música.\n\n${String(e)}`,
      m
    )
  }
}

function safeFileName(name) {
  return String(name || 'audio')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
}

handler.help = ['spotify', 'splay']
handler.tags = ['descargas']
handler.command = ['spotify', 'splay', 'sPlay']
handler.group = true
handler.register = true

export default handler
