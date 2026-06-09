/**
 * Webhook IP Whitelist Middleware
 * Valida que el request provenga de IPs autorizadas para webhooks de Flow.
 * Como capa adicional a la validación HMAC de firma.
 *
 * IPs conocidas de Flow Chile (pueden cambiar — configurar en FLOW_WEBHOOK_IPS):
 * 200.1.123.20 - 200.1.123.29
 */

const DEFAULT_FLOW_IPS = [
  "200.1.123.20", "200.1.123.21", "200.1.123.22",
  "200.1.123.23", "200.1.123.24", "200.1.123.25",
  "200.1.123.26", "200.1.123.27", "200.1.123.28",
  "200.1.123.29",
];

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "";
}

export const webhookIpGuard = (req, res, next) => {
  const configured = process.env.FLOW_WEBHOOK_IPS;
  const allowed = configured
    ? configured.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_FLOW_IPS;

  const clientIp = getClientIp(req);

  if (!allowed.includes(clientIp)) {
    console.error(`[webhookIpGuard] IP no autorizada: ${clientIp} para ${req.originalUrl}`);
    return res.status(403).send("ip no autorizada");
  }

  next();
};
