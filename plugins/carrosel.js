import fs from 'fs'

let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
  text: "🌸 Oitavão Bot",
  footer: "Escolha uma categoria",
  buttons: [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📂 Abrir Menu",
        sections: [
          {
            title: "Categorias",
            rows: [
              {
                header: "🌷 Main",
                title: "Menu Principal",
                description: "Comandos principais",
                id: ".menu main"
              },
              {
                header: "🧰 Tools",
                title: "Ferramentas",
                description: "Comandos úteis",
                id: ".menu tools"
              },
              {
                header: "🎵 Audio",
                title: "Áudio",
                description: "Downloads e áudio",
                id: ".menu audio"
              }
            ]
          }
        ]
      })
    }
  ]
})
handler.command = ['carousel']
export default handler
