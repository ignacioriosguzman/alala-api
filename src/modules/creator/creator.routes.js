import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authGuard } from "../../middlewares/authGuard.js";
import {
  perfil, crearPerfil, editarPerfil,
  link, visita, stats,
  earningsMonthly, conversion,
} from "./creator.controller.js";

const router = Router();

const visitaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas visitas registradas. Intenta más tarde." },
});

// ── Perfil de creador (requiere auth) ─────────────────────────────────────────
router.get("/profile",  authGuard, perfil);
router.post("/profile", authGuard, crearPerfil);
router.put("/profile",  authGuard, editarPerfil);

// ── Link de referido (requiere auth) ─────────────────────────────────────────
router.get("/link",          authGuard, link);
router.post("/link/visit", visitaLimiter, visita);   // público — registra visita
router.get("/stats",         authGuard, stats);

// ── Ingresos y conversión (requiere auth) ────────────────────────────────────
router.get("/earnings/monthly", authGuard, earningsMonthly);
router.get("/conversion",       authGuard, conversion);

export default router;
