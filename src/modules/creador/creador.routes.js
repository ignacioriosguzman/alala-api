import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { resumen, microcursos, manuales, ventas } from "./creador.controller.js";

const router = Router();

const guard = [authGuard, roleGuard("CREATOR", "INSTRUCTOR", "ADMIN")];

router.get("/resumen",     ...guard, resumen);
router.get("/microcursos", ...guard, microcursos);
router.get("/manuales",    ...guard, manuales);
router.get("/ventas",      ...guard, ventas);

export default router;
