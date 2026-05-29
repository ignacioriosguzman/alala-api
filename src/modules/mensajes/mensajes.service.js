import prisma from "../../lib/prisma.js";



export const createMensaje = async (data) => {
  return prisma.mensaje.create({
    data: {
      cursoId: Number(data.cursoId),
      remitenteId: Number(data.remitenteId),
      destinatarioId: Number(data.destinatarioId),
      texto: data.texto,
    },
    include: {
      curso: { select: { id: true, titulo: true } },
    },
  });
};

export const getMensajesByCurso = async (cursoId) => {
  return prisma.mensaje.findMany({
    where: { cursoId: Number(cursoId) },
    orderBy: { createdAt: "asc" },
    include: {
      curso: { select: { id: true, titulo: true } },
    },
  });
};

export const countNoLeidos = async (destinatarioId) => {
  return prisma.mensaje.count({
    where: {
      destinatarioId: Number(destinatarioId),
      leido: false,
    },
  });
};
