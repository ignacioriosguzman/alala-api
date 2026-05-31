import nodemailer from "nodemailer";

const esc = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

let _transporter = null;
let _transporterConfigKey = '';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass) {
    console.warn(
      '[email] ⚠️  SMTP NO CONFIGURADO — el correo no será enviado.\n' +
      '         Verifica en Railway: SMTP_HOST, SMTP_USER, SMTP_PASS.\n' +
      `         Estado actual → SMTP_HOST="${host || ''}" SMTP_USER="${user || ''}" SMTP_PASS="${pass ? '***' : '(vacío)'}"`
    );
    return null;
  }

  // Con SendGrid (SMTP_USER="apikey") SMTP_FROM es OBLIGATORIO porque "apikey" no es un email válido.
  if (user === 'apikey' && !from) {
    console.error(
      '[email] 🚫 ERROR DE CONFIGURACIÓN SMTP:\n' +
      '         Estás usando SendGrid (SMTP_USER="apikey") pero SMTP_FROM no está definido.\n' +
      '         SendGrid rechazará todos los envíos porque el remitente no es un email válido.\n' +
      '         Solución: define SMTP_FROM en Railway con un remitente verificado en SendGrid (ej: contacto@alala.cl).'
    );
    return null;
  }

  const configKey = `${host}:${port}:${user}`;
  if (_transporter && configKey === _transporterConfigKey) return _transporter;

  // SendGrid y Gmail tienen certificados válidos → verificar siempre.
  // Hosting compartido (cPanel) puede tener certs autofirmados → desactivar verificación.
  const isKnownProvider = host === 'smtp.sendgrid.net' || host === 'smtp.gmail.com';
  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: isKnownProvider,
    },
    connectionTimeout: 10000,
    socketTimeout: 15000,
    greetingTimeout: 8000,
  });
  _transporterConfigKey = configKey;
  console.log(`[email] Transporter SMTP listo: ${host}:${port} (secure=${port === 465})`);
  return _transporter;
}

async function send({ to, subject, html }) {
  const t = getTransporter();

  if (!t) {
    console.error('[email][FALLBACK] ══════════════════════════════════════════');
    console.error('[email][FALLBACK] CORREO NO ENVIADO — SMTP sin configurar.');
    console.error('[email][FALLBACK] Destinatario:', to);
    console.error('[email][FALLBACK] Asunto:', subject);
    console.error('[email][FALLBACK] Solución: establecer SMTP_HOST, SMTP_USER, SMTP_PASS y SMTP_FROM en Railway.');
    console.error('[email][FALLBACK] ═══════════════════════════════════════════');
    return { ok: false, fallback: true, error: 'SMTP no configurado o mal configurado (revisa SMTP_FROM)' };
  }

  // SMTP_FROM es el email remitente verificado.
  // Con SendGrid: SMTP_USER="apikey" (no es email), por eso SMTP_FROM es obligatorio.
  const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER;
  const from = `"ALALÁ Chile" <${fromAddr}>`;

  try {
    const info = await t.sendMail({ from, to, subject, html });
    console.log(`[email] ✓ Enviado → ${to} | messageId: ${info.messageId}`);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[email] ✗ Error enviando a ${to}:`, err.message);
    // Resetear transporter para forzar reconexión en el próximo intento
    _transporter = null;
    _transporterConfigKey = '';
    throw err;
  }
}

export async function verificarConexionSMTP() {
  const t = getTransporter();
  if (!t) return { ok: false, error: 'SMTP_HOST, SMTP_USER o SMTP_PASS no configurados en Railway' };
  try {
    await t.verify();
    console.log('[email] ✓ Conexión SMTP verificada correctamente.');
    return { ok: true };
  } catch (err) {
    console.error('[email] ✗ Verificación SMTP fallida:', err.message);
    return { ok: false, error: err.message };
  }
}

export async function enviarEmailConfirmacionCompra({
  email,
  nombre,
  cursoTitulo,
  cursoFecha,
  cursoDireccion,
  ordenId,
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2>¡Gracias por tu compra, ${esc(nombre)}!</h2>
      <p>Tu inscripción al curso <strong>${esc(cursoTitulo)}</strong> ha sido confirmada.</p>
      <ul>
        <li><strong>Fecha:</strong> ${esc(cursoFecha) || "Por definir"}</li>
        <li><strong>Dirección:</strong> ${esc(cursoDireccion) || "Por definir"}</li>
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
      <h2>¡Bienvenido a ALALÁ, ${esc(nombre)}!</h2>
      <p>Estamos emocionados de tenerte como instructor en nuestra plataforma.</p>
      <p>Desde ahora puedes crear cursos, gestionar tus alumnos y hacer crecer tu comunidad.</p>
      <p>Si tienes dudas, escríbenos a <a href="mailto:hola@alala.cl">hola@alala.cl</a>.</p>
    </div>
  `;
  return send({ to: email, subject: "Bienvenido a ALALÁ como instructor", html });
}

export async function enviarEmailRecuperacion({ email, nombre, resetUrl }) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

          <tr>
            <td style="background:#D4705A;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center">
              <p style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.03em">ALALÁ</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.75);letter-spacing:.05em;text-transform:uppercase">Recuperación de contraseña</p>
            </td>
          </tr>

          <tr>
            <td style="background:#fff;padding:40px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;letter-spacing:-0.02em">
                Recupera tu contraseña
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
                Hola <strong style="color:#111">${esc(nombre)}</strong>,<br>
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en ALALÁ.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:28px 0">
                <tr>
                  <td style="background:#D4705A;border-radius:10px">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:-0.01em">
                      Restablecer contraseña &#8594;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;line-height:1.6">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 28px;font-size:12px;word-break:break-all">
                <a href="${resetUrl}" style="color:#D4705A">${resetUrl}</a>
              </p>

              <div style="background:#fef9f8;border:1px solid #f8d5cc;border-radius:8px;padding:14px 16px">
                <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5">
                  ⏱ Este enlace es válido por <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este correo — tu cuenta está segura.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#fafafa;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center">
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af">
                ¿Tienes dudas? Escríbenos a
                <a href="mailto:contacto@alala.cl" style="color:#D4705A;text-decoration:none">contacto@alala.cl</a>
              </p>
              <p style="margin:0;font-size:12px;color:#d1d5db">
                ALALÁ Chile &nbsp;·&nbsp; <a href="https://alala.cl" style="color:#d1d5db">alala.cl</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  return send({ to: email, subject: 'Recupera tu contraseña de ALALÁ', html });
}

export async function enviarEmailVerificacionInstructor({ email, nombre, confirmUrl }) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

          <tr>
            <td style="background:#D4705A;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center">
              <p style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.03em">ALALÁ</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.75);letter-spacing:.05em;text-transform:uppercase">Plataforma de cursos culturales</p>
            </td>
          </tr>

          <tr>
            <td style="background:#fff;padding:40px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;letter-spacing:-0.02em">
                Confirma tu cuenta de instructor
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
                Hola <strong style="color:#111">${esc(nombre)}</strong>, ¡bienvenido a ALALÁ! <br>
                Para activar tu cuenta y comenzar a publicar cursos, confirma tu dirección de correo electrónico.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:28px 0">
                <tr>
                  <td style="background:#D4705A;border-radius:10px">
                    <a href="${confirmUrl}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:-0.01em">
                      Confirmar mi cuenta &#8594;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;line-height:1.6">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 28px;font-size:12px;word-break:break-all">
                <a href="${confirmUrl}" style="color:#D4705A">${confirmUrl}</a>
              </p>

              <div style="background:#fef9f8;border:1px solid #f8d5cc;border-radius:8px;padding:14px 16px">
                <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5">
                  ⏱ Este enlace es válido por <strong>24 horas</strong>. Si no creaste esta cuenta, puedes ignorar este correo.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#fafafa;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center">
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af">
                ¿Tienes dudas? Escríbenos a
                <a href="mailto:contacto@alala.cl" style="color:#D4705A;text-decoration:none">contacto@alala.cl</a>
              </p>
              <p style="margin:0;font-size:12px;color:#d1d5db">
                ALALÁ Chile &nbsp;·&nbsp; <a href="https://alala.cl" style="color:#d1d5db">alala.cl</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  return send({
    to: email,
    subject: 'Confirma tu cuenta de instructor en ALALÁ',
    html,
  });
}

export async function enviarEmailRecordatorio({
  email,
  nombre,
  cursoTitulo,
  cursoFecha,
  diasRestantes,
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2>¡Hola ${esc(nombre)}!</h2>
      <p>Tu curso <strong>${esc(cursoTitulo)}</strong> comienza pronto.</p>
      <ul>
        <li><strong>Fecha:</strong> ${esc(cursoFecha) || "Por definir"}</li>
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
