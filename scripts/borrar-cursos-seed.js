/**
 * Limpieza: elimina los cursos creados por el seed inicial.
 * Uso: node scripts/borrar-cursos-seed.js
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TITULOS_A_BORRAR = [
  "Cómo crear proyectos culturales digitales desde cero",
  "Introducción a ALALÁ: aprende a usar la plataforma",
];

async function main() {
  console.log("🗑️  Eliminando cursos del seed inicial...\n");

  for (const titulo of TITULOS_A_BORRAR) {
    const curso = await prisma.course.findFirst({ where: { titulo } });

    if (!curso) {
      console.log(`⚠️  No encontrado: "${titulo}" — omitido`);
      continue;
    }

    await prisma.course.delete({ where: { id: curso.id } });
    console.log(`✅ Eliminado: "${titulo}" (ID: ${curso.id})`);
  }

  console.log("\n🎉 Limpieza completada.\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
