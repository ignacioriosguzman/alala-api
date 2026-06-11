import express from "express";
import { authGuard, optionalAuth } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { evento, dashboardCurso, resumenInstructor } from "./analytics.controller.js";

const router = express.Router();

router.post("/evento", optionalAuth, evento);
router.get("/curso/:cursoId", authGuard, dashboardCurso);
router.get("/instructor/:id", authGuard, roleGuard('INSTRUCTOR', 'CREATOR', 'ADMIN'), resumenInstructor);

export default router;
