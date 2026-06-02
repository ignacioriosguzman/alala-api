import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { resumen, microcursos, manuales, ventas } from "./creador.controller.js";

const router = Router();

// Todos los endpoints del panel de creador requieren autenticación
router.get("/resumen/:id",    authGuard, resumen);
router.get("/microcursos/:id", authGuard, microcursos);
router.get("/manuales/:id",   authGuard, manuales);
router.get("/ventas/:id",     authGuard, ventas);

export default router;
