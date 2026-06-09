/**
 * ALALA Sanitization Utilities
 * Sanitización completa contra XSS persistente y reflectivo.
 *
 * Protege contra:
 * - Tags HTML: <script>, <img onerror=...>, etc.
 * - Atributos con event handlers: onerror, onload, onclick, etc.
 * - URLs maliciosas: javascript:, data:, vbscript:
 * - Comillas y backticks que rompen atributos HTML
 * - Entidades HTML numéricas/hexadecimales
 *
 * No requiere dependencias externas.
 */

const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file):/i;
const EVENT_HANDLER_ATTR = /^on\w+$/i;

/**
 * Escapa caracteres HTML peligrosos.
 */
function escapeHtml(str) {
  if (str == null) return str;
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;');
}

/**
 * Sanitiza una URL. Bloquea protocolos peligrosos.
 * Si es sospechosa, devuelve '#blocked'.
 */
function sanitizeUrl(url) {
  if (url == null) return url;
  if (typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (DANGEROUS_PROTOCOLS.test(trimmed)) {
    return '#blocked';
  }
  // Detectar entidades HTML que decodifican a javascript:
  const decoded = trimmed
    .replace(/&\#x?0*58;/gi, ':')
    .replace(/&\#x?0*59;/gi, ';')
    .replace(/&colon;/gi, ':');
  if (DANGEROUS_PROTOCOLS.test(decoded)) {
    return '#blocked';
  }
  return trimmed;
}

/**
 * Sanitiza una clave de objeto. Rechaza claves que parecen
 * atributos de evento (onerror, onclick, etc.).
 */
function sanitizeKey(key) {
  if (typeof key !== 'string') return key;
  if (EVENT_HANDLER_ATTR.test(key)) {
    return '__blocked__' + key;
  }
  return key;
}

/**
 * Recorre recursivamente un objeto/array y sanitiza todas las strings.
 * - Escapa HTML en strings genéricas
 * - Sanitiza URLs en campos que terminan en "Url", "url", "Urls", "urls",
 *   o contienen "url", "href", "src", "link", "uri", "image"
 * - Renombra claves que parecen event handlers
 * - Preserva números, booleans, dates, null, undefined
 */
function isUrlField(key) {
  if (typeof key !== 'string') return false;
  const lower = key.toLowerCase();
  return (
    lower.endsWith('url') ||
    lower.endsWith('urls') ||
    lower.endsWith('href') ||
    lower.endsWith('src') ||
    lower.endsWith('link') ||
    lower.endsWith('uri') ||
    lower.endsWith('image') ||
    lower.endsWith('imagen') ||
    lower.endsWith('portada') ||
    lower.endsWith('avatar') ||
    lower.endsWith('pdf') ||
    lower.endsWith('epub')
  );
}

export function sanitizeObject(obj, maxDepth = 5, currentDepth = 0) {
  if (currentDepth > maxDepth) return obj;
  if (obj == null) return obj;
  if (typeof obj === 'string') return escapeHtml(obj);
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth, currentDepth + 1));
  }
  if (typeof obj === 'object' && obj.constructor === Object) {
    const result = {};
    for (const [rawKey, value] of Object.entries(obj)) {
      const key = sanitizeKey(rawKey);
      if (typeof value === 'string' && isUrlField(rawKey)) {
        result[key] = sanitizeUrl(value);
      } else {
        result[key] = sanitizeObject(value, maxDepth, currentDepth + 1);
      }
    }
    return result;
  }
  // Preservar otros tipos (number, boolean, Date, etc.)
  return obj;
}

/**
 * Sanitiza un campo de texto plano individual.
 * Útil cuando no quieres sanitizar todo el body.
 */
export function sanitizeText(str) {
  return escapeHtml(str);
}

/**
 * Sanitiza una URL individual.
 */
export function sanitizeUrlField(url) {
  return sanitizeUrl(url);
}

export { escapeHtml };
