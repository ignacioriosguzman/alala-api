import sharp from "sharp";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
// src/services/ → ../../ → alala-api root → uploads/avatars
export const UPLOADS_DIR = path.resolve(__dirname, "../../uploads/avatars");

// Formatos de imagen permitidos (validación por magic bytes)
const MAGIC_BYTES = {
  jpeg: [[0xFF, 0xD8, 0xFF]],
  png:  [[0x89, 0x50, 0x4E, 0x47]],
  webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF + WEBP a offset 8
};

export const detectarFormato = (buffer) => {
  const b = buffer;
  if (b[0]===0xFF && b[1]===0xD8 && b[2]===0xFF) return "jpeg";
  if (b[0]===0x89 && b[1]===0x50 && b[2]===0x4E && b[3]===0x47) return "png";
  if (b[0]===0x52 && b[1]===0x49 && b[2]===0x46 && b[3]===0x46 &&
      b[8]===0x57 && b[9]===0x45 && b[10]===0x42 && b[11]===0x50) return "webp";
  return null;
};

export const asegurarDirectorio = async () => {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
};

/**
 * Procesa una imagen de avatar:
 * - Redimensiona a 512×512 (crop centrado)
 * - Convierte a WebP
 * - Comprime a calidad 75
 * - Guarda en disco
 *
 * @param {Buffer} buffer — Buffer del archivo original
 * @param {string} userId — ID del usuario (para nombre de archivo)
 * @returns {{ filename: string, sizeKb: number }}
 */
export const procesarAvatar = async (buffer, userId) => {
  await asegurarDirectorio();

  const filename = `avatar-${userId}-${Date.now()}.webp`;
  const destPath = path.join(UPLOADS_DIR, filename);

  await sharp(buffer)
    .resize(512, 512, {
      fit: "cover",
      position: "attention", // usa detección de punto focal (caras)
    })
    .webp({ quality: 75 })
    .toFile(destPath);

  const { size } = await sharp(destPath).metadata();
  return { filename, sizeKb: Math.round((size ?? 0) / 1024) };
};

/**
 * Genera la URL pública de un avatar.
 * Usa API_URL del .env o construye desde la request.
 */
export const buildAvatarUrl = (filename, req) => {
  const base = process.env.API_URL
    ?? `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/avatars/${filename}`;
};
