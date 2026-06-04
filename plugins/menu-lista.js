import moment from 'moment-timezone'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, args }) => {
  try {
    let userId = m.sender
    let userData = global.db.data.users[userId] || {}

    let exp = userData.exp || 0
    let coin = userData.coin || 0
    let level = userData.level || 0
    let name = await conn.getName(userId)

    const theme = {
      bot: '🩷',
      line: '✦',
      user: '👤',
      level: '🎟️',
      exp: '💗',
      coin: '💰',
      section: '🍬',
      cmd: '🌸',
      footer: '🌺'
    }

    const emojis = {
      main: '🌷',
      tools: '🧰',
      audio: '🎶',
      group: '🎁',
      owner: '👑',
      fun: '🎮',
      info: '📘',
      internet: '🌐',
      downloads: '⬇️',
      admin: '🧦',
      anime: '✨',
      nsfw: '🚫',
      search: '🔍',
      sticker: '🖼️',
      game: '🕹️',
      premium: '💎',
      bot: '🤖',
      rg: '🪪'
    }

    let grupos = {}

    for (let plugin of Object.values(global.plugins || {})) {
      if (!plugin.help || !plugin.tags) continue

      for (let tag of plugin.tags) {
        if (!grupos[tag]) grupos[tag] = []

        for (let help of plugin.help) {
          if (!help || /^\$|^=>|^>/.test(help)) continue
          grupos[tag].push(`${usedPrefix}${help}`)
        }
      }
    }

    for (let tag in grupos) {
      grupos[tag] = [...new Set(grupos[tag])].sort((a, b) => a.localeCompare(b))
    }

    let tag = (args[0] || '').toLowerCase().trim()

    if (tag) {
      if (!grupos[tag] || !grupos[tag].length) {
        return m.reply(`${theme.footer} Não encontrei comandos em *${tag}*.`)
      }

      let textoTag = `╭━━ ${emojis[tag] || '⭐'} *${tag.toUpperCase()}* ━━⬣
${grupos[tag].map(cmd => `┃ ➩ ${cmd}`).join('\n')}
╰━━━━━━━━━━━━⬣`

      return m.reply(textoTag)
    }

    let texto = `
${theme.line} ── ${theme.bot} OITAVÃO BOT ── ${theme.line}

${ucapan()} @${userId.split('@')[0]}

┊ ${theme.user} ${name}
┊ ${theme.level} Lv. ${level}
┊ ${theme.exp} ${exp} XP
┊ ${theme.coin} ${coin} Coins

${theme.line} ── ${theme.section} Rápidos ── ${theme.line}

|${theme.cmd} • ${usedPrefix}perfil      |${theme.cmd} • ${usedPrefix}menu
|${theme.cmd} • ${usedPrefix}ping        |${theme.cmd} • ${usedPrefix}owner
|${theme.cmd} • ${usedPrefix}level       |${theme.cmd} • ${usedPrefix}coin
|${theme.cmd} • ${usedPrefix}registro    |${theme.cmd} • ${usedPrefix}search
|${theme.cmd} • ${usedPrefix}play        |${theme.cmd} • ${usedPrefix}sticker

${theme.line} ───────────── ${theme.line}

${theme.footer} Abra a lista abaixo.
`.trim()

    let sections = Object.keys(grupos)
      .sort((a, b) => a.localeCompare(b))
      .map(tagName => ({
        title: `${emojis[tagName] || '⭐'} ${tagName.toUpperCase()}`,
        rows: [
          {
            title: `${emojis[tagName] || '⭐'} Abrir ${tagName}`,
            description: `${grupos[tagName].length} comandos disponíveis`,
            id: `${usedPrefix}menu ${tagName}`
          }
        ]
      }))

    if (!sections.length) {
      sections = [
        {
          title: '🌷 MAIN',
          rows: [
            {
              title: '🌷 Menu principal',
              description: 'Abrir menu principal',
              id: `${usedPrefix}menu main`
            }
          ]
        }
      ]
    }

    const media = await prepareWAMessageMedia(
      {
        image: {
          url: 'https://i.ibb.co/5W62jvz2/IMG-9525.jpg'
        }
      },
      {
        upload: conn.waUploadToServer
      }
    )

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            header: proto.Message.InteractiveMessage.Header.create({
              title: 'OITAVÃO BOT',
              subtitle: 'Menu principal',
              hasMediaAttachment: true,
              ...media
            }),

            body: proto.Message.InteractiveMessage.Body.create({
              text: texto
            }),

            footer: proto.Message.InteractiveMessage.Footer.create({
              text: '© OITAVÃO BOT'
            }),

            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: '📜 Abrir lista',
                    sections
                  })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: '🌷 MAIN',
                    id: `${usedPrefix}menu main`
                  })
                },
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: '🧰 TOOLS',
                    sections: [
                      {
                        title: '🧰 TOOLS',
                        rows: [
                          {
                            title: '🧰 Abrir TOOLS',
                            description: 'Ferramentas do bot',
                            id: `${usedPrefix}menu tools`
                          }
                        ]
                      }
                    ]
                  })
                }
              ]
            })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, {
      messageId: msg.key.id
    })

    await m.react(theme.footer)

  } catch (err) {
    console.error(err)
    await m.reply('Erro no menu:\n' + err.message)
  }
}

handler.help = ['menu', 'menu <tag>']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help']
handler.register = true

export default handler

function ucapan() {
  const h = Number(moment.tz('America/Sao_Paulo').format('HH'))

  if (h >= 5 && h < 12) return 'Bom Dia ☀️'
  if (h >= 12 && h < 18) return 'Boa Tarde 🌤️'
  return 'Boa Noite 🌙'
}
