/* ═══════════════════════════════════════════════
   AALUXE — Security & Input Sanitization Helpers
   Preventing XSS vulnerabilities and validating input parameters
   ═══════════════════════════════════════════════ */

/**
 * Escapes unsafe HTML characters to prevent XSS attacks when embedding string content.
 * @param {any} str - Input string
 * @returns {string} Safe escaped string
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates whether a given string is a well-formed URL.
 * @param {string} url - String to test
 * @returns {boolean}
 */
export function isValidURL(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates price or numerical value
 */
export function isValidPrice(price) {
  const num = Number(price);
  return !isNaN(num) && num >= 0;
}

/**
 * Validates duration in minutes
 */
export function isValidDuration(duration) {
  const num = Number(duration);
  return Number.isInteger(num) && num > 0 && num <= 1440;
}

/**
 * Sanitizes an object by recursively escaping string properties
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (typeof val === 'string') {
        clean[key] = escapeHTML(val);
      } else if (typeof val === 'object' && val !== null) {
        clean[key] = sanitizeObject(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}
