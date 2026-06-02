import { google } from 'googleapis';
import { Readable } from 'stream';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

function getAuth() {
  const raw = process.env.GOOGLE_CREDENTIALS_JSON;
  if (!raw) throw new Error('GOOGLE_CREDENTIALS_JSON no configurado');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

export const subirArchivoDrive = async (fileBuffer, fileName, mimeType) => {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const media = { mimeType, body: Readable.from(fileBuffer) };

  // Intentar subir a la carpeta configurada; si falla (carpeta no compartida), subir al root
  let response;
  if (FOLDER_ID) {
    try {
      response = await drive.files.create({
        requestBody: { name: fileName, parents: [FOLDER_ID] },
        media,
        fields: 'id, webViewLink, webContentLink',
      });
    } catch (e) {
      if (e?.response?.data?.error?.code === 404 || e?.response?.data?.error?.code === 403) {
        console.warn(`[Drive] Carpeta ${FOLDER_ID} inaccesible (${e.response.data.error.code}), subiendo al root del service account.`);
        response = await drive.files.create({
          requestBody: { name: fileName },
          media,
          fields: 'id, webViewLink, webContentLink',
        });
      } else throw e;
    }
  } else {
    response = await drive.files.create({
      requestBody: { name: fileName },
      media,
      fields: 'id, webViewLink, webContentLink',
    });
  }

  const fileId = response.data.id;
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return {
    id: fileId,
    url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
    downloadUrl: `https://drive.google.com/uc?id=${fileId}&export=download`,
    webViewLink: response.data.webViewLink,
  };
};

export const generarVistaPrevia = async (pdfBuffer) => {
  console.log('[GoogleDrive] Vista previa pendiente de implementación');
  return [
    'https://via.placeholder.com/400x566?text=Preview+1',
    'https://via.placeholder.com/400x566?text=Preview+2',
    'https://via.placeholder.com/400x566?text=Preview+3',
  ];
};
