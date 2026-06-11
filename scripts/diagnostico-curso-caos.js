/**
 * Diagnóstico: busca el curso "Desde el Caos" y reporta su estado.
 * Uso: node scripts/diagnostico-curso-caos.js
 *
 * Requiere DATABASE_URL en .env o como variable de entorno.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Buscando curso relacionado con 'caos'...\n");

  // 1. Buscar en Course (cursos tradicionales — panel de instructor)
  const cursos = await prisma.course.findMany({
    where: {
      OR: [
        { titulo: { contains: "caos", mode: "insensitive" } },
        { titulo: { contains: "Caos", mode: "insensitive" } },
        { descripcion: { contains: "caos", mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { instructorUser: { select: { id: true, nombre: true, email: true } } },
  });

  console.log(`📚 Cursos tradicionales (panel instructor) encontrados: ${cursos.length}`);
  for (const c of cursos) {
    console.log(`\n  ID: ${c.id}`);
    console.log(`  Título: "${c.titulo}"`);
    console.log(`  Instructor asignado: ${c.instructorUser?.nombre ?? "N/A"} (ID: ${c.instructorUserId ?? "null"}, email: ${c.instructorUser?.email ?? "N/A"})`);
    console.log(`  Creado: ${c.createdAt.toISOString()}`);
    console.log(`  Precio: $${c.precio} | Modalidad: ${c.modalidad ?? "N/A"}`);
  }

  // 2. Buscar en ContenidoDigital (panel de creador)
  const contenidos = await prisma.contenidoDigital.findMany({
    where: {
      OR: [
        { titulo: { contains: "caos", mode: "insensitive" } },
        { descripcion: { contains: "caos", mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { creator: { select: { id: true, nombre: true, email: true } } },
  });

  console.log(`\n📖 Contenidos digitales (panel creador) encontrados: ${contenidos.length}`);
  for (const c of contenidos) {
    console.log(`\n  ID: ${c.id}`);
    console.log(`  Título: "${c.titulo}"`);
    console.log(`  Tipo: ${c.tipo} | Status: ${c.status}`);
    console.log(`  Creador: ${c.creator?.nombre ?? "N/A"} (ID: ${c.creatorId}, email: ${c.creator?.email ?? "N/A"})`);
    console.log(`  Creado: ${c.createdAt.toISOString()}`);
  }

  // 3. Buscar en MicroContenido
  const micros = await prisma.microContenido.findMany({
    where: {
      OR: [
        { titulo: { contains: "caos", mode: "insensitive" } },
        { contenido: { contains: "caos", mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { autor: { select: { id: true, nombre: true, email: true } } },
  });

  console.log(`\n📝 MicroContenidos encontrados: ${micros.length}`);
  for (const m of micros) {
    console.log(`\n  ID: ${m.id}`);
    console.log(`  Título: "${m.titulo}"`);
    console.log(`  Tipo: ${m.tipo} | Publicado: ${m.publicado}`);
    console.log(`  Autor: ${m.autor?.nombre ?? "N/A"} (ID: ${m.autorId})`);
  }

  // 4. Listar TODOS los cursos del instructor (por email)
  const INSTRUCTOR_EMAIL = process.env.INSTRUCTOR_EMAIL || "igrigu@gmail.com";
  const user = await prisma.user.findUnique({
    where: { email: INSTRUCTOR_EMAIL },
    include: { cursosCreados: { orderBy: { createdAt: "desc" } } },
  });

  if (user) {
    console.log(`\n👤 Usuario encontrado: ${user.nombre} (ID: ${user.id}, rol: ${user.role})`);
    console.log(`   Cursos tradicionales asignados a este usuario: ${user.cursosCreados.length}`);
    for (const c of user.cursosCreados) {
      console.log(`   - [${c.id}] "${c.titulo}" ($${c.precio})`);
    }
  } else {
    console.log(`\n⚠️ Usuario con email ${INSTRUCTOR_EMAIL} NO encontrado.`);
  }

  console.log("\n✅ Diagnóstico completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
