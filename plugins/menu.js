import moment from 'moment-timezone'

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
      main: '🌷', tools: '🧰', audio: '🎶', group: '🎁',
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
|${theme.cmd} • ${usedPrefix}level        |${theme.cmd} • ${usedPrefix}coin  
|${theme.cmd} • ${usedPrefix}registro   |${theme.cmd} • ${usedPrefix}search  
|${theme.cmd} • ${usedPrefix}play         |${theme.cmd} • ${usedPrefix}sticker  

${theme.line} ───────────── ${theme.line}

${theme.footer} Toque em um botão abaixo
`

    await conn.sendMessage(m.chat, {
      image: { url: 'https://i.ibb.co/5W62jvz2/IMG-9525.jpg' },
      gifPlayback: true,
      caption: texto,
      footer: '© OITAVÃO BOT',
      buttons: [
        { buttonId:`${usedPrefix}menu main`, buttonText: { displayText: '🌷 MAIN ' }, type: 1 },
        { buttonId: `${usedPrefix}menu tools`, buttonText: { displayText: '🧰 TOOLS' }, type: 1 },
        { buttonId: `${usedPrefix}menu2`, buttonText: { displayText: `➡️ MAIS ` }, type: 2 }
      ],
      headerType: 1
    }, { quoted: m })

    await m.react('${theme.footer}')

  } catch (err) {
    console.error(err)
    await m.reply('Erro no menu:\n' + err.message)
  }
}

handler.help = ['menuold', 'menu <tag>']
handler.tags = ['main']
handler.command = ['menuold', 'menúold', 'helpold']
handler.register = true

export default handler

function ucapan() {
  const h = moment.tz('America/Sao_Paulo').format('HH')
  if (h >= 5 && h < 12) return 'Bom Dia ☀️'
  if (h >= 12 && h < 18) return 'Boa Tarde 🌤️'
  return 'Boa Noite 🌙'
}
