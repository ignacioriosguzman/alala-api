import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const result = await prisma.$executeRawUnsafe(
    `DELETE FROM "_prisma_migrations" WHERE migration_name = '20260608100000_add_microcontenido' AND finished_at IS NULL`
  );
  if (result > 0) {
    console.log('[fix-migration] Registro de migración fallida eliminado.');
  }
} catch (e) {
  console.log('[fix-migration] Nada que limpiar:', e.message);
} finally {
  await prisma.$disconnect();
}
