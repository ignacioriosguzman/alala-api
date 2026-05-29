import express from "express";
import { register, registrarInstructor, login, refresh, logout, forgotPassword, doResetPassword } from "./auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/register-instructor", registrarInstructor);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", doResetPassword);

export default router;
