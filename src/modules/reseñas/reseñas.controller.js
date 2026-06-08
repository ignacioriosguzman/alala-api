import { sanitizeObject } from "../../utils/sanitize.js";
import {
  createReseña,
  getReseñasByContenido,
  getPromedioReseñas,
} from "./reseñas.service.js";

const handleError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Reseñas] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

export const crear = async (req, res) => {
  try {
    const data = sanitizeObject({ ...req.body, userId: req.user.id });
    if (!data.contenidoId) return res.status(400).json({ error: "contenidoId requerido" });
    const reseña = await createReseña(data);
    res.status(201).json(reseña);
  } catch (error) {
    handleError(error, res);
  }
};

export const listarPorContenido = async (req, res) => {
  try {
    const reseñas = await getReseñasByContenido(req.params.contenidoId);
    res.json(reseñas);
  } catch (error) {
    handleError(error, res);
  }
};

export const promedio = async (req, res) => {
  try {
    const result = await getPromedioReseñas(req.params.contenidoId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};
