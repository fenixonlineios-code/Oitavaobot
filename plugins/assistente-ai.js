import fetch from 'node-fetch'

const API_ASSISTENTE = 'https://tpgb.online/api/assistente'

async function before(m, { conn }) {

  // =====================================================
  // PEGA O TEXTO DA MENSAGEM
  // =====================================================

  const body = (m.text || '').trim()

  if (!body) {
    return false
  }

  // =====================================================
  // IGNORA COMANDOS
  // =====================================================

  if (/^[./#!]/.test(body)) {
    return false
  }

  const lower = body.toLowerCase()

  // =====================================================
  // JID DO BOT
  // =====================================================

  const botJid = conn.user?.jid

  // =====================================================
  // VERIFICA MENÇÃO
  // =====================================================

  const mentionedList =
    Array.isArray(m.mentionedJid)
      ? m.mentionedJid
      : Array.isArray(
          m.message
            ?.extendedTextMessage
            ?.contextInfo
            ?.mentionedJid
        )
        ? m.message
            .extendedTextMessage
            .contextInfo
            .mentionedJid
        : []

  const mentioned =
    botJid &&
    mentionedList.includes(
      botJid
    )

  // =====================================================
  // GRUPOS
  // =====================================================

  if (m.isGroup) {

    const chamou =
      mentioned ||
      lower.startsWith(
        'bot '
      ) ||
      lower.startsWith(
        'oitavão '
      ) ||
      lower.startsWith(
        'oitavao '
      )

    if (!chamou) {
      return false
    }
  }

  // =====================================================
  // TRY PRINCIPAL
  // =====================================================

  try {

    console.log(
      '━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
      '🤖 ASSISTENTE DEBUG'
    )

    console.log(
      'URL FINAL:',
      API_ASSISTENTE
    )

    console.log(
      'MENSAGEM:',
      body
    )

    console.log(
      'SENDER:',
      m.sender
    )

    console.log(
      'CHAT:',
      m.chat
    )

    console.log(
      '━━━━━━━━━━━━━━━━━━━━'
    )

    // ===================================================
    // CHAMA API
    // ===================================================

    const res = await fetch(
      API_ASSISTENTE,
      {
        method:
          'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify(
          {
            mensagem:
              body,

            nome:
              m.pushName ||
              m.name ||
              'usuário',

            jid:
              m.sender
          }
        )
      }
    )

    console.log(
      'STATUS:',
      res.status
    )

    console.log(
      'CONTENT-TYPE:',
      res.headers.get(
        'content-type'
      )
    )

    // ===================================================
    // LÊ RESPOSTA
    // ===================================================

    const raw =
      await res.text()

    console.log(
      'RESPOSTA RAW:',
      raw.slice(
        0,
        3000
      )
    )

    // ===================================================
    // CONVERTE JSON
    // ===================================================

    let data

    try {

      data =
        JSON.parse(
          raw
        )

    } catch (erroJson) {

      console.error(
        '❌ ERRO AO INTERPRETAR JSON:',
        erroJson
      )

      await m.react?.(
        '❌'
      )

      await m.reply(
        '❌ A API respondeu algo que não é JSON. Veja o log RAW.'
      )

      return true
    }

    // ===================================================
    // DEBUG
    // ===================================================

    console.log(
      '━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
      '🤖 DADOS DA IA'
    )

    console.log(
      JSON.stringify(
        data,
        null,
        2
      )
    )

    console.log(
      '━━━━━━━━━━━━━━━━━━━━'
    )

    // ===================================================
    // ERRO HTTP
    // ===================================================

    if (!res.ok) {

      await m.react?.(
        '❌'
      )

      await m.reply(
        `❌ Erro na API: ${res.status}\n\n${
          data.resposta ||
          raw.slice(
            0,
            300
          )
        }`
      )

      return true
    }

    // ===================================================
    // TEXTO
    // ===================================================

    const texto =
      typeof data.resposta ===
      'string' &&
      data.resposta.trim()
        ? data.resposta.trim()
        : 'Não veio resposta.'

    // ===================================================
    // PEGA BOTÕES
    // ===================================================

    const botoes =
      Array.isArray(
        data.botoes
      )
        ? data.botoes
        : []

    // ===================================================
    // FILTRA BOTÕES VÁLIDOS
    // ===================================================

    const botoesValidos =
      botoes
        .filter(
          botao => {

            return (
              botao &&

              typeof botao.texto ===
                'string' &&

              botao.texto.trim()
                .length > 0 &&

              typeof botao.id ===
                'string' &&

              botao.id.trim()
                .length > 0
            )
          }
        )
        .slice(
          0,
          3
        )

    console.log(
      '🔘 BOTÕES VÁLIDOS:',
      JSON.stringify(
        botoesValidos,
        null,
        2
      )
    )

    // ===================================================
    // SE TEM BOTÕES
    // ===================================================

    if (
      botoesValidos.length >
      0
    ) {

      // ================================================
      // FORMATO EXATO DO SEU TESTE QUE FUNCIONA
      // ================================================

      const buttons =
        botoesValidos.map(
          botao => ({

            buttonId:
              botao.id.trim(),

            buttonText: {
              displayText:
                botao.texto.trim()
            },

            type:
              1
          })
        )

      console.log(
        '📤 BOTÕES FORMATADOS:',
        JSON.stringify(
          buttons,
          null,
          2
        )
      )

      try {

        await conn.sendMessage(
          m.chat,
          {
            text:
              texto,

            footer:
              'OITAVÃO BOT',

            buttons:
              buttons,

            headerType:
              1
          },
          {
            quoted:
              m
          }
        )

        console.log(
          '✅ MENSAGEM COM BOTÕES ENVIADA'
        )

        return true

      } catch (erroBotoes) {

        console.error(
          '❌ ERRO AO ENVIAR BOTÕES:',
          erroBotoes
        )

        // ==============================================
        // FALLBACK
        // ==============================================

        try {

          await conn.sendMessage(
            m.chat,
            {
              text:
                texto
            },
            {
              quoted:
                m
            }
          )

          console.log(
            '✅ TEXTO ENVIADO COMO FALLBACK'
          )

        } catch (erroTexto) {

          console.error(
            '❌ ERRO AO ENVIAR TEXTO:',
            erroTexto
          )
        }

        return true
      }
    }

    // ===================================================
    // SEM BOTÕES
    // ===================================================

    try {

      await conn.sendMessage(
        m.chat,
        {
          text:
            texto
        },
        {
          quoted:
            m
        }
      )

      console.log(
        '✅ RESPOSTA DE TEXTO ENVIADA'
      )

    } catch (erroTexto) {

      console.error(
        '❌ ERRO AO ENVIAR RESPOSTA:',
        erroTexto
      )
    }

    return true

  } catch (e) {

    console.error(
      '❌ ERRO ASSISTENTE IA:',
      e
    )

    await m.react?.(
      '❌'
    )

    return true
  }
}

export default {
  before
}
