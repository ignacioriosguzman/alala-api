#!/usr/bin/env node
/**
 * Genera un reporte financiero en CSV.
 * Uso: node scripts/reporte-financiero.js [YYYY-MM]
 *
 * Sin argumento → mes actual.
 * Ejemplo: node scripts/reporte-financiero.js 2026-05
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync }  from "fs";

const prisma = new PrismaClient();
const periodo = process.argv[2] ?? new Date().toISOString().slice(0, 7);
const [year, month] = periodo.split("-").map(Number);
const desde = new Date(year, month - 1, 1);
const hasta  = new Date(year, month, 1);

async function main() {
  console.log(`\n📊 Reporte financiero — ${periodo}\n`);

  const [vc, vm, ve, vCursos] = await Promise.all([
    prisma.compraContenido.findMany({
      where: { estado: "completada", createdAt: { gte: desde, lt: hasta } },
      include: { contenido: { select: { titulo: true, creator: { select: { nombre: true, email: true } } } }, user: { select: { nombre: true, email: true } } },
    }),
    prisma.compraMicroContenido.findMany({
      where: { estado: "completada", createdAt: { gte: desde, lt: hasta } },
      include: { microContenido: { select: { titulo: true, autor: { select: { nombre: true, email: true } } } } },
    }),
    prisma.compraMiniEbook.findMany({
      where: { estado: "completada", createdAt: { gte: desde, lt: hasta } },
      include: { miniEbook: { select: { titulo: true, autor: { select: { nombre: true, email: true } } } } },
    }),
    prisma.venta.findMany({
      where: { estado: "PAGADO", createdAt: { gte: desde, lt: hasta } },
      include: { course: { select: { titulo: true } }, instructorUser: { select: { nombre: true, email: true } } },
    }),
  ]);

  const rows = [
    ["Fecha", "Tipo", "Titulo", "Creador", "Email Creador", "Comprador", "Monto", "Comision", "Pago Creador"],
    ...vc.map(v => [v.createdAt.toISOString().slice(0,10), "contenido", v.contenido?.titulo, v.contenido?.creator?.nombre, v.contenido?.creator?.email, v.user?.nombre ?? v.user?.email, v.monto, v.comisionPlataforma, v.pagoCreador]),
    ...vm.map(v => [v.createdAt.toISOString().slice(0,10), "microcontenido", v.microContenido?.titulo, v.microContenido?.autor?.nombre, v.microContenido?.autor?.email, v.emailInvitado ?? v.userId ?? "—", v.monto, v.comisionPlataforma, v.pagoCreador]),
    ...ve.map(v => [v.createdAt.toISOString().slice(0,10), "miniebook", v.miniEbook?.titulo, v.miniEbook?.autor?.nombre, v.miniEbook?.autor?.email, v.emailInvitado ?? v.userId ?? "—", v.monto, v.comisionPlataforma, v.pagoCreador]),
    ...vCursos.map(v => [v.createdAt.toISOString().slice(0,10), "curso", v.course?.titulo, v.instructorUser?.nombre, v.instructorUser?.email, v.userId, v.monto, v.comisionPlataforma, v.pagoInstructor]),
  ];

  const csv  = rows.map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n");
  const file = `reporte_${periodo}.csv`;
  writeFileSync(file, csv, "utf8");

  const totalMonto    = [...vc, ...vm, ...ve].reduce((s,v) => s + v.monto, 0) + vCursos.reduce((s,v) => s + v.monto, 0);
  const totalComision = [...vc, ...vm, ...ve].reduce((s,v) => s + v.comisionPlataforma, 0) + vCursos.reduce((s,v) => s + v.comisionPlataforma, 0);
  const totalCreador  = [...vc, ...vm, ...ve].reduce((s,v) => s + v.pagoCreador, 0) + vCursos.reduce((s,v) => s + v.pagoInstructor, 0);
  const totalTransac  = rows.length - 1;

  console.log(`Transacciones: ${totalTransac}`);
  console.log(`Monto total:   $${totalMonto.toLocaleString("es-CL")}`);
  console.log(`Comisión ALALA: $${totalComision.toLocaleString("es-CL")} (${totalMonto > 0 ? Math.round(totalComision/totalMonto*100) : 0}%)`);
  console.log(`Pago creadores: $${totalCreador.toLocaleString("es-CL")}`);
  console.log(`\n✅ CSV guardado: ${file}`);
}

main()
  .catch(e => { console.error("❌ Error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
