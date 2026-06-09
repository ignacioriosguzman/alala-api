import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { validate } from "../../middlewares/validate.js";
import { reviewSchema } from "../../validators/schemas.js";
import { crear, listarPorCurso, promedio } from "./reviews.controller.js";

const router = express.Router();

router.post("/", authGuard, validate(reviewSchema), crear);
router.get("/curso/:cursoId", listarPorCurso);
router.get("/promedio/:cursoId", promedio);

export default router;
