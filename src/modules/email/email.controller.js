import { enviarEmailConfirmacionCompra, verificarConexionSMTP } from "../../services/email.service.js";

export const smtpStatus = async (req, res) => {
  const host  = process.env.SMTP_HOST  || '(no definido)';
  const user  = process.env.SMTP_USER  || '(no definido)';
  const pass  = process.env.SMTP_PASS  ? '***' : '(vacío)';
  const from  = process.env.SMTP_FROM  || '(no definido)';
  const port  = process.env.SMTP_PORT  || '587 (default)';

  const { ok, error } = await verificarConexionSMTP();
  res.json({
    smtp: { host, port, user, pass, from },
    connection: ok ? 'OK' : 'FALLO',
    ...(error ? { error } : {}),
  });
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const enviarConfirmacion = async (req, res) => {
  try {
    const { email, nombre, cursoTitulo, cursoFecha, cursoDireccion, ordenId } = req.body;

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "email inválido" });
    }
    if (!nombre || !cursoTitulo) {
      return res.status(400).json({ error: "nombre y cursoTitulo son requeridos" });
    }

    const resultado = await enviarEmailConfirmacionCompra({
      email,
      nombre,
      cursoTitulo,
      cursoFecha,
      cursoDireccion,
      ordenId,
    });

    res.json({ ok: true, fallback: resultado.fallback || false });
  } catch (err) {
    console.error("[email.controller] enviarConfirmacion:", err.message);
    res.status(500).json({ error: "Error al enviar el email" });
  }
};
