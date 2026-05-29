import prisma from "../../lib/prisma.js";



export const registrarEvento = async (data) => {
  return prisma.eventoAnalitico.create({
    data: {
      tipo: data.tipo,
      cursoId: data.cursoId ? Number(data.cursoId) : null,
      userId: data.userId ? Number(data.userId) : null,
      metadata: data.metadata ?? {},
    },
  });
};

export const getDashboardCurso = async (cursoId) => {
  const id = Number(cursoId);
  const [vistas, clicks, compras] = await Promise.all([
    prisma.eventoAnalitico.count({ where: { tipo: "vista", cursoId: id } }),
    prisma.eventoAnalitico.count({ where: { tipo: "click_comprar", cursoId: id } }),
    prisma.venta.count({ where: { courseId: id, estado: "PAGADO" } }),
  ]);

  const tasaConversion = clicks > 0 ? ((compras / clicks) * 100).toFixed(2) : "0.00";

  return {
    cursoId: id,
    vistas,
    clicksComprar: clicks,
    compras,
    tasaConversion: `${tasaConversion}%`,
  };
};

export const getResumenInstructor = async (instructorUserId) => {
  const id = Number(instructorUserId);

  const cursos = await prisma.course.findMany({
    where: { instructorUserId: id },
    select: { id: true },
  });
  const cursoIds = cursos.map((c) => c.id);

  const [totalVistas, totalCompras] = await Promise.all([
    prisma.eventoAnalitico.count({
      where: { tipo: "vista", cursoId: { in: cursoIds } },
    }),
    prisma.venta.count({
      where: { instructorUserId: id, estado: "PAGADO" },
    }),
  ]);

  const hoy = new Date();
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(hoy.getMonth() - 5);
  seisMesesAtras.setDate(1);
  seisMesesAtras.setHours(0, 0, 0, 0);

  const ventas = await prisma.venta.findMany({
    where: {
      instructorUserId: id,
      estado: "PAGADO",
      createdAt: { gte: seisMesesAtras },
    },
    select: { monto: true, createdAt: true },
  });

  const ingresosPorMes = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    ingresosPorMes[key] = 0;
  }

  for (const v of ventas) {
    const d = new Date(v.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (ingresosPorMes[key] !== undefined) {
      ingresosPorMes[key] += v.monto;
    }
  }

  return {
    instructorId: id,
    totalVistas,
    totalCompras,
    ingresosPorMes: Object.entries(ingresosPorMes)
      .map(([mes, monto]) => ({ mes, monto }))
      .sort((a, b) => a.mes.localeCompare(b.mes)),
  };
};
