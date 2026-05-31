import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokens.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarDatosUsuario({ nombre, email, password }) {
  if (!nombre?.trim()) throw new Error("El nombre es requerido");
  if (!email || !EMAIL_RE.test(email)) throw new Error("El correo electrónico no es válido");
  if (!password || password.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres");
}

async function generarTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id } });
  return { accessToken, refreshToken };
}

// El secreto incluye el email del usuario: si cambia el email, el token queda inválido
function secretoVerificacion(user) {
  return process.env.JWT_SECRET + user.email;
}

export function generarTokenVerificacion(user) {
  return jwt.sign(
    { id: user.id, email: user.email, type: 'verify' },
    secretoVerificacion(user),
    { expiresIn: '24h' }
  );
}

export const registerUser = async (data) => {
  validarDatosUsuario(data);
  const existe = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existe) throw new Error("Este email ya está registrado");
  const hashed = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { nombre: data.nombre.trim(), email: data.email.toLowerCase(), password: hashed }
  });
  const tokens = await generarTokens(user);
  return { user, ...tokens };
};

export const registerInstructor = async (data) => {
  validarDatosUsuario(data);
  const existe = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existe) throw new Error("Este email ya está registrado");
  const hashed = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      nombre: data.nombre.trim(),
      email: data.email.toLowerCase(),
      password: hashed,
      role: "INSTRUCTOR",
      verificado: false,
    },
  });
  const verificationToken = generarTokenVerificacion(user);
  return { user, verificationToken };
};

export const loginUser = async (email, password) => {
  if (!email || !password) return null;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  if (user.role === 'INSTRUCTOR' && !user.verificado) {
    const err = new Error('Debes confirmar tu correo para iniciar sesión');
    err.code = 'EMAIL_NOT_VERIFIED';
    throw err;
  }

  const tokens = await generarTokens(user);
  return { user, ...tokens };
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) return null;
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored) return null;
  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) return null;
  const accessToken = generateAccessToken(user);
  return { accessToken, user };
};

export const confirmarEmailInstructor = async (token) => {
  // Decodificar sin verificar para obtener el id
  let payload;
  try {
    payload = jwt.decode(token);
  } catch {
    throw new Error('Token inválido');
  }
  if (!payload?.id || payload.type !== 'verify') throw new Error('Token inválido');

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) throw new Error('Usuario no encontrado');
  if (user.verificado) return { ya_verificado: true, user };

  // Verificar firma con el secreto correcto
  try {
    jwt.verify(token, secretoVerificacion(user));
  } catch {
    throw new Error('El enlace de confirmación es inválido o ha expirado. Solicita uno nuevo.');
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { verificado: true },
  });
  return { ya_verificado: false, user: updated };
};

export const reenviarConfirmacion = async (email) => {
  if (!email || !EMAIL_RE.test(email)) throw new Error('Email inválido');
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  // Respuesta genérica para no revelar si el email existe
  if (!user || user.role !== 'INSTRUCTOR') return null;
  if (user.verificado) return null;
  const verificationToken = generarTokenVerificacion(user);
  return { user, verificationToken };
};

// Forgot password: token JWT de un solo uso firmado con JWT_SECRET + hash_password
export const generarTokenReset = async (email) => {
  const emailNorm = (email || '').trim().toLowerCase();
  if (!emailNorm || !EMAIL_RE.test(emailNorm)) {
    console.warn('[auth][generarTokenReset] Email inválido o vacío — raw recibido:', JSON.stringify(email));
    return null;
  }
  console.log('[auth][generarTokenReset] Buscando usuario con email normalizado:', emailNorm);
  const user = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (!user) {
    console.warn('[auth][generarTokenReset] Usuario no encontrado para email:', emailNorm);
    return null;
  }
  console.log('[auth][generarTokenReset] ✓ Usuario encontrado — id:', user.id, '| role:', user.role, '| verificado:', user.verificado);

  const secret = process.env.JWT_SECRET + user.password;
  const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1h' });
  console.log('[auth][generarTokenReset] ✓ Token generado. Procediendo a enviar correo.');
  return { token, user };
};

export const resetPassword = async (userId, token, newPassword) => {
  if (!newPassword || newPassword.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuario no encontrado");

  const secret = process.env.JWT_SECRET + user.password;
  try {
    jwt.verify(token, secret);
  } catch {
    throw new Error("El enlace de recuperación es inválido o ha expirado");
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  await prisma.refreshToken.deleteMany({ where: { userId } });
  return true;
};
