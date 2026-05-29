import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { crear, listarPorCurso, promedio } from "./reviews.controller.js";

const router = express.Router();

router.post("/", authGuard, crear);
router.get("/curso/:cursoId", listarPorCurso);
router.get("/promedio/:cursoId", promedio);

export default router;
