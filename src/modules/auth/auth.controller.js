import {
  registerUser,
  registerInstructor,
  loginUser,
  refreshAccessToken,
  generarTokenReset,
  resetPassword,
  confirmarEmailInstructor,
  reenviarConfirmacion,
} from "./auth.service.js";
import prisma from "../../lib/prisma.js";
import {
  enviarEmailRecuperacion,
  enviarEmailVerificacionInstructor,
  enviarEmailBienvenidaInstructor,
} from "../../services/email.service.js";

const FRONTEND = process.env.FRONTEND_URL || 'https://alala.cl';

const handleAuthError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Auth] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

const userPublic = (u) => ({
  id: u.id,
  nombre: u.nombre,
  email: u.email,
  role: u.role,
  verificado: u.verificado,
});

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
    const { user, verificationToken } = await registerInstructor(req.body);

    // Responder inmediatamente — envío de email en background
    res.status(201).json({
      message: "Instructor registrado. Revisa tu correo para confirmar tu cuenta.",
      user: userPublic(user),
    });

    const confirmUrl = `${FRONTEND}/confirmar.html?token=${encodeURIComponent(verificationToken)}`;
    enviarEmailVerificacionInstructor({ email: user.email, nombre: user.nombre, confirmUrl })
      .then(r => {
        if (r?.fallback) console.error('[auth][registrarInstructor] 🚫 SMTP mal configurado. Correo de verificación NO enviado a:', user.email);
      })
      .catch(err => console.error('[auth][registrarInstructor] 🚫 Error SMTP al enviar verificación:', err.message));
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
    res.json({
      user: userPublic(result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    if (error.code === 'EMAIL_NOT_VERIFIED') {
      return res.status(403).json({
        error: error.message,
        code: 'EMAIL_NOT_VERIFIED',
      });
    }
    handleAuthError(error, res);
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken requerido' });
    const result = await refreshAccessToken(refreshToken);
    if (!result) return res.status(401).json({ error: 'Token inválido o expirado' });
    res.json({ accessToken: result.accessToken, refreshToken: result.refreshToken, user: userPublic(result.user) });
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
    const email = (req.body.email || '').trim();
    if (!email) return res.status(400).json({ error: 'Email requerido' });
    const result = await generarTokenReset(email);

    // Responder inmediatamente — no bloquear esperando al servidor SMTP
    res.json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });

    if (!result) return;

    const resetUrl = `${FRONTEND}/reset-password.html?id=${result.user.id}&token=${encodeURIComponent(result.token)}`;
    enviarEmailRecuperacion({ email: result.user.email, nombre: result.user.nombre, resetUrl })
      .then(r => {
        if (r?.fallback) {
          console.error('[auth][forgotPassword] 🚫 CORREO NO ENVIADO (SMTP mal configurado). Destinatario:', result.user.email);
          console.error('[auth][forgotPassword] Revisa los logs de [email] arriba. Lo más probable: falta SMTP_FROM en Railway.');
        } else if (!r?.ok) {
          console.error('[auth][forgotPassword] 🚫 CORREO RECHAZADO POR SMTP. Destinatario:', result.user.email, 'Error:', r?.error);
        } else {
          console.log('[auth][forgotPassword] ✓ Correo de recuperación enviado a:', result.user.email);
        }
      })
      .catch(err => console.error('[auth][forgotPassword] 🚫 Error SMTP al enviar recuperación:', err.message));
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

export const confirmar = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token requerido' });

    const result = await confirmarEmailInstructor(token);
    if (result.ya_verificado) {
      return res.json({ ok: true, message: 'Tu cuenta ya estaba confirmada. Puedes iniciar sesión.' });
    }

    res.json({ ok: true, message: '¡Cuenta confirmada! Ya puedes iniciar sesión como instructor.' });

    // Correo de bienvenida — solo en la primera confirmación, en background
    enviarEmailBienvenidaInstructor({ email: result.user.email, nombre: result.user.nombre })
      .then(r => {
        if (r?.ok) {
          console.log('[auth][confirmar] ✓ Correo de bienvenida enviado a:', result.user.email);
        } else {
          console.error('[auth][confirmar] ✗ Correo de bienvenida no enviado a:', result.user.email, r?.error || '');
        }
      })
      .catch(err => console.error('[auth][confirmar] ✗ Error enviando bienvenida:', err.message));
  } catch (error) {
    handleAuthError(error, res);
  }
};

export const reenviar = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const result = await reenviarConfirmacion(email);
    // Responder inmediatamente — envío en background
    res.json({ message: 'Si el correo corresponde a una cuenta de instructor pendiente, recibirás el enlace de confirmación.' });

    if (result) {
      const confirmUrl = `${FRONTEND}/confirmar.html?token=${encodeURIComponent(result.verificationToken)}`;
      enviarEmailVerificacionInstructor({ email: result.user.email, nombre: result.user.nombre, confirmUrl })
        .then(r => {
          if (r?.fallback) console.error('[auth][reenviar] 🚫 SMTP mal configurado. Correo de confirmación NO reenviado a:', result.user.email);
        })
        .catch(err => console.error('[auth][reenviar] 🚫 Error SMTP al reenviar verificación:', err.message));
    }
  } catch (error) {
    handleAuthError(error, res);
  }
};
