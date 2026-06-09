/**
 * Seed: cursos iniciales de ALALÁ
 * Uso: node scripts/seed-cursos-iniciales.js
 *
 * Crea 2 cursos fundacionales asignados al instructor
 * cuyo email se define en INSTRUCTOR_EMAIL.
 * Si el instructor no existe, el script falla con mensaje claro.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const INSTRUCTOR_EMAIL = process.env.INSTRUCTOR_EMAIL || "igrigu@gmail.com";

// ─────────────────────────────────────────────────────────────────────────────
// Módulos del curso principal (guardados como JSON en el campo `modulos`)
// ─────────────────────────────────────────────────────────────────────────────
const MODULOS_PROYECTOS_CULTURALES = JSON.stringify([
  {
    numero: 1,
    titulo: "Fundamentos: qué es un proyecto cultural digital",
    descripcion: "Entendemos el ecosistema, los conceptos clave y por qué el contexto chileno tiene sus propias reglas.",
    lecciones: [
      { numero: 1, titulo: "¿Qué hace que un proyecto sea 'cultural'?", duracion: "18 min" },
      { numero: 2, titulo: "El ecosistema digital en Chile: plataformas, audiencias y oportunidades", duracion: "22 min" },
      { numero: 3, titulo: "Errores comunes en proyectos culturales que fracasan rápido", duracion: "15 min" },
    ],
  },
  {
    numero: 2,
    titulo: "Idea y concepto: cómo encontrar tu propuesta única",
    descripcion: "Herramientas para generar ideas, validarlas con comunidades reales y definir una propuesta de valor que no copie.",
    lecciones: [
      { numero: 1, titulo: "Mapa de audiencias: quién necesita lo que tienes", duracion: "20 min" },
      { numero: 2, titulo: "De idea a concepto: la diferencia que define el éxito", duracion: "25 min" },
      { numero: 3, titulo: "Ejercicio práctico: define tu proyecto en una frase", duracion: "30 min" },
      { numero: 4, titulo: "Feedback temprano: cómo validar sin lanzar", duracion: "18 min" },
    ],
  },
  {
    numero: 3,
    titulo: "Estructura y planificación",
    descripcion: "Aprende a construir un plan de proyecto real: fases, hitos, recursos y métricas culturales.",
    lecciones: [
      { numero: 1, titulo: "El plan de proyecto en una página (método ALALÁ)", duracion: "28 min" },
      { numero: 2, titulo: "Gestión de tiempo en proyectos creativos: por qué todo tarda el doble", duracion: "20 min" },
      { numero: 3, titulo: "Herramientas gratuitas para organizar equipos creativos", duracion: "22 min" },
    ],
  },
  {
    numero: 4,
    titulo: "Contenido digital y plataformas",
    descripcion: "Cómo crear, publicar y distribuir contenido cultural en el ecosistema digital chileno.",
    lecciones: [
      { numero: 1, titulo: "Producción de contenido con recursos mínimos", duracion: "35 min" },
      { numero: 2, titulo: "Redes sociales para proyectos culturales: qué funciona y qué no", duracion: "28 min" },
      { numero: 3, titulo: "Construcción de comunidad antes del lanzamiento", duracion: "22 min" },
      { numero: 4, titulo: "SEO básico para proyectos culturales", duracion: "18 min" },
    ],
  },
  {
    numero: 5,
    titulo: "Financiamiento y sostenibilidad",
    descripcion: "Modelos de negocio para proyectos culturales, fondos FONDART, crowdfunding y monetización digital.",
    lecciones: [
      { numero: 1, titulo: "Modelos de financiamiento en la cultura chilena", duracion: "30 min" },
      { numero: 2, titulo: "Cómo presentar un proyecto a un fondo (FONDART y otros)", duracion: "40 min" },
      { numero: 3, titulo: "Crowdfunding cultural: casos de éxito y fracaso en Chile", duracion: "25 min" },
      { numero: 4, titulo: "Monetización digital: venta de tickets, membresías y contenido", duracion: "22 min" },
    ],
  },
  {
    numero: 6,
    titulo: "Lanzamiento y comunidad",
    descripcion: "Estrategias de lanzamiento, cómo construir una comunidad activa y mantener el proyecto vivo en el tiempo.",
    lecciones: [
      { numero: 1, titulo: "El lanzamiento no es el final: cómo mantener el impulso", duracion: "20 min" },
      { numero: 2, titulo: "Comunidad: la diferencia entre audiencia y tribu", duracion: "25 min" },
      { numero: 3, titulo: "Métricas culturales: qué medir más allá de los likes", duracion: "18 min" },
    ],
  },
  {
    numero: 7,
    titulo: "Proyecto final y próximos pasos",
    descripcion: "Presentación del proyecto completo, retroalimentación y recursos para continuar aprendiendo.",
    lecciones: [
      { numero: 1, titulo: "Presentación de proyectos: feedback del instructor", duracion: "60 min" },
      { numero: 2, titulo: "Recursos, comunidades y redes para gestores culturales digitales", duracion: "15 min" },
    ],
  },
]);

const MODULOS_INTRO_ALALA = JSON.stringify([
  {
    numero: 1,
    titulo: "Bienvenida a ALALÁ",
    descripcion: "Qué es la plataforma, cómo está organizada y cómo sacarle el máximo provecho.",
    lecciones: [
      { numero: 1, titulo: "¿Qué es ALALÁ y para quién es?", duracion: "5 min" },
      { numero: 2, titulo: "Cómo navegar la plataforma: cursos, revista y contenidos", duracion: "8 min" },
      { numero: 3, titulo: "Crear tu cuenta y configurar tu perfil", duracion: "6 min" },
    ],
  },
  {
    numero: 2,
    titulo: "Guía para alumnos",
    descripcion: "Todo lo que necesitas saber para inscribirte en cursos, interactuar con instructores y acceder a tu contenido.",
    lecciones: [
      { numero: 1, titulo: "Cómo buscar y elegir un curso", duracion: "7 min" },
      { numero: 2, titulo: "El proceso de pago: seguro, simple y local", duracion: "5 min" },
      { numero: 3, titulo: "Acceder a tus cursos y materiales", duracion: "6 min" },
    ],
  },
  {
    numero: 3,
    titulo: "Guía para instructores y creadores",
    descripcion: "Cómo publicar tu primer curso, subir contenido y usar el panel de instructor.",
    lecciones: [
      { numero: 1, titulo: "Registrarse como creador", duracion: "5 min" },
      { numero: 2, titulo: "Publicar tu primer curso: paso a paso", duracion: "10 min" },
      { numero: 3, titulo: "El panel de instructor: ventas, mensajes y retiros", duracion: "8 min" },
    ],
  },
]);

// ─────────────────────────────────────────────────────────────────────────────
// Datos de los cursos
// ─────────────────────────────────────────────────────────────────────────────
const CURSOS = (instructorId, instructorNombre) => [
  {
    titulo: "Cómo crear proyectos culturales digitales desde cero",
    descripcion:
      "Un curso completo para gestores culturales, artistas y emprendedores creativos que quieren llevar sus proyectos al mundo digital. Desde la idea hasta el lanzamiento, con herramientas reales y casos del contexto chileno.",
    descripcionLarga:
      "Vivimos en un momento único para la cultura digital en Chile. Las barreras de entrada son más bajas que nunca, las audiencias están más fragmentadas y atentas que antes, y hay una demanda real de proyectos auténticos que conecten con las comunidades locales.\n\nEste curso está diseñado para quienes tienen una idea cultural —un festival, una plataforma, un proyecto editorial, una comunidad de práctica— y quieren transformarla en algo concreto, financiable y sostenible.\n\nA lo largo de 7 módulos y más de 20 horas de contenido, aprenderás a validar tu idea, construir tu estrategia digital, acceder a financiamiento (FONDART, crowdfunding, monetización directa) y lanzar con comunidad real.\n\nNo es un curso teórico. Cada módulo termina con ejercicios prácticos aplicados a tu proyecto específico, y el módulo final incluye una sesión de feedback individual con el instructor.",
    objetivos:
      "Diseñar y presentar un proyecto cultural digital completo\nValidar una idea con audiencias reales antes de invertir recursos\nCrear una estrategia de contenido para redes y plataformas digitales\nPostular a fondos públicos y privados de financiamiento cultural\nLanzar con una comunidad comprometida desde el día uno",
    contenidoPrograma:
      "7 módulos | 21 lecciones | +20 horas de contenido\n\nMódulo 1: Fundamentos del proyecto cultural digital\nMódulo 2: Idea y concepto\nMódulo 3: Planificación y estructura\nMódulo 4: Contenido y plataformas\nMódulo 5: Financiamiento y sostenibilidad\nMódulo 6: Lanzamiento y comunidad\nMódulo 7: Proyecto final",
    requisitos:
      "No se requiere experiencia previa en gestión cultural digital\nSe requiere tener una idea de proyecto en mente (puede ser vaga)\nAcceso a computador con internet\nDisposición para trabajar en ejercicios prácticos entre sesiones",
    nivel: "todos",
    duracion: "8 semanas | 20+ horas de contenido",
    materiales:
      "Plantilla de plan de proyecto (Google Docs)\nGuía de fondos y financiamiento cultural en Chile\nKit de lanzamiento: checklist + cronograma\nAcceso a comunidad privada de participantes",
    beneficios:
      "Proyecto cultural digital completo y listo para presentar\nRed de contactos con otros gestores y creadores\nAcceso permanente a los materiales\nCertificado de participación",
    instructor: instructorNombre,
    instructorBio:
      "Gestor cultural digital con más de 10 años de experiencia en proyectos culturales en Chile. Ha colaborado con organizaciones como el CNCA, festivales independientes y colectivos creativos de Santiago, Valparaíso y Concepción. Docente en la Universidad de Chile y fundador de ALALÁ.",
    instructorUserId: instructorId,
    modulos: MODULOS_PROYECTOS_CULTURALES,
    categoria: "Cultura",
    precio: 89000,
    imagen:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80&fm=webp&auto=format",
    ciudad: "Santiago",
    modalidad: "online",
  },
  {
    titulo: "Introducción a ALALÁ: aprende a usar la plataforma",
    descripcion:
      "Una guía rápida y gratuita para aprender todo lo que necesitas sobre ALALÁ: cómo explorar cursos, inscribirte, publicar tu propio contenido y sacarle el máximo provecho a la plataforma.",
    descripcionLarga:
      "Bienvenido/a a ALALÁ. Este curso de introducción gratuito está pensado para que, en menos de una hora, tengas claridad total sobre cómo funciona la plataforma, ya sea que vengas como alumno o como instructor.\n\nSi eres alumno, aprenderás a encontrar los cursos que más te interesan, entender el proceso de pago seguro con Flow (el sistema de pagos local de Chile), acceder a tu contenido comprado y comunicarte con tu instructor.\n\nSi eres instructor o quieres serlo, aprenderás a registrarte como creador, publicar tu primer curso con el formulario guiado, y usar el panel de instructor para seguir tus ventas, mensajes y retiros.\n\nTres módulos. Nueve lecciones. Sin rodeos.",
    objetivos:
      "Entender qué es ALALÁ y cómo está organizada\nNavegar la plataforma con confianza\nInscribirte en cursos y acceder a tu contenido\nPublicar tu primer curso como instructor\nUsar el panel de instructor de forma básica",
    contenidoPrograma:
      "3 módulos | 9 lecciones | ~45 minutos\n\nMódulo 1: Bienvenida a ALALÁ\nMódulo 2: Guía para alumnos\nMódulo 3: Guía para instructores",
    requisitos: "Ninguno. Este curso es para cualquier persona que llegue a ALALÁ.",
    nivel: "todos",
    duracion: "45 minutos",
    materiales: "Acceso a la plataforma ALALÁ (gratuito)",
    beneficios:
      "Dominio completo de la plataforma\nConfianza para explorar, comprar y vender en ALALÁ",
    instructor: instructorNombre,
    instructorBio:
      "Equipo ALALÁ — Plataforma de cursos culturales y de bienestar en Chile.",
    instructorUserId: instructorId,
    modulos: MODULOS_INTRO_ALALA,
    categoria: "Tecnología creativa",
    precio: 0,
    imagen:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=1200&q=80&fm=webp&auto=format",
    ciudad: "Online",
    modalidad: "online",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Iniciando seed de cursos iniciales ALALÁ...\n");

  const instructor = await prisma.user.findUnique({
    where: { email: INSTRUCTOR_EMAIL },
    select: { id: true, nombre: true, role: true, email: true },
  });

  if (!instructor) {
    console.error(`❌ No se encontró usuario con email: ${INSTRUCTOR_EMAIL}`);
    console.error("   Crea el instructor primero o cambia INSTRUCTOR_EMAIL.");
    process.exit(1);
  }

  if (!["INSTRUCTOR", "CREATOR", "ADMIN"].includes(instructor.role)) {
    console.error(
      `❌ El usuario ${INSTRUCTOR_EMAIL} tiene rol ${instructor.role}.`
    );
    console.error("   Solo INSTRUCTOR, CREATOR o ADMIN pueden ser propietarios de cursos.");
    process.exit(1);
  }

  console.log(
    `✅ Instructor encontrado: ${instructor.nombre} (ID: ${instructor.id}, rol: ${instructor.role})\n`
  );

  const cursos = CURSOS(instructor.id, instructor.nombre);
  const resultados = [];

  for (const cursoData of cursos) {
    // Verificar si ya existe por título para evitar duplicados
    const existe = await prisma.course.findFirst({
      where: { titulo: cursoData.titulo },
    });

    if (existe) {
      console.log(`⚠️  Ya existe: "${cursoData.titulo}" (ID: ${existe.id}) — omitido`);
      resultados.push({ titulo: cursoData.titulo, id: existe.id, accion: "omitido" });
      continue;
    }

    const nuevo = await prisma.course.create({ data: cursoData });
    console.log(`✅ Creado: "${nuevo.titulo}" (ID: ${nuevo.id}) — $${nuevo.precio === 0 ? "Gratis" : nuevo.precio.toLocaleString("es-CL")} CLP`);
    resultados.push({ titulo: nuevo.titulo, id: nuevo.id, accion: "creado" });
  }

  console.log("\n──────────────────────────────────────────────────────");
  console.log("Resumen:");
  resultados.forEach((r) =>
    console.log(`  [${r.accion.toUpperCase()}] ${r.titulo} (ID: ${r.id})`)
  );
  console.log("──────────────────────────────────────────────────────");
  console.log("\n🎉 Seed completado.\n");
  console.log(
    "💡 Tip: Ahora ve a https://alala.cl/panel-instructor.html para ver los cursos.\n"
  );
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
