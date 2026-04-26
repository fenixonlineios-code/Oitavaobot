export async function before(m, { conn }) {
  if (!m.text || !global.prefix.test(m.text)) return

  const usedPrefix = global.prefix.exec(m.text)[0]
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase()

  if (!command || command === 'bot') return

  const isValidCommand = (command, plugins) => {
    for (let plugin of Object.values(plugins || {})) {
      if (!plugin.command) continue

      const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]

      for (let cmd of cmds) {
        if (cmd instanceof RegExp && cmd.test(command)) return true
        if (typeof cmd === 'string' && cmd === command) return true
      }
    }
    return false
  }

  if (isValidCommand(command, global.plugins)) {
    let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
    user.commands = (user.commands || 0) + 1
    return
  }

  const mensajes = [
    `🙃 ¡Vaya! *${command}* no existe.\n🔎 Prueba con *${usedPrefix}menu* para ver todos los comandos.`,
    `🤔 Hmm… *${command}* parece perdido.\n📚 Usa *${usedPrefix}menu* para encontrar lo que buscas.`,
    `🚨 Error: comando *${command}* no reconocido.\n✨ Ve al menú con *${usedPrefix}menu*`,
    `😅 Ups… no conozco *${command}*.\n📌 Explora los comandos con *${usedPrefix}menu*`,
    `🛑 ¡Alerta! *${command}* no está disponible.\n🔧 Ingresa *${usedPrefix}menu* para ver opciones válidas.`
  ]

  const texto = mensajes[Math.floor(Math.random() * mensajes.length)]

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: [m.sender],
    contextInfo: {
      externalAdReply: {
        title: global.botname || 'OITAVÃO BOT',
        body: 'Sistema de comandos',
        thumbnailUrl: global.banner || '',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}
