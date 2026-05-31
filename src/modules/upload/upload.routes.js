import express from "express";
import rateLimit from "express-rate-limit";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { subirPdf, generarPreview, subirPortada } from "./upload.controller.js";

const router = express.Router();

const instructorGuard = [authGuard, roleGuard("INSTRUCTOR", "ADMIN")];

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas subidas. Intenta más tarde.' },
});

router.post("/pdf", ...instructorGuard, uploadLimiter, subirPdf);
router.post("/preview", ...instructorGuard, uploadLimiter, generarPreview);
router.post("/portada", ...instructorGuard, uploadLimiter, subirPortada);

export default router;
