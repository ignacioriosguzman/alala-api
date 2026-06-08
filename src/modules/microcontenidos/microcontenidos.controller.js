import { sanitizeObject } from "../../utils/sanitize.js";
import {
  createMicro,
  listarMicros,
  listarPorTipo,
  getMicroById,
  listarMisMicros,
  updateMicro,
  togglePublicado,
  deleteMicro,
  upsellMicros,
  toggleFavoritoMicro,
  listarFavoritosMicro,
  checkFavoritoMicro,
  guardarProgresoMicro,
  obtenerProgresoMicro,
  comprarMicro,
  comprarMicroInvitado,
  verificarCompraMicro,
  misComprasMicro,
} from "./microcontenidos.service.js";

const handleError = (error, res) => {
  if (error.name?.startsWith?.('Prisma') || String(error.code ?? '').startsWith('P')) {
    console.error('[MicroContenido] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

export const crear = async (req, res) => {
  try {
    const micro = await createMicro(sanitizeObject(req.body), req.user.id);
    res.status(201).json(micro);
  } catch (error) {
    handleError(error, res);
  }
};

export const listar = async (req, res) => {
  try {
    const micros = await listarMicros(req.query);
    res.json(micros);
  } catch (error) {
    handleError(error, res);
  }
};

export const porTipo = async (req, res) => {
  try {
    const micros = await listarPorTipo(req.params.tipo);
    res.json(micros);
  } catch (error) {
    handleError(error, res);
  }
};

export const obtener = async (req, res) => {
  try {
    const micro = await getMicroById(req.params.id);
    if (!micro || !micro.publicado) {
      return res.status(404).json({ error: "MicroContenido no encontrado" });
    }

    // Si el microcontenido tiene precio, verificar compra antes de entregar el contenido completo
    if ((micro.precio ?? 0) > 0) {
      const userId = req.user?.id ?? null;
      const { comprado } = await verificarCompraMicro(userId, null, req.params.id);
      if (!comprado) {
        const { contenido, ...preview } = micro;
        return res.json({ ...preview, contenido: null, acceso: 'bloqueado' });
      }
    }

    res.json(micro);
  } catch (error) {
    handleError(error, res);
  }
};

export const misMicros = async (req, res) => {
  try {
    const micros = await listarMisMicros(req.user.id);
    res.json(micros);
  } catch (error) {
    handleError(error, res);
  }
};

export const editar = async (req, res) => {
  try {
    const micro = await updateMicro(req.params.id, sanitizeObject(req.body), req.user.id);
    res.json(micro);
  } catch (error) {
    handleError(error, res);
  }
};

export const cambiarPublicado = async (req, res) => {
  try {
    const { publicado } = req.body;
    if (publicado === undefined) {
      return res.status(400).json({ error: "Campo 'publicado' requerido" });
    }
    const micro = await togglePublicado(req.params.id, publicado, req.user.id);
    res.json(micro);
  } catch (error) {
    handleError(error, res);
  }
};

export const eliminar = async (req, res) => {
  try {
    await deleteMicro(req.params.id, req.user.id);
    res.json({ message: "MicroContenido eliminado" });
  } catch (error) {
    handleError(error, res);
  }
};

export const upsell = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 3;
    const data = await upsellMicros(req.params.id, limit);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

// ── Favoritos ──
export const toggleFavorito = async (req, res) => {
  try {
    const result = await toggleFavoritoMicro(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const misFavoritos = async (req, res) => {
  try {
    const data = await listarFavoritosMicro(req.user.id);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const checkFavorito = async (req, res) => {
  try {
    const data = await checkFavoritoMicro(req.params.id, req.user.id);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

// ── Progreso ──
export const guardarProgreso = async (req, res) => {
  try {
    const { emailInvitado, porcentaje, leidoCompleto } = req.body;
    const userId = req.user?.id ?? null;
    const prog = await guardarProgresoMicro(req.params.id, { userId, emailInvitado, porcentaje, leidoCompleto });
    res.json(prog);
  } catch (error) {
    handleError(error, res);
  }
};

export const obtenerProgreso = async (req, res) => {
  try {
    const { userId, email } = req.query;
    const prog = await obtenerProgresoMicro(req.params.id, userId ? Number(userId) : null, email || null);
    res.json(prog);
  } catch (error) {
    handleError(error, res);
  }
};

// ── Compras ──
export const comprar = async (req, res) => {
  try {
    const compra = await comprarMicro(req.user.id, req.params.id);
    res.json(compra);
  } catch (error) {
    handleError(error, res);
  }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const comprarInvitado = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Email inválido" });
    const compra = await comprarMicroInvitado(email, req.params.id);
    res.json(compra);
  } catch (error) {
    handleError(error, res);
  }
};

export const checkCompra = async (req, res) => {
  try {
    const { userId, email } = req.query;
    const data = await verificarCompraMicro(
      userId ? Number(userId) : null,
      email || null,
      req.params.id
    );
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const misCompras = async (req, res) => {
  try {
    const data = await misComprasMicro(req.user.id);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};
