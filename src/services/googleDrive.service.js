/**
 * Servicio de integración con Google Drive API
 *
 * REQUISITOS PARA ACTIVAR:
 * 1. Crear proyecto en Google Cloud Console: https://console.cloud.google.com/
 * 2. Habilitar Google Drive API
 * 3. Crear cuenta de servicio (Service Account)
 * 4. Descargar JSON de credenciales y guardar como `google-credentials.json`
 * 5. Compartir una carpeta de Drive con el email de la cuenta de servicio
 * 6. Agregar GOOGLE_DRIVE_FOLDER_ID al .env
 *
 * Instalar: npm install googleapis
 */

// TODO: Descomentar cuando se configuren las credenciales
// import { google } from 'googleapis';
// import fs from 'fs';
// import path from 'path';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
// const SCOPES = ['https://www.googleapis.com/auth/drive'];

/**
 * Sube un archivo a Google Drive.
 * Versión actual: placeholder que simula la respuesta.
 *
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {string} fileName - Nombre del archivo incluyendo extensión
 * @param {string} mimeType - MIME type del archivo (ej: application/pdf)
 * @returns {Promise<{id:string, url:string, downloadUrl:string, webViewLink:string}>}
 */
export const subirArchivoDrive = async (fileBuffer, fileName, mimeType) => {
  // Placeholder: loguea en consola y devuelve URL simulada
  console.log('[GoogleDrive] Simulando subida:', fileName, mimeType, 'tamaño:', fileBuffer.length);
  const fakeId = 'simulado-' + Date.now();
  return {
    id: fakeId,
    url: `https://drive.google.com/file/d/${fakeId}/view`,
    downloadUrl: `https://drive.google.com/uc?id=${fakeId}&export=download`,
    webViewLink: `https://drive.google.com/file/d/${fakeId}/view`,
  };
};

/**
 * Genera vistas previas en JPG a partir de un PDF.
 * Versión actual: placeholder que devuelve imágenes de prueba.
 *
 * @param {Buffer} pdfBuffer - Buffer del PDF
 * @returns {Promise<string[]>} Array de URLs de imágenes de preview
 */
export const generarVistaPrevia = async (pdfBuffer) => {
  // Placeholder: en producción, usaría pdf2pic o sharp para convertir las primeras 3 páginas a JPG
  console.log('[GoogleDrive] Simulando generación de vista previa');
  return [
    'https://via.placeholder.com/400x566?text=Preview+1',
    'https://via.placeholder.com/400x566?text=Preview+2',
    'https://via.placeholder.com/400x566?text=Preview+3',
  ];
};

/**
 * Código de implementación real (comentado hasta configurar credenciales):
 *
 * const auth = new google.auth.GoogleAuth({
 *   keyFile: path.resolve(process.cwd(), 'google-credentials.json'),
 *   scopes: SCOPES,
 * });
 * const drive = google.drive({ version: 'v3', auth });
 *
 * export const subirArchivoDrive = async (fileBuffer, fileName, mimeType) => {
 *   const fileMetadata = {
 *     name: fileName,
 *     parents: FOLDER_ID ? [FOLDER_ID] : undefined,
 *   };
 *   const media = {
 *     mimeType,
 *     body: Readable.from(fileBuffer),
 *   };
 *   const response = await drive.files.create({
 *     requestBody: fileMetadata,
 *     media,
 *     fields: 'id, webViewLink, webContentLink',
 *   });
 *   // Hacer el archivo público (opcional: cambiar a 'reader' para restringido)
 *   await drive.permissions.create({
 *     fileId: response.data.id,
 *     requestBody: { role: 'reader', type: 'anyone' },
 *   });
 *   return {
 *     id: response.data.id,
 *     url: `https://drive.google.com/file/d/${response.data.id}/view`,
 *     downloadUrl: `https://drive.google.com/uc?id=${response.data.id}&export=download`,
 *     webViewLink: response.data.webViewLink,
 *   };
 * };
 */
