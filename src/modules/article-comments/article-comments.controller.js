import prisma from "../../lib/prisma.js";
import { enviarEmailNuevoComentario } from "../../services/email.service.js";

export const listar = async (req, res) => {
  const { articuloId } = req.params;
  try {
    const comentarios = await prisma.articleComment.findMany({
      where: { articuloId, aprobado: true },
      include: { user: { select: { id: true, nombre: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(comentarios);
  } catch (err) {
    console.error("[ArticleComments] Error en listar:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};

// Sanitización básica contra XSS en comentarios
const sanitizeHtml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const crear = async (req, res) => {
  const userId = req.user.id;
  const { articuloId } = req.params;
  const { contenido } = req.body;

  if (!contenido || contenido.trim().length < 5) {
    return res.status(400).json({ error: "El comentario debe tener al menos 5 caracteres." });
  }
  if (contenido.length > 2000) {
    return res.status(400).json({ error: "El comentario no puede superar los 2000 caracteres." });
  }

  try {
    const [comentario, usuario] = await Promise.all([
      prisma.articleComment.create({
        data: { articuloId, userId, contenido: sanitizeHtml(contenido.trim()) },
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { nombre: true, email: true } }),
    ]);

    enviarEmailNuevoComentario({
      articuloId,
      autorNombre: usuario?.nombre || `Usuario ${userId}`,
      autorEmail: usuario?.email || '',
      contenido: contenido.trim(),
    }).catch((err) => console.error("[ArticleComments] Error enviando email al admin:", err.message));

    return res.status(201).json({
      ok: true,
      comentario,
      mensaje: "Tu comentario será revisado antes de publicarse. ¡Gracias!",
    });
  } catch (err) {
    console.error("[ArticleComments] Error en crear:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};

export const aprobar = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });
  try {
    await prisma.articleComment.update({ where: { id }, data: { aprobado: true } });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[ArticleComments] Error en aprobar:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};

export const eliminar = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });
  try {
    await prisma.articleComment.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[ArticleComments] Error en eliminar:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};

export const listarPendientes = async (req, res) => {
  try {
    const pendientes = await prisma.articleComment.findMany({
      where: { aprobado: false },
      include: { user: { select: { id: true, nombre: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
    return res.json(pendientes);
  } catch (err) {
    console.error("[ArticleComments] Error en listarPendientes:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};
