import express from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { subirPdf, generarPreview, subirPortada, subirAvatar } from "./upload.controller.js";

const router = express.Router();

// ── Rate limiters ─────────────────────────────────────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { error: "Demasiadas subidas. Intenta más tarde." },
});

const avatarLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,  // 10 cambios de avatar por hora
  standardHeaders: true, legacyHeaders: false,
  message: { error: "Demasiados cambios de avatar. Espera un momento." },
});

// ── Multer para avatares (memoria, 2 MB máximo) ───────────────────────────────
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Formato no permitido. Usa JPG, PNG o WebP."));
    }
  },
});

const instructorGuard = [authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN")];

// ── Rutas existentes (PDF / portada) ─────────────────────────────────────────
router.post("/pdf",     ...instructorGuard, uploadLimiter, subirPdf);
router.post("/preview", ...instructorGuard, uploadLimiter, generarPreview);
router.post("/portada", ...instructorGuard, uploadLimiter, subirPortada);

// ── Avatar — cualquier usuario autenticado puede subir el suyo ───────────────
router.post(
  "/avatar",
  authGuard,
  avatarLimiter,
  avatarUpload.single("avatar"),
  subirAvatar
);

// Manejador de error de multer (tamaño/formato)
router.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "La imagen supera el límite de 2 MB" });
  }
  if (err.message?.includes("Formato")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

export default router;
