import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'

ffmpeg.setFfmpegPath(ffmpegPath)

const tmpDir = './tmp'
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

// limite pra não travar o Railway
const MAX_MB = 15

// 🔊 PRESET ESTOURADO COM GRAVE
const FILTRO_ESTOURADO = [
  'bass=g=22:f=80:w=0.6',
  'bass=g=18:f=140:w=0.7',
  'volume=14',
  'acompressor=threshold=-28dB:ratio=10:attack=2:release=60',
  'alimiter=limit=0.98'
]

// 💀 PRESET MAIS INSANO AINDA
const FILTRO_ABSURDO = [
  'bass=g=30:f=70:w=0.7',
  'bass=g=24:f=140:w=0.8',
  'volume=20',
  'acompressor=threshold=-32dB:ratio=14:attack=1:release=50',
  'alimiter=limit=1.0'
]

function tmpFile(ext) {
  return path.join(
    tmpDir,
    `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
  )
}

function safeDelete(file) {
  try {
    if (file && fs.existsSync(file)) fs.unlinkSync(file)
  } catch {}
}

function processarMidia(input, output, isVideo = false, modo = 'normal') {
  return new Promise((resolve, reject) => {
    const filtros = modo === 'absurdo'
      ? FILTRO_ABSURDO
      : FILTRO_ESTOURADO

    let cmd = ffmpeg(input)

    if (isVideo) {
      cmd = cmd
        .videoCodec('copy')
        .audioCodec('aac')
        .audioFilters(filtros)
        .outputOptions([
          '-movflags',
          '+faststart'
        ])
    } else {
      cmd = cmd
        .audioCodec('libmp3lame')
        .audioFilters(filtros)
    }

    cmd
      .on('end', () => resolve(output))
      .on('error', reject)
      .save(output)
  })
}

let handler = async (m, { conn, args }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!/audio|video/.test(mime)) {
    return m.reply(`🔊 Responda a um áudio ou vídeo.

Use:
.estourar

Ou modo absurdo:
.estourar absurdo`)
  }

  const modo = (args[0] || '').toLowerCase() === 'absurdo'
    ? 'absurdo'
    : 'normal'

  await m.react?.('🔊')

  let input
  let output

  try {
    const buffer = await q.download()

    if (!buffer) {
      await m.react?.('❌')
      return m.reply('❌ Não consegui baixar a mídia.')
    }

    const sizeMB = buffer.length / 1024 / 1024

    if (sizeMB > MAX_MB) {
      await m.react?.('❌')
      return m.reply(`❌ Arquivo muito grande.

Limite: ${MAX_MB} MB
Esse arquivo tem: ${sizeMB.toFixed(1)} MB`)
    }

    const isVideo = /video/.test(mime)

    input = tmpFile(isVideo ? 'mp4' : 'ogg')
    output = tmpFile(isVideo ? 'mp4' : 'mp3')

    fs.writeFileSync(input, buffer)

    await processarMidia(input, output, isVideo, modo)

    const finalBuffer = fs.readFileSync(output)

    if (isVideo) {
      await conn.sendMessage(m.chat, {
        video: finalBuffer,
        mimetype: 'video/mp4',
        caption: modo === 'absurdo'
          ? '💀 Vídeo com áudio ABSURDAMENTE estourado'
          : '🔊 Vídeo com áudio estourado'
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        audio: finalBuffer,
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: m })
    }

    await m.react?.('✅')
  } catch (e) {
    console.error('ERRO ESTOURAR:', e)
    await m.react?.('❌')
    m.reply('❌ Erro ao estourar o áudio.')
  } finally {
    safeDelete(input)
    safeDelete(output)
  }
}

handler.command = ['estourar', 'bassboost', 'audioestourado']
handler.tags = ['audio']
handler.help = ['estourar', 'estourar absurdo']

export default handler
