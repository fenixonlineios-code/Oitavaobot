import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `*❀ Por favor, envie um termo de busca ou um link do TikTok.*\n\nExemplo:\n${usedPrefix}tt https://vm.tiktok.com/xxxxx\n${usedPrefix}tiktoks bjork`, m)
  }

  const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)

  try {
    await m.react('🕒')

    if (command === 'ttaudio') {
      if (!isUrl) return conn.reply(m.chat, 'ꕥ Envie um link válido do TikTok para baixar o áudio.', m)

      const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`)
      const data = res.data?.data

      if (!data?.music) return conn.reply(m.chat, 'ꕥ Não encontrei áudio disponível nesse TikTok.', m)

      await conn.sendMessage(m.chat, {
        audio: { url: data.music },
        mimetype: 'audio/mp4',
        fileName: 'audio_tiktok.mp4'
      }, { quoted: m })

      await m.react('✔️')
      return
    }

    if (isUrl) {
      const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`)
      const data = res.data?.data

      if (!data?.play) return conn.reply(m.chat, 'ꕥ Link inválido ou sem conteúdo para baixar.', m)

      const { title, duration, author, created_at, type, images, music, play } = data
      const caption = createCaption(title, author, duration, created_at)

      if (type === 'image' && Array.isArray(images)) {
        const medias = images.map(url => ({
          type: 'image',
          data: { url },
          caption
        }))

        await conn.sendSylphy(m.chat, medias, { quoted: m })

        if (music) {
          await conn.sendMessage(m.chat, {
            audio: { url: music },
            mimetype: 'audio/mp4',
            fileName: 'audio_tiktok.mp4'
          }, { quoted: m })
        }

        await sendActionButtons(conn, m, usedPrefix, text, author, title, true)
      } else {
        await conn.sendMessage(m.chat, {
          video: { url: play },
          caption,
          footer: 'OITAVÃO BOT',
          buttons: [
            {
              buttonId: `${usedPrefix}tt ${text}`,
              buttonText: { displayText: '🔁 Repetir' },
              type: 1
            },
            {
              buttonId: `${usedPrefix}ttaudio ${text}`,
              buttonText: { displayText: '🎵 Áudio' },
              type: 1
            },
            {
              buttonId: `${usedPrefix}tiktoks ${author?.unique_id || title || ''}`,
              buttonText: { displayText: '👤 Autor' },
              type: 1
            }
          ],
          headerType: 1
        }, { quoted: m })
      }

    } else {
      const res = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/feed/search',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: {
          keywords: text,
          count: 20,
          cursor: 0,
          HD: 1
        }
      })

      const results = res.data?.data?.videos?.filter(v => v.play) || []

      if (results.length < 2) {
        return conn.reply(m.chat, 'ꕥ É necessário encontrar pelo menos 2 resultados válidos com conteúdo.', m)
      }

      const medias = results.slice(0, 10).map(v => ({
        type: 'video',
        data: { url: v.play },
        caption: createSearchCaption(v)
      }))

      await conn.sendSylphy(m.chat, medias, { quoted: m })

      await conn.sendMessage(m.chat, {
        text: `🔎 *Busca concluída*\n\nResultado para: *${text}*\n\nEscolha uma ação:`,
        footer: 'OITAVÃO BOT',
        buttons: [
          {
            buttonId: `${usedPrefix}tiktoks ${text}`,
            buttonText: { displayText: '🔄 Buscar de novo' },
            type: 1
          },
          {
            buttonId: `${usedPrefix}play ${text}`,
            buttonText: { displayText: '🎧 Música' },
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
    }

    await m.react('✔️')

  } catch (e) {
    await m.react('✖️')
    await conn.reply(
      m.chat,
      `⚠︎ Ocorreu um problema.\n> Use *${usedPrefix}report* para informar.\n\n${e.message}`,
      m
    )
  }
}

async function sendActionButtons(conn, m, usedPrefix, originalText, author, title, isImage = false) {
  try {
    await conn.sendMessage(m.chat, {
      text: `${isImage ? '📸 Imagens enviadas com sucesso.' : '🎬 Download concluído.'}\n\nEscolha uma ação:`,
      footer: 'OITAVÃO BOT',
      buttons: [
        {
          buttonId: `${usedPrefix}tt ${originalText}`,
          buttonText: { displayText: '🔁 Repetir' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}ttaudio ${originalText}`,
          buttonText: { displayText: '🎵 Áudio' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}tiktoks ${author?.unique_id || title || ''}`,
          buttonText: { displayText: '👤 Autor' },
          type: 1
        }
      ],
      headerType: 1
    }, { quoted: m })
  } catch (e) {
    console.error('Erro ao enviar botões do TikTok:', e)
  }
}

function createCaption(title, author, duration, created_at = '') {
  return `❀ *Título ›* \`${title || 'Não disponível'}\`
> ☕︎ Autor › *${author?.nickname || author?.unique_id || 'Não disponível'}*
> ✰ Duração › *${duration || 'Não disponível'}s*${created_at ? `\n> ☁︎ Criado em » ${created_at}` : ''}
> 𝅘𝅥𝅮 Música » [${author?.nickname || author?.unique_id || 'Não disponível'}] som original - ${author?.unique_id || 'desconhecido'}`
}

function createSearchCaption(data) {
  return `❀ Título › ${data.title || 'Não disponível'}

☕︎ Autor › ${data.author?.nickname || 'Desconhecido'} ${data.author?.unique_id ? `@${data.author.unique_id}` : ''}
✧︎ Duração › ${data.duration || 'Não disponível'}
𝅘𝅥𝅮 Música › ${data.music?.title || `[${data.author?.nickname || 'Não disponível'}] som original - ${data.author?.unique_id || 'desconhecido'}`}`
}

handler.help = ['tiktok', 'tt', 'ttaudio']
handler.tags = ['descargas', 'search']
handler.command = ['tiktok', 'tt', 'tiktoks', 'tts', 'ttaudio']
handler.group = true

export default handler
