import express from "express";
import rateLimit from "express-rate-limit";
import { authGuard } from "../../middlewares/authGuard.js";
import {
  crearOrden, crearOrdenContenido, crearOrdenMicro, crearOrdenEbook,
  confirmarPago, retornoPago, estadoPago,
} from "./pagos.controller.js";

const router = express.Router();

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit excedido" },
});

const retornoLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta más tarde." },
});

const ordenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 órdenes por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas órdenes de pago. Intenta más tarde." },
});

router.post("/crear", authGuard, ordenLimiter, crearOrden);
router.post("/contenido/crear", authGuard, ordenLimiter, crearOrdenContenido);
router.post("/micro/crear", authGuard, ordenLimiter, crearOrdenMicro);
router.post("/ebook/crear", authGuard, ordenLimiter, crearOrdenEbook);
router.post("/confirmacion", webhookLimiter, confirmarPago);   // webhook Flow — sin auth, con rate limit
router.get("/retorno", retornoLimiter, retornoPago);           // redirect Flow → frontend
router.get("/estado/:token", authGuard, estadoPago);

export default router;
