import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
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
import creadorRoutes from "./modules/creador/creador.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// ── Headers de seguridad ───────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // CSP específica para API REST: no sirve HTML, bloquea todo lo innecesario
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; " +
    "frame-ancestors 'none';"
  );
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
app.use(generalLimiter);

app.use(cors({
  origin: ['https://alala.cl', 'https://app.alala.cl'],
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get("/health", (req, res) => res.json({ status: "ok", service: "ALALA API", env: process.env.FLOW_ENV || 'sandbox' }));

const v1 = express.Router();
v1.use("/auth", authLimiter, authRoutes);
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
v1.use("/creador", creadorRoutes);
app.use("/api/v1", v1);

// Sitemap sigue accesible en raíz para bots
app.use("/", sitemapRoutes);

// ── Middleware global de errores (siempre al final) ────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ALALA API running on port ${PORT} [FLOW_ENV: ${process.env.FLOW_ENV || 'sandbox'}]`));
