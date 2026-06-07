import express from "express";
import rateLimit from "express-rate-limit";
import { authGuard } from "../../middlewares/authGuard.js";
import {
  crear,
  misCupones,
  validar,
  desactivar,
} from "./cupones.controller.js";

const router = express.Router();

const cuponLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas validaciones. Intenta más tarde." },
});

router.post("/", authGuard, crear);
router.get("/mis-cupones", authGuard, misCupones);
router.get("/validar", cuponLimiter, validar);
router.patch("/:id/desactivar", authGuard, desactivar);

export default router;
