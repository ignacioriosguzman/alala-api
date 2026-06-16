/**
 * Corrige la portada del curso "Prácticas Diarias" de Ari Nivana.
 * La imagen incorrecta (portada del libro "Caos") se reemplaza con la imagen correcta.
 *
 * Uso:
 *   DATABASE_URL="postgresql://..." node scripts/fix-imagen-arinivana.mjs
 *   — o bien —
 *   railway run node scripts/fix-imagen-arinivana.mjs
 */

import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const prisma = new PrismaClient();

// Ruta a la imagen correcta (ajusta si está en otro lugar)
const IMAGEN_CORRECTA = "/Users/ignacioriosguzman/Downloads/ARI NIVANA/Arin Nivana Horizontal.png";

async function main() {
  console.log("🔍 Buscando el curso de Ari Nivana...\n");

  // Buscar en ContenidoDigital (panel creador)
  const contenidos = await prisma.contenidoDigital.findMany({
    where: {
      OR: [
        { titulo: { contains: "prácticas diarias", mode: "insensitive" } },
        { titulo: { contains: "practicas diarias", mode: "insensitive" } },
        { titulo: { contains: "calmar", mode: "insensitive" } },
        { titulo: { contains: "reconectar", mode: "insensitive" } },
      ],
    },
    include: { creator: { select: { nombre: true, email: true } } },
  });

  // Buscar en Course (panel instructor)
  const cursos = await prisma.course.findMany({
    where: {
      OR: [
        { titulo: { contains: "prácticas diarias", mode: "insensitive" } },
        { titulo: { contains: "practicas diarias", mode: "insensitive" } },
        { titulo: { contains: "calmar", mode: "insensitive" } },
        { titulo: { contains: "reconectar", mode: "insensitive" } },
        { titulo: { contains: "ari nivana", mode: "insensitive" } },
      ],
    },
    include: { instructorUser: { select: { nombre: true, email: true } } },
  });

  console.log(`📚 ContenidoDigital encontrados: ${contenidos.length}`);
  for (const c of contenidos) {
    console.log(`   [${c.id}] "${c.titulo}" — ${c.creator?.nombre ?? "sin creador"} (${c.creator?.email})`);
    console.log(`   portadaUrl (primeros 80 chars): ${(c.portadaUrl ?? "null").slice(0, 80)}`);
  }

  console.log(`\n📚 Cursos (Course) encontrados: ${cursos.length}`);
  for (const c of cursos) {
    console.log(`   [${c.id}] "${c.titulo}" — ${c.instructorUser?.nombre ?? "sin instructor"}`);
    console.log(`   imagen (primeros 80 chars): ${(c.imagen ?? "null").slice(0, 80)}`);
  }

  if (contenidos.length === 0 && cursos.length === 0) {
    console.log("\n⚠️  No se encontró el curso. Verifica el título.");
    return;
  }

  // Preparar la nueva imagen (comprimida, 800px max ancho, jpeg)
  console.log(`\n📷 Procesando imagen correcta desde: ${IMAGEN_CORRECTA}`);
  const buffer = readFileSync(IMAGEN_CORRECTA);
  const compressed = await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 78 })
    .toBuffer();
  const nuevaPortada = `data:image/jpeg;base64,${compressed.toString("base64")}`;
  console.log(`   Imagen procesada: ${compressed.length} bytes → base64 length: ${nuevaPortada.length}`);

  // Actualizar ContenidoDigital
  for (const c of contenidos) {
    await prisma.contenidoDigital.update({
      where: { id: c.id },
      data: { portadaUrl: nuevaPortada },
    });
    console.log(`\n✅ ContenidoDigital [${c.id}] "${c.titulo}" — portada actualizada.`);
  }

  // Actualizar Course
  for (const c of cursos) {
    await prisma.course.update({
      where: { id: c.id },
      data: { imagen: nuevaPortada },
    });
    console.log(`\n✅ Course [${c.id}] "${c.titulo}" — imagen actualizada.`);
  }

  console.log("\n🎉 Listo. Recarga la página para ver la imagen correcta.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
