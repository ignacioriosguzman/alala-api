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
      from: `"ALALA Chile" <${SMTP_USER}>`,
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
