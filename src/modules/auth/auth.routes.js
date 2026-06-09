import express from "express";
import rateLimit from "express-rate-limit";
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
import { validate } from "../../middlewares/validate.js";
import { registerSchema, loginSchema, forgotPasswordSchema } from "../../validators/schemas.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta más tarde.' },
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de registro. Intenta más tarde.' },
});
const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de recuperación. Intenta más tarde.' },
});
const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' },
});

const router = express.Router();

router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/register-instructor", registerLimiter, validate(registerSchema), registrarInstructor);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/refresh", generalAuthLimiter, refresh);
router.post("/logout", generalAuthLimiter, logout);
router.post("/forgot-password", forgotLimiter, forgotPassword);
router.post("/reset-password", generalAuthLimiter, doResetPassword);
router.get("/confirmar", generalAuthLimiter, confirmar);
router.post("/reenviar-confirmacion", generalAuthLimiter, reenviar);
router.get("/me", authGuard, me);

export default router;
