import fetch from 'node-fetch'

const API_ASSISTENTE = 'https://tpgb.online/api/assistente'

async function before(m, { conn }) {
  const body = (m.text || '').trim()
  if (!body) return false

  // Ignora comandos com prefixo
  if (/^[./#!]/.test(body)) return false

  const lower = body.toLowerCase()
  const botJid = conn.user?.jid

  const mentionedList =
    Array.isArray(m.mentionedJid)
      ? m.mentionedJid
      : Array.isArray(m.message?.extendedTextMessage?.contextInfo?.mentionedJid)
        ? m.message.extendedTextMessage.contextInfo.mentionedJid
        : []

  const mentioned = mentionedList.includes(botJid)

  // Em grupo, só responde se chamar o bot
  if (m.isGroup) {
    const chamou =
      mentioned ||
      lower.startsWith('bot ') ||
      lower.startsWith('oitavão ') ||
      lower.startsWith('oitavao ')

    if (!chamou) return false
  }

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━')
    console.log('🤖 ASSISTENTE DEBUG')
    console.log('URL FINAL:', API_ASSISTENTE)
    console.log('MENSAGEM:', body)
    console.log('SENDER:', m.sender)
    console.log('CHAT:', m.chat)
    console.log('━━━━━━━━━━━━━━━━━━━━')

    const res = await fetch(API_ASSISTENTE, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        mensagem: body,
        nome: m.pushName || m.name || 'usuário',
        jid: m.sender
      })
    })

    console.log('STATUS:', res.status)
    console.log(
      'CONTENT-TYPE:',
      res.headers.get('content-type')
    )

    const raw = await res.text()

    console.log(
      'RESPOSTA RAW:',
      raw.slice(0, 3000)
    )

    let data

    // =====================================================
    // CONVERTE A RESPOSTA DA API PARA JSON
    // =====================================================

    try {
      data = JSON.parse(raw)
    } catch (e) {
      console.error(
        '❌ ERRO AO INTERPRETAR JSON:',
        e
      )

      await m.react?.('❌')

      await m.reply(
        '❌ A API respondeu algo que não é JSON. Veja o log RAW.'
      )

      return true
    }

    // =====================================================
    // DEBUG COMPLETO DA RESPOSTA DA IA
    // =====================================================

    console.log('━━━━━━━━━━━━━━━━━━━━')
    console.log('🤖 DADOS DA IA')
    console.log(
      JSON.stringify(data, null, 2)
    )
    console.log('━━━━━━━━━━━━━━━━━━━━')

    // =====================================================
    // ERRO HTTP DA API
    // =====================================================

    if (!res.ok) {
      await m.react?.('❌')

      await m.reply(
        `❌ Erro na API: ${res.status}\n\n${
          data.resposta ||
          raw.slice(0, 300)
        }`
      )

      return true
    }

    // =====================================================
    // TEXTO DA RESPOSTA
    // =====================================================

    const texto =
      typeof data.resposta === 'string' &&
      data.resposta.trim()
        ? data.resposta.trim()
        : 'Não veio resposta.'

    // =====================================================
    // BOTÕES
    //
    // IMPORTANTE:
    // Não verificamos data.tipo.
    //
    // Mesmo que a IA mande:
    //
    // "tipo": "texto",
    // "botoes": [...]
    //
    // os botões serão enviados.
    // =====================================================

    if (
      Array.isArray(data.botoes) &&
      data.botoes.length > 0
    ) {

      // Remove botões vazios ou sem ID
      const botoesValidos =
        data.botoes.filter(botao => {

          return (
            botao &&
            typeof botao.texto === 'string' &&
            botao.texto.trim() !== '' &&
            typeof botao.id === 'string' &&
            botao.id.trim() !== ''
          )
        })

      console.log(
        '🔘 BOTÕES VÁLIDOS:',
        JSON.stringify(
          botoesValidos,
          null,
          2
        )
      )

      // ===================================================
      // SE EXISTIREM BOTÕES VÁLIDOS
      // ===================================================

      if (botoesValidos.length > 0) {

        const buttons =
          botoesValidos.map(botao => ({

            name: 'quick_reply',

            buttonParamsJson:
              JSON.stringify({

                display_text:
                  botao.texto.trim(),

                id:
                  botao.id.trim()

              })

          }))

        console.log(
          '📤 BOTÕES ENVIADOS:',
          JSON.stringify(
            buttons,
            null,
            2
          )
        )

        await conn.sendMessage(
          m.chat,
          {
            text: texto,

            buttons: buttons
          },
          {
            quoted: m
          }
        )

        return true
      }
    }

    // =====================================================
    // SEM BOTÕES
    //
    // Se a IA não mandar botões válidos,
    // envia somente o texto.
    // =====================================================

    console.log(
      'ℹ️ Nenhum botão válido encontrado.'
    )

    await conn.sendMessage(
      m.chat,
      {
        text: texto
      },
      {
        quoted: m
      }
    )

    return true

  } catch (e) {

    console.error(
      '❌ ERRO ASSISTENTE IA:',
      e
    )

    await m.react?.('❌')

    return true
  }
}

export default {
  before
}
