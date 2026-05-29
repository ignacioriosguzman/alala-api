import { registerUser, registerInstructor, loginUser, refreshAccessToken, generarTokenReset, resetPassword } from "./auth.service.js";
import prisma from "../../lib/prisma.js";
import { enviarEmailRecuperacion } from "../../services/email.service.js";

const handleAuthError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Auth] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

const userPublic = (u) => ({ id: u.id, nombre: u.nombre, email: u.email, role: u.role });

export const register = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await registerUser(req.body);
    res.status(201).json({
      message: "Usuario registrado",
      user: userPublic(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};

export const registrarInstructor = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await registerInstructor(req.body);
    res.status(201).json({
      message: "Instructor registrado correctamente",
      user: userPublic(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    const result = await loginUser(email, password);
    if (!result) return res.status(401).json({ error: "Credenciales inválidas" });
    res.json({ user: userPublic(result.user), accessToken: result.accessToken, refreshToken: result.refreshToken });
  } catch (error) {
    handleAuthError(error, res);
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken requerido' });
    const result = await refreshAccessToken(refreshToken);
    if (!result) return res.status(401).json({ error: 'Token inválido o expirado' });
    res.json({ accessToken: result.accessToken, user: userPublic(result.user) });
  } catch (error) {
    handleAuthError(error, res);
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ message: 'Sesión cerrada' });
  } catch {
    res.json({ message: 'Sesión cerrada' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const result = await generarTokenReset(email);

    // Siempre responder OK (no revelar si el email existe)
    if (result) {
      const resetUrl = `${process.env.FRONTEND_URL || 'https://alala.cl'}/reset-password.html?id=${result.user.id}&token=${encodeURIComponent(result.token)}`;
      try {
        await enviarEmailRecuperacion({ email: result.user.email, nombre: result.user.nombre, resetUrl });
      } catch (emailErr) {
        console.error('[auth] Error enviando email de recuperación:', emailErr.message);
      }
    }

    res.json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
  } catch (error) {
    handleAuthError(error, res);
  }
};

export const doResetPassword = async (req, res) => {
  try {
    const { id, token, password } = req.body;
    if (!id || !token || !password) {
      return res.status(400).json({ error: 'Parámetros incompletos' });
    }
    await resetPassword(Number(id), token, password);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    handleAuthError(error, res);
  }
};
