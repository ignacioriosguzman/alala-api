import express from "express";
import { subirPdf, generarPreview, subirPortada } from "./upload.controller.js";

const router = express.Router();

// Subida de PDF a Google Drive (simulado / placeholder)
router.post("/pdf", subirPdf);

// Generación de 3 vistas previa JPG desde un PDF
router.post("/preview", generarPreview);

// Subida de imagen de portada a Google Drive
router.post("/portada", subirPortada);

export default router;
