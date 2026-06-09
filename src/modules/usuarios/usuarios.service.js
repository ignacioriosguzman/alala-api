import prisma from "../../lib/prisma.js";

const USER_PUBLIC = {
  id: true, nombre: true, email: true, role: true,
  verificado: true, createdAt: true, updatedAt: true,
};

// Solo campos seguros para perfiles públicos (sin email)
const USER_PROFILE_PUBLIC = {
  id: true, nombre: true, role: true, createdAt: true,
};

const ALLOWED_FIELDS_USER = ['nombre'];
const ALLOWED_FIELDS_ADMIN = ['nombre', 'email', 'role', 'verificado'];

function sanitizeUpdate(data, isAdmin) {
  const allowed = isAdmin ? ALLOWED_FIELDS_ADMIN : ALLOWED_FIELDS_USER;
  const clean = {};
  for (const key of allowed) {
    if (data[key] !== undefined) clean[key] = data[key];
  }
  return clean;
}

export const getUsuarios = () => prisma.user.findMany({ select: USER_PUBLIC });
export const getUsuario = (id) => prisma.user.findUnique({ where: { id: Number(id) }, select: USER_PUBLIC });
export const getUsuarioPublico = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: USER_PROFILE_PUBLIC,
  });
  if (!user) return null;
  // Solo exponer perfiles de creadores/instructores (no alumnos)
  if (!['INSTRUCTOR', 'CREATOR', 'ADMIN'].includes(user.role)) return null;
  const [seguidores, cursos] = await Promise.all([
    prisma.userFollow.count({ where: { seguidoId: Number(id) } }).catch(() => 0),
    prisma.course.count({ where: { instructorUserId: Number(id) } }).catch(() => 0),
  ]);
  return { ...user, seguidores, totalCursos: cursos };
};
export const updateUsuario = (id, data, isAdmin = false) =>
  prisma.user.update({ where: { id: Number(id) }, data: sanitizeUpdate(data, isAdmin), select: USER_PUBLIC });
export const deleteUsuario = (id) =>
  prisma.user.delete({ where: { id: Number(id) } });
