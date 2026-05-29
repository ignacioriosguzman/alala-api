import prisma from "../../lib/prisma.js";



export const toggleFavorite = async (userId, courseId) => {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_courseId: {
        userId: Number(userId),
        courseId: Number(courseId),
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
    return { favorito: false };
  }

  await prisma.favorite.create({
    data: {
      userId: Number(userId),
      courseId: Number(courseId),
    },
  });
  return { favorito: true };
};

export const getFavoritesByUser = async (userId) => {
  return prisma.favorite.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: "desc" },
    include: {
      curso: {
        select: {
          id: true,
          titulo: true,
          descripcion: true,
          imagen: true,
          precio: true,
          instructor: true,
        },
      },
    },
  });
};

export const checkFavorite = async (userId, courseId) => {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_courseId: {
        userId: Number(userId),
        courseId: Number(courseId),
      },
    },
  });
  return { favorito: !!existing };
};
