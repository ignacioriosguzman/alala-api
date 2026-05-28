import { enviarEmailConfirmacionCompra } from "../../services/email.service.js";

export const enviarConfirmacion = async (req, res) => {
  try {
    const { email, nombre, cursoTitulo, cursoFecha, cursoDireccion, ordenId } = req.body;

    if (!email || !nombre || !cursoTitulo) {
      return res.status(400).json({ error: "email, nombre y cursoTitulo son requeridos" });
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
