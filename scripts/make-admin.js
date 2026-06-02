import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Uso: DATABASE_URL=\"...\" node scripts/make-admin.js <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`❌ No se encontró usuario con email: ${email}`);
    process.exit(1);
  }

  console.log(`Usuario encontrado: ${user.nombre} (${user.email}) — rol actual: ${user.role}`);

  if (user.role === "ADMIN") {
    console.log("✅ Ya es ADMIN. No se requieren cambios.");
    return;
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: { id: true, nombre: true, email: true, role: true },
  });

  console.log(`✅ Rol actualizado correctamente:`, updated);
}

main()
  .catch((e) => { console.error("❌ Error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
