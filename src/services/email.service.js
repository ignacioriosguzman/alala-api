/**
 * email.service.js — SendGrid HTTP API v3
 *
 * Usa fetch nativo (Node 18+) para evitar el bloqueo SMTP de Railway.
 * Variables necesarias en Railway:
 *   SMTP_PASS  → API Key de SendGrid  (ej: SG.xxxxx)
 *   SMTP_FROM  → Remitente verificado (ej: contacto@alala.cl)
 */

const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';

const esc = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

function getConfig() {
  const apiKey = process.env.SMTP_PASS;
  const from   = process.env.SMTP_FROM;

  if (!apiKey) {
    console.warn(
      '[email] ⚠️  SMTP_PASS no definida en Railway — correos desactivados.\n' +
      '         Agrega tu API Key de SendGrid como SMTP_PASS en Railway Variables.'
    );
    return null;
  }
  if (!from) {
    console.warn(
      '[email] ⚠️  SMTP_FROM no definida en Railway — correos desactivados.\n' +
      '         Agrega el remitente verificado (ej: contacto@alala.cl) como SMTP_FROM.'
    );
    return null;
  }
  return { apiKey, from };
}

async function send({ to, subject, html }) {
  const cfg = getConfig();

  if (!cfg) {
    console.error('[email][FALLBACK] CORREO NO ENVIADO — SMTP_PASS o SMTP_FROM sin configurar.');
    console.error('[email][FALLBACK] Destinatario:', to, '| Asunto:', subject);
    return { ok: false, fallback: true, error: 'SendGrid no configurado (revisa SMTP_PASS y SMTP_FROM)' };
  }

  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: cfg.from, name: 'ALALA Chile' },
    subject,
    content: [{ type: 'text/html', value: html }],
  };

  try {
    const res = await fetch(SENDGRID_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.status === 202) {
      console.log(`[email] ✓ Enviado → ${to} | subject: ${subject}`);
      return { ok: true };
    }

    // SendGrid devuelve detalles del error en el body
    let errDetail = '';
    try {
      const errBody = await res.json();
      errDetail = errBody?.errors?.map(e => e.message).join(', ') || res.statusText;
    } catch {
      errDetail = res.statusText;
    }

    console.error(`[email] ✗ SendGrid rechazó el envío a ${to} — HTTP ${res.status}: ${errDetail}`);

    // Diagnósticos comunes
    if (res.status === 401) {
      console.error('[email] → Causa probable: SMTP_PASS (API Key) inválida o revocada. Verifica en SendGrid → Settings → API Keys.');
    } else if (res.status === 403) {
      console.error('[email] → Causa probable: el remitente SMTP_FROM no está verificado en SendGrid.');
      console.error('[email] → Ve a SendGrid → Settings → Sender Authentication y verifica', cfg.from);
    }

    return { ok: false, error: `HTTP ${res.status}: ${errDetail}` };
  } catch (err) {
    console.error(`[email] ✗ Error de red enviando a ${to}:`, err.message);
    throw err;
  }
}

// Verifica que la API Key sea válida consultando el perfil de SendGrid
export async function verificarConexionSMTP() {
  const cfg = getConfig();
  if (!cfg) return { ok: false, error: 'SMTP_PASS o SMTP_FROM no configuradas en Railway' };

  try {
    const res = await fetch('https://api.sendgrid.com/v3/user/profile', {
      headers: { 'Authorization': `Bearer ${cfg.apiKey}` },
    });
    if (res.status === 200) {
      console.log('[email] ✓ SendGrid API Key válida. Correos habilitados.');
      return { ok: true };
    }
    if (res.status === 401) {
      console.error('[email] ✗ SendGrid API Key inválida o revocada.');
      return { ok: false, error: 'API Key inválida — verifica SMTP_PASS en Railway' };
    }
    return { ok: false, error: `SendGrid respondió HTTP ${res.status}` };
  } catch (err) {
    console.error('[email] ✗ No se pudo conectar a SendGrid:', err.message);
    return { ok: false, error: err.message };
  }
}

export async function enviarEmailConfirmacionCompra({
  email, nombre, cursoTitulo, cursoFecha, cursoDireccion, ordenId,
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2>¡Gracias por tu compra, ${esc(nombre)}!</h2>
      <p>Tu inscripción al curso <strong>${esc(cursoTitulo)}</strong> ha sido confirmada.</p>
      <ul>
        <li><strong>Fecha:</strong> ${esc(cursoFecha) || 'Por definir'}</li>
        <li><strong>Dirección:</strong> ${esc(cursoDireccion) || 'Por definir'}</li>
        <li><strong>Orden:</strong> ${esc(String(ordenId))}</li>
      </ul>
      <p>Te esperamos. ¡Nos vemos pronto!</p>
    </div>
  `;
  return send({ to: email, subject: `Confirmación de compra – ${esc(cursoTitulo)}`, html });
}

export async function enviarEmailBienvenidaInstructor({ email, nombre }) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2>¡Bienvenido a ALALA, ${esc(nombre)}!</h2>
      <p>Estamos emocionados de tenerte como instructor en nuestra plataforma.</p>
      <p>Desde ahora puedes crear cursos, gestionar tus alumnos y hacer crecer tu comunidad.</p>
      <p>Si tienes dudas, escríbenos a <a href="mailto:hola@alala.cl">hola@alala.cl</a>.</p>
    </div>
  `;
  return send({ to: email, subject: 'Bienvenido a ALALA como instructor', html });
}

export async function enviarEmailRecuperacion({ email, nombre, resetUrl }) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr>
          <td style="background:#D4705A;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center">
            <p style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.03em">ALALA</p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.75);letter-spacing:.05em;text-transform:uppercase">Recuperación de contraseña</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:40px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;letter-spacing:-0.02em">Recupera tu contraseña</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
              Hola <strong style="color:#111">${esc(nombre)}</strong>,<br>
              Recibimos una solicitud para restablecer la contraseña de tu cuenta en ALALA.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:28px 0">
              <tr>
                <td style="background:#D4705A;border-radius:10px">
                  <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none">
                    Restablecer contraseña &#8594;
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af">Si el botón no funciona, copia y pega este enlace:</p>
            <p style="margin:0 0 28px;font-size:12px;word-break:break-all">
              <a href="${resetUrl}" style="color:#D4705A">${resetUrl}</a>
            </p>
            <div style="background:#fef9f8;border:1px solid #f8d5cc;border-radius:8px;padding:14px 16px">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5">
                ⏱ Este enlace es válido por <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este correo.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#fafafa;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center">
            <p style="margin:0 0 4px;font-size:13px;color:#9ca3af">
              ¿Tienes dudas? <a href="mailto:contacto@alala.cl" style="color:#D4705A;text-decoration:none">contacto@alala.cl</a>
            </p>
            <p style="margin:0;font-size:12px;color:#d1d5db">ALALA Chile · <a href="https://alala.cl" style="color:#d1d5db">alala.cl</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
  return send({ to: email, subject: 'Recupera tu contraseña de ALALA', html });
}

export async function enviarEmailVerificacionInstructor({ email, nombre, confirmUrl }) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr>
          <td style="background:#D4705A;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center">
            <p style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.03em">ALALA</p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.75);letter-spacing:.05em;text-transform:uppercase">Plataforma de cursos culturales</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:40px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">Confirma tu cuenta de instructor</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
              Hola <strong style="color:#111">${esc(nombre)}</strong>, ¡bienvenido a ALALA!<br>
              Para activar tu cuenta y comenzar a publicar cursos, confirma tu correo.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:28px 0">
              <tr>
                <td style="background:#D4705A;border-radius:10px">
                  <a href="${confirmUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none">
                    Confirmar mi cuenta &#8594;
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af">Si el botón no funciona, copia y pega este enlace:</p>
            <p style="margin:0 0 28px;font-size:12px;word-break:break-all">
              <a href="${confirmUrl}" style="color:#D4705A">${confirmUrl}</a>
            </p>
            <div style="background:#fef9f8;border:1px solid #f8d5cc;border-radius:8px;padding:14px 16px">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5">
                ⏱ Este enlace es válido por <strong>24 horas</strong>.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#fafafa;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center">
            <p style="margin:0 0 4px;font-size:13px;color:#9ca3af">
              ¿Tienes dudas? <a href="mailto:contacto@alala.cl" style="color:#D4705A;text-decoration:none">contacto@alala.cl</a>
            </p>
            <p style="margin:0;font-size:12px;color:#d1d5db">ALALA Chile · <a href="https://alala.cl" style="color:#d1d5db">alala.cl</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
  return send({ to: email, subject: 'Confirma tu cuenta de instructor en ALALA', html });
}

export async function enviarEmailRecordatorio({ email, nombre, cursoTitulo, cursoFecha, diasRestantes }) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2>¡Hola ${esc(nombre)}!</h2>
      <p>Tu curso <strong>${esc(cursoTitulo)}</strong> comienza pronto.</p>
      <ul>
        <li><strong>Fecha:</strong> ${esc(cursoFecha) || 'Por definir'}</li>
        <li><strong>Faltan:</strong> ${esc(String(diasRestantes))} días</li>
      </ul>
      <p>¡Prepárate para una gran experiencia de aprendizaje!</p>
    </div>
  `;
  return send({
    to: email,
    subject: `Recordatorio: ${esc(cursoTitulo)} comienza en ${esc(String(diasRestantes))} días`,
    html,
  });
}
