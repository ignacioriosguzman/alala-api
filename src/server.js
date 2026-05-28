import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

// ── Headers de seguridad ───────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // CSP permisiva pero segura: permite inline scripts/styles del frontend estático
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://images.unsplash.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://alala-api-production.up.railway.app https://api.alala.cl; " +
    "frame-ancestors 'none';"
  );
  next();
});

app.use(cors({
  origin: ['https://alala.cl', 'https://app.alala.cl'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // para webhook de Flow

app.get("/health", (req, res) => res.json({ status: "ok", service: "ALALA API" }));

app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/cursos", cursosRoutes);
app.use("/pagos", pagosRoutes);
app.use("/", ventasRoutes);
app.use("/instructor", instructorRoutes);
app.use("/email", emailRoutes);
app.use("/geocode", geocodingRoutes);
app.use("/", sitemapRoutes);
app.use("/reviews", reviewRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/mensajes", mensajesRoutes);
app.use("/contenido", contenidoRoutes);
app.use("/compras", comprasRoutes);
app.use("/cupones", cuponesRoutes);
app.use("/reseñas-contenido", reseñasRoutes);
app.use("/upload", uploadRoutes);

// ── Middleware global de errores (siempre al final) ────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ALALA API running on port ${PORT}`));
