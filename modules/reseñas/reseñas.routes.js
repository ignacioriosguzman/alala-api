import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { crear, listarPorContenido, promedio } from "./reseñas.controller.js";

const router = express.Router();

router.post("/", authGuard, crear);
router.get("/contenido/:contenidoId", listarPorContenido);
router.get("/promedio/:contenidoId", promedio);

export default router;
