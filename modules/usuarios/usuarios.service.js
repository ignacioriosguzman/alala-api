import prisma from "../../lib/prisma.js";



export const getUsuarios = () => prisma.user.findMany();
export const getUsuario = (id) => prisma.user.findUnique({ where: { id: Number(id) } });
export const updateUsuario = (id, data) =>
  prisma.user.update({ where: { id: Number(id) }, data });
export const deleteUsuario = (id) =>
  prisma.user.delete({ where: { id: Number(id) } });
