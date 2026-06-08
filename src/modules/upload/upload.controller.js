import { subirArchivoDrive, generarVistaPrevia } from '../../services/googleDrive.service.js';
import { detectarFormato, procesarAvatar, buildAvatarUrl } from '../../services/imageProcessing.service.js';
import prisma from '../../lib/prisma.js';
import sharp from 'sharp';

// ── Helpers ──────────────────────────────────────────────────────────

const bufferDesdeBase64 = (base64Input) => {
  if (!base64Input) throw new Error('No se recibió contenido del archivo');
  const base64 = base64Input.includes(',') ? base64Input.split(',')[1] : base64Input;
  return Buffer.from(base64, 'base64');
};

// Validación por magic bytes (primeros bytes del archivo real, no el mimeType declarado)
const MAGIC = {
  pdf:  { bytes: [0x25, 0x50, 0x44, 0x46], label: 'PDF' },           // %PDF
  jpeg: { bytes: [0xFF, 0xD8, 0xFF],        label: 'JPEG' },
  png:  { bytes: [0x89, 0x50, 0x4E, 0x47], label: 'PNG' },
  webp: { bytes: [0x52, 0x49, 0x46, 0x46], label: 'WebP', extraOffset: 8, extraBytes: [0x57, 0x45, 0x42, 0x50] },
};

function validarMagicBytes(buffer, tipo) {
  const check = (magic) => magic.bytes.every((b, i) => buffer[i] === b);
  if (tipo === 'pdf') return check(MAGIC.pdf);
  if (tipo === 'imagen') {
    if (check(MAGIC.jpeg)) return true;
    if (check(MAGIC.png)) return true;
    // WebP: "RIFF" en offset 0 + "WEBP" en offset 8
    if (check(MAGIC.webp)) {
      const { extraOffset, extraBytes } = MAGIC.webp;
      return extraBytes.every((b, i) => buffer[extraOffset + i] === b);
    }
    return false;
  }
  return false;
}

const MAX_PDF_BYTES  = 10 * 1024 * 1024;  // 10 MB (limitado por express.json limit)
const MAX_IMG_BYTES  = 10 * 1024 * 1024;  // 10 MB

const handleError = (error, res) => {
  console.error('[Upload] Error:', error.message);
  if (error.name?.startsWith?.('Prisma') || String(error.code ?? '').startsWith('P')) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

// ── Controllers ──────────────────────────────────────────────────────

/**
 * POST /upload/pdf
 * Recibe un archivo PDF en base64, lo sube a Google Drive y devuelve las URLs.
 *
 * Body: { fileBase64: string, fileName?: string }
 */
const DRIVE_TIMEOUT_MS = 25000;

function conTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Drive timeout')), ms)),
  ]);
}

export const subirPdf = async (req, res) => {
  try {
    const { fileBase64, fileName = `documento-${Date.now()}.pdf` } = req.body;
    const buffer = bufferDesdeBase64(fileBase64);

    if (buffer.length > MAX_PDF_BYTES) {
      return res.status(400).json({ error: 'El archivo supera el límite de 10 MB' });
    }
    if (!validarMagicBytes(buffer, 'pdf')) {
      return res.status(400).json({ error: 'El archivo no es un PDF válido' });
    }

    // Intentar subir a Drive con timeout; si falla, retornar como base64 data URL
    try {
      const resultado = await conTimeout(
        subirArchivoDrive(buffer, fileName, 'application/pdf'),
        DRIVE_TIMEOUT_MS
      );
      if (resultado?.downloadUrl) {
        return res.status(201).json({ message: 'PDF subido correctamente', archivo: resultado });
      }
    } catch (driveErr) {
      console.warn('[Upload] Drive no disponible, usando base64:', driveErr.message);
    }

    // Fallback: almacenar como data URL base64 (hasta 50 MB)
    const dataUrl = `data:application/pdf;base64,${buffer.toString('base64')}`;
    return res.status(201).json({
      message: 'PDF guardado correctamente',
      archivo: { url: dataUrl, downloadUrl: dataUrl, webViewLink: dataUrl },
    });
  } catch (error) {
    console.error('[Upload] subirPdf error:', error.message);
    handleError(error, res);
  }
};

/**
 * POST /upload/preview
 * Recibe un PDF en base64, genera 3 vistas previa JPG y devuelve sus URLs.
 *
 * Body: { fileBase64: string }
 */
export const generarPreview = async (req, res) => {
  try {
    const { fileBase64 } = req.body;
    const buffer = bufferDesdeBase64(fileBase64);

    if (buffer.length > MAX_PDF_BYTES) {
      return res.status(400).json({ error: 'El archivo supera el límite de 10 MB' });
    }
    if (!validarMagicBytes(buffer, 'pdf')) {
      return res.status(400).json({ error: 'El archivo no es un PDF válido' });
    }

    const previews = await generarVistaPrevia(buffer);
    res.json({ message: 'Vistas previa generadas', previews });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * POST /upload/portada
 * Recibe una imagen en base64, la sube a Google Drive y devuelve la URL.
 *
 * Body: { fileBase64: string, fileName?: string, mimeType?: string }
 */
const MIME_IMAGEN = { 'image/jpeg': true, 'image/png': true, 'image/webp': true };

export const subirPortada = async (req, res) => {
  try {
    const { fileBase64, fileName = `portada-${Date.now()}.jpg`, mimeType = 'image/jpeg' } = req.body;

    if (!MIME_IMAGEN[mimeType]) {
      return res.status(400).json({ error: 'Tipo de imagen no permitido. Usa JPEG, PNG o WebP.' });
    }

    const buffer = bufferDesdeBase64(fileBase64);

    if (buffer.length > MAX_IMG_BYTES) {
      return res.status(400).json({ error: 'La imagen supera el límite de 10 MB' });
    }
    if (!validarMagicBytes(buffer, 'imagen')) {
      return res.status(400).json({ error: 'El archivo no es una imagen válida (JPEG, PNG o WebP)' });
    }

    // Comprimir a máximo 800px y devolver como base64 (Drive personal no acepta service accounts)
    const compressed = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 78 })
      .toBuffer();

    const dataUrl = `data:image/jpeg;base64,${compressed.toString('base64')}`;
    res.status(201).json({ message: 'Portada procesada correctamente', archivo: { url: dataUrl, webViewLink: dataUrl } });
  } catch (error) {
    handleError(error, res);
  }
};

// ── Avatar ────────────────────────────────────────────────────────────────────

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const FORMATOS_PERMITIDOS = new Set(["jpeg", "png", "webp"]);

/**
 * POST /upload/avatar
 * Recibe multipart/form-data con campo "avatar".
 * Procesa con sharp: 512×512, WebP, calidad 75.
 * Actualiza el campo avatar del CreatorProfile del usuario autenticado.
 */
export const subirAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo. Campo requerido: avatar" });
    }

    const buffer = req.file.buffer;

    if (buffer.length > MAX_AVATAR_BYTES) {
      return res.status(400).json({ error: "La imagen supera el límite de 2 MB" });
    }

    const formato = detectarFormato(buffer);
    if (!FORMATOS_PERMITIDOS.has(formato)) {
      return res.status(400).json({ error: "Formato no permitido. Usa JPG, PNG o WebP." });
    }

    const { filename } = await procesarAvatar(buffer, req.user.id);
    const avatarUrl = buildAvatarUrl(filename, req);

    // Actualizar o crear el perfil del creador con la nueva URL
    await prisma.creatorProfile.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id, nombrePublico: req.user.nombre, avatar: avatarUrl },
      update: { avatar: avatarUrl },
    });

    res.json({ ok: true, avatarUrl });
  } catch (error) {
    console.error("[Upload] Avatar error:", error.message);
    res.status(500).json({ error: "Error al procesar la imagen" });
  }
};
