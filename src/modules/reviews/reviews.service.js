import prisma from "../../lib/prisma.js";



export const createReview = async (data) => {
  const cursoId = Number(data.cursoId);
  const userId = Number(data.userId);

  // Verificar que el usuario está matriculado en el curso antes de reseñar
  const matriculado = await prisma.enrollment.findFirst({
    where: { userId, courseId: cursoId },
  });
  if (!matriculado) throw new Error("Debes estar inscrito en el curso para reseñarlo");

  // Verificar que no haya reseñado ya
  const existente = await prisma.review.findFirst({
    where: { userId, cursoId },
  });
  if (existente) throw new Error("Ya has reseñado este curso");

  const rating = Number(data.rating);
  if (!rating || rating < 1 || rating > 5) throw new Error("La calificación debe ser entre 1 y 5");

  const review = await prisma.review.create({
    data: {
      cursoId,
      userId,
      rating,
      comentario: data.comentario,
    },
    include: {
      user: { select: { id: true, nombre: true } },
    },
  });

  // Recalcular rating promedio del curso
  const todas = await prisma.review.findMany({
    where: { cursoId },
    select: { rating: true },
  });
  const total = todas.length;
  const promedio = total > 0 ? todas.reduce((sum, r) => sum + r.rating, 0) / total : 0;

  await prisma.course.update({
    where: { id: cursoId },
    data: { rating: parseFloat(promedio.toFixed(2)), reviews: total },
  });

  return review;
};

export const getReviewsByCurso = async (cursoId) => {
  return prisma.review.findMany({
    where: { cursoId: Number(cursoId) },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, nombre: true } },
    },
  });
};

export const getPromedioReviews = async (cursoId) => {
  const reviews = await prisma.review.findMany({
    where: { cursoId: Number(cursoId) },
    select: { rating: true },
  });
  const total = reviews.length;
  const promedio = total > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;
  return { promedio: Number(promedio.toFixed(2)), total };
};
