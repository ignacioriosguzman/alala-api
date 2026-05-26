import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const COURSE_FIELDS = [
  "titulo", "descripcion", "descripcion_larga", "objetivos",
  "contenido_programa", "requisitos", "nivel", "duracion",
  "materiales", "beneficios", "instructor", "instructor_bio",
  "modulos", "categoria", "precio",
  "imagen", "ciudad", "lat", "lng",
  "modalidad", "direccion",
];

const sanitize = (data) => {
  const clean = {};
  for (const key of COURSE_FIELDS) {
    if (data[key] !== undefined) {
      if (key === "precio") {
        clean[key] = Number(data[key]);
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

export const getCursos = () => prisma.course.findMany();
export const getCurso = (id) => prisma.course.findUnique({ where: { id: Number(id) } });
export const createCurso = (data) => prisma.course.create({ data: sanitize(data) });
export const updateCurso = (id, data) =>
  prisma.course.update({ where: { id: Number(id) }, data: sanitize(data) });
export const deleteCurso = (id) =>
  prisma.course.delete({ where: { id: Number(id) } });
