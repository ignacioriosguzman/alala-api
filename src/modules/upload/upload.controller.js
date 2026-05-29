import { subirArchivoDrive, generarVistaPrevia } from '../../services/googleDrive.service.js';

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Extrae un Buffer desde un string base64 enviado en el body.
 * Soporta data URLs: data:application/pdf;base64,JVBERi0xLjQ...
 */
const bufferDesdeBase64 = (base64Input) => {
  if (!base64Input) throw new Error('No se recibió contenido del archivo');
  const base64 = base64Input.includes(',') ? base64Input.split(',')[1] : base64Input;
  return Buffer.from(base64, 'base64');
};

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

    const resultado = await subirArchivoDrive(buffer, fileName, 'application/pdf');

    res.status(201).json({
      message: 'PDF subido correctamente',
      archivo: resultado,
    });
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

    const previews = await generarVistaPrevia(buffer);

    res.json({
      message: 'Vistas previa generadas',
      previews,
    });
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
export const subirPortada = async (req, res) => {
  try {
    const { fileBase64, fileName = `portada-${Date.now()}.jpg`, mimeType = 'image/jpeg' } = req.body;
    const buffer = bufferDesdeBase64(fileBase64);

    const resultado = await subirArchivoDrive(buffer, fileName, mimeType);

    res.status(201).json({
      message: 'Portada subida correctamente',
      archivo: resultado,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// TODO: Cuando se instale multer, reemplazar el body base64 por:
// import multer from 'multer';
// const upload = multer({ storage: multer.memoryStorage() });
// router.post('/pdf', upload.single('file'), subirPdf);
