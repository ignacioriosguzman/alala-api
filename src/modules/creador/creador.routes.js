import { Router } from "express";
import { resumen, microcursos, manuales, ventas } from "./creador.controller.js";
const router = Router();

router.get("/resumen/:id", resumen);
router.get("/microcursos/:id", microcursos);
router.get("/manuales/:id", manuales);
router.get("/ventas/:id", ventas);

export default router;
