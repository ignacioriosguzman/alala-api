import prisma from "../../lib/prisma.js";

const MONTHS_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ── Toggles en memoria ────────────────────────────────────────────────────────
export const seccionesEstado = {
  micronovelas: true, manuales: true, cursos: true,
  miniebooks: true, microcontenidos: true,
};

// ════════════════════════════════════════════════════════════════════════════
// MÉTRICAS GENERALES
// ════════════════════════════════════════════════════════════════════════════
export const getMetricas = async () => {
  const [
    totalUsuarios, totalCreadores, totalAdmins,
    totalCursos, totalContenidos, totalMicrocursos, totalManuales,
    totalMicroContenidos, totalMicronovelas, totalMiniEbooks,
    contenidosActivos, contenidosBorrador,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CREATOR" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.course.count(),
    prisma.contenidoDigital.count(),
    prisma.contenidoDigital.count({ where: { tipo: "microcurso" } }),
    prisma.contenidoDigital.count({ where: { tipo: "manual" } }),
    prisma.microContenido.count({ where: { tipo: { notIn: ["micronovela","relato"] } } }),
    prisma.microContenido.count({ where: { tipo: { in: ["micronovela","relato"] } } }),
    prisma.miniEbook.count(),
    prisma.contenidoDigital.count({ where: { status: "activo" } }),
    prisma.contenidoDigital.count({ where: { status: "borrador" } }),
  ]);
  return {
    totalUsuarios, totalCreadores,
    totalEstudiantes: totalUsuarios - totalCreadores - totalAdmins,
    totalAdmins, totalCursos, totalContenidos, totalMicrocursos, totalManuales,
    totalMicroContenidos, totalMicronovelas, totalMiniEbooks,
    contenidosActivos, contenidosBorrador,
    seccionesEstado: { ...seccionesEstado },
  };
};

// ════════════════════════════════════════════════════════════════════════════
// ACTIVIDAD RECIENTE
// ════════════════════════════════════════════════════════════════════════════
export const getActividad = async () => {
  const ahora = new Date();
  const diasLabels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(ahora);
    d.setDate(d.getDate() - i);
    diasLabels.push(d.toISOString().slice(0, 10));
  }
  const usuariosPorDia = await Promise.all(
    diasLabels.map(async (dia) => {
      const inicio = new Date(dia);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 1);
      const count = await prisma.user.count({ where: { createdAt: { gte: inicio, lt: fin } } });
      return { dia, count };
    })
  );
  const hace7  = new Date(ahora); hace7.setDate(ahora.getDate() - 7);
  const hace30 = new Date(ahora); hace30.setDate(ahora.getDate() - 30);
  const hoy = new Date(ahora.toISOString().slice(0, 10));

  const [
    nuevosHoy, nuevosSemana, nuevosMes, creadoresNuevosMes,
    contenidosNuevosMes, topVendidos, ultimosUsuarios,
    ultimasVentasC, ultimasComprasContenido,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: hoy } } }),
    prisma.user.count({ where: { createdAt: { gte: hace7 } } }),
    prisma.user.count({ where: { createdAt: { gte: hace30 } } }),
    prisma.user.count({ where: { role: "CREATOR", createdAt: { gte: hace30 } } }),
    prisma.contenidoDigital.count({ where: { createdAt: { gte: hace30 } } }),
    prisma.contenidoDigital.findMany({
      where: { status: "activo" }, orderBy: { ventas: "desc" }, take: 10,
      select: { id: true, titulo: true, tipo: true, ventas: true, rating: true, creator: { select: { nombre: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" }, take: 8,
      select: { id: true, nombre: true, email: true, role: true, createdAt: true, activo: true },
    }),
    // Últimas ventas de cursos
    prisma.venta.findMany({
      where: { estado: "PAGADO" }, orderBy: { createdAt: "desc" }, take: 5,
      select: { monto: true, createdAt: true, course: { select: { titulo: true } }, user: { select: { nombre: true } } },
    }),
    // Últimas compras de contenido
    prisma.compraContenido.findMany({
      where: { estado: "completada" }, orderBy: { createdAt: "desc" }, take: 5,
      select: { monto: true, createdAt: true, contenido: { select: { titulo: true } }, user: { select: { nombre: true } } },
    }),
  ]);

  const ultimasVentas = [
    ...ultimasVentasC.map(v => ({ titulo: v.course?.titulo ?? "—", comprador: v.user?.nombre ?? "—", monto: v.monto, fecha: v.createdAt, tipo: "curso" })),
    ...ultimasComprasContenido.map(v => ({ titulo: v.contenido?.titulo ?? "—", comprador: v.user?.nombre ?? "—", monto: v.monto, fecha: v.createdAt, tipo: "contenido" })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 8);

  return {
    nuevosHoy, nuevosSemana, nuevosMes, creadoresNuevosMes, contenidosNuevosMes,
    usuariosPorDia, topVendidos, ultimosUsuarios, ultimasVentas,
  };
};

// ════════════════════════════════════════════════════════════════════════════
// FINANZAS
// ════════════════════════════════════════════════════════════════════════════
export const getFinanzas = async () => {
  const [agCursos, agContenido, agMicro, agEbooks, ventasPorCategoria] = await Promise.all([
    prisma.venta.aggregate({ where: { estado: "PAGADO" }, _sum: { monto: true, comisionPlataforma: true, pagoInstructor: true }, _count: true }),
    prisma.compraContenido.aggregate({ where: { estado: "completada" }, _sum: { monto: true, comisionPlataforma: true, pagoCreador: true }, _count: true }),
    prisma.compraMicroContenido.aggregate({ where: { estado: "completada" }, _sum: { monto: true, comisionPlataforma: true, pagoCreador: true }, _count: true }),
    prisma.compraMiniEbook.aggregate({ where: { estado: "completada" }, _sum: { monto: true, comisionPlataforma: true, pagoCreador: true }, _count: true }),
    prisma.contenidoDigital.groupBy({ by: ["categoria"], _sum: { ventas: true }, orderBy: { _sum: { ventas: "desc" } }, take: 8 }),
  ]);

  const comprasContenido = await prisma.compraContenido.findMany({
    where: { estado: "completada" },
    select: { pagoCreador: true, contenido: { select: { creatorId: true, creator: { select: { nombre: true, email: true } } } } },
  });
  const rankingMap = new Map();
  for (const c of comprasContenido) {
    const cid = c.contenido.creatorId;
    if (!rankingMap.has(cid)) rankingMap.set(cid, { id: cid, nombre: c.contenido.creator.nombre, email: c.contenido.creator.email, ingresos: 0, ventas: 0 });
    rankingMap.get(cid).ingresos += c.pagoCreador ?? 0;
    rankingMap.get(cid).ventas++;
  }
  const rankingCreadores = Array.from(rankingMap.values()).sort((a, b) => b.ingresos - a.ingresos).slice(0, 10);

  const ventasTotales = (agCursos._sum.monto ?? 0) + (agContenido._sum.monto ?? 0) + (agMicro._sum.monto ?? 0) + (agEbooks._sum.monto ?? 0);
  const comisionTotal = (agCursos._sum.comisionPlataforma ?? 0) + (agContenido._sum.comisionPlataforma ?? 0) + (agMicro._sum.comisionPlataforma ?? 0) + (agEbooks._sum.comisionPlataforma ?? 0);
  const gananciasCreadores = (agCursos._sum.pagoInstructor ?? 0) + (agContenido._sum.pagoCreador ?? 0) + (agMicro._sum.pagoCreador ?? 0) + (agEbooks._sum.pagoCreador ?? 0);
  const totalVentas = (agCursos._count ?? 0) + (agContenido._count ?? 0) + (agMicro._count ?? 0) + (agEbooks._count ?? 0);

  return {
    ventasTotales, comisionTotal, gananciasCreadores, totalVentas,
    desglose: {
      cursos:    { monto: agCursos._sum.monto ?? 0,    ventas: agCursos._count ?? 0 },
      contenido: { monto: agContenido._sum.monto ?? 0, ventas: agContenido._count ?? 0 },
      micro:     { monto: agMicro._sum.monto ?? 0,     ventas: agMicro._count ?? 0 },
      ebooks:    { monto: agEbooks._sum.monto ?? 0,    ventas: agEbooks._count ?? 0 },
    },
    ventasPorCategoria: ventasPorCategoria.map(v => ({ categoria: v.categoria, ventas: v._sum.ventas ?? 0 })),
    rankingCreadores,
  };
};

// ════════════════════════════════════════════════════════════════════════════
// VENTAS POR MES (últimos 12 meses — todos los tipos)
// ════════════════════════════════════════════════════════════════════════════
export const getVentasPorMes = async () => {
  const desde = new Date();
  desde.setMonth(desde.getMonth() - 11);
  desde.setDate(1);
  desde.setHours(0, 0, 0, 0);

  const [vc, vm, ve, vCursos] = await Promise.all([
    prisma.compraContenido.findMany({
      where: { estado: "completada", createdAt: { gte: desde } },
      select: { monto: true, comisionPlataforma: true, pagoCreador: true, createdAt: true },
    }),
    prisma.compraMicroContenido.findMany({
      where: { estado: "completada", createdAt: { gte: desde } },
      select: { monto: true, comisionPlataforma: true, pagoCreador: true, createdAt: true },
    }),
    prisma.compraMiniEbook.findMany({
      where: { estado: "completada", createdAt: { gte: desde } },
      select: { monto: true, comisionPlataforma: true, pagoCreador: true, createdAt: true },
    }),
    prisma.venta.findMany({
      where: { estado: "PAGADO", createdAt: { gte: desde } },
      select: { monto: true, comisionPlataforma: true, pagoInstructor: true, createdAt: true },
    }),
  ]);

  const map = {};
  const addToMap = (v, tipo) => {
    const d = new Date(v.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    if (!map[key]) map[key] = { mes: MONTHS_ES[d.getMonth()], monto: 0, comision: 0, pagoCreador: 0, ventas: 0 };
    map[key].monto += v.monto;
    map[key].comision += v.comisionPlataforma;
    map[key].pagoCreador += v.pagoCreador ?? v.pagoInstructor ?? 0;
    map[key].ventas++;
  };
  [...vc, ...vm, ...ve].forEach(v => addToMap(v, "digital"));
  vCursos.forEach(v => addToMap({ ...v, pagoCreador: v.pagoInstructor }, "curso"));

  const meses = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    meses.push(map[key] ?? { mes: MONTHS_ES[d.getMonth()], monto: 0, comision: 0, pagoCreador: 0, ventas: 0 });
  }
  return meses;
};

// ════════════════════════════════════════════════════════════════════════════
// USUARIOS — listado con filtros y paginación
// ════════════════════════════════════════════════════════════════════════════
export const getUsuarios = async ({ role, search, page = 1, limit = 30, activo } = {}) => {
  const where = {};
  if (role)   where.role   = role;
  if (activo !== undefined) where.activo = activo === "true" || activo === true;
  if (search) where.OR = [
    { nombre: { contains: search, mode: "insensitive" } },
    { email:  { contains: search, mode: "insensitive" } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [usuarios, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: Number(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true, nombre: true, email: true, role: true,
        activo: true, verificado: true, createdAt: true,
        _count: { select: { contenidosCreados: true, comprasContenido: true, matriculas: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { usuarios, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
};

// ════════════════════════════════════════════════════════════════════════════
// USUARIO DETALLE
// ════════════════════════════════════════════════════════════════════════════
export const getUsuarioDetalle = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      creatorProfile: true,
      contenidosCreados: { select: { id: true, titulo: true, tipo: true, status: true, ventas: true, createdAt: true }, take: 10, orderBy: { createdAt: "desc" } },
      comprasContenido: { select: { id: true, monto: true, createdAt: true, contenido: { select: { titulo: true } } }, take: 10, orderBy: { createdAt: "desc" } },
      pagosRecibidos: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { contenidosCreados: true, comprasContenido: true, matriculas: true, pagosRecibidos: true } },
    },
  });
  if (!user) return null;

  // Calcular ganancias totales
  const [ganC, ganM, ganE] = await Promise.all([
    prisma.compraContenido.aggregate({ where: { contenido: { creatorId: Number(id) }, estado: "completada" }, _sum: { pagoCreador: true, monto: true } }),
    prisma.compraMicroContenido.aggregate({ where: { microContenido: { autorId: Number(id) }, estado: "completada" }, _sum: { pagoCreador: true, monto: true } }),
    prisma.compraMiniEbook.aggregate({ where: { miniEbook: { autorId: Number(id) }, estado: "completada" }, _sum: { pagoCreador: true, monto: true } }),
  ]);
  const totalGanado = (ganC._sum.pagoCreador ?? 0) + (ganM._sum.pagoCreador ?? 0) + (ganE._sum.pagoCreador ?? 0);
  const totalPagado = await prisma.pagoCreador.aggregate({ where: { creatorId: Number(id) }, _sum: { monto: true } });
  const pendientePago = totalGanado - (totalPagado._sum.monto ?? 0);

  return { ...user, totalGanado, totalPagado: totalPagado._sum.monto ?? 0, pendientePago };
};

export const cambiarRolUsuario = (id, role) =>
  prisma.user.update({ where: { id: Number(id) }, data: { role }, select: { id: true, nombre: true, role: true } });

export const toggleActivoUsuario = (id, activo) =>
  prisma.user.update({ where: { id: Number(id) }, data: { activo: Boolean(activo) }, select: { id: true, nombre: true, activo: true } });

// ════════════════════════════════════════════════════════════════════════════
// CONTENIDOS — listado admin con filtros
// ════════════════════════════════════════════════════════════════════════════
export const getContenidos = async ({ tipo, status, search, page = 1, limit = 30 } = {}) => {
  const where = {};
  if (tipo)   where.tipo   = tipo;
  if (status) where.status = status;
  if (search) where.OR = [
    { titulo:      { contains: search, mode: "insensitive" } },
    { descripcion: { contains: search, mode: "insensitive" } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [contenidos, total] = await Promise.all([
    prisma.contenidoDigital.findMany({
      where, skip, take: Number(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true, titulo: true, tipo: true, status: true, precio: true,
        ventas: true, rating: true, createdAt: true,
        creator: { select: { id: true, nombre: true, email: true } },
      },
    }),
    prisma.contenidoDigital.count({ where }),
  ]);
  return { contenidos, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
};

export const cambiarEstadoContenido = (id, status) =>
  prisma.contenidoDigital.update({ where: { id: Number(id) }, data: { status }, select: { id: true, titulo: true, status: true } });

export const eliminarContenido = (id) =>
  prisma.contenidoDigital.delete({ where: { id: Number(id) } });

// ════════════════════════════════════════════════════════════════════════════
// CREADORES — listado con stats completos
// ════════════════════════════════════════════════════════════════════════════
export const getCreadores = async () => {
  const creadores = await prisma.user.findMany({
    where: { role: { in: ["CREATOR", "INSTRUCTOR"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, nombre: true, email: true, role: true, activo: true, createdAt: true,
      creatorProfile: { select: { nombrePublico: true, especialidad: true, avatar: true } },
      _count: { select: { contenidosCreados: true, microContenidos: true, miniEbooks: true } },
    },
  });

  // Agregar ganancias por creador
  const results = await Promise.all(
    creadores.map(async (c) => {
      const [ganC, ganM, ganE, totalPagado] = await Promise.all([
        prisma.compraContenido.aggregate({ where: { contenido: { creatorId: c.id }, estado: "completada" }, _sum: { pagoCreador: true }, _count: true }),
        prisma.compraMicroContenido.aggregate({ where: { microContenido: { autorId: c.id }, estado: "completada" }, _sum: { pagoCreador: true }, _count: true }),
        prisma.compraMiniEbook.aggregate({ where: { miniEbook: { autorId: c.id }, estado: "completada" }, _sum: { pagoCreador: true }, _count: true }),
        prisma.pagoCreador.aggregate({ where: { creatorId: c.id }, _sum: { monto: true } }),
      ]);
      const totalGanado = (ganC._sum.pagoCreador ?? 0) + (ganM._sum.pagoCreador ?? 0) + (ganE._sum.pagoCreador ?? 0);
      const totalVentas = (ganC._count ?? 0) + (ganM._count ?? 0) + (ganE._count ?? 0);
      return {
        ...c,
        totalGanado,
        totalVentas,
        totalPagado: totalPagado._sum.monto ?? 0,
        pendientePago: totalGanado - (totalPagado._sum.monto ?? 0),
      };
    })
  );
  return results.sort((a, b) => b.totalGanado - a.totalGanado);
};

// ════════════════════════════════════════════════════════════════════════════
// PAGOS A CREADORES
// ════════════════════════════════════════════════════════════════════════════
export const getPagosPendientes = async () => {
  const creadores = await getCreadores();
  return creadores
    .filter(c => c.pendientePago > 0)
    .sort((a, b) => b.pendientePago - a.pendientePago);
};

export const getHistorialPagos = async () => {
  return prisma.pagoCreador.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { creator: { select: { nombre: true, email: true } } },
  });
};

export const marcarPagado = async (creatorId, { monto, descripcion, referencia, adminId }) => {
  if (!monto || monto <= 0) throw new Error("Monto inválido");
  const creator = await prisma.user.findUnique({ where: { id: Number(creatorId) }, select: { id: true, nombre: true } });
  if (!creator) throw new Error("Creador no encontrado");

  const periodo = new Date().toISOString().slice(0, 7); // "2026-06"
  return prisma.pagoCreador.create({
    data: {
      creatorId: Number(creatorId),
      monto:     Number(monto),
      descripcion,
      referencia,
      periodo,
      adminId:   adminId ? Number(adminId) : null,
      pagadoEn:  new Date(),
    },
    include: { creator: { select: { nombre: true, email: true } } },
  });
};

// ════════════════════════════════════════════════════════════════════════════
// MODERACIÓN
// ════════════════════════════════════════════════════════════════════════════
export const getModeracion = async () => {
  const hace7 = new Date();
  hace7.setDate(hace7.getDate() - 7);
  const [contenidosPendientes, microsPendientes, ebooksPendientes, mensajesRecientes] = await Promise.all([
    prisma.contenidoDigital.findMany({
      where: { status: { in: ["borrador","pausado"] } }, orderBy: { createdAt: "desc" }, take: 20,
      select: { id: true, titulo: true, tipo: true, status: true, createdAt: true, creator: { select: { nombre: true, email: true } } },
    }),
    prisma.microContenido.findMany({
      where: { publicado: false }, orderBy: { creadoEn: "desc" }, take: 10,
      select: { id: true, titulo: true, tipo: true, creadoEn: true, autor: { select: { nombre: true, email: true } } },
    }),
    prisma.miniEbook.findMany({
      where: { status: { in: ["borrador","pausado"] } }, orderBy: { createdAt: "desc" }, take: 10,
      select: { id: true, titulo: true, status: true, createdAt: true, autor: { select: { nombre: true } } },
    }),
    prisma.mensaje.findMany({
      where: { leido: false, createdAt: { gte: hace7 } }, orderBy: { createdAt: "desc" }, take: 15,
      select: { id: true, texto: true, leido: true, createdAt: true, remitenteId: true, destinatarioId: true },
    }),
  ]);
  return {
    contenidosPendientes, microsPendientes, ebooksPendientes, mensajesRecientes,
    totalPendientes: contenidosPendientes.length + microsPendientes.length + ebooksPendientes.length,
  };
};

// ════════════════════════════════════════════════════════════════════════════
// ESTADO DEL SERVIDOR
// ════════════════════════════════════════════════════════════════════════════
export const getEstado = async () => {
  let dbOk = false, dbLatencia = null;
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencia = Date.now() - t0;
    dbOk = true;
  } catch {}
  const uptimeSec = process.uptime();
  return {
    api: "ok",
    db: dbOk ? "ok" : "error",
    dbLatenciaMs: dbLatencia,
    uptimeSec: Math.round(uptimeSec),
    uptimeHuman: formatUptime(uptimeSec),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    memoria: {
      heapUsadoMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  };
};

function formatUptime(sec) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

export const toggleSeccion = (seccion, activo) => {
  if (!(seccion in seccionesEstado)) throw new Error(`Sección desconocida: ${seccion}`);
  seccionesEstado[seccion] = Boolean(activo);
  return { ...seccionesEstado };
};
