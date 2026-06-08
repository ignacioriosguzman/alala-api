import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { ventas, saldo, cursos } from "./instructor.controller.js";

const router = express.Router();

const guard = [authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN")];

router.get("/ventas/:id", ...guard, ventas);
router.get("/saldo/:id", ...guard, saldo);
router.get("/cursos/:id", ...guard, cursos);

// Sin parámetro: usa el id del JWT
router.get("/ventas", ...guard, ventas);
router.get("/saldo", ...guard, saldo);
router.get("/cursos", ...guard, cursos);

export default router;
