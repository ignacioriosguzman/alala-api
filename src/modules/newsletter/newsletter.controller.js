import prisma from "../../lib/prisma.js";
import { enviarEmailBienvenidaNewsletter } from "../../services/email.service.js";

export const suscribir = async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email inválido." });
  }

  const emailLower = email.toLowerCase().trim();

  try {
    const existente = await prisma.newsletter.findUnique({ where: { email: emailLower } });

    if (existente) {
      if (!existente.activo) {
        await prisma.newsletter.update({ where: { email: emailLower }, data: { activo: true } });
        enviarEmailBienvenidaNewsletter({ email: emailLower }).catch((err) =>
          console.error("[Newsletter] Error enviando email de reactivación:", err.message)
        );
        return res.json({ ok: true, mensaje: "Suscripción reactivada." });
      }
      return res.status(409).json({ ok: true, mensaje: "Ya estás suscrito/a." });
    }

    await prisma.newsletter.create({ data: { email: emailLower } });
    enviarEmailBienvenidaNewsletter({ email: emailLower }).catch((err) =>
      console.error("[Newsletter] Error enviando email de bienvenida:", err.message)
    );
    return res.status(201).json({ ok: true, mensaje: "Suscripción exitosa." });
  } catch (err) {
    console.error("[Newsletter] Error en suscribir:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};

export const desuscribir = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requerido." });

  const emailLower = email.toLowerCase().trim();
  try {
    await prisma.newsletter.updateMany({
      where: { email: emailLower },
      data: { activo: false },
    });
    return res.json({ ok: true, mensaje: "Desuscripción exitosa." });
  } catch (err) {
    console.error("[Newsletter] Error en desuscribir:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};

export const listar = async (req, res) => {
  try {
    const suscriptores = await prisma.newsletter.findMany({
      where: { activo: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, createdAt: true },
    });
    return res.json({ total: suscriptores.length, suscriptores });
  } catch (err) {
    console.error("[Newsletter] Error en listar:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};
