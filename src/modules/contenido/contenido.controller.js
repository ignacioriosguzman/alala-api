import prisma from "../../lib/prisma.js";
import { sanitizeObject } from "../../utils/sanitize.js";
import {
  createContenido,
  listarCatalogo,
  getContenidoById,
  listarMisContenidos,
  updateContenido,
  cambiarStatus,
  deleteContenido,
  upsellRecomendaciones,
} from "./contenido.service.js";

function resolvePortadaUrl(portadaUrl, id, base) {
  if (!portadaUrl) return null;
  if (portadaUrl.startsWith('data:image/')) return `${base}/api/v1/contenido/${id}/portada`;
  return portadaUrl;
}

const handleError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Contenido] Error de Prisma:', error.code, error.message, error.meta ?? '');
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

export const crear = async (req, res) => {
  try {
    const contenido = await createContenido(sanitizeObject(req.body), req.user.id);
    res.status(201).json(contenido);
  } catch (error) {
    handleError(error, res);
  }
};

export const catalogo = async (req, res) => {
  try {
    const contenidos = await listarCatalogo(req.query);
    const base = `${req.protocol}://${req.get('host')}`;
    const result = contenidos.map(c => ({
      ...c,
      portadaUrl: resolvePortadaUrl(c.portadaUrl, c.id, base),
    }));
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const portada = async (req, res) => {
  try {
    const contenido = await prisma.contenidoDigital.findUnique({
      where: { id: Number(req.params.id) },
      select: { portadaUrl: true },
    });
    if (!contenido?.portadaUrl?.startsWith('data:image/')) {
      return res.status(404).end();
    }
    const [meta, b64] = contenido.portadaUrl.split(',');
    const mime = meta.match(/data:(image\/\w+)/)?.[1] || 'image/jpeg';
    const buf = Buffer.from(b64, 'base64');
    res.set('Content-Type', mime);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buf);
  } catch (error) {
    handleError(error, res);
  }
};

export const obtener = async (req, res) => {
  try {
    const contenido = await getContenidoById(req.params.id);
    if (!contenido) {
      return res.status(404).json({ error: "Contenido no encontrado" });
    }
    // Permitir que el creador o un admin vea contenidos no activos
    const isOwner = req.user && contenido.creatorId === req.user.id;
    const isAdmin = req.user?.role === 'ADMIN';
    if (contenido.status !== "activo" && !isOwner && !isAdmin) {
      return res.status(404).json({ error: "Contenido no encontrado" });
    }

    // Si el contenido tiene precio, verificar compra antes de entregar URL de descarga
    const monto = contenido.precioOferta ?? contenido.precio;
    if ((monto ?? 0) > 0 && !isOwner && !isAdmin) {
      const userId = req.user?.id ?? null;
      const emailInvitado = req.query.email || null;
      let tieneAcceso = false;
      if (userId) {
        const compra = await prisma.compraContenido.findUnique({
          where: { userId_contenidoId: { userId: Number(userId), contenidoId: Number(req.params.id) } },
        });
        tieneAcceso = compra?.estado === 'completada';
      } else if (emailInvitado) {
        const compra = await prisma.compraInvitado.findFirst({
          where: { email: emailInvitado.toLowerCase(), contenidoId: Number(req.params.id), estado: 'completada' },
        });
        tieneAcceso = !!compra;
      }
      if (!tieneAcceso) {
        const { pdfUrl, ...preview } = contenido;
        return res.json({ ...preview, acceso: 'bloqueado' });
      }
    }

    res.json(contenido);
  } catch (error) {
    handleError(error, res);
  }
};

export const misContenidos = async (req, res) => {
  try {
    const contenidos = await listarMisContenidos(req.user.id);
    res.json(contenidos);
  } catch (error) {
    handleError(error, res);
  }
};

export const editar = async (req, res) => {
  try {
    const contenido = await updateContenido(req.params.id, sanitizeObject(req.body), req.user.id);
    res.json(contenido);
  } catch (error) {
    handleError(error, res);
  }
};

export const cambiarEstado = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["borrador", "activo", "pausado"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }
    const contenido = await cambiarStatus(req.params.id, status, req.user.id);
    res.json(contenido);
  } catch (error) {
    handleError(error, res);
  }
};

export const eliminar = async (req, res) => {
  try {
    await deleteContenido(req.params.id, req.user.id);
    res.json({ message: "Contenido eliminado" });
  } catch (error) {
    handleError(error, res);
  }
};

export const upsell = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 3;
    const recomendaciones = await upsellRecomendaciones(req.params.id, limit);
    res.json(recomendaciones);
  } catch (error) {
    handleError(error, res);
  }
};
