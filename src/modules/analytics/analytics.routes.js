import express from "express";
import jwt from "jsonwebtoken";
import { authGuard } from "../../middlewares/authGuard.js";
import { evento, dashboardCurso, resumenInstructor } from "./analytics.controller.js";

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch {
      // token inválido o expirado, continuar sin usuario
    }
  }
  next();
};

router.post("/evento", optionalAuth, evento);
router.get("/curso/:cursoId", authGuard, dashboardCurso);
router.get("/instructor/:id", authGuard, resumenInstructor);

export default router;
