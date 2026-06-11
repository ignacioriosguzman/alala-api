/**
 * Validación centralizada de variables de entorno críticas.
 * Se importa lo más temprano posible en server.js.
 */

const REQUIRED = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'DATABASE_URL'];
const FLOW_REQUIRED = ['FLOW_API_KEY', 'FLOW_SECRET', 'FLOW_URL_CONFIRMATION', 'FLOW_URL_RETURN'];

export function validarEnv() {
  const faltantes = REQUIRED.filter((k) => !process.env[k]);
  if (faltantes.length) {
    console.error('[FATAL] Variables de entorno faltantes:', faltantes.join(', '));
    process.exit(1);
  }

  const jwt = process.env.JWT_SECRET || '';
  if (jwt.length < 32) {
    console.error('[FATAL] JWT_SECRET debe tener al menos 32 caracteres.');
    process.exit(1);
  }

  const refresh = process.env.REFRESH_TOKEN_SECRET || '';
  if (refresh.length < 32) {
    console.error('[FATAL] REFRESH_TOKEN_SECRET debe tener al menos 32 caracteres.');
    process.exit(1);
  }

  const flowMissing = FLOW_REQUIRED.filter((k) => !process.env[k]);
  if (flowMissing.length) {
    console.warn('[WARN] Flow Chile no está completamente configurado:', flowMissing.join(', '));
  }

  if (!process.env.FRONTEND_URL) {
    console.warn('[WARN] FRONTEND_URL no definida. Usando https://alala.cl por defecto.');
    process.env.FRONTEND_URL = 'https://alala.cl';
  }
}
