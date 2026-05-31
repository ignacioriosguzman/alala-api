import { subirArchivoDrive, generarVistaPrevia } from '../../services/googleDrive.service.js';

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

const MAX_PDF_BYTES  = 50 * 1024 * 1024;  // 50 MB
const MAX_IMG_BYTES  = 10 * 1024 * 1024;  // 10 MB

const handleError = (error, res) => {
  console.error('[Upload] Error:', error.message);
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
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
export const subirPdf = async (req, res) => {
  try {
    const { fileBase64, fileName = `documento-${Date.now()}.pdf` } = req.body;
    const buffer = bufferDesdeBase64(fileBase64);

    if (buffer.length > MAX_PDF_BYTES) {
      return res.status(400).json({ error: 'El archivo supera el límite de 50 MB' });
    }
    if (!validarMagicBytes(buffer, 'pdf')) {
      return res.status(400).json({ error: 'El archivo no es un PDF válido' });
    }

    const resultado = await subirArchivoDrive(buffer, fileName, 'application/pdf');
    res.status(201).json({ message: 'PDF subido correctamente', archivo: resultado });
  } catch (error) {
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
      return res.status(400).json({ error: 'El archivo supera el límite de 50 MB' });
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

    const resultado = await subirArchivoDrive(buffer, fileName, mimeType);
    res.status(201).json({ message: 'Portada subida correctamente', archivo: resultado });
  } catch (error) {
    handleError(error, res);
  }
};

// TODO: Cuando se instale multer, reemplazar el body base64 por:
// import multer from 'multer';
// const upload = multer({ storage: multer.memoryStorage() });
// router.post('/pdf', upload.single('file'), subirPdf);
