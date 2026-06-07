import { Router } from "express";
import rateLimit from "express-rate-limit";
import { suscribir, desuscribir, listar } from "./newsletter.controller.js";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";

const router = Router();

const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta más tarde." },
});

router.post("/suscribir", newsletterLimiter, suscribir);
router.post("/desuscribir", newsletterLimiter, desuscribir);
router.get("/lista", authGuard, roleGuard("ADMIN"), listar);

export default router;
