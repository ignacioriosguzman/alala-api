import {
  createEbook,
  listarEbooks,
  getEbookById,
  listarMisEbooks,
  updateEbook,
  cambiarStatus,
  deleteEbook,
  generarArchivosEbook,
  upsellEbooks,
  toggleFavorito,
  listarFavoritos,
  checkFavorito,
  guardarProgreso,
  obtenerProgreso,
  comprarEbook,
  comprarEbookInvitado,
  verificarCompra,
  misCompras,
  estadisticasAutor,
  crearResena,
  listarResenas,
} from "./miniebooks.service.js";

const handleError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[MiniEbook] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

// ── CRUD ──────────────────────────────────────────────────────────

export const crear = async (req, res) => {
  try {
    const ebook = await createEbook(req.body, req.user.id);
    res.status(201).json(ebook);
  } catch (error) {
    handleError(error, res);
  }
};

export const listar = async (req, res) => {
  try {
    const ebooks = await listarEbooks(req.query);
    res.json(ebooks);
  } catch (error) {
    handleError(error, res);
  }
};

export const obtener = async (req, res) => {
  try {
    const ebook = await getEbookById(req.params.id);
    if (!ebook || ebook.status !== "activo") {
      return res.status(404).json({ error: "Mini-ebook no encontrado" });
    }
    res.json(ebook);
  } catch (error) {
    handleError(error, res);
  }
};

export const misEbooks = async (req, res) => {
  try {
    const ebooks = await listarMisEbooks(req.user.id);
    res.json(ebooks);
  } catch (error) {
    handleError(error, res);
  }
};

export const editar = async (req, res) => {
  try {
    const ebook = await updateEbook(req.params.id, req.body, req.user.id);
    res.json(ebook);
  } catch (error) {
    handleError(error, res);
  }
};

export const cambiarEstado = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Campo 'status' requerido" });
    }
    const ebook = await cambiarStatus(req.params.id, status, req.user.id);
    res.json(ebook);
  } catch (error) {
    handleError(error, res);
  }
};

export const eliminar = async (req, res) => {
  try {
    await deleteEbook(req.params.id, req.user.id);
    res.json({ message: "Mini-ebook eliminado" });
  } catch (error) {
    handleError(error, res);
  }
};

// ── Generación ────────────────────────────────────────────────────

export const generar = async (req, res) => {
  try {
    const resultado = await generarArchivosEbook(req.params.id, req.user.id);
    res.json(resultado);
  } catch (error) {
    handleError(error, res);
  }
};

// ── Upsell ────────────────────────────────────────────────────────

export const upsell = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 3;
    const data = await upsellEbooks(req.params.id, limit);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

// ── Favoritos ─────────────────────────────────────────────────────

export const toggleFav = async (req, res) => {
  try {
    const result = await toggleFavorito(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const misFavoritos = async (req, res) => {
  try {
    const data = await listarFavoritos(req.user.id);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const checkFav = async (req, res) => {
  try {
    const data = await checkFavorito(req.params.id, req.user.id);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

// ── Progreso ──────────────────────────────────────────────────────

export const saveProgreso = async (req, res) => {
  try {
    const { emailInvitado, porcentaje, leidoCompleto } = req.body;
    const userId = req.user?.id ?? null;
    const prog = await guardarProgreso(req.params.id, { userId, emailInvitado, porcentaje, leidoCompleto });
    res.json(prog);
  } catch (error) {
    handleError(error, res);
  }
};

export const getProgreso = async (req, res) => {
  try {
    const { userId, email } = req.query;
    const prog = await obtenerProgreso(req.params.id, userId ? Number(userId) : null, email || null);
    res.json(prog);
  } catch (error) {
    handleError(error, res);
  }
};

// ── Compras ───────────────────────────────────────────────────────

export const comprar = async (req, res) => {
  try {
    const compra = await comprarEbook(req.user.id, req.params.id);
    res.json(compra);
  } catch (error) {
    handleError(error, res);
  }
};

export const comprarInvitado = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });
    const compra = await comprarEbookInvitado(email, req.params.id);
    res.json(compra);
  } catch (error) {
    handleError(error, res);
  }
};

export const checkCompra = async (req, res) => {
  try {
    const { userId, email } = req.query;
    const data = await verificarCompra(
      userId ? Number(userId) : null,
      email || null,
      req.params.id
    );
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const getMisCompras = async (req, res) => {
  try {
    const data = await misCompras(req.user.id);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

// ── Estadísticas ──────────────────────────────────────────────────

export const estadisticas = async (req, res) => {
  try {
    const data = await estadisticasAutor(req.user.id);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

// ── Reseñas ───────────────────────────────────────────────────────

export const crearResenaCtrl = async (req, res) => {
  try {
    const { rating, comentario } = req.body;
    if (!rating || !comentario) {
      return res.status(400).json({ error: "Rating y comentario requeridos" });
    }
    const resena = await crearResena(req.params.id, req.user.id, rating, comentario);
    res.status(201).json(resena);
  } catch (error) {
    handleError(error, res);
  }
};

export const listarResenasCtrl = async (req, res) => {
  try {
    const resenas = await listarResenas(req.params.id);
    res.json(resenas);
  } catch (error) {
    handleError(error, res);
  }
};
