import jwt from "jsonwebtoken";
import {
  comprarContenido,
  listarMisDescargas,
  obtenerDownloadUrl,
  reporteCreador,
  comprarContenidoInvitado,
  comprarBundle,
  comprarBundleInvitado,
  guardarProgreso,
  obtenerProgreso,
  listarFavoritosContenido,
  toggleFavoritoContenido,
  checkFavoritoContenido,
} from "./compras.service.js";

const handleError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Compras] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  if (error.message === "Ya has comprado este contenido" || error.message === "Ya has comprado uno de estos contenidos") {
    return res.status(409).json({ error: error.message });
  }
  res.status(400).json({ error: error.message });
};

const getUserFromOptionalToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      return jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch {
      return null;
    }
  }
  return null;
};

export const comprar = async (req, res) => {
  try {
    const { contenidoId } = req.body;
    if (!contenidoId) return res.status(400).json({ error: "contenidoId requerido" });
    const compra = await comprarContenido(req.user.id, contenidoId);
    res.status(201).json(compra);
  } catch (error) {
    handleError(error, res);
  }
};

export const misDescargas = async (req, res) => {
  try {
    const descargas = await listarMisDescargas(req.user.id);
    res.json(descargas);
  } catch (error) {
    handleError(error, res);
  }
};

export const download = async (req, res) => {
  try {
    const result = await obtenerDownloadUrl(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const reporte = async (req, res) => {
  try {
    const data = await reporteCreador(req.user.id);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const comprarInvitado = async (req, res) => {
  try {
    const { email, nombre, contenidoId, cuponCodigo } = req.body;
    if (!email) return res.status(400).json({ error: "email requerido" });
    if (!contenidoId) return res.status(400).json({ error: "contenidoId requerido" });
    const result = await comprarContenidoInvitado(email, nombre, contenidoId, cuponCodigo);
    res.status(201).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const bundle = async (req, res) => {
  try {
    const { contenidoIds } = req.body;
    if (!Array.isArray(contenidoIds)) return res.status(400).json({ error: "contenidoIds debe ser un array" });
    const compras = await comprarBundle(req.user.id, contenidoIds);
    res.status(201).json(compras);
  } catch (error) {
    handleError(error, res);
  }
};

export const bundleInvitado = async (req, res) => {
  try {
    const { email, nombre, contenidoIds } = req.body;
    if (!email) return res.status(400).json({ error: "email requerido" });
    if (!Array.isArray(contenidoIds)) return res.status(400).json({ error: "contenidoIds debe ser un array" });
    const compras = await comprarBundleInvitado(email, nombre, contenidoIds);
    res.status(201).json(compras);
  } catch (error) {
    handleError(error, res);
  }
};

export const guardarProgresoHandler = async (req, res) => {
  try {
    const { contenidoId, paginaActual, totalPaginas, emailInvitado } = req.body;
    if (!contenidoId) return res.status(400).json({ error: "contenidoId requerido" });
    if (paginaActual === undefined) return res.status(400).json({ error: "paginaActual requerido" });

    const user = getUserFromOptionalToken(req);
    const progreso = await guardarProgreso(
      user?.id ?? null,
      user?.id ? null : emailInvitado,
      contenidoId,
      paginaActual,
      totalPaginas
    );
    res.json(progreso);
  } catch (error) {
    handleError(error, res);
  }
};

export const obtenerProgresoHandler = async (req, res) => {
  try {
    const { contenidoId } = req.params;
    const { emailInvitado } = req.query;
    const user = getUserFromOptionalToken(req);
    const progreso = await obtenerProgreso(
      user?.id ?? null,
      user?.id ? null : emailInvitado,
      contenidoId
    );
    res.json(progreso ?? null);
  } catch (error) {
    handleError(error, res);
  }
};

export const favoritosContenido = async (req, res) => {
  try {
    const favoritos = await listarFavoritosContenido(req.user.id);
    res.json(favoritos);
  } catch (error) {
    handleError(error, res);
  }
};

export const toggleFavorito = async (req, res) => {
  try {
    const { contenidoId } = req.body;
    if (!contenidoId) return res.status(400).json({ error: "contenidoId requerido" });
    const result = await toggleFavoritoContenido(req.user.id, contenidoId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const checkFavorito = async (req, res) => {
  try {
    const result = await checkFavoritoContenido(req.user.id, req.params.contenidoId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};
