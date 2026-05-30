import { toggleFavorite, getFavoritesByUser, checkFavorite } from "./favorites.service.js";

const handleError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Favorites] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

export const toggle = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: "courseId requerido" });
    const result = await toggleFavorite(req.user.id, courseId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const listar = async (req, res) => {
  try {
    const favorites = await getFavoritesByUser(req.user.id);
    res.json(favorites);
  } catch (error) {
    handleError(error, res);
  }
};

export const check = async (req, res) => {
  try {
    const result = await checkFavorite(req.user.id, req.params.courseId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};
