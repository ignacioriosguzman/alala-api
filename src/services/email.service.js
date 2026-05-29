import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 5000,
      socketTimeout: 10000,
      greetingTimeout: 5000,
    });
    console.log("[email] Usando SMTP configurado:", SMTP_HOST);
  } else {
    console.log("[email] SMTP no configurado. Se usará fallback a consola.");
  }

  return transporter;
}

async function send({ to, subject, html }) {
  const t = getTransporter();

  if (!t) {
    console.log("[email][FALLBACK] ────────────────────────────────");
    console.log("Para:", to);
    console.log("Asunto:", subject);
    console.log("HTML:", html);
    console.log("─────────────────────────────────────────────────");
    return { ok: true, fallback: true };
  }

  try {
    const info = await t.sendMail({
      from: '"ALALA Chile" <contacto@alala.cl>',
      to,
      subject,
      html,
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error("[email] Error enviando email:", err.message);
    throw err;
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
      <h2>¡Gracias por tu compra, ${nombre}!</h2>
      <p>Tu inscripción al curso <strong>${cursoTitulo}</strong> ha sido confirmada.</p>
      <ul>
        <li><strong>Fecha:</strong> ${cursoFecha || "Por definir"}</li>
        <li><strong>Dirección:</strong> ${cursoDireccion || "Por definir"}</li>
        <li><strong>Orden:</strong> ${ordenId}</li>
      </ul>
      <p>Te esperamos. ¡Nos vemos pronto!</p>
    </div>
  `;
  return send({ to: email, subject: `Confirmación de compra – ${cursoTitulo}`, html });
}

export async function enviarEmailBienvenidaInstructor({ email, nombre }) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2>¡Bienvenido a ALALA, ${nombre}!</h2>
      <p>Estamos emocionados de tenerte como instructor en nuestra plataforma.</p>
      <p>Desde ahora puedes crear cursos, gestionar tus alumnos y hacer crecer tu comunidad.</p>
      <p>Si tienes dudas, escríbenos a <a href="mailto:hola@alala.cl">hola@alala.cl</a>.</p>
    </div>
  `;
  return send({ to: email, subject: "Bienvenido a ALALA como instructor", html });
}

export async function enviarEmailRecuperacion({ email, nombre, resetUrl }) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#D4705A">Recupera tu contraseña</h2>
      <p>Hola ${nombre},</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en ALALA.</p>
      <p style="margin:24px 0">
        <a href="${resetUrl}" style="background:#D4705A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">
          Restablecer contraseña
        </a>
      </p>
      <p style="color:#999;font-size:.85rem">Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este correo.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
      <p style="color:#999;font-size:.75rem">ALALA Chile · <a href="https://alala.cl" style="color:#D4705A">alala.cl</a></p>
    </div>
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
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

          <!-- Header -->
          <tr>
            <td style="background:#D4705A;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center">
              <p style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.03em">ALALÁ</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.75);letter-spacing:.05em;text-transform:uppercase">Plataforma de cursos culturales</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#fff;padding:40px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;letter-spacing:-0.02em">
                Confirma tu cuenta de instructor
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
                Hola <strong style="color:#111">${nombre}</strong>, ¡bienvenido a ALALÁ! <br>
                Para activar tu cuenta y comenzar a publicar cursos, confirma tu dirección de correo electrónico.
              </p>

              <!-- Button -->
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

          <!-- Footer -->
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
      <h2>¡Hola ${nombre}!</h2>
      <p>Tu curso <strong>${cursoTitulo}</strong> comienza pronto.</p>
      <ul>
        <li><strong>Fecha:</strong> ${cursoFecha || "Por definir"}</li>
        <li><strong>Faltan:</strong> ${diasRestantes} días</li>
      </ul>
      <p>¡Prepárate para una gran experiencia de aprendizaje!</p>
    </div>
  `;
  return send({
    to: email,
    subject: `Recordatorio: ${cursoTitulo} comienza en ${diasRestantes} días`,
    html,
  });
}
