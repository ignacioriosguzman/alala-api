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
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#D4705A;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center">
            <p style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.03em">ALALA</p>
            <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,.75);letter-spacing:.08em;text-transform:uppercase">Plataforma de cursos culturales</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 40px 36px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">

            <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6">
              Hola <strong style="color:#111111">${esc(nombre)}</strong>,
            </p>

            <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.7">
              Gracias por registrarte en ALALA.
            </p>

            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.7">
              Tu cuenta ya está activa y puedes comenzar a publicar tus cursos, talleres o actividades cuando quieras.
            </p>

            <!-- Qué encontrarás -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px">
              <tr>
                <td style="background:#fef9f8;border-radius:12px;padding:24px 28px;border:1px solid #f8d5cc">
                  <p style="margin:0 0 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#D4705A">
                    En tu panel encontrarás
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:7px 0;font-size:14px;color:#374151;line-height:1.5">
                        <span style="color:#D4705A;font-weight:700;margin-right:10px">&#8226;</span>
                        Herramientas para crear y gestionar tus cursos
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:7px 0;font-size:14px;color:#374151;line-height:1.5">
                        <span style="color:#D4705A;font-weight:700;margin-right:10px">&#8226;</span>
                        Espacios para subir fotos, descripciones y horarios
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:7px 0;font-size:14px;color:#374151;line-height:1.5">
                        <span style="color:#D4705A;font-weight:700;margin-right:10px">&#8226;</span>
                        Opciones para recibir estudiantes y administrar tu oferta
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:7px 0;font-size:14px;color:#374151;line-height:1.5">
                        <span style="color:#D4705A;font-weight:700;margin-right:10px">&#8226;</span>
                        Un perfil público para mostrar tu trabajo
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:32px">
              <tr>
                <td style="background:#D4705A;border-radius:10px">
                  <a href="https://alala.cl/panel-instructor.html"
                     style="display:inline-block;padding:15px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:-0.01em">
                    Ir a mi panel &#8594;
                  </a>
                </td>
              </tr>
            </table>

            <!-- Mensaje personal -->
            <p style="margin:0 0 8px;font-size:15px;color:#6b7280;line-height:1.7">
              Si necesitas ayuda para publicar tu primer curso, solo responde este correo y te acompañaré en el proceso.
            </p>

            <p style="margin:0 0 4px;font-size:15px;color:#6b7280;line-height:1.7">
              Bienvenido/a a ALALA.<br>
              Estamos felices de tenerte aquí.
            </p>

            <!-- Firma -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;padding-top:24px;border-top:1px solid #f3f4f6">
              <tr>
                <td>
                  <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111111">Ignacio</p>
                  <p style="margin:0 0 2px;font-size:13px;color:#9ca3af">ALALA</p>
                  <a href="mailto:contacto@alala.cl" style="font-size:13px;color:#D4705A;text-decoration:none">contacto@alala.cl</a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fafafa;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center">
            <p style="margin:0;font-size:12px;color:#d1d5db">
              ALALA Chile &nbsp;&#183;&nbsp; <a href="https://alala.cl" style="color:#d1d5db;text-decoration:none">alala.cl</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
  return send({ to: email, subject: `Bienvenido/a a ALALA — Tu espacio para compartir tus cursos`, html });
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

export async function enviarEmailVerificacionUsuario({ email, nombre, confirmUrl }) {
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
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">Confirma tu correo electrónico</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
              Hola <strong style="color:#111">${esc(nombre)}</strong>, ¡bienvenido/a a ALALA!<br>
              Haz clic en el botón para confirmar tu cuenta y comenzar a explorar cursos.
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
  return send({ to: email, subject: 'Confirma tu cuenta en ALALA', html });
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
