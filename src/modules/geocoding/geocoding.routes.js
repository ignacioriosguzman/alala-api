import express from "express";
import rateLimit from "express-rate-limit";
import { geocode } from "./geocoding.controller.js";

const router = express.Router();

const geocodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes de geocodificación. Intenta más tarde." },
});

router.post("/geocode", geocodeLimiter, geocode);

export default router;
