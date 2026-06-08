import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { saldo, solicitar, historial, pendientes, procesar } from "./retiros.controller.js";

const router = express.Router();

const instructorGuard = [authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN")];
const adminGuard      = [authGuard, roleGuard("ADMIN")];

router.get("/saldo",    ...instructorGuard, saldo);
router.post("/solicitar", ...instructorGuard, solicitar);
router.get("/historial", ...instructorGuard, historial);

// Admin
router.get("/admin/pendientes", ...adminGuard, pendientes);
router.patch("/admin/:id/estado", ...adminGuard, procesar);

export default router;
