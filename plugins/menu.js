import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix, args }) => {
  try {
    let userId = m.sender
    let userData = global.db.data.users[userId] || {}
    let exp = userData.exp || 0
    let coin = userData.coin || 0
    let level = userData.level || 0
    let name = await conn.getName(userId)

    const emojis = {
      main: '🎄', tools: '🧰', audio: '🎶', group: '🎁',
      owner: '👑', fun: '🎮', info: '📘', internet: '🌐',
      downloads: '⬇️', admin: '🧦', anime: '✨', nsfw: '🚫',
      search: '🔍', sticker: '🖼️', game: '🕹️',
      premium: '💎', bot: '🤖', rg: '🪪'
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
        return m.reply(`🍂 Não encontrei comandos em *${tag}*.`)
      }

      let textoTag = `╭━━ ${emojis[tag] || '⭐'} *${tag.toUpperCase()}* ━━⬣
${grupos[tag].map(cmd => `┃ ➩ ${cmd}`).join('\n')}
╰━━━━━━━━━━━━⬣`

      return m.reply(textoTag)
    }

    let texto = `🩷 *OITAVÃO BOT*

${ucapan()} @${userId.split('@')[0]}

👤 Usuário: ${name}
🎟️ Nível: ${level}
💗 EXP: ${exp}
💰 Coins: ${coin}

━━━━━━━━━━━━━━
•🍬 *COMANDOS RÁPIDOS*
━━━━━━━━━━━━━━
•|🌸 ${usedPrefix}perfil
•|🌸 ${usedPrefix}menu
•|🌸 ${usedPrefix}ping
•|🌸 ${usedPrefix}owner
•|🌸 ${usedPrefix}level
•|🌸 ${usedPrefix}coin
•|🌸 ${usedPrefix}registro
•|🌸 ${usedPrefix}search
•|🌸 ${usedPrefix}play
•|🌸 ${usedPrefix}sticker

━━━━━━━━━━━━━━
•🌺 *Escolha um menu abaixo:*`

    await conn.sendMessage(m.chat, {
      image: { url: 'https://i.ibb.co/5W62jvz2/IMG-9525.jpg' },
      gifPlayback: true,
      caption: texto,
      footer: 'OITAVÃO BOT',
      buttons: [
        { buttonId:`${usedPrefix}menu main`, buttonText: { displayText: '🎄 MAIN ' }, type: 1 },
        { buttonId: `${usedPrefix}menu tools`, buttonText: { displayText: '🧰 TOOLS' }, type: 1 },
        { buttonId: `${usedPrefix}menu2`, buttonText: { displayText: `➡️ MAIS ` }, type: 2 }
      ],
      headerType: 1
    }, { quoted: m })

    await m.react('🍂')

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
  const h = moment.tz('America/Sao_Paulo').format('HH')
  if (h >= 5 && h < 12) return 'Bom Dia ☀️'
  if (h >= 12 && h < 18) return 'Boa Tarde 🌤️'
  return 'Boa Noite 🌙'
}
