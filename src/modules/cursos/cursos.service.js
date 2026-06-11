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

export const getCursos = async ({ limit, offset } = {}) => {
  const [courses, contenidos] = await Promise.all([
    prisma.course.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.contenidoDigital.findMany({
      where: { status: "activo" },
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { nombre: true } } },
    }),
  ]);

  // Normalizar ContenidoDigital con la misma estructura que Course
  const contenidosComo = (contenidos ?? []).map(c => ({
    id: c.id,
    titulo: c.titulo,
    descripcion: c.descripcion,
    descripcion_larga: c.descripcionLarga ?? null,
    instructor: c.creator?.nombre ?? "Creador ALALA",
    categoria: c.categoria,
    precio: c.precioOferta ?? c.precio,
    imagen: c.portadaUrl ?? null,
    modalidad: "online",
    nivel: c.nivel ?? "todos",
    duracion: null,
    ciudad: null,
    lat: null,
    lng: null,
    direccion: null,
    _tipo: "contenido",
    _subtipo: c.tipo,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  const cursosConTipo = (courses ?? []).map(c => ({ ...c, _tipo: "curso" }));
  const todos = [...cursosConTipo, ...contenidosComo];
  if (limit == null) return todos;
  const off = Number(offset) || 0;
  return todos.slice(off, off + Number(limit));
};
export const getCurso = async (id) => {
  const course = await prisma.course.findUnique({
    where: { id: Number(id) },
    include: { _count: { select: { alumnos: true } } },
  });
  if (course) return { ...course, _tipo: "curso" };

  // Fallback: buscar en ContenidoDigital si no existe como Course
  const c = await prisma.contenidoDigital.findUnique({
    where: { id: Number(id), status: "activo" },
    include: { creator: { select: { nombre: true } } },
  });
  if (!c) return null;
  return {
    id: c.id,
    titulo: c.titulo,
    descripcion: c.descripcion,
    descripcion_larga: c.descripcionLarga ?? null,
    instructor: c.creator?.nombre ?? "Creador ALALA",
    categoria: c.categoria,
    precio: c.precioOferta ?? c.precio,
    imagen: c.portadaUrl ?? null,
    modalidad: "online",
    nivel: c.nivel ?? "todos",
    duracion: null,
    ciudad: null,
    lat: null,
    lng: null,
    _tipo: "contenido",
    _subtipo: c.tipo,
    pdfUrl: c.pdfUrl,
    _count: { alumnos: c.ventas ?? 0 },
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
};
export const createCurso = (data) => prisma.course.create({ data: sanitize(data) });
export const updateCurso = (id, data) =>
  prisma.course.update({ where: { id: Number(id) }, data: sanitize(data) });
export const deleteCurso = (id) =>
  prisma.$transaction([
    prisma.favorite.deleteMany({ where: { courseId: Number(id) } }),
    prisma.review.deleteMany({ where: { cursoId: Number(id) } }),
    prisma.enrollment.deleteMany({ where: { courseId: Number(id) } }),
    prisma.venta.deleteMany({ where: { courseId: Number(id) } }),
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

export const getMisCursos = async (userId) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { createdAt: 'desc' },
  });
  return enrollments.map(e => ({
    ...e.course,
    _tipo: 'curso',
    fechaCompra: e.createdAt,
  }));
};

export const verificarAcceso = async (userId, courseId) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId: Number(courseId) },
  });
  return { tieneAcceso: !!enrollment };
};
