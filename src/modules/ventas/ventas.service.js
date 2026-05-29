import prisma from "../../lib/prisma.js";




export const getVentasInstructor = async (instructorUserId) => {
  const ventas = await prisma.venta.findMany({
    where: { instructorUserId, estado: 'PAGADO' },
    orderBy: { createdAt: 'desc' },
    include: {
      course: { select: { titulo: true, precio: true } },
      user: { select: { nombre: true, email: true } },
    },
  });

  const saldo = await prisma.instructorSaldo.findUnique({
    where: { userId: instructorUserId },
  });

  const montoTotal = ventas.reduce((acc, v) => acc + v.pagoInstructor, 0);
  const comisionTotal = ventas.reduce((acc, v) => acc + v.comisionPlataforma, 0);

  return {
    ventas,
    resumen: {
      totalVentas: ventas.length,
      montoTotal,
      comisionPlataforma: comisionTotal,
      saldoPendiente: saldo?.saldoPendiente ?? 0,
      saldoAcumulado: saldo?.saldoAcumulado ?? 0,
      saldoPagado: saldo?.saldoPagado ?? 0,
    },
  };
};

export const getVentasAdmin = async () => {
  const ventas = await prisma.venta.findMany({
    where: { estado: 'PAGADO' },
    orderBy: { createdAt: 'desc' },
    include: {
      course: { select: { titulo: true, precio: true } },
      user: { select: { nombre: true, email: true } },
      instructorUser: { select: { nombre: true, email: true } },
    },
  });

  const totalRecaudado = ventas.reduce((acc, v) => acc + v.monto, 0);
  const totalComision = ventas.reduce((acc, v) => acc + v.comisionPlataforma, 0);
  const totalInstructores = ventas.reduce((acc, v) => acc + v.pagoInstructor, 0);

  const saldosPorInstructor = await prisma.instructorSaldo.findMany({
    include: { user: { select: { nombre: true, email: true } } },
    orderBy: { saldoAcumulado: 'desc' },
  });

  return {
    ventas,
    resumen: {
      totalVentas: ventas.length,
      totalRecaudado,
      totalComisionPlataforma: totalComision,
      totalPagadoInstructores: totalInstructores,
    },
    saldosPorInstructor,
  };
};
