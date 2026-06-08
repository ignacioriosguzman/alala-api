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

export const getMensajesByUsuario = async (userId) => {
  const id = Number(userId);
  const mensajes = await prisma.mensaje.findMany({
    where: { OR: [{ destinatarioId: id }, { remitenteId: id }] },
    orderBy: { createdAt: "desc" },
    include: { curso: { select: { id: true, titulo: true } } },
  });
  const remitenteIds = [...new Set(mensajes.map((m) => m.remitenteId))];
  const usuarios = await prisma.user.findMany({
    where: { id: { in: remitenteIds } },
    select: { id: true, nombre: true, email: true },
  });
  const userMap = Object.fromEntries(usuarios.map((u) => [u.id, u]));
  return mensajes.map((m) => ({
    id: m.id,
    remitente: userMap[m.remitenteId]?.nombre || userMap[m.remitenteId]?.email || "Usuario",
    texto: m.texto,
    fecha: m.createdAt,
    cursoId: m.cursoId,
    curso: m.curso?.titulo,
    leido: m.leido,
  }));
};
