import crypto from 'crypto';

const BASE_URL = process.env.FLOW_ENV === 'production'
  ? 'https://www.flow.cl/api'
  : 'https://sandbox.flow.cl/api';

function firmar(params) {
  const keys = Object.keys(params).sort();
  const cadena = keys.map(k => `${k}${params[k]}`).join('');
  return crypto
    .createHmac('sha256', process.env.FLOW_SECRET)
    .update(cadena)
    .digest('hex');
}

async function postFlow(endpoint, params) {
  const signed = { ...params, s: firmar(params) };
  const body = new URLSearchParams(signed).toString();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Flow ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function getFlow(endpoint, params) {
  const signed = { ...params, s: firmar(params) };
  const qs = new URLSearchParams(signed).toString();

  const res = await fetch(`${BASE_URL}${endpoint}?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(`Flow ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

export async function crearPago({ commerceOrder, amount, email, subject }) {
  return postFlow('/payment/create', {
    apiKey: process.env.FLOW_API_KEY,
    commerceOrder: String(commerceOrder),
    subject,
    currency: 'CLP',
    amount: String(Math.round(amount)),
    email,
    urlConfirmation: process.env.FLOW_URL_CONFIRMATION,
    urlReturn: process.env.FLOW_URL_RETURN,
  });
  // Respuesta: { token, url, flowOrder }
  // URL de pago: `${url}?token=${token}`
}

export async function obtenerEstadoPago(token) {
  return getFlow('/payment/getStatus', {
    apiKey: process.env.FLOW_API_KEY,
    token,
  });
  // status: 1=pendiente, 2=pagado, 3=rechazado, 4=anulado
}

// Validar firma de webhook de Flow
export function validarFirmaFlow(payload) {
  const { s, ...params } = payload;
  if (!s) return false;
  const expected = firmar(params);
  // Timing-safe comparison para prevenir timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(s, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}
