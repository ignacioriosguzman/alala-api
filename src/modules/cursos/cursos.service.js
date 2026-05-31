import prisma from "../../lib/prisma.js";



const COURSE_FIELDS = [
  "titulo", "descripcion", "descripcion_larga", "objetivos",
  "contenido_programa", "requisitos", "nivel", "duracion",
  "materiales", "beneficios", "instructor", "instructor_bio",
  "modulos", "categoria", "precio",
  "imagen", "ciudad", "lat", "lng",
  "modalidad", "direccion", "instructorUserId",
];

const sanitize = (data) => {
  const clean = {};
  for (const key of COURSE_FIELDS) {
    if (data[key] !== undefined) {
      if (["precio", "instructorUserId"].includes(key)) {
        const n = Number(data[key]);
        if (!isNaN(n)) clean[key] = n;
      } else if (["lat", "lng"].includes(key)) {
        const val = parseFloat(data[key]);
        clean[key] = isNaN(val) ? null : val;
      } else {
        clean[key] = data[key];
      }
    }
  }
  return clean;
};

export const getCursos = () => prisma.course.findMany({ orderBy: { createdAt: "desc" } });
export const getCurso = (id) => prisma.course.findUnique({ where: { id: Number(id) } });
export const createCurso = (data) => prisma.course.create({ data: sanitize(data) });
export const updateCurso = (id, data) =>
  prisma.course.update({ where: { id: Number(id) }, data: sanitize(data) });
export const deleteCurso = (id) =>
  prisma.$transaction([
    prisma.favorite.deleteMany({ where: { courseId: Number(id) } }),
    prisma.review.deleteMany({ where: { cursoId: Number(id) } }),
    prisma.enrollment.deleteMany({ where: { courseId: Number(id) } }),
    prisma.mensaje.deleteMany({ where: { cursoId: Number(id) } }),
    prisma.course.delete({ where: { id: Number(id) } }),
  ]);

export const upsellRecomendaciones = async (id, limit = 3) => {
  const curso = await prisma.course.findUnique({ where: { id: Number(id) } });
  if (!curso) return [];
  return prisma.course.findMany({
    where: {
      id: { not: Number(id) },
      OR: [
        { categoria: curso.categoria },
        { instructorUserId: curso.instructorUserId },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: Number(limit),
    select: {
      id: true, titulo: true, imagen: true, precio: true,
      categoria: true, instructor: true,
    },
  });
};
