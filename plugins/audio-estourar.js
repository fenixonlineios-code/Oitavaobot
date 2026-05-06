import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'

ffmpeg.setFfmpegPath(ffmpegPath)

const tmpDir = './tmp'
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

function tmpFile(ext) {
  return path.join(tmpDir, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`)
}

function safeDelete(file) {
  try {
    if (file && fs.existsSync(file)) fs.unlinkSync(file)
  } catch {}
}

function processarMidia(input, output, isVideo = false) {
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(input)

    if (isVideo) {
      cmd = cmd
        .videoCodec('copy')
        .audioCodec('aac')
        .audioFilters([
          'volume=120',
          'acompressor=threshold=-18dB:ratio=6:attack=5:release=80',
          'alimiter=limit=0.95'
        ])
    } else {
      cmd = cmd
        .audioCodec('libmp3lame')
        .audioFilters([
          'volume=70',
          'acompressor=threshold=-18dB:ratio=6:attack=5:release=80',
          'alimiter=limit=0.95'
        ])
    }

    cmd
      .on('end', () => resolve(output))
      .on('error', reject)
      .save(output)
  })
}

let handler = async (m, { conn }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!/audio|video/.test(mime)) {
    return m.reply('🎧 Responda a um áudio ou vídeo para estourar o som.')
  }

  await m.react?.('🔊')

  let input
  let output

  try {
    const buffer = await q.download()

    if (!buffer) {
      await m.react?.('❌')
      return m.reply('❌ Não consegui baixar a mídia.')
    }

    const isVideo = /video/.test(mime)

    input = tmpFile(isVideo ? 'mp4' : 'ogg')
    output = tmpFile(isVideo ? 'mp4' : 'mp3')

    fs.writeFileSync(input, buffer)

    await processarMidia(input, output, isVideo)

    if (isVideo) {
      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(output),
        mimetype: 'video/mp4',
        caption: '🔊 Vídeo com áudio estourado'
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(output),
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: m })
    }

    await m.react?.('✅')
  } catch (e) {
    console.error(e)
    await m.react?.('❌')
    m.reply('❌ Erro ao estourar o áudio.')
  } finally {
    safeDelete(input)
    safeDelete(output)
  }
}

handler.command = ['estourar', 'bassboost', 'audioestourado']
handler.tags = ['audio']
handler.help = ['estourar']

export default handler
