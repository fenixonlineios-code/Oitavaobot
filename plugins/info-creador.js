// by dv.shadow - https://github.com/Yuji-XDev
import PhoneNumber from 'awesome-phonenumber';

const handler = async (m, { conn }) => {
  const name = 'PIPI';
  const numCreador = '5573981832617';
  const empresa = 'TPGB';
  const about = 'Apenas um trambiqueiro querendo ser feliz';
  const correo = 'pietro@tpgb.online';
  const web = 'https://tpgb.online/';
  const direccion = 'Tokyo, Japón 🇯🇵';
  const fotoPerfil = 'https://i.ibb.co/YTTxWkPd/98849e22-dd90-4d5e-8309-f7fc10f824f3.jpg';

  const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
ORG:${empresa}
TITLE:CEO & Fundador
TEL;waid=${numCreador}:${new PhoneNumber('+' + numCreador).getNumber('international')}
EMAIL:${correo}
URL:${web}
NOTE:${about}
ADR:;;${direccion};;;;
X-ABADR:ES
X-WA-BIZ-NAME:${name}
X-WA-BIZ-DESCRIPTION:${about}
END:VCARD`.trim();

  const contactMessage = {
    displayName: name,
    vcard
  };
  m.react('☁️');
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: name,
      contacts: [contactMessage]
    },
    contextInfo: {
    mentionedJid: [m.sender],
      externalAdReply: {
        title: '📌 Contato do meu criador',
        body: '',
        mediaType: 1,
        thumbnailUrl: fotoPerfil,
        renderLargerThumbnail: true,
        sourceUrl: web
      }
    }
  }, { quoted: fkontak });
};

handler.help = ['creador'];
handler.tags = ['info'];
handler.command = ['creador', 'creator', 'owner'];
export default handler;
