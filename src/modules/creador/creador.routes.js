import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { resumen, microcursos, manuales, ventas } from "./creador.controller.js";

const router = Router();

// Todos los endpoints del panel de creador requieren autenticación
router.get("/resumen",    authGuard, resumen);
router.get("/microcursos", authGuard, microcursos);
router.get("/manuales",   authGuard, manuales);
router.get("/ventas",     authGuard, ventas);

export default router;
