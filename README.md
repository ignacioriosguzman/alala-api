# ALALA API

API REST de ALALA — Plataforma cultural para aprender, crear y compartir.

## Stack

- **Node.js** + **Express**
- **Prisma ORM** + **PostgreSQL**
- **Flow Chile** para pagos
- **JWT** para autenticación
- **Helmet** + **Rate Limiting** para seguridad

## Estructura

```
src/
  modules/       # Módulos por dominio (auth, cursos, pagos, etc.)
  middlewares/   # Auth, roles, validación, errores
  services/      # Email, Google Drive, procesamiento de imágenes
  utils/         # Sanitización, tokens
  validators/    # Esquemas de validación
  config/        # Configuración de entorno
  server.js      # Punto de entrada
```

## Roles

- `STUDENT` — Estudiante
- `INSTRUCTOR` — Instructor de cursos
- `CREATOR` — Creador de contenido digital
- `ADMIN` — Administrador de plataforma

## Variables de entorno

Ver `.env.example` para la lista completa.

## Comandos

```bash
npm install
npx prisma migrate dev
npm start
```

## Estado

✅ Producción estable — lista para promoción.
