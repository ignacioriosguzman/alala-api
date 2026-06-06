import { Router } from "express";
import { suscribir, desuscribir, listar } from "./newsletter.controller.js";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";

const router = Router();

router.post("/suscribir", suscribir);
router.post("/desuscribir", desuscribir);
router.get("/lista", authGuard, roleGuard("ADMIN"), listar);

export default router;
