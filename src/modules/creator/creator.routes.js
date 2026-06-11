import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
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

const guard = [authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN")];

// ── Perfil de creador (requiere auth + rol) ──────────────────────────────────
router.get("/profile",  ...guard, perfil);
router.post("/profile", ...guard, crearPerfil);
router.put("/profile",  ...guard, editarPerfil);

// ── Link de referido ─────────────────────────────────────────────────────────
router.get("/link",          ...guard, link);
router.post("/link/visit", visitaLimiter, visita);   // público — registra visita
router.get("/stats",         ...guard, stats);

// ── Ingresos y conversión (requiere auth + rol) ──────────────────────────────
router.get("/earnings/monthly", ...guard, earningsMonthly);
router.get("/conversion",       ...guard, conversion);

export default router;
