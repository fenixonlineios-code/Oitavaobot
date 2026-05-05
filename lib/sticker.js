import { dirname } from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

import fluent_ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

import { fileTypeFromBuffer } from "file-type";
import webp from "node-webpmux";
import fetch from "node-fetch";

const __dirname = dirname(fileURLToPath(import.meta.url));

/* ==============================
   CONFIG FFMPEG
============================== */

if (ffmpegPath) {
  fluent_ffmpeg.setFfmpegPath(ffmpegPath);
  console.log("✅ FFmpeg carregado:", ffmpegPath);
} else {
  console.log("❌ ffmpeg-static não retornou caminho.");
}

/* ==============================
   TMP SEGURO
============================== */

const tmpDir = path.join(__dirname, "../tmp");

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

/* ==============================
   HELPERS
============================== */

function safeUnlink(file) {
  try {
    if (file && fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  } catch (e) {
    console.error("Erro ao apagar arquivo tmp:", e);
  }
}

function makeTmpFile(ext = "bin") {
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  return path.join(tmpDir, name);
}

/* ==============================
   STICKER COM FFMPEG
============================== */

function sticker6(img, url) {
  return new Promise(async (resolve, reject) => {
    let tmp;
    let out;

    try {
      if (url) {
        const res = await fetch(url);

        if (res.status !== 200) {
          throw new Error(await res.text());
        }

        img = await res.buffer();
      }

      const type = (await fileTypeFromBuffer(img)) || {
        mime: "application/octet-stream",
        ext: "bin",
      };

      if (type.ext === "bin") {
        return reject(img);
      }

      tmp = makeTmpFile(type.ext);
      out = `${tmp}.webp`;

      await fs.promises.writeFile(tmp, img);

      const Fffmpeg = /video/i.test(type.mime)
        ? fluent_ffmpeg(tmp).inputFormat(type.ext)
        : fluent_ffmpeg(tmp).input(tmp);

      Fffmpeg
        .on("error", function (err) {
          console.error("❌ Erro no ffmpeg sticker6:", err);

          safeUnlink(tmp);
          safeUnlink(out);

          reject(err);
        })
        .on("end", async function () {
          try {
            safeUnlink(tmp);

            let resultSticker = await fs.promises.readFile(out);

            safeUnlink(out);

            if (resultSticker.length > 1000000) {
              resultSticker = await sticker6_compress(img, null);
            }

            resolve(resultSticker);
          } catch (e) {
            safeUnlink(tmp);
            safeUnlink(out);
            reject(e);
          }
        })
        .addOutputOptions([
          "-vcodec",
          "libwebp",
          "-vf",
          "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
          "-loop",
          "0",
          "-preset",
          "default",
          "-an",
          "-vsync",
          "0",
        ])
        .toFormat("webp")
        .save(out);

    } catch (err) {
      console.error("❌ Erro geral sticker6:", err);

      safeUnlink(tmp);
      safeUnlink(out);

      reject(err);
    }
  });
}

/* ==============================
   STICKER COM FFMPEG COMPRIMIDO
============================== */

function sticker6_compress(img, url) {
  return new Promise(async (resolve, reject) => {
    let tmp;
    let out;

    try {
      if (url) {
        const res = await fetch(url);

        if (res.status !== 200) {
          throw new Error(await res.text());
        }

        img = await res.buffer();
      }

      const type = (await fileTypeFromBuffer(img)) || {
        mime: "application/octet-stream",
        ext: "bin",
      };

      if (type.ext === "bin") {
        return reject(img);
      }

      tmp = makeTmpFile(type.ext);
      out = `${tmp}.webp`;

      await fs.promises.writeFile(tmp, img);

      const Fffmpeg = /video/i.test(type.mime)
        ? fluent_ffmpeg(tmp).inputFormat(type.ext)
        : fluent_ffmpeg(tmp).input(tmp);

      Fffmpeg
        .on("error", function (err) {
          console.error("❌ Erro no ffmpeg sticker6_compress:", err);

          safeUnlink(tmp);
          safeUnlink(out);

          reject(err);
        })
        .on("end", async function () {
          try {
            safeUnlink(tmp);

            const resultSticker = await fs.promises.readFile(out);

            safeUnlink(out);

            resolve(resultSticker);
          } catch (e) {
            safeUnlink(tmp);
            safeUnlink(out);
            reject(e);
          }
        })
        .addOutputOptions([
          "-vcodec",
          "libwebp",
          "-vf",
          "scale='min(224,iw)':min'(224,ih)':force_original_aspect_ratio=decrease,fps=12,pad=224:224:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
          "-loop",
          "0",
          "-preset",
          "default",
          "-an",
          "-vsync",
          "0",
        ])
        .toFormat("webp")
        .save(out);

    } catch (err) {
      console.error("❌ Erro geral sticker6_compress:", err);

      safeUnlink(tmp);
      safeUnlink(out);

      reject(err);
    }
  });
}

/* ==============================
   STICKER COM WA-STICKER-FORMATTER
============================== */

async function sticker5(
  img,
  url,
  packname,
  author,
  categories = [""],
  extra = {},
) {
  const { Sticker } = await import("wa-sticker-formatter");

  const buffer = await new Sticker(img ? img : url)
    .setPack(packname)
    .setAuthor(author)
    .setQuality(10)
    .toBuffer();

  return buffer;
}

/* ==============================
   EXIF
============================== */

async function addExif(
  webpSticker,
  packname,
  author,
  categories = [""],
  extra = {}
) {
  const img = new webp.Image();
  const stickerPackId = crypto.randomBytes(32).toString("hex");

  const json = {
    "sticker-pack-id": stickerPackId,
    "sticker-pack-name": packname,
    "sticker-pack-publisher": author,
    emojis: categories,
    ...extra,
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00,
    0x00, 0x00,
  ]);

  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
  const exif = Buffer.concat([exifAttr, jsonBuffer]);

  exif.writeUIntLE(jsonBuffer.length, 14, 4);

  await img.load(webpSticker);
  img.exif = exif;

  return await img.save(null);
}

/* ==============================
   FUNÇÃO PRINCIPAL
============================== */

async function sticker(img, url, ...args) {
  let lastError;
  let stiker;

  const methods = [
    global.support?.ffmpeg && sticker6,
    sticker5,
  ].filter(Boolean);

  for (const func of methods) {
    try {
      console.log(`En sticker.js metodo en ejecucion: ${func.name}`);

      stiker = await func(img, url, ...args);

      if (!Buffer.isBuffer(stiker)) {
        throw new Error("Sticker retornou algo que não é buffer.");
      }

      const str = stiker.toString("utf8");

      if (str.includes("html")) {
        continue;
      }

      if (stiker.includes("WEBP")) {
        try {
          return await addExif(stiker, ...args);
        } catch (e) {
          console.error("Erro ao adicionar EXIF:", e);
          return stiker;
        }
      }

      throw new Error("Resultado não parece WEBP.");

    } catch (err) {
      lastError = err;
      console.error(`❌ Método ${func.name} falhou:`, err);
      continue;
    }
  }

  console.error("❌ Todos os métodos de sticker falharam:", lastError);
  return lastError;
}

/* ==============================
   SUPORTE
============================== */

const support = {
  ffmpeg: !!ffmpegPath,
  ffprobe: !!ffmpegPath,
  ffmpegWebp: !!ffmpegPath,
  convert: true,
  magick: false,
  gm: false,
  find: false,
};

export {
  sticker,
  sticker6,
  sticker5,
  sticker6_compress,
  addExif,
  support
};
