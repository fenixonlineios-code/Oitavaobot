let handler = async (m, { conn }) => {

  await conn.sendCarousel(
    m.chat,
    '🌸 OITAVÃO BOT',
    'Escolha uma categoria',
    'MENU',
    [
      [
        '🌷 Categoria Main',
        'Comandos principais',
        'https://i.ibb.co/5W62jvz2/IMG-9525.jpg',

        [
          ['📜 Abrir Main', '.menu main']
        ],

        [],

        [
          ['🌐 Site', 'https://google.com']
        ],

        []
      ],

      [
        '🧰 Categoria Tools',
        'Ferramentas úteis',
        'https://i.ibb.co/5W62jvz2/IMG-9525.jpg',

        [
          ['🧰 Abrir Tools', '.menu tools']
        ],

        [],

        [
          ['📢 Canal', 'https://youtube.com']
        ],

        []
      ],

      [
        '🎶 Categoria Audio',
        'Comandos de áudio',
        'https://i.ibb.co/5W62jvz2/IMG-9525.jpg',

        [
          ['🎵 Abrir Audio', '.menu audio']
        ],

        [],

        [
          ['💬 Grupo', 'https://chat.whatsapp.com/seulink']
        ],

        []
      ]
    ],
    m
  )

}

handler.help = ['teste']
handler.tags = ['main']
handler.command = ['testec']

export default handler
