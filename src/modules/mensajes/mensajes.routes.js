import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { enviar, listarPorCurso, noLeidos, listarPorUsuario } from "./mensajes.controller.js";

const router = express.Router();

router.get("/", authGuard, listarPorUsuario);
router.post("/", authGuard, enviar);
router.get("/curso/:cursoId", authGuard, listarPorCurso);
router.get("/no-leidos", authGuard, noLeidos);

export default router;
