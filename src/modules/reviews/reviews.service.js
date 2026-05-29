import prisma from "../../lib/prisma.js";



export const createReview = async (data) => {
  return prisma.review.create({
    data: {
      cursoId: Number(data.cursoId),
      userId: Number(data.userId),
      rating: Number(data.rating),
      comentario: data.comentario,
    },
    include: {
      user: { select: { id: true, nombre: true } },
    },
  });
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
