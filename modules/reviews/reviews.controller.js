import { createReview, getReviewsByCurso, getPromedioReviews } from "./reviews.service.js";

const handleError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Reviews] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

export const crear = async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user.id };
    const review = await createReview(data);
    res.status(201).json(review);
  } catch (error) {
    handleError(error, res);
  }
};

export const listarPorCurso = async (req, res) => {
  try {
    const reviews = await getReviewsByCurso(req.params.cursoId);
    res.json(reviews);
  } catch (error) {
    handleError(error, res);
  }
};

export const promedio = async (req, res) => {
  try {
    const result = await getPromedioReviews(req.params.cursoId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};
