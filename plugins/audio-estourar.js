import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'

ffmpeg.setFfmpegPath(ffmpegPath)

const tmpDir = './tmp'
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

const MAX_MB = 15

// 🔊 NORMAL: alto + grave, mas mais entendível
const FILTRO_ESTOURADO =
  "bass=g=19:f=80:w=0.9," +
  "equalizer=f=70:width_type=h:width=120:g=12," +
  "equalizer=f=140:width_type=h:width=180:g=10," +
  "volume=18dB," +
  "acompressor=threshold=-14dB:ratio=2.5:attack=8:release=120," +
  "asoftclip=type=tanh:param=3.6," +
  "volume=8dB"

// 💀 ABSURDO: fica como o normal antigo
const FILTRO_ABSURDO =
  "bass=g=25:f=80:w=1," +
  "equalizer=f=60:width_type=h:width=120:g=18," +
  "equalizer=f=120:width_type=h:width=180:g=14," +
  "volume=18dB," +
  "asoftclip=type=tanh:param=3," +
  "volume=8dB"

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
    const filtro = modo === 'absurdo'
      ? FILTRO_ABSURDO
      : FILTRO_ESTOURADO

    let cmd = ffmpeg(input)

    if (isVideo) {
      cmd = cmd
        .videoCodec('copy')
        .audioCodec('aac')
        .audioBitrate('192k')
        .audioFilters(filtro)
        .outputOptions([
          '-movflags',
          '+faststart'
        ])
    } else {
      cmd = cmd
        .audioCodec('libmp3lame')
        .audioBitrate('192k')
        .audioFilters(filtro)
    }

    cmd
      .on('start', line => {
        console.log('FFMPEG CMD:', line)
      })
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
      // Enviar como documento preserva melhor o volume do que enviar como áudio normal
      await conn.sendMessage(m.chat, {
        document: finalBuffer,
        mimetype: 'audio/mpeg',
        fileName: modo === 'absurdo'
          ? 'audio-estourado-absurdo.mp3'
          : 'audio-estourado.mp3'
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
