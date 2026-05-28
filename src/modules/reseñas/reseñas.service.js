import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createReseña = async (data) => {
  const contenidoId = Number(data.contenidoId);
  const userId = Number(data.userId);

  const compra = await prisma.compraContenido.findUnique({
    where: {
      userId_contenidoId: {
        userId,
        contenidoId,
      },
    },
  });

  if (!compra) throw new Error("Debes comprar el contenido antes de reseñarlo");

  const existente = await prisma.resenaContenido.findFirst({
    where: { userId, contenidoId },
  });

  if (existente) throw new Error("Ya has reseñado este contenido");

  const reseña = await prisma.resenaContenido.create({
    data: {
      contenidoId,
      userId,
      rating: Number(data.rating),
      comentario: data.comentario,
    },
    include: {
      user: { select: { id: true, nombre: true } },
    },
  });

  const reseñas = await prisma.resenaContenido.findMany({
    where: { contenidoId },
    select: { rating: true },
  });

  const total = reseñas.length;
  const promedio = total > 0
    ? reseñas.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;

  await prisma.contenidoDigital.update({
    where: { id: contenidoId },
    data: { rating: Number(promedio.toFixed(2)), reviews: total },
  });

  return reseña;
};

export const getReseñasByContenido = (contenidoId) => {
  return prisma.resenaContenido.findMany({
    where: { contenidoId: Number(contenidoId) },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, nombre: true } },
    },
  });
};

export const getPromedioReseñas = async (contenidoId) => {
  const reseñas = await prisma.resenaContenido.findMany({
    where: { contenidoId: Number(contenidoId) },
    select: { rating: true },
  });
  const total = reseñas.length;
  const promedio = total > 0
    ? reseñas.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;
  return { promedio: Number(promedio.toFixed(2)), total };
};
