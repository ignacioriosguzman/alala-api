# ALALÁ API

Backend REST para ALALÁ — Marketplace de cursos culturales y de bienestar en Chile.

## Tecnologías

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT para autenticación
- bcryptjs para hashing de contraseñas

## Estructura de rutas

Todas las rutas están bajo el prefijo `/api/v1/`.

### Health Check

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/health` | Verifica que el servidor esté activo |

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Registrar nuevo usuario |
| POST | `/api/v1/auth/login` | Iniciar sesión |

### Cursos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/cursos` | Listar todos los cursos |
| GET | `/api/v1/cursos/:id` | Obtener un curso por ID |
| POST | `/api/v1/cursos` | Crear nuevo curso |
| PUT | `/api/v1/cursos/:id` | Actualizar curso |
| DELETE | `/api/v1/cursos/:id` | Eliminar curso |

### Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/usuarios` | Listar usuarios |
| GET | `/api/v1/usuarios/:id` | Obtener usuario por ID |
| PUT | `/api/v1/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/v1/usuarios/:id` | Eliminar usuario |

## Deploy en Railway

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "ALALÁ API v1.0.0"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/alala-api.git
git push -u origin main
```

### 2. Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Selecciona tu repositorio

### 3. Agregar PostgreSQL

1. En tu proyecto Railway, haz clic en **New** → **Database** → **Add PostgreSQL**
2. Railway creará automáticamente la variable `DATABASE_URL`

### 4. Variables de entorno

En Railway → **Variables**, asegúrate de tener:

```env
DATABASE_URL      ← (creada automáticamente por PostgreSQL)
JWT_SECRET        ← genera uno largo y seguro
JWT_REFRESH_SECRET← genera otro largo y seguro
```

### 5. Configurar Build Settings

En Railway → **Settings**:

| Campo | Valor |
|-------|-------|
| **Build Command** | `npm install` |
| **Start Command** | `prisma migrate deploy && node src/server.js` |

Railway ejecutará `postinstall` automáticamente después de `npm install`, lo que generará el cliente de Prisma.

### 6. Verificar deploy

```bash
curl https://TU_URL_RAILWAY.up.railway.app/api/v1/health
```

Respuesta esperada:
```json
{"status":"ok","service":"ALALÁ API","version":"1.0.0"}
```

## Crear curso de prueba

```bash
curl -X POST https://TU_URL_RAILWAY/api/v1/cursos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer alala123" \
  -d '{
    "titulo": "Taller de Cerámica",
    "descripcion": "Aprende cerámica desde cero",
    "categoria": "artesania",
    "precio": 35000,
    "instructor": "María Paz Rojas",
    "imagen": "https://ejemplo.com/imagen.jpg",
    "ciudad": "Santiago",
    "lat": -33.4489,
    "lng": -70.6693,
    "modalidad": "presencial"
  }'
```

## Modelo de datos

### Course

| Campo | Tipo | Requerido |
|-------|------|-----------|
| id | Int (autoincrement) | Sí |
| titulo | String | Sí |
| descripcion | String | Sí |
| categoria | String | Sí |
| precio | Int | Sí |
| instructor | String | Sí |
| imagen | String | No |
| ciudad | String | No |
| lat | Float | No |
| lng | Float | No |
| modalidad | String | No |
| direccion | String | No |
| createdAt | DateTime | Sí |
| updatedAt | DateTime | Sí |

## Migraciones.

La migración inicial está en `prisma/migrations/20250526000000_init/`.

Para crear nuevas migraciones en desarrollo local:

```bash
npx prisma migrate dev --name nombre_migracion
```

Para aplicar migraciones en producción:

```bash
npx prisma migrate deploy
```
