import prisma from "../../lib/prisma.js";

const MONTHS_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ── Perfil ────────────────────────────────────────────────────────────────────

export const getProfile = (userId) =>
  prisma.creatorProfile.findUnique({ where: { userId: Number(userId) } });

export const upsertProfile = (userId, data) =>
  prisma.creatorProfile.upsert({
    where: { userId: Number(userId) },
    create: { userId: Number(userId), ...data },
    update: data,
  });

// ── Link de referido ──────────────────────────────────────────────────────────

export const getLink = (creatorId) => ({
  link: `https://alala.cl/?ref=${creatorId}`,
  creatorId,
});

export const registrarVisita = async (creatorId, ip, userAgent) => {
  const cId = Number(creatorId);
  if (!Number.isInteger(cId) || cId <= 0) throw new Error("creatorId inválido");
  const existe = await prisma.user.findUnique({ where: { id: cId }, select: { id: true } });
  if (!existe) throw new Error("Creador no encontrado");
  return prisma.refLinkVisit.create({ data: { creatorId: cId, ip, userAgent } });
};

// ── Stats (visitas + conversiones) ────────────────────────────────────────────

export const getStats = async (creatorId) => {
  const cId = Number(creatorId);

  const [visitas, convContenido, convMicro, convEbook] = await Promise.all([
    prisma.refLinkVisit.count({ where: { creatorId: cId } }),
    prisma.compraContenido.count({
      where: { contenido: { creatorId: cId }, estado: "completada" },
    }),
    prisma.compraMicroContenido.count({
      where: { microContenido: { autorId: cId }, estado: "completada" },
    }),
    prisma.compraMiniEbook.count({
      where: { miniEbook: { autorId: cId }, estado: "completada" },
    }),
  ]);

  const conversiones = convContenido + convMicro + convEbook;
  const tasaConversion = visitas > 0
    ? Number(((conversiones / visitas) * 100).toFixed(1))
    : 0;

  return {
    visitas,
    conversiones,
    tasaConversion,
    link: `https://alala.cl/?ref=${creatorId}`,
  };
};

// ── Ingresos por mes (últimos 12 meses) ───────────────────────────────────────

export const getEarningsMonthly = async (creatorId) => {
  const cId = Number(creatorId);
  const desde = new Date();
  desde.setMonth(desde.getMonth() - 11);
  desde.setDate(1);
  desde.setHours(0, 0, 0, 0);

  const [vc, vm, ve] = await Promise.all([
    prisma.compraContenido.findMany({
      where: { contenido: { creatorId: cId }, estado: "completada", createdAt: { gte: desde } },
      select: { monto: true, pagoCreador: true, comisionPlataforma: true, createdAt: true },
    }),
    prisma.compraMicroContenido.findMany({
      where: { microContenido: { autorId: cId }, estado: "completada", createdAt: { gte: desde } },
      select: { monto: true, pagoCreador: true, comisionPlataforma: true, createdAt: true },
    }),
    prisma.compraMiniEbook.findMany({
      where: { miniEbook: { autorId: cId }, estado: "completada", createdAt: { gte: desde } },
      select: { monto: true, pagoCreador: true, comisionPlataforma: true, createdAt: true },
    }),
  ]);

  const map = {};
  [...vc, ...vm, ...ve].forEach((v) => {
    const d = new Date(v.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map[key]) map[key] = { mes: MONTHS_ES[d.getMonth()], monto: 0, pagoCreador: 0, comision: 0, ventas: 0 };
    map[key].monto += v.monto;
    map[key].pagoCreador += v.pagoCreador;
    map[key].comision += v.comisionPlataforma;
    map[key].ventas += 1;
  });

  const meses = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    meses.push(map[key] ?? { mes: MONTHS_ES[d.getMonth()], monto: 0, pagoCreador: 0, comision: 0, ventas: 0 });
  }

  const all = [...vc, ...vm, ...ve];
  return {
    meses,
    totales: {
      monto:       all.reduce((s, v) => s + v.monto, 0),
      pagoCreador: all.reduce((s, v) => s + v.pagoCreador, 0),
      comision:    all.reduce((s, v) => s + v.comisionPlataforma, 0),
      ventas:      all.length,
    },
  };
};

// ── Conversión vista → compra ─────────────────────────────────────────────────

export const getConversion = async (creatorId) => {
  const cId = Number(creatorId);

  const [visitas, cc, cm, ce] = await Promise.all([
    prisma.refLinkVisit.count({ where: { creatorId: cId } }),
    prisma.compraContenido.count({
      where: { contenido: { creatorId: cId }, estado: "completada" },
    }),
    prisma.compraMicroContenido.count({
      where: { microContenido: { autorId: cId }, estado: "completada" },
    }),
    prisma.compraMiniEbook.count({
      where: { miniEbook: { autorId: cId }, estado: "completada" },
    }),
  ]);

  const compras = cc + cm + ce;
  const porcentaje = visitas > 0 ? Number(((compras / visitas) * 100).toFixed(1)) : 0;
  return { visitas, compras, porcentaje };
};
