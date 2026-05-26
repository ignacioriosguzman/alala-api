import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokens.js";

const prisma = new PrismaClient();

export const registerUser = async (data) => {
  const hashed = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      password: hashed
    }
  });
};

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id }
  });

  return { user, accessToken, refreshToken };
};
