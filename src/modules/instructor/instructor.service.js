import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getVentasInstructor = async (instructorUserId) => {
  const ventas = await prisma.venta.findMany({
    where: { instructorUserId, estado: "PAGADO" },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { titulo: true, precio: true } },
      user: { select: { nombre: true, email: true } },
    },
  });

  const monto = ventas.reduce((s, v) => s + v.pagoInstructor, 0);
  const comision = ventas.reduce((s, v) => s + v.comisionPlataforma, 0);

  return {
    ventas: ventas.map((v) => ({
      idVenta: v.id,
      curso: v.course?.titulo ?? "—",
      alumno: v.user?.nombre ?? "—",
      monto: v.pagoInstructor,
      fecha: v.createdAt,
      estado: v.estado,
    })),
    resumen: {
      totalVentas: ventas.length,
      montoTotal: monto,
      comisionPlataforma: comision,
    },
  };
};

export const getSaldoInstructor = async (instructorUserId) => {
  const saldo = await prisma.instructorSaldo.findUnique({
    where: { userId: instructorUserId },
  });
  return {
    saldoPendiente: saldo?.saldoPendiente ?? 0,
    saldoAcumulado: saldo?.saldoAcumulado ?? 0,
    saldoPagado: saldo?.saldoPagado ?? 0,
  };
};

export const getCursosInstructor = async (instructorUserId) => {
  return prisma.course.findMany({
    where: { instructorUserId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      titulo: true,
      categoria: true,
      precio: true,
      modalidad: true,
      ciudad: true,
      createdAt: true,
    },
  });
};
