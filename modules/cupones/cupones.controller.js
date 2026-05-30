import {
  crearCupon,
  listarCupones,
  validarCupon,
  desactivarCupon,
} from "./cupones.service.js";

const handleError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Cupones] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

export const crear = async (req, res) => {
  try {
    const cupon = await crearCupon(req.body, req.user.id);
    res.status(201).json(cupon);
  } catch (error) {
    handleError(error, res);
  }
};

export const misCupones = async (req, res) => {
  try {
    const cupones = await listarCupones(req.user.id);
    res.json(cupones);
  } catch (error) {
    handleError(error, res);
  }
};

export const validar = async (req, res) => {
  try {
    const { codigo, contenidoId } = req.query;
    if (!codigo) return res.status(400).json({ error: "codigo requerido" });
    const resultado = await validarCupon(codigo, contenidoId);
    res.json(resultado);
  } catch (error) {
    handleError(error, res);
  }
};

export const desactivar = async (req, res) => {
  try {
    const cupon = await desactivarCupon(req.params.id, req.user.id);
    res.json(cupon);
  } catch (error) {
    handleError(error, res);
  }
};
