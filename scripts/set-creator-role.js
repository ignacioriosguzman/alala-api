/**
 * Asigna rol CREATOR a la cuenta contacto@dosraices.cl (Ari Nivana).
 * Uso: node scripts/set-creator-role.js
 * Requiere DATABASE_URL en .env (o variable de entorno en Railway).
 */
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const TARGET_EMAIL = 'contacto@dosraices.cl';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
    select: { id: true, nombre: true, email: true, role: true, verificado: true, activo: true },
  });

  if (!user) {
    console.error(`✗  No se encontró ningún usuario con email: ${TARGET_EMAIL}`);
    process.exit(1);
  }

  console.log(`\nUsuario encontrado:`);
  console.log(`  ID:         ${user.id}`);
  console.log(`  Nombre:     ${user.nombre}`);
  console.log(`  Email:      ${user.email}`);
  console.log(`  Rol actual: ${user.role}`);
  console.log(`  Verificado: ${user.verificado}`);
  console.log(`  Activo:     ${user.activo}`);
  console.log(`  Link ref:   https://alala.cl/?ref=${user.id}`);

  if (user.role === 'CREATOR') {
    console.log(`\n✓  El usuario ya tiene rol CREATOR. No se realizaron cambios.`);
    return;
  }

  const updated = await prisma.user.update({
    where: { email: TARGET_EMAIL },
    data: { role: 'CREATOR' },
    select: { id: true, email: true, role: true },
  });

  console.log(`\n✓  Rol actualizado exitosamente:`);
  console.log(`  Antes: ${user.role}`);
  console.log(`  Ahora: ${updated.role}`);
  console.log(`\n  El usuario puede iniciar sesión en: https://alala.cl/login-instructor.html`);
  console.log(`  Panel unificado en:                 https://alala.cl/panel-creador.html`);
  console.log(`  Editar perfil:                      Tab "👤 Mi Perfil" en el panel`);
}

main()
  .catch((e) => { console.error('Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
