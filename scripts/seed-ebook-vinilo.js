/**
 * Seed: MiniEbook "Vinilo de corte desde cero"
 * Uso: node scripts/seed-ebook-vinilo.js
 *
 * Crea el ebook en la BD asignado al autor definido en AUTOR_EMAIL.
 * Luego llama al endpoint /generar para producir el PDF en Railway.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const AUTOR_EMAIL = process.env.AUTOR_EMAIL || "igrigu@gmail.com";

const MANUSCRITO = `# Vinilo de corte desde cero

## Módulo 1 — Introducción al vinilo de corte

### Lección 1: Qué es el vinilo de corte y para qué sirve

El vinilo de corte es una lámina adhesiva de polímero plástico que se puede cortar con precisión mediante una máquina llamada plóter de corte. A diferencia de lo que muchos creen, no se imprime: se corta en silueta, como si fuera una plantilla que luego se adhiere a una superficie. El resultado es una gráfica limpia, duradera y de aspecto profesional.

Este material se usa en una cantidad enorme de aplicaciones cotidianas. Cuando ves el logo de una empresa en el vidrio de una tienda, una frase decorativa en la pared de una cafetería, los números en una camiseta deportiva o los stickers de un notebook, es muy probable que todo eso haya sido cortado en vinilo.

El vinilo de corte es una de las entradas más accesibles al mundo de la producción gráfica física. Con una inversión moderada puedes comenzar a producir piezas reales para clientes reales. No necesitas una imprenta ni grandes instalaciones. Muchos negocios de vinilo empiezan en una mesa de living.

Principales usos del vinilo de corte: señalética de locales comerciales, rotulación de vehículos, camisetas y ropa deportiva (vinilo textil), stickers y etiquetas personalizadas, decoración de interiores (frases, siluetas), protección de superficies, packaging personalizado.

El proceso básico tiene cuatro pasos: diseñar el archivo en un programa de computador, enviar el archivo al plóter, cortar el vinilo con la máquina y aplicar el resultado en la superficie final.

Advertencia: muchos principiantes compran el plóter antes de entender bien el proceso completo. El 80% de los problemas con vinilo de corte no son del plóter: son del archivo o de la técnica de aplicación.

### Lección 2: Tipos de vinilo — Metamark, Oracal, Avery y otros

Uno de los primeros errores que comete quien empieza en el mundo del vinilo es comprar el vinilo más barato disponible sin entender qué diferencia hay entre uno y otro. El tipo de vinilo determina el acabado, la durabilidad, la facilidad de aplicación y el costo final del proyecto.

Las tres categorías principales:

Vinilo calandrado (estándar). Es el más común y económico. Se fabrica mediante estiramiento en frío. Vida útil exterior: 2 a 5 años. Ideal para proyectos de corto y mediano plazo, eventos, decoración temporal y señalética interior.

Vinilo fundido (cast). Se fabrica mediante colado, produciendo una lámina más estable. No tiene tensiones internas, se adapta mejor a superficies curvas y su durabilidad exterior puede llegar a 7 u 8 años. Se usa para rotulación de vehículos y exteriores permanentes.

Vinilo textil (termofijado). No es adhesivo: se activa con calor mediante plancha o prensa térmica. Se usa exclusivamente en telas. Tiene acabados mate, brillante, metálico, flock y reflectante.

Marcas más usadas: Metamark (MD5 calandrado / MD7 fundido) muy popular en Latinoamérica por su buena relación calidad-precio. Oracal considerada la referencia de calidad mundial. Avery Dennison muy usada en el sector automotriz. Siser el referente mundial en vinilo textil.

Buena práctica: guarda siempre un retazo de cada tipo de vinilo con el que trabajas, pegado en una hoja con la marca, el código y la fecha. Así construyes tu propio muestrario de referencia.

### Lección 3: Herramientas básicas — plóter, espátula, transfer y más

El plóter de corte es el protagonista. Mueve una cuchilla pequeña y afilada sobre el vinilo siguiendo las instrucciones del archivo digital. No imprime: solo corta el contorno de las formas. Los modelos más comunes para iniciantes son Silhouette Cameo y Cricut. Para producción comercial, Roland CAMM-1 y Graphtec son el estándar.

La cuchilla es el consumible más importante. Las de ángulo 45° sirven para la mayoría de los vinilos estándar. Las de 60° se usan para materiales más gruesos o cortes muy detallados. Una cuchilla desgastada arruina el trabajo: cámbiala con regularidad.

La espátula o raspador (squeegee) es una herramienta de plástico rígido para alisar el vinilo y eliminar burbujas durante la aplicación. Nunca apliques vinilo sin una espátula: tus dedos no ejercen la presión uniforme que el material necesita.

El papel de transferencia (transfer) es una cinta con adhesivo débil que levanta el vinilo depilado y lo transfiere a la superficie final. Los hay de papel y de plástico transparente.

Otras herramientas útiles: cúter o bisturí para depilado fino, pinzas para piezas pequeñas, regla metálica, alcohol isopropílico para limpiar superficies, paño de microfibra y cinta de carrocero.

Lista de compra mínima para empezar: plóter de corte, vinilo calandrado brillante (negro y blanco para practicar), papel de transferencia, espátula básica, bisturí de precisión y alcohol isopropílico al 70% o superior.

## Módulo 2 — Preparación de archivos

### Lección 4: Cómo preparar archivos en Illustrator

El trabajo en vinilo de corte empieza mucho antes de encender el plóter. Empieza en el computador, frente a un programa de diseño vectorial. El estándar de la industria es Adobe Illustrator.

¿Por qué vectorial? Porque el plóter no trabaja con píxeles sino con coordenadas. Lee instrucciones de dónde mover la cuchilla, generadas por software a partir de trazados vectoriales.

Configuración inicial del documento: Unidades en milímetros. Modo de color CMYK. Tamaño del artboard igual al área de corte del plóter.

Cómo preparar el diseño para corte: primero, trabaja solo con formas vectoriales, sin sombras ni gradientes. Segundo, convierte todo texto a trazados con Texto › Crear contornos (Ctrl+Shift+O). Tercero, unifica formas superpuestas con el Buscatrazados. Cuarto, asigna un contorno de 0,001 pt en rojo puro y relleno Ninguno para indicar líneas de corte. Quinto, guarda en formato compatible: .ai, .eps, .svg o .pdf.

Advertencia: nunca envíes un .jpg o .png al plóter esperando que lo corte. Son imágenes de mapa de bits, no trazados vectoriales.

### Lección 5: Trazados, nodos y tipografías

Un nodo es un punto de anclaje en un trazado vectorial. El conjunto de nodos y segmentos forma el trazado. Cuando hay demasiados nodos mal ubicados, la cuchilla debe hacer micro-correcciones constantes, produciendo cortes irregulares.

Cómo simplificar nodos en Illustrator: Objeto › Trazado › Simplificar. Ajusta el porcentaje de precisión hasta que el trazado sea lo más simple posible sin perder la forma visible.

Cómo detectar trazados problemáticos: activa la vista de esquema con Ver › Esquema (Ctrl+Y). Busca líneas dobles, formas no cerradas, nodos flotantes y superposiciones invisibles.

Tipografías: el error más común es no convertir a curvas. Otro problema frecuente son las contraformas: las letras A, B, D, O, P, Q, R tienen islas interiores que deben manejarse con puentes o eligiendo tipografías sin contraformas para piezas pequeñas. Las tipografías muy finas tampoco funcionan: el trazo mínimo práctico para vinilo estándar es de 1,5 mm.

Tip práctico: antes de cortar, imprime el diseño en papel normal a escala real y recórtalo con tijeras. Si el papel se rompe al manipularlo, el vinilo también lo hará.

### Lección 6: Cómo evitar errores comunes antes del corte

Tomarte cinco minutos de revisión antes de cortar puede salvarte un rollo entero de vinilo.

Los 7 errores más comunes antes del corte. Primero, no hacer prueba de corte: siempre corta un test en retazo del mismo vinilo. La cuchilla debe cortar el vinilo sin atravesar el liner. Segundo, no limpiar el vinilo antes de cargar. Tercero, cargar el vinilo torcido: un milímetro de desalineación se convierte en centímetros de error. Cuarto, no verificar en vista de esquema. Quinto, usar una cuchilla desgastada. Sexto, no verificar la escala real. Séptimo, no guardar el archivo antes de enviar.

Checklist previa al corte: texto convertido a contornos, formas expandidas sin efectos vivos, superposiciones resueltas, nodos simplificados, escala verificada, archivo guardado, vinilo limpio y alineado, prueba de corte realizada y cuchilla en buen estado.

## Módulo 3 — Corte y depilado

### Lección 7: Cómo usar un plóter de corte

Antes de encender el plóter verifica que la cuchilla esté correctamente instalada. El saliente debe ser apenas mayor al grosor del vinilo, sin penetrar el liner. Carga el vinilo con las guías alineadas y ajusta las ruedas de presión.

El proceso de corte paso a paso: primero, prueba de corte usando la función test cut. Corta un cuadrado pequeño con un triángulo interior; si el triángulo sale limpio sin llevarse el papel, la configuración es correcta. Segundo, define el origen moviendo el cabezal al punto de inicio. Tercero, envía el archivo desde el software de corte verificando la escala. Cuarto, supervisa el corte observando los primeros segundos.

Variables principales: la presión determina si la cuchilla penetra suficiente. La velocidad determina la precisión en curvas. Para curvas muy cerradas, baja la velocidad aunque tarde más. Un corte lento y preciso es siempre mejor que uno rápido y rugoso.

Advertencia: nunca dejes el plóter solo durante un corte largo sin haberlo supervisado al menos los primeros dos minutos. Un problema de alimentación puede arruinar metros de vinilo en segundos.

### Lección 8: Técnicas de depilado

Depilar es el proceso de retirar manualmente el vinilo sobrante que rodea el diseño, dejando solo las partes que quieres transferir. Es una de las tareas más meditativas del trabajo con vinilo.

La herramienta principal es un bisturí o un gancho de depilado (weeding hook). El gancho tiene una punta fina y curva que permite levantar esquinas sin dañar las piezas del diseño. Para piezas muy pequeñas, añade una pinza.

Técnica básica: empieza siempre por las piezas más grandes de descarte (el fondo exterior). Levanta una esquina con el gancho y jala suavemente a 45 grados. Si el corte fue correcto, el vinilo sobrante saldrá limpio. Para las piezas interiores (contraformas de letras), trabaja despacio y con buena luz.

Errores de depilado más comunes: levantar piezas del diseño ocurre cuando el corte fue superficial; dejar restos de vinilo adherido ocurre cuando se jala demasiado rápido; perder detalles finos ocurre cuando el diseño es demasiado pequeño.

Buena práctica: si trabajas con un diseño complejo, depila por secciones. Divide el trabajo en zonas y supervisa cada una.

### Lección 9: Transferencia y aplicación en superficies simples

La superficie debe estar limpia, seca y sin grasa. Usa alcohol isopropílico al 70% o superior con un paño de microfibra. No apliques sobre superficies muy frías (bajo 10°C) ni muy calientes (sobre 35°C).

El proceso de aplicación paso a paso: primero, coloca el vinilo con transfer encima sobre la superficie. Usa cinta de carrocero para hacer una bisagra en un borde y verificar la posición sin que se pegue. Segundo, satisfecho con la posición, presiona un extremo con la espátula y jala el liner hacia atrás a 180 grados. Tercero, pasa la espátula firmemente de centro hacia los bordes, eliminando burbujas. Cuarto, retira el transfer lentamente a 45 grados. Si alguna parte del diseño se levanta, presiona nuevamente y espera 30 segundos antes de reintentar.

Advertencia en superficies porosas: en paredes con pintura mate o superficies texturizadas, el vinilo adhesivo estándar puede no pegar bien. Verifica siempre la compatibilidad del adhesivo con la superficie.

## Módulo 4 — Proyectos simples

### Lección 10: Stickers

Los stickers son el proyecto de entrada más popular y uno de los más rentables en pequeña escala. Con poca inversión de material y tiempo puedes producir piezas con alta demanda: regalería, merchandising, eventos, papelería y decoración personal.

Un buen sticker tiene tres características: diseño limpio (funciona a escala pequeña), buen material (durable en el uso real) y acabado prolijo (bordes sin rebabas, sin restos de adhesivo visible).

Los stickers de vinilo de corte son monocromáticos o de un solo color por capa. Para stickers multicolor, cada color es una capa de vinilo diferente cortada y aplicada por separado.

Proceso completo de un sticker: diseña en Illustrator manteniendo el diseño simple (funciona mejor a 5–10 cm). Corta en vinilo con borde de contorno a 2–3 mm del diseño (kiss cut). Depila el área exterior. Opcionalmente aplica laminado. Corta el contorno exterior.

Tip de negocio: los stickers en formato hoja (varias unidades en una misma hoja A4 o A5) son más fáciles de manejar, más económicos de producir y más atractivos para el cliente que los stickers sueltos.

### Lección 11: Frases decorativas

Las frases decorativas en vinilo son un producto de alta demanda para decoración de interiores: habitaciones, cocinas, baños, oficinas y espacios comerciales.

Para frases decorativas, la tipografía es el diseño. Las tipografías script (manuscritas) de trazo grueso son elegantes y se depilan bien. Evita scripts muy finas para piezas de menos de 8 cm de alto. Las tipografías sans serif también funcionan muy bien para frases modernas y minimalistas.

Antes de cortar, imprime la frase a escala real y colócala en la pared con cinta. ¿Se lee bien? ¿El tamaño es proporcional al espacio? Ajusta todo antes de cortar. Para frases de más de 60 cm de ancho, trabaja por tramos.

Aplicación en paredes: limpia con paño ligeramente húmedo sin alcohol (puede dañar la pintura). Usa nivel y lápiz para marcar una guía horizontal. Aplica con el método de bisagra. Pasa espátula con fieltro. Retira el transfer muy lentamente.

Advertencia: el vinilo removible (Oracal 631) es la opción correcta para paredes en arriendo o paredes con pintura delicada. El vinilo permanente puede dañar la pintura al retirarse.

### Lección 12: Señalética básica

La señalética es uno de los mercados más estables para quienes trabajan con vinilo. Locales comerciales, restaurantes, clínicas, oficinas y edificios necesitan señalética constantemente.

Tipos de señalética que puedes hacer: vidrieras y ventanas con horarios, nombres de empresa y logotipos. Paredes internas con nombres de departamentos y flechas. Puertas con indicaciones básicas. Vehículos con nombre y teléfono de empresa.

La señalética tiene reglas propias. El mensaje debe leerse en uno o dos segundos: tipografía clara (sans serif), contraste fuerte, jerarquía de texto bien definida, y nada de decoración que compita con el mensaje. Para señalética en vidrieras por dentro, el diseño debe cortarse en espejo para leerse correctamente desde afuera.

Cómo cotizar señalética básica: no cotices solo por el material. Considera diseño, material, corte, depilado, aplicación y desplazamiento. El metro cuadrado instalado en vinilo calandrado estándar puede cotizarse entre 3 y 6 veces el costo del material.

Buena práctica: entrega siempre una prueba de posición (el diseño impreso en papel a escala real pegado con cinta) antes de cortar el vinilo definitivo.

## Conclusión

Aprender vinilo de corte no es solo aprender a usar una máquina. Es aprender a transformar una idea en algo físico, tangible, que alguien puede ver, tocar y usar. Eso tiene un valor que va mucho más allá de la técnica.

Los primeros cortes no van a ser perfectos. El primer depilado va a sacar más vinilo del que debía. La primera aplicación va a tener una burbuja que no lograrás quitar. Todo eso es parte del proceso y es completamente normal.

Lo que separa a quienes dominan el vinilo de quienes se frustran no es el talento ni el equipo. Es la disposición a hacer, a fallar en pequeño, a entender el error y a intentarlo de nuevo. Cada rollo de vinilo que practicas es una inversión en el ojo que te permite ver los problemas antes de que ocurran.

El vinilo de corte es una puerta de entrada generosa al mundo de la producción gráfica. Empieza hoy. Con lo que tienes. Donde estás.`;

async function main() {
  console.log("🌱 Creando MiniEbook: Vinilo de corte desde cero...\n");

  const autor = await prisma.user.findUnique({
    where: { email: AUTOR_EMAIL },
    select: { id: true, nombre: true, role: true },
  });

  if (!autor) {
    console.error(`❌ No se encontró usuario con email: ${AUTOR_EMAIL}`);
    process.exit(1);
  }

  if (!["INSTRUCTOR", "CREATOR", "ADMIN"].includes(autor.role)) {
    console.error(`❌ El usuario ${AUTOR_EMAIL} tiene rol ${autor.role}. Necesita INSTRUCTOR, CREATOR o ADMIN.`);
    process.exit(1);
  }

  console.log(`✅ Autor encontrado: ${autor.nombre} (ID: ${autor.id})\n`);

  // Verificar si ya existe
  const existe = await prisma.miniEbook.findFirst({
    where: { titulo: "Vinilo de corte desde cero" },
  });

  if (existe) {
    console.log(`⚠️  Ya existe el MiniEbook (ID: ${existe.id}) — omitido`);
    console.log(`\n💡 Para regenerar el PDF ve a: https://alala.cl/panel-miniebooks.html`);
    process.exit(0);
  }

  const ebook = await prisma.miniEbook.create({
    data: {
      titulo: "Vinilo de corte desde cero",
      descripcion: "Todo lo que necesitas para empezar a cortar, depilar y aplicar vinilo de manera profesional. Desde las herramientas hasta los primeros proyectos reales.",
      descripcionLarga: "Un curso completo y práctico para quienes quieren aprender vinilo de corte desde cero. Cubre los tipos de vinilo disponibles en el mercado, la preparación de archivos en Illustrator, el uso del plóter, las técnicas de depilado y aplicación, y tres proyectos de entrada: stickers, frases decorativas y señalética básica. Incluye checklist de preparación, guía de errores comunes y ejercicios por módulo.",
      manuscritoTexto: MANUSCRITO,
      portadaUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      template: "minimalista",
      categoria: "Diseño",
      palabrasClave: ["vinilo", "corte", "plóter", "diseño", "señalética", "stickers"],
      idioma: "es",
      precio: 0,
      status: "activo",
      paginas: 35,
      palabras: 6500,
      autorId: autor.id,
    },
  });

  console.log(`✅ MiniEbook creado (ID: ${ebook.id})`);
  console.log(`\n──────────────────────────────────────────────────────`);
  console.log(`Título: ${ebook.titulo}`);
  console.log(`Estado: ${ebook.status}`);
  console.log(`Precio: ${ebook.precio === 0 ? "Gratis" : `$${ebook.precio.toLocaleString("es-CL")} CLP`}`);
  console.log(`──────────────────────────────────────────────────────`);
  console.log(`\n📄 Próximo paso — Generar el PDF:`);
  console.log(`   Ve a https://alala.cl/panel-miniebooks.html`);
  console.log(`   Busca el ebook y haz clic en "Generar PDF"`);
  console.log(`   O llama directamente:`);
  console.log(`   POST /api/v1/miniebooks/${ebook.id}/generar  (con tu JWT)\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
