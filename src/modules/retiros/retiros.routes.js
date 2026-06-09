import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { validate } from "../../middlewares/validate.js";
import { solicitudRetiroSchema, procesarRetiroSchema } from "../../validators/schemas.js";
import { saldo, solicitar, historial, pendientes, procesar } from "./retiros.controller.js";

const router = express.Router();

const instructorGuard = [authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN")];
const adminGuard      = [authGuard, roleGuard("ADMIN")];

router.get("/saldo",    ...instructorGuard, saldo);
router.post("/solicitar", ...instructorGuard, validate(solicitudRetiroSchema), solicitar);
router.get("/historial", ...instructorGuard, historial);

// Admin
router.get("/admin/pendientes", ...adminGuard, pendientes);
router.patch("/admin/:id/estado", ...adminGuard, validate(procesarRetiroSchema), procesar);

export default router;
