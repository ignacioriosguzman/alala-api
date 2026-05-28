import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { enviar, listarPorCurso, noLeidos } from "./mensajes.controller.js";

const router = express.Router();

router.post("/", authGuard, enviar);
router.get("/curso/:cursoId", authGuard, listarPorCurso);
router.get("/no-leidos", authGuard, noLeidos);

export default router;
