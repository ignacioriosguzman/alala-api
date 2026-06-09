/**
 * Anti-Bot Guard para checkout invitado
 * Capas de protección sin CAPTCHA externo:
 * 1. Honeypot: campo _hp debe estar vacío o no existir
 * 2. Rate limit por IP (usado junto a express-rate-limit)
 * 3. Email descartable: bloquea dominios temporales conocidos
 */

const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com","throwaway.com","mailinator.com","guerrillamail.com",
  "yopmail.com","sharklasers.com","getairmail.com","10minutemail.com",
  "burnermail.io","temp-mail.org","fakeinbox.com","mailnesia.com",
  "tempinbox.com","dispostable.com","mailcatch.com","mintemail.com",
  "mytrashmail.com","spambog.com","trashmail.com","wegwerfmail.de",
  "mail.ru" // a veces usado para spam, aunque no es descartable estrictamente
]);

function isDisposableEmail(email) {
  if (!email || typeof email !== "string") return false;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

export const antiBotGuard = (req, res, next) => {
  const { _hp, email } = req.body;

  // 1. Honeypot: si el campo oculto tiene contenido, es un bot
  if (_hp !== undefined && _hp !== null && String(_hp).trim() !== "") {
    console.error("[antiBotGuard] Honeypot detectado (bot):", _hp);
    return res.status(400).json({ error: "Solicitud inválida" });
  }

  // 2. Email descartable
  if (isDisposableEmail(email)) {
    console.error("[antiBotGuard] Email descartable detectado:", email);
    return res.status(400).json({ error: "Este tipo de correo no está permitido" });
  }

  next();
};
