import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Capturar errores no controlados antes de que tiren el proceso
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Excepción no capturada:', err.stack || err.message);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Promesa rechazada no capturada:', reason);
  process.exit(1);
});
import prisma from "./lib/prisma.js";
import authRoutes from "./modules/auth/auth.routes.js";
import usuariosRoutes from "./modules/usuarios/usuarios.routes.js";
import cursosRoutes from "./modules/cursos/cursos.routes.js";
import pagosRoutes from "./modules/pagos/pagos.routes.js";
import ventasRoutes from "./modules/ventas/ventas.routes.js";
import instructorRoutes from "./modules/instructor/instructor.routes.js";
import emailRoutes from "./modules/email/email.routes.js";
import sitemapRoutes from "./modules/sitemap/sitemap.routes.js";
import geocodingRoutes from "./modules/geocoding/geocoding.routes.js";
import reviewRoutes from "./modules/reviews/reviews.routes.js";
import favoriteRoutes from "./modules/favorites/favorites.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import mensajesRoutes from "./modules/mensajes/mensajes.routes.js";
import contenidoRoutes from "./modules/contenido/contenido.routes.js";
import comprasRoutes from "./modules/compras/compras.routes.js";
import cuponesRoutes from "./modules/cupones/cupones.routes.js";
import reseñasRoutes from "./modules/reseñas/reseñas.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import microcontenidosRoutes from "./modules/microcontenidos/microcontenidos.routes.js";
import miniebooksRoutes from "./modules/miniebooks/miniebooks.routes.js";
import creadorRoutes from "./modules/creador/creador.routes.js";
import creatorRoutes from "./modules/creator/creator.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import newsletterRoutes from "./modules/newsletter/newsletter.routes.js";
import followsRoutes from "./modules/follows/follows.routes.js";
import articleFavoritesRoutes from "./modules/article-favorites/article-favorites.routes.js";
import articleCommentsRoutes from "./modules/article-comments/article-comments.routes.js";
import retirosRoutes from "./modules/retiros/retiros.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { verificarConexionSMTP } from "./services/email.service.js";
import { limpiarTokensExpirados } from "./modules/auth/auth.service.js";

dotenv.config();

// Validar variables de entorno críticas antes de arrancar
const REQUIRED_ENV = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'DATABASE_URL'];
const missingEnv = REQUIRED_ENV.filter(v => !process.env[v]);
if (missingEnv.length) {
  console.error('[FATAL] Variables de entorno faltantes:', missingEnv.join(', '));
  process.exit(1);
}
if ((process.env.JWT_SECRET || '').length < 32) {
  console.error('[FATAL] JWT_SECRET debe tener al menos 32 caracteres.');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1);

// ── Headers de seguridad (helmet) ─────────────────────────────────
app.use(helmet({
  // API REST — no sirve HTML, bloquear todo
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  // HSTS: 2 años, subdomains, preload
  strictTransportSecurity: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
  // X-XSS-Protection desactivado (deprecated, puede crear vulnerabilidades en IE)
  xXssProtection: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false,
}));
// Permissions-Policy (helmet no lo gestiona aún)
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// ── Rate limiting ──────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticación. Intenta más tarde.' },
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta más tarde.' },
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de registro. Intenta más tarde.' },
});
const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de recuperación. Intenta más tarde.' },
});
app.use(generalLimiter);

app.use(cors({
  origin: ['https://alala.cl', 'https://app.alala.cl'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Archivos estáticos — avatares optimizados ──────────────────────────────
// src/ → ../ → alala-api root → uploads/avatars
const UPLOADS_DIR = path.resolve(__dirname, "../uploads/avatars");
if (!existsSync(UPLOADS_DIR)) mkdir(UPLOADS_DIR, { recursive: true }).catch(() => {});
app.use("/uploads/avatars", express.static(UPLOADS_DIR, {
  maxAge: "7d",         // caché en cliente 7 días
  immutable: false,
  setHeaders: (res) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
}));

app.get("/health", (req, res) => res.json({ status: "ok", service: "ALALA API" }));

const v1 = express.Router();
v1.use("/auth", authRoutes);
v1.use("/usuarios", usuariosRoutes);
v1.use("/cursos", cursosRoutes);
v1.use("/pagos", pagosRoutes);
v1.use("/ventas", ventasRoutes);
v1.use("/instructor", instructorRoutes);
v1.use("/email", emailRoutes);
v1.use("/sitemap", sitemapRoutes);
v1.use("/geocode", geocodingRoutes);
v1.use("/reviews", reviewRoutes);
v1.use("/favorites", favoriteRoutes);
v1.use("/analytics", analyticsRoutes);
v1.use("/mensajes", mensajesRoutes);
v1.use("/contenido", contenidoRoutes);
v1.use("/compras", comprasRoutes);
v1.use("/cupones", cuponesRoutes);
v1.use("/reseñas-contenido", reseñasRoutes);
v1.use("/upload", uploadRoutes);
v1.use("/microcontenidos", microcontenidosRoutes);
v1.use("/miniebooks", miniebooksRoutes);
v1.use("/creador", creadorRoutes);
v1.use("/creator", creatorRoutes);
v1.use("/admin",   adminRoutes);
v1.use("/newsletter", newsletterRoutes);
v1.use("/follows", followsRoutes);
v1.use("/article-favorites", articleFavoritesRoutes);
v1.use("/article-comments", articleCommentsRoutes);
v1.use("/retiros", retirosRoutes);
app.use("/api/v1", v1);

// Sitemap sigue accesible en raíz para bots
app.use("/", sitemapRoutes);

// ── Middleware global de errores (siempre al final) ────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ALALA API running on port ${PORT} [FLOW_ENV: ${process.env.FLOW_ENV || 'sandbox'}]`);
  verificarConexionSMTP().then(r => {
    if (r.ok) {
      console.log('[startup] ✓ SMTP OK — correos habilitados.');
    } else {
      console.warn('[startup] ✗ SMTP no disponible:', r.error);
    }
  });
  // Limpieza diaria de refresh tokens expirados
  limpiarTokensExpirados().then(n => {
    if (n > 0) console.log(`[startup] ✓ ${n} refresh token(s) expirados eliminados.`);
  }).catch(() => {});
  setInterval(() => {
    limpiarTokensExpirados().catch(() => {});
  }, 24 * 60 * 60 * 1000);

  // Auto-promover ADMIN_EMAIL a rol ADMIN si no lo tiene aún
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    prisma.user.updateMany({
      where: { email: adminEmail.toLowerCase(), role: { not: 'ADMIN' } },
      data: { role: 'ADMIN' },
    }).then(r => {
      if (r.count > 0) console.log(`[startup] ✓ Usuario ${adminEmail} promovido a ADMIN automáticamente.`);
    }).catch(() => {});
  }
});
