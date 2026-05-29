import prisma from "../../lib/prisma.js";



export const getResumen = async (creatorId) => {
  const [totalContenido, totalMicro, ventasContenido, ventasMicro] = await Promise.all([
    prisma.contenidoDigital.count({ where: { creatorId: Number(creatorId) } }),
    prisma.microContenido.count({ where: { autorId: Number(creatorId) } }),
    prisma.compraContenido.count({
      where: {
        contenido: { creatorId: Number(creatorId) },
        estado: "completada",
      },
    }),
    prisma.compraMicroContenido.count({
      where: {
        microContenido: { autorId: Number(creatorId) },
        estado: "completada",
      },
    }),
  ]);

  const gananciasContenido = await prisma.compraContenido.aggregate({
    where: { contenido: { creatorId: Number(creatorId) }, estado: "completada" },
    _sum: { pagoCreador: true },
  });

  const gananciasMicro = await prisma.compraMicroContenido.aggregate({
    where: { microContenido: { autorId: Number(creatorId) }, estado: "completada" },
    _sum: { pagoCreador: true },
  });

  return {
    totalContenidos: totalContenido + totalMicro,
    totalVentas: ventasContenido + ventasMicro,
    gananciasNetas: (gananciasContenido._sum.pagoCreador ?? 0) + (gananciasMicro._sum.pagoCreador ?? 0),
  };
};

export const getMicrocursos = (creatorId) => {
  return prisma.contenidoDigital.findMany({
    where: { creatorId: Number(creatorId), tipo: "microcurso" },
    orderBy: { createdAt: "desc" },
  });
};

export const getManuales = (creatorId) => {
  return prisma.contenidoDigital.findMany({
    where: { creatorId: Number(creatorId), tipo: "manual" },
    orderBy: { createdAt: "desc" },
  });
};

export const getVentas = async (creatorId) => {
  const contenidoIds = await prisma.contenidoDigital.findMany({
    where: { creatorId: Number(creatorId) },
    select: { id: true },
  });
  const ids = contenidoIds.map((c) => c.id);

  const ventasContenido = await prisma.compraContenido.findMany({
    where: { contenidoId: { in: ids }, estado: "completada" },
    orderBy: { createdAt: "desc" },
    include: {
      contenido: { select: { titulo: true, tipo: true } },
      user: { select: { nombre: true, email: true } },
    },
  });

  const microIds = await prisma.microContenido.findMany({
    where: { autorId: Number(creatorId) },
    select: { id: true },
  });
  const mIds = microIds.map((c) => c.id);

  const ventasMicro = await prisma.compraMicroContenido.findMany({
    where: { microContenidoId: { in: mIds }, estado: "completada" },
    orderBy: { createdAt: "desc" },
    include: {
      microContenido: { select: { titulo: true, tipo: true } },
    },
  });

  const todas = [
    ...ventasContenido.map((v) => ({
      id: `c-${v.id}`,
      titulo: v.contenido?.titulo || "—",
      tipo: v.contenido?.tipo || "contenido",
      alumno: v.user?.nombre || v.user?.email || "—",
      monto: v.monto,
      comision: v.comisionPlataforma,
      pagoCreador: v.pagoCreador,
      fecha: v.createdAt,
    })),
    ...ventasMicro.map((v) => ({
      id: `m-${v.id}`,
      titulo: v.microContenido?.titulo || "—",
      tipo: v.microContenido?.tipo || "microcontenido",
      alumno: v.emailInvitado || v.userId || "—",
      monto: v.monto,
      comision: v.comisionPlataforma,
      pagoCreador: v.pagoCreador,
      fecha: v.createdAt,
    })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return todas;
};
