/**
 * ALALA Sanitization Utilities
 * Escape HTML en strings para prevenir XSS persistente.
 * No requiere dependencias externas.
 *
 * ESTRATEGIA: Escapar solo < y > para neutralizar tags HTML.
 * Preserva URLs (incluyendo & en query params), saltos de línea,
 * comillas y todo el resto del texto.
 */

function escapeTags(str) {
  if (str == null) return str;
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Recorre recursivamente un objeto/array y aplica escapeTags a todas las strings.
 * Preserva números, booleans, dates, null, undefined.
 * Las URLs se mantienen intactas porque no contienen < ni >.
 */
export function sanitizeObject(obj, maxDepth = 5, currentDepth = 0) {
  if (currentDepth > maxDepth) return obj;
  if (obj == null) return obj;
  if (typeof obj === 'string') return escapeTags(obj);
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth, currentDepth + 1));
  }
  if (typeof obj === 'object' && obj.constructor === Object) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObject(value, maxDepth, currentDepth + 1);
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
  return escapeTags(str);
}

export { escapeTags };
