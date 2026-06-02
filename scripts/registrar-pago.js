#!/usr/bin/env node
/**
 * Registra un pago manual a un creador.
 * Uso: node scripts/registrar-pago.js <email-creador> <monto> [referencia]
 *
 * Ejemplo:
 *   node scripts/registrar-pago.js creador@alala.cl 150000 "TRF-2026-06-001"
 */
import { PrismaClient } from "@prisma/client";

const prisma    = new PrismaClient();
const [emailCreador, montoStr, referencia] = process.argv.slice(2);

if (!emailCreador || !montoStr) {
  console.error("Uso: node scripts/registrar-pago.js <email> <monto> [referencia]");
  process.exit(1);
}

const monto = parseInt(montoStr, 10);
if (isNaN(monto) || monto <= 0) {
  console.error("El monto debe ser un número entero positivo.");
  process.exit(1);
}

async function main() {
  const creator = await prisma.user.findUnique({
    where: { email: emailCreador },
    select: { id: true, nombre: true, email: true, role: true },
  });
  if (!creator) { console.error(`❌ Creador no encontrado: ${emailCreador}`); process.exit(1); }

  // Calcular ganado y pendiente
  const [ganC, ganM, ganE, yaPageado] = await Promise.all([
    prisma.compraContenido.aggregate({ where: { contenido: { creatorId: creator.id }, estado: "completada" }, _sum: { pagoCreador: true } }),
    prisma.compraMicroContenido.aggregate({ where: { microContenido: { autorId: creator.id }, estado: "completada" }, _sum: { pagoCreador: true } }),
    prisma.compraMiniEbook.aggregate({ where: { miniEbook: { autorId: creator.id }, estado: "completada" }, _sum: { pagoCreador: true } }),
    prisma.pagoCreador.aggregate({ where: { creatorId: creator.id }, _sum: { monto: true } }),
  ]);
  const totalGanado   = (ganC._sum.pagoCreador ?? 0) + (ganM._sum.pagoCreador ?? 0) + (ganE._sum.pagoCreador ?? 0);
  const totalPagado   = yaPageado._sum.monto ?? 0;
  const pendiente     = totalGanado - totalPagado;

  console.log(`Creador: ${creator.nombre} (${creator.email})`);
  console.log(`  Total ganado:   $${totalGanado.toLocaleString("es-CL")}`);
  console.log(`  Ya pagado:      $${totalPagado.toLocaleString("es-CL")}`);
  console.log(`  Pendiente:      $${pendiente.toLocaleString("es-CL")}`);
  console.log(`  Monto a pagar:  $${monto.toLocaleString("es-CL")}`);

  if (monto > pendiente) {
    console.warn(`⚠️  Advertencia: el monto ($${monto.toLocaleString("es-CL")}) supera el pendiente ($${pendiente.toLocaleString("es-CL")})`);
  }

  const pago = await prisma.pagoCreador.create({
    data: {
      creatorId:   creator.id,
      monto,
      descripcion: `Pago manual vía script — ${new Date().toLocaleDateString("es-CL")}`,
      referencia:  referencia ?? null,
      periodo:     new Date().toISOString().slice(0, 7),
      pagadoEn:    new Date(),
    },
  });

  console.log(`\n✅ Pago registrado (id: ${pago.id})`);
  console.log(`   Referencia: ${pago.referencia ?? "—"}`);
  console.log(`   Periodo:    ${pago.periodo}`);
}

main()
  .catch(e => { console.error("❌ Error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
