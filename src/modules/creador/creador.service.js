import prisma from "../../lib/prisma.js";

const MONTHS_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export const getResumen = async (creatorId) => {
  const cId = Number(creatorId);
  const desde = new Date();
  desde.setMonth(desde.getMonth() - 5);
  desde.setDate(1);
  desde.setHours(0, 0, 0, 0);

  const [
    totalMicrocursos, totalManuales, totalMicro,
    ventasC, ventasM, ventasE,
    ganC, ganM, ganE,
    recentC, recentM, recentE,
    ultimasC,
    resenasC,
  ] = await Promise.all([
    prisma.contenidoDigital.count({ where: { creatorId: cId, tipo: "microcurso" } }),
    prisma.contenidoDigital.count({ where: { creatorId: cId, tipo: "manual" } }),
    prisma.microContenido.count({ where: { autorId: cId } }),

    prisma.compraContenido.count({ where: { contenido: { creatorId: cId }, estado: "completada" } }),
    prisma.compraMicroContenido.count({ where: { microContenido: { autorId: cId }, estado: "completada" } }),
    prisma.compraMiniEbook.count({ where: { miniEbook: { autorId: cId }, estado: "completada" } }),

    prisma.compraContenido.aggregate({ where: { contenido: { creatorId: cId }, estado: "completada" }, _sum: { pagoCreador: true } }),
    prisma.compraMicroContenido.aggregate({ where: { microContenido: { autorId: cId }, estado: "completada" }, _sum: { pagoCreador: true } }),
    prisma.compraMiniEbook.aggregate({ where: { miniEbook: { autorId: cId }, estado: "completada" }, _sum: { pagoCreador: true } }),

    // Ventas recientes para el chart (últimos 6 meses)
    prisma.compraContenido.findMany({
      where: { contenido: { creatorId: cId }, estado: "completada", createdAt: { gte: desde } },
      select: { pagoCreador: true, createdAt: true },
    }),
    prisma.compraMicroContenido.findMany({
      where: { microContenido: { autorId: cId }, estado: "completada", createdAt: { gte: desde } },
      select: { pagoCreador: true, createdAt: true },
    }),
    prisma.compraMiniEbook.findMany({
      where: { miniEbook: { autorId: cId }, estado: "completada", createdAt: { gte: desde } },
      select: { pagoCreador: true, createdAt: true },
    }),

    // Últimas 5 ventas de contenido
    prisma.compraContenido.findMany({
      where: { contenido: { creatorId: cId }, estado: "completada" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        contenido: { select: { titulo: true, tipo: true } },
        user:      { select: { nombre: true, email: true } },
      },
    }),

    // Rating promedio
    prisma.resenaContenido.aggregate({
      where: { contenido: { creatorId: cId } },
      _avg: { rating: true },
    }),
  ]);

  // Agrupar por mes (últimos 6 meses)
  const map = {};
  [...recentC, ...recentM, ...recentE].forEach((v) => {
    const d = new Date(v.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map[key]) map[key] = { mes: MONTHS_ES[d.getMonth()], valor: 0 };
    map[key].valor += v.pagoCreador;
  });

  const ventasPorMes = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    ventasPorMes.push(map[key] ?? { mes: MONTHS_ES[d.getMonth()], valor: 0 });
  }

  return {
    totalContenidos: totalMicrocursos + totalManuales + totalMicro,
    totalMicrocursos,
    totalManuales,
    totalVentas:    ventasC + ventasM + ventasE,
    gananciasNetas: (ganC._sum.pagoCreador ?? 0) + (ganM._sum.pagoCreador ?? 0) + (ganE._sum.pagoCreador ?? 0),
    resenasPromedio: Number((resenasC._avg.rating ?? 0).toFixed(1)),
    ventasPorMes,
    ultimasVentas: ultimasC.map((v) => ({
      contenido: v.contenido?.titulo ?? "—",
      tipo:      v.contenido?.tipo ?? "contenido",
      comprador: v.user?.nombre ?? v.user?.email ?? "—",
      monto:     v.monto,
      fecha:     v.createdAt,
    })),
  };
};

export const getMicrocursos = (creatorId) =>
  prisma.contenidoDigital.findMany({
    where: { creatorId: Number(creatorId), tipo: "microcurso" },
    orderBy: { createdAt: "desc" },
  });

export const getManuales = (creatorId) =>
  prisma.contenidoDigital.findMany({
    where: { creatorId: Number(creatorId), tipo: "manual" },
    orderBy: { createdAt: "desc" },
  });

export const getVentas = async (creatorId) => {
  const cId = Number(creatorId);

  const contenidoIds = await prisma.contenidoDigital.findMany({
    where: { creatorId: cId },
    select: { id: true },
  });
  const ids  = contenidoIds.map((c) => c.id);

  const microIds = await prisma.microContenido.findMany({
    where: { autorId: cId },
    select: { id: true },
  });
  const mIds = microIds.map((c) => c.id);

  const [ventasC, ventasM] = await Promise.all([
    prisma.compraContenido.findMany({
      where: { contenidoId: { in: ids }, estado: "completada" },
      orderBy: { createdAt: "desc" },
      include: {
        contenido: { select: { titulo: true, tipo: true } },
        user:      { select: { nombre: true, email: true } },
      },
    }),
    prisma.compraMicroContenido.findMany({
      where: { microContenidoId: { in: mIds }, estado: "completada" },
      orderBy: { createdAt: "desc" },
      include: { microContenido: { select: { titulo: true, tipo: true } } },
    }),
  ]);

  return [
    ...ventasC.map((v) => ({
      id:        `c-${v.id}`,
      contenido: v.contenido?.titulo ?? "—",
      tipo:      v.contenido?.tipo ?? "contenido",
      comprador: v.user?.nombre ?? v.user?.email ?? "—",
      monto:     v.monto,
      comision:  v.comisionPlataforma,
      ganancia:  v.pagoCreador,
      fecha:     v.createdAt,
    })),
    ...ventasM.map((v) => ({
      id:        `m-${v.id}`,
      contenido: v.microContenido?.titulo ?? "—",
      tipo:      v.microContenido?.tipo ?? "microcontenido",
      comprador: v.emailInvitado ?? String(v.userId) ?? "—",
      monto:     v.monto,
      comision:  v.comisionPlataforma,
      ganancia:  v.pagoCreador,
      fecha:     v.createdAt,
    })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};
