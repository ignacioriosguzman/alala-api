import express from "express";
import {
  register,
  registrarInstructor,
  login,
  refresh,
  logout,
  forgotPassword,
  doResetPassword,
  confirmar,
  reenviar,
  me,
} from "./auth.controller.js";
import { authGuard } from "../../middlewares/authGuard.js";

const router = express.Router();

router.post("/register", register);
router.post("/register-instructor", registrarInstructor);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", doResetPassword);
router.get("/confirmar", confirmar);
router.post("/reenviar-confirmacion", reenviar);
router.get("/me", authGuard, me);

export default router;
