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
    },
  });
  const tokens = await generarTokens(user);
  return { user, ...tokens };
};

export const loginUser = async (email, password) => {
  if (!email || !password) return null;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
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

// Forgot password: genera un token JWT de un solo uso firmado con JWT_SECRET + hash_password
// Al cambiar la contraseña, el token queda automáticamente invalidado.
export const generarTokenReset = async (email) => {
  if (!email || !EMAIL_RE.test(email)) return null;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null; // No revelar si el email existe (seguridad)

  // El secreto combina JWT_SECRET con el hash actual — se invalida al cambiar contraseña
  const secret = process.env.JWT_SECRET + user.password;
  const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1h' });
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
  // Invalidar todos los refresh tokens del usuario
  await prisma.refreshToken.deleteMany({ where: { userId } });
  return true;
};
