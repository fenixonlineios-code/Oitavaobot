import yts from 'yt-search'
import { execFile } from 'child_process'
import fs from 'fs'
import path from 'path'

const DIR = './ytmp'
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })

const runYtdlp = (args) => new Promise((resolve, reject) => {
  execFile('yt-dlp', args, { maxBuffer: 1024 * 1024 * 100 }, (err, stdout, stderr) => {
    if (err) return reject(stderr || err)
    resolve(stdout)
  })
})

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) {
    return m.reply(`🔎 Digite o nome ou link do YouTube.

Exemplo:
${usedPrefix}playaudio Hunter Björk
${usedPrefix}playvideo Hunter Björk`)
  }

  try {
    await m.react('⏳')

    const search = await yts(text)
    const video = search.videos[0]
    if (!video) return m.reply('❌ Nenhum vídeo encontrado.')

    const info = `╭━━━〔 🎬 YOUTUBE 〕━━━⬣
┃ 🎵 *Título:* ${video.title}
┃ 👤 *Canal:* ${video.author.name}
┃ ⏱️ *Duração:* ${video.timestamp}
┃ 👁️ *Visualizações:* ${formatViews(video.views)}
┃ 📅 *Publicado:* ${video.ago}
┃ 🔗 *Link:* ${video.url}
╰━━━━━━━━━━━━⬣`

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption: info,
      footer: 'OITAVÃO BOT',
      buttons: [
        {
          buttonId: `${usedPrefix}playaudio ${video.url}`,
          buttonText: { displayText: '🎵 Áudio' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}playvideo ${video.url}`,
          buttonText: { displayText: '🎬 Vídeo' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}menu descargas`,
          buttonText: { displayText: '⬇️ Downloads' },
          type: 1
        }
      ],
      headerType: 4
    }, { quoted: m })

    const id = Date.now()

    if (command === 'playaudio') {
      const output = path.join(DIR, `audio_${id}.mp3`)

      await runYtdlp([
        '-x',
        '--audio-format', 'mp3',
        '--audio-quality', '128K',
        '--no-playlist',
        '-o', output,
        video.url
      ])

      if (!fs.existsSync(output)) return m.reply('❌ O áudio não foi baixado.')

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(output),
        mimetype: 'audio/mpeg',
        ptt: true,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: `${video.author.name} • ${formatViews(video.views)} visualizações`,
            thumbnailUrl: video.thumbnail,
            sourceUrl: video.url,
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m })

      if (fs.existsSync(output)) fs.unlinkSync(output)
    }

    if (command === 'playvideo') {
      const output = path.join(DIR, `video_${id}.mp4`)

      await runYtdlp([
        '-f', '18/best[ext=mp4]/best',
        '--no-playlist',
        '-o', output,
        video.url
      ])

      if (!fs.existsSync(output)) return m.reply('❌ O vídeo não foi baixado.')

      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(output),
        mimetype: 'video/mp4',
        caption: `🎥 *${video.title}*

👤 ${video.author.name}
👁️ ${formatViews(video.views)} visualizações
⏱️ ${video.timestamp}`,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: `${video.author.name} • ${formatViews(video.views)} visualizações`,
            thumbnailUrl: video.thumbnail,
            sourceUrl: video.url,
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m })

      if (fs.existsSync(output)) fs.unlinkSync(output)
    }

    await m.react('✅')

  } catch (e) {
    console.log(e)
    await m.react('❌')
    await m.reply(`❌ Erro ao baixar.\n\n${String(e).slice(0, 300)}`)
  }
}

function formatViews(num) {
  if (!num) return '0'
  return Number(num).toLocaleString('pt-BR')
}

handler.command = ['playaudio', 'playvideo']
handler.help = ['playaudio <texto>', 'playvideo <texto>']
handler.tags = ['descargas']
handler.register = true

export default handler
