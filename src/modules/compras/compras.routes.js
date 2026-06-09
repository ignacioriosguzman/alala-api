import express from "express";
import rateLimit from "express-rate-limit";
import { authGuard } from "../../middlewares/authGuard.js";
import { antiBotGuard } from "../../middlewares/antiBotGuard.js";
import {
  comprar,
  misDescargas,
  download,
  reporte,
  comprarInvitado,
  bundle,
  bundleInvitado,
  guardarProgresoHandler,
  obtenerProgresoHandler,
  favoritosContenido,
  toggleFavorito,
  checkFavorito,
} from "./compras.controller.js";

const router = express.Router();

const invitadoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' },
});

const checkoutInvitadoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 compras invitado por IP/hora
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown',
  message: { error: 'Demasiadas compras desde esta red. Intenta más tarde.' },
});

router.post("/contenido", authGuard, comprar);
router.get("/mis-descargas", authGuard, misDescargas);
router.get("/contenido/:id/download", authGuard, download);
router.get("/reporte-creador", authGuard, reporte);
router.post("/contenido/invitado", checkoutInvitadoLimiter, antiBotGuard, comprarInvitado);
router.post("/bundle", authGuard, bundle);
router.post("/bundle/invitado", checkoutInvitadoLimiter, antiBotGuard, bundleInvitado);
router.post("/progreso", invitadoLimiter, guardarProgresoHandler);
router.get("/progreso/:contenidoId", invitadoLimiter, obtenerProgresoHandler);
router.get("/favoritos-contenido", authGuard, favoritosContenido);
router.post("/favoritos-contenido", authGuard, toggleFavorito);
router.get("/favoritos-contenido/check/:contenidoId", authGuard, checkFavorito);

export default router;
