import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const EJEMPLOS = [
  // ═══════════════════════════════════════════════════════════
  // MICROTEXTOS (6)
  // ═══════════════════════════════════════════════════════════
  {
    titulo: "El silencio de las cosas rotas",
    descripcion: "Una reflexión breve sobre los objetos que guardamos después de una pérdida y el peso emocional que cargan.",
    contenido: `Hay cajas que no se abren en años. No porque estén cerradas con llave, sino porque contienen el peso exacto de un recuerdo que ya no sabemos cómo nombrar. Guardamos el jarrón que se cayó de la mesa, la bufanda que ya no usamos, la carta que nunca enviamos. Las cosas rotas tienen una peculiaridad: no duelen por lo que son, sino por lo que representan.\n\nEn cada grieta habita una ausencia. En cada fragmento, una pregunta sin respuesta. A veces pienso que no somos nostálgicos, somos arqueólogos de nuestro propio dolor, excavando con cuidado entre los escombros para encontrar algo que nos devuelva la sensación de estar completos.\n\nPero hay belleza en lo roto también. El kintsugi japonés enseña que las grietas deben rellenarse con oro, no ocultarse. Quizás las pérdidas no son para olvidarlas, sino para integrarlas en nuestra historia con un brillo distinto.`,
    tipo: "microtexto",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1516546453174-5e1098a4b4af?w=800&q=80",
    categoria: "Reflexión",
    palabrasClave: ["pérdida", "nostalgia", "kintsugi", "emociones"],
    paginas: 1,
    lecturaMin: 3,
    autorId: 1,
  },
  {
    titulo: "Carta a quien nunca llegó",
    descripcion: "Un microcuento epistolar sobre las oportunidades que pasan de largo cuando el miedo habla más alto que el deseo.",
    contenido: `Querido tú:\n\nTe escribo desde el tren que nunca tomamos juntos. Desde la estación donde te vi por última vez, con tu abrigo gris y tu mirada de alguien que también estaba a punto de decir algo.\n\nNunca supe qué. Eso es lo que me tortura: no saber si era un adiós o un quédate. El silencio entre nosotros era tan denso que podrías haber construido un puente sobre él. Pero ninguno de los dos supo poner el primer tablón.\n\nAhora miro por la ventana y cada paisaje que pasa tiene tu forma. Cada persona que sube lleva algo de tu andar. Quizás eso sea el amor no dicho: una geografía que habitamos sin permiso, un mapa trazado con las uñas sobre la mesa de un café.\n\nTe escribo para decirte que no importa. Que ya no importa. Que lo único que me queda es esta carta, doblada en cuatro, guardada en el cajón donde guardo las cosas que nunca envié.\n\nCon todo lo que no dije,\nYo.`,
    tipo: "microtexto",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1516961642265-531546e84af2?w=800&q=80",
    categoria: "Ficción",
    palabrasClave: ["microcuento", "carta", "amor", "miedo"],
    paginas: 2,
    lecturaMin: 5,
    autorId: 1,
  },
  {
    titulo: "Manual de supervivencia para introvertidos en fiestas",
    descripcion: "Reflexión humorística y cálida sobre cómo navegar el caos social sin perder la identidad.",
    contenido: `Regla número uno: no tienes que quedarte toda la noche. Tu presencia no es un contrato de arrendamiento. Puedes aparecer, saludar, comer un canapé y desaparecer como ninja con problemas de socialización.\n\nRegla número dos: encuentra a otro introvertido. Se reconocen por la mirada: esos ojos que barren la habitación buscando una salida o, al menos, una planta con la que entablar conversación. Juntos forman un pacto silencioso de no juzgarse mutuamente por pasar veinte minutos hablando del clima.\n\nRegla número tres: el baño es tu santuario. No es cobardía, es estrategia. Tres minutos de soledad auditiva pueden recargar tus baterías sociales por media hora más. Llévate el teléfono si quieres, pero no lo mires. Solo respira.\n\nRegla número cuatro: no pidas disculpas por ser quien eres. El mundo necesita oyentes. Necesita gente que piense antes de hablar, que observe antes de juzgar, que prefiera una conversación profunda a diez superficiales.\n\nRegla número cinco: cuando llegues a casa, quítate los zapatos, abrázate a ti mismo y recuerda: sobreviviste. Y lo harás de nuevo.`,
    tipo: "microtexto",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
    categoria: "Humor",
    palabrasClave: ["introversión", "social", "supervivencia", "humor"],
    paginas: 2,
    lecturaMin: 4,
    autorId: 1,
  },
  {
    titulo: "Poema para los que construyen con las manos",
    descripcion: "Texto poético dedicado a artesanos, carpinteros y creadores que piensan con los dedos.",
    contenido: `Tus manos no son herramientas,\nson traductoras.\nConvierten la idea en materia,\nel sueño en grano,\nla intención en nudo.\n\nMientras el mundo habla de eficiencia,\ntú hablas de paciencia.\nMientras otros buscan atajos,\ntú eliges la línea recta del cincel,\nel camino lento de la lija,\nla conversación silenciosa entre la madera y el aceite.\n\nNo hay algoritmo para lo que haces.\nNo hay app que reemplace la calidez\nde algo hecho a mano, con tiempo,\ncon error, con corrección,\ncon la huella digital de tu atención.\n\nEres arquitecto de lo tangible\nen una era que olvida cómo se siente\ntocar algo real.\n\nY eso, amigo mío,\nes una forma de resistencia.`,
    tipo: "microtexto",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80",
    categoria: "Poesía",
    palabrasClave: ["artesanía", "poesía", "manualidad", "creación"],
    paginas: 1,
    lecturaMin: 2,
    autorId: 1,
  },
  {
    titulo: "La última librería del mundo",
    descripcion: "Microcuento distópico sobre un lugar donde todavía se puede oler el papel.",
    contenido: `En el año 2087, cuando todos los libros habían migrado a la nube y la nube se había evaporado en una actualización de sistema, quedó una sola librería.\n\nEstaba en una calle empedrada de Valparaíso, entre una ferretería abandonada y un café que todavía servía espresso hecho por humanos. Su dueño, un señor llamado Elías, tenía ochenta y tres años y la memoria de quinientos títulos.\n\n—No vendo libros —decía a quien entraba—. Los alquilo por tiempo indefinido. La condición es que los leas en voz alta, al menos una página, antes de devolverlos.\n\nLa gente venía de todas las ciudades-arcología del continente. No por los libros, sino por el ritual. Por la sensación de pasar páginas que no se deslizaban, que tenían peso, que dejaban polvo de años entre los dedos.\n\nUn día, un niño preguntó: —Señor, ¿qué es un final feliz?\n\nElías le entregó un libro sin cubierta y sonrió. —Algo que tú tienes que construir. Yo solo te doy las palabras.\n\nEsa noche, la librería cerró más tarde de lo habitual. Y en la oscuridad, entre estantes que olían a papel viejo, alguien leyó en voz alta por primera vez en décadas.`,
    tipo: "microtexto",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
    categoria: "Ficción",
    palabrasClave: ["distopía", "libros", "futuro", "literatura"],
    paginas: 3,
    lecturaMin: 6,
    autorId: 1,
  },
  {
    titulo: "Pequeña teoría del desorden creativo",
    descripcion: "Reflexión sobre por qué el caos organizado es el hábitat natural de las ideas.",
    contenido: `Mi escritorio es un mapa de mi cerebro. No hay límites claros entre lo que es importante y lo que es aparentemente basura. Hay una servilleta con una frase escrita a las tres de la mañana junto a un libro de física cuántica que nunca terminé de leer. Junto a eso, una piedra lisa que recogí en una playa en 2019 y que, por alguna razón, me recuerda a mi abuela.\n\nHe intentado ser ordenado. He comprado agendas, aplicaciones de productividad, cajas con etiquetas. Pero las ideas no llegan en horario de oficina. Llegan cuando estás cortando cebolla, cuando te distraes con una mancha en la pared, cuando encuentras una foto antigua debajo del sofá.\n\nEl desorden no es flojera. Es topografía emocional. Cada objeto en el caos es una posible conexión. El artista no ordena para crear; ordena después, cuando ya no hay nada más que excavar.\n\nAsí que deja el desorden. No como excusa, sino como estrategia. Tu caos tiene un orden que solo tú entiendes. Y eso es suficiente.`,
    tipo: "microtexto",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    categoria: "Creatividad",
    palabrasClave: ["creatividad", "caos", "escritura", "productividad"],
    paginas: 2,
    lecturaMin: 4,
    autorId: 1,
  },

  // ═══════════════════════════════════════════════════════════
  // MANUALES (6)
  // ═══════════════════════════════════════════════════════════
  {
    titulo: "Cómo crear tu primer fanzine artesanal",
    descripcion: "Guía paso a paso para concebir, diagramar, imprimir y encuadernar un fanzine desde cero, sin necesidad de equipamiento profesional.",
    contenido: `# CAPÍTULO 1: LA IDEA\n\nUn fanzine no necesita permiso. No necesita editorial, ISBN ni distribuidora. Necesita urgencia: la necesidad de decir algo que no cabe en una red social. Antes de tocar papel, responde: ¿qué te quema? Eso es tu tema.\n\n# CAPÍTULO 2: MATERIALES BÁSICOS\n\n• Papel bond o couche de 90g (20 hojas mínimo)\n• Una impresora láser o de inyección (tinta negra es suficiente)\n• Cutter, regla metálica, base de corte\n• Hilo encerado o lino para encuadernación\n• Aguja de ojo grande\n• Opcional: sellos de goma, washi tape, recortes de revista\n\n# CAPÍTULO 3: DIAGRAMACIÓN\n\nEl formato más común es A5 (media carta). Diseña en Canva, InDesign o incluso Word. La regla de oro: máximo 3 tipografías. Deja márgenes generosos (2 cm mínimo). Numeración de páginas siempre en el exterior.\n\n# CAPÍTULO 4: IMPRESIÓN Y PLIEGO\n\nImprime en modo "folleto" si tu software lo permite. Si no, imprime páginas pares e impares por separado y ordénalas manualmente. El pliego más simple: dobla un stack de hojas por la mitad y cosé por el centro.\n\n# CAPÍTULO 5: ENCUADERNACIÓN COSTURA\n\n1. Haz tres agujeros en el lomo con la aguja\n2. Pasa el hilo por el centro, sube por el agujero superior, baja por el inferior\n3. Vuelve al centro y anuda\n4. Deja 5 cm de cola para decoración\n\n# CAPÍTULO 6: DISTRIBUCIÓN\n\nRegálalo en ferias, déjalo en cafés, vendelo en Instagram. Un fanzine bien hecho tiene alma de objeto: la gente lo guarda, lo presta, lo deja en el baño de un bar para que un desconocido lo encuentre.`,
    tipo: "manual",
    precio: 3500,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
    categoria: "Artes visuales",
    palabrasClave: ["fanzine", "autoedición", "encuadernación", "DIY"],
    paginas: 12,
    lecturaMin: 25,
    autorId: 1,
  },
  {
    titulo: "Guía rápida para fotografía móvil",
    descripcion: "Técnicas de composición, luz y edición para sacar fotografías profesionales con tu teléfono celular.",
    contenido: `# 1. LUZ, SIEMPRE LUZ\n\nLa fotografía es pintar con luz. Tu sensor móvil es pequeño; necesita luz generosa. La hora dorada (justo después del amanecer o antes del atardecer) es tu aliada. Evita el sol cenital (12:00-14:00) salvo que busques sombras duras con intención.\n\n# 2. REGLA DE LOS TERCIOS\n\nActiva la cuadrícula en tu cámara. Coloca el sujeto en uno de los cuatro puntos de intersección. No centres todo. El espacio vacío también habla.\n\n# 3. ENFOQUE Y EXPOSICIÓN\n\nToca la pantalla donde quieras enfocar. Desliza el dedo hacia arriba/abajo para ajustar exposición. Subexpón ligeramente (-0.3 EV): recuperar sombras es más fácil que recuperar luces quemadas.\n\n# 4. ESTABILIDAD\n\nUsa ambas manos. Apoya los codos. Respira, exhala, dispara. Para nocturnas, usa un trípode de bolsillo o apoya el teléfono contra una superficie. Activa el temporizador de 3 segundos.\n\n# 5. EDICIÓN MÓVIL\n\nApps recomendadas:\n• Lightroom Mobile (control total de curvas y color)\n• Snapseed (herramientas selectivas gratuitas)\n• VSCO (filtros cinematográficos sutiles)\n\nFlujo básico: ajusta exposición → recorta/Endereza → balance de blancos → curvas (sube sombras, baja luces) → nitidez (+15) → exporta en calidad máxima.\n\n# 6. LA ÚLTIMA REGLA\n\nLa mejor cámara es la que llevas puesta. Y la mejor foto es la que te hace sentir algo. Todo lo demás es técnica.`,
    tipo: "manual",
    precio: 2900,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    categoria: "Fotografía",
    palabrasClave: ["fotografía", "móvil", "edición", "composición"],
    paginas: 8,
    lecturaMin: 15,
    autorId: 1,
  },
  {
    titulo: "Cómo escribir un microcuento en 10 minutos",
    descripcion: "Método práctico de generación de ficción breve con ejercicios, ejemplos y estructuras probadas.",
    contenido: `# EL MÉTODO 10-MINUTOS\n\n## Minuto 0-1: El disparador\n\nEscribe una frase que comience con alguna de estas palabras: "Cuando", "Después de", "Si nunca", "Ella guardaba", "El último". No pienses. Escribe.\n\nEjemplo: "Ella guardaba los tickets de cine en un frasco de mermelada."\n\n## Minuto 1-3: El personaje\n\nResponde rápido:\n- ¿Qué quiere este personaje en este momento exacto?\n- ¿Qué le impide tenerlo?\n- ¿Qué está dispuesto a arriesgar?\n\n## Minuto 3-5: La vuelta de tuerca\n\nEl microcuento vive del giro. Piensa: ¿qué revelación puede cambiar todo lo que el lector cree saber? Debe caber en una oración.\n\nEjemplo: "El frasco estaba vacío desde 1987."\n\n## Minuto 5-7: El cuerpo\n\nEscribe sin parar. Máximo 300 palabras. Regla: una sola escena. Un solo espacio. Un solo momento decisivo.\n\n## Minuto 7-9: La poda\n\nElimina:\n- Adjetivos innecesarios\n- Explicaciones (muestra, no cuentes)\n- La primera oración (a menudo es solo calentamiento)\n\n## Minuto 9-10: El título\n\nEl título debe funcionar como una línea más del texto. No resuma. Sugiera. Contradiga. Amplifique.\n\n# TRES ESTRUCTURAS PROBADAS\n\n1. **La revelación retardada**: presenta una escena cotidiana, luego revela un detalle que la recontextualiza.\n2. **El espejo**: comienza y termina con la misma imagen, pero el significado ha cambiado.\n3. **La negación**: el personaje dice que no siente algo, pero cada acción demuestra lo contrario.\n\n# EJERCICIO FINAL\n\nUsa este disparador: "Nunca supo por qué guardaba las llaves de un auto que ya no tenía."\nTiempo: 10 minutos. Límite: 250 palabras. A escribir.`,
    tipo: "manual",
    precio: 2500,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    categoria: "Escritura",
    palabrasClave: ["escritura", "microcuento", "creatividad", "técnica"],
    paginas: 10,
    lecturaMin: 20,
    autorId: 1,
  },
  {
    titulo: "Guía de cerámica en casa para principiantes",
    descripcion: "Todo lo que necesitas para empezar a modelar arcilla en tu propia casa: materiales, técnicas básicas, secado y horneado.",
    contenido: `# ANTES DE COMENZAR\n\nLa cerámica es tierra, agua, fuego y paciencia. No necesitas un torno profesional para empezar. Necesitas ganas de ensuciarte las manos y aceptar que el primer intento será feo. Eso es parte del trato.\n\n# MATERIALES INICIALES\n\n• Arcilla de baja temperatura (roja o blanca, 5 kg)\n• Tabla de madera o MDF para trabajar\n• Herramientas básicas: espátula, alambre para cortar, esponja\n• Palillos de madera para modelado\n• Cuerda de nailon (para cortar piezas del torno, si lo usas)\n\n# TÉCNICA 1: PINCHADO\n\n1. Haz una bola de arcilla del tamaño de un pomelo\n2. Introduce el pulgar en el centro y gira lentamente\n3. Ve apretando las paredes hacia arriba con los dedos índice y pulgar\n4. Grosor ideal: 1 cm en la base, 0.8 cm en paredes\n\n# TÉCNICA 2: PLACAS\n\nAmasa la arcilla, extiéndela con un rodillo (o botella de vino) sobre dos reglas de 1 cm de espesor. Corta formas con un cúter. Une las piezas con barbotina (arcilla líquida).\n\n# SECADO\n\n• Cubre tus piezas con plástico las primeras 24 horas para que sequen lento\n• Luego destapa y deja secar 3-5 días\n• El sonido de campana indica que está lista para el horno\n\n# HORNEADO\n\nSi no tienes horno de cerámica, busca talleres comunitarios o centros culturales que alquilen espacio de horneado. La baja temperatura (1000°C) es suficiente para piezas decorativas.\n\n# LA ÚLTima LECCIÓN\n\nLa cerámica enseña humildad. Cada pieza que se agrieta, cada taza que queda torcida, cada plato que explota en el horno, es una lección. No hay errores, solo resultados inesperados. Y a veces, los inesperados son los más bellos.`,
    tipo: "manual",
    precio: 4500,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
    categoria: "Artesanía",
    palabrasClave: ["cerámica", "arcilla", "manualidades", "hogar"],
    paginas: 14,
    lecturaMin: 30,
    autorId: 1,
  },
  {
    titulo: "Cómo organizar tu primer evento cultural",
    descripcion: "Desde la idea hasta el cierre: presupuesto, espacio, difusión, logística y evaluación para eventos culturales independientes.",
    contenido: `# FASE 1: LA IDEA Y EL PÚBLICO (Semanas 1-2)\n\nDefine claramente qué, para quién y por qué. Un evento cultural no es "hacer algo bonito". Es crear una experiencia que transforme, aunque sea por una hora, la percepción de quien asiste.\n\nPreguntas clave:\n- ¿Cuál es la pregunta que tu evento responde?\n- ¿Quién necesita esta respuesta?\n- ¿Qué se llevará consigo al salir?\n\n# FASE 2: PRESUPUESTO REALISTA\n\nCategorías esenciales:\n• Espacio y permisos\n• Difusión (gráfica, redes, prensa)\n• Infraestructura (sillas, sonido, iluminación)\n• Staff (catering, seguridad, producción)\n• Colchón de emergencia (15% del total)\n\nFuentes de financiamiento: crowfunding, fondos culturales municipales, entradas, sponsors locales (cafés, librerías, imprentas).\n\n# FASE 3: ESPACIO\n\nConsidera no solo el aforo, sino la acústica, la circulación, los baños, la accesibilidad y la atmósfera. Un espacio pequeño y bien pensado vence a un teatro mal iluminado.\n\n# FASE 4: DIFUSIÓN\n\nCalendario ideal:\n- 6 semanas antes: Save the date en redes\n- 4 semanas: venta de entradas abierta\n- 2 semanas: prensa local y newsletters\n- 1 semana: recordatorios diarios con valor agregado\n\n# FASE 5: EL DÍA DEL EVENTO\n\nChecklist: sonido probado, agua para expositores, señalética clara, fotógrafo asignado, persona de contacto visible, plan B para lluvia/cortes de luz.\n\n# FASE 6: CIERRE Y APRENDIZAJE\n\nEnvía encuesta a los asistentes. Agradece a cada colaborador por nombre. Calcula tus números. Documenta todo con fotos. El mejor evento del año que viene empieza con las notas del evento de este año.`,
    tipo: "manual",
    precio: 3900,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    categoria: "Gestión cultural",
    palabrasClave: ["eventos", "producción", "cultura", "organización"],
    paginas: 16,
    lecturaMin: 35,
    autorId: 1,
  },
  {
    titulo: "Manual de bordado contemporáneo",
    descripcion: "Técnicas de bordado moderno para crear piezas decorativas, textos bordados y reparaciones artísticas de ropa.",
    contenido: `# INTRODUCCIÓN\n\nEl bordado ha dejado de ser abuelita en el rocking chair. Hoy es protesta, es identidad, es arte textil. Este manual te enseña a bordar con intención, no solo con destreza.\n\n# MATERIALES\n\n• Bastidor de madera (15-20 cm para empezar)\n• Tela de algodón o lino de trama cerrada\n• Hilos mouliné (DMC o similar, 6 hebras)\n• Aguja de punta redonda n° 24-26\n• Tijeras pequeñas de punta fina\n• Lápiz soluble en agua o tiza de sastre\n\n# PUNTOS BÁSICOS\n\n**Punto recto**: la base de todo. Entra, sale, repite. Puede formar líneas, contornos, rellenos.\n\n**Punto atrás**: ideal para letras y contornos precisos. Parece una línea continua.\n\n**Punto cruz (cross stitch)**: clásico, geométrico. Perfecto para patrones repetitivos.\n\n**Punto satinado**: relleno denso y brillante. Usa hebras completas. Trabaja siempre del centro hacia afuera.\n\n**Punto de nudo francés**: textura, ojos, pistilos. Enrolla el hilo dos veces alrededor de la aguja antes de clavar.\n\n# PROYECTO 1: BORDA TU PRIMERA FRASE\n\n1. Escribe la frase en papel cuadriculado\n2. Transfiere a la tela con lápiz soluble\n3. Usa punto atrás para las letras\n4. Agrega un pequeño diseño con punto satinado alrededor\n5. Lava suavemente para eliminar marcas\n\n# PROYECTO 2: REPARACIÓN ARTÍSTICA (SASHIKO)\n\nEl sashiko japonés no oculta la rasgadura, la celebra. Borda líneas paralelas sobre el daño. Usa hilo azul índigo sobre tela blanca para el look clásico.\n\n# CUIDADO Y MANTENCIÓN\n\nLava a mano con agua fría. No retuerzas. Seca plano. El bordado bien hecho dura décadas. Es un acto de resistencia contra la obsolescencia programada.`,
    tipo: "manual",
    precio: 4200,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1623600990468-4d544b2d9680?w=800&q=80",
    categoria: "Textil",
    palabrasClave: ["bordado", "textil", "manualidades", "arte"],
    paginas: 12,
    lecturaMin: 28,
    autorId: 1,
  },

  // ═══════════════════════════════════════════════════════════
  // INSTRUCTIVOS (4)
  // ═══════════════════════════════════════════════════════════
  {
    titulo: "Cómo hacer tinta natural con cáscaras de cebolla",
    descripcion: "Instructivo paso a paso para fabricar tinta vegana, duradera y olorosa usando residuos de cocina.",
    contenido: `# MATERIALES\n\n• 10 cáscaras de cebolla (más cáscaras = tinta más oscura)\n• 2 tazas de agua\n• 1 cucharadita de vinagre blanco (fijador)\n• 1/2 cucharadita de sal\n• Un frasco de vidrio limpio\n• Colador de tela\n• Olla vieja (la cebolla tiñe)\n\n# PASO 1: RECOLECCIÓN\n\nJunta cáscaras de cebolla durante una semana. No importa si son rojas, amarillas o blancas. Cada una aporta un tono diferente.\n\n# PASO 2: COCCIÓN\n\n1. Pon las cáscaras en la olla con el agua\n2. Hierve a fuego medio por 30 minutos\n3. El agua se tornará ámbar, luego marrón cobrizo\n4. Si hierves 60 minutos, obtendrás un marrón profundo casi negro\n\n# PASO 3: FILTRADO\n\n1. Deja enfriar 10 minutos\n2. Cuela por la tela exprimiendo bien\n3. Desecha las cáscaras (compostables, por supuesto)\n\n# PASO 4: FIJAje\n\nAgrega vinagre y sal al líquido caliente. Mezcla hasta disolver. El vinagre actúa como fijador natural. La sal conserva.\n\n# PASO 5: ALMACENAMIENTO\n\nVierte en el frasco de vidrio. Etiqueta con fecha. Durabilidad: 6-12 meses en lugar fresco y oscuro. Agita antes de usar.\n\n# USOS\n\n• Caligrafía con plumilla de bambú\n• Sellos y estarcidos\n• Teñido de papel artesanal\n• Pintura en acuarela (mezcla con goma arábiga)\n\n# NOTA FINAL\n\nLa tinta de cebolla huele a especias cuando está fresca. Ese olor desaparece al secarse. Cada trazo que hagas con ella lleva la historia de una comida compartida.`,
    tipo: "instructivo",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80",
    categoria: "Artes visuales",
    palabrasClave: ["tinta", "natural", "sustentable", "DIY"],
    paginas: 3,
    lecturaMin: 7,
    autorId: 1,
  },
  {
    titulo: "Instructivo: Encuadernación copta en 8 pasos",
    descripcion: "Aprende la encuadernación copta, una técnica milenaria que permite que el libro se abra completamente plano.",
    contenido: `# QUÉ ES LA ENCUADERNACIÓN COPTA\n\nOriginaria de Egipto (siglo II d.C.), es una encuadernación sin adhesivo que usa costura expuesta en el lomo. Su ventaja: el libro abre 180° plano, ideal para sketchbooks y diarios.\n\n# MATERIALES\n\n• 5-10 hojas de papel plegadas en cuadernillos (grupos de 4 hojas dobladas)\n• 2 tapas de cartón grueso o madera contrachapada\n• Hilo de lino o cáñamo encerado\n• Aguja de ojo grande\n• Taladro o punzón para hacer agujeros\n• Regla y lápiz\n\n# PASO 1: PREPARAR CUADERNILLOS\n\nDobla las hojas en grupos de 4 (cada grupo forma 8 páginas). Marca el centro de cada cuadernillo con un pequeño pliegue.\n\n# PASO 2: HACER AGUJEROS EN LOS CUADERNILLOS\n\n1. Junta todos los cuadernillos y alinea los lomos\n2. Marca 4 puntos equidistantes en el lomo de cada cuadernillo\n3. Taladra con cuidado (no hagas los agujeros muy grandes)\n\n# PASO 3: HACER AGUJEROS EN LAS TAPAS\n\n1. Coloca los cuadernillos sobre una tapa, alineados al borde izquierdo\n2. Marca por dónde salen los agujeros de los cuadernillos\n3. Taladra las tapas en esos puntos\n\n# PASO 4: LA COSTURA\n\n1. Entra por el agujero inferior de la tapa trasera\n2. Atraviesa todos los cuadernillos y sal por el mismo agujero en la tapa delantera\n3. Sube al siguiente agujero y regresa hacia atrás\n4. Repite hasta el último agujero\n5. Al regresar, cruza el hilo horizontalmente entre cada par de agujeros (esto crea el patrón característico)\n\n# PASO 5: ATAR\n\nAl llegar al agujero inferior inicial, haz dos nudos firmes. Deja una cola decorativa de 3-4 cm.\n\n# PASO 6: TERMINACIÓN\n\nRecorta los bordes si es necesario. Pega papel de guarda si quieres tapar el interior de las tapas.\n\n# CONSEJO\n\nLa primera vez será imperfecta. La quinta vez, será hermosa. La décima vez, no recordarás cómo era no saber hacerlo.`,
    tipo: "instructivo",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    categoria: "Artesanía",
    palabrasClave: ["encuadernación", "copta", "libro", "DIY"],
    paginas: 4,
    lecturaMin: 10,
    autorId: 1,
  },
  {
    titulo: "Cómo hacer papel reciclado artesanal",
    descripcion: "Instructivo completo para transformar papel de desecho en hojas artísticas únicas usando solo herramientas caseras.",
    contenido: `# MATERIALES\n\n• Papel de desecho (periódico, hojas impresas, cartulinas viejas)\n• Un balde o recipiente grande\n• Licuadora (una vieja sirve perfecto)\n• Un marco de madera con malla de nylon (moldura)\n• Toallas de tela o fieltro absorbente\n• Un trozo de madera plana para prensar\n• Pétalos, semillas o hilos opcionales\n\n# PASO 1: DESGARRAR Y REMOJAR\n\n1. Desgarra el papel en trozos pequeños (5x5 cm aprox)\n2. Llena el balde con agua tibia\n3. Sumerge el papel y deja remojar 12-24 horas\n\n# PASO 2: LICUAR\n\n1. Con una licuadora vieja, procesa el papel remojado con agua\n2. Proporción: 2 tazas de papel + 3 tazas de agua\n3. Licúa hasta obtener una pulpa homogénea (tipo sopa espesa)\n\n# PASO 3: PREPARAR LA BAÑERA\n\n1. Llena una bandeja o fregadero con 5 cm de agua\n2. Vierte la pulpa y revuelve con la mano\n3. La cantidad de pulpa determina el grosor de la hoja\n\n# PASO 4: FORMAR LA HOJA\n\n1. Sumerge el marco con la malla (moldura) en la bañera\n2. Muévelo suavemente de lado a lado para distribuir la pulpa\n3. Levántalo en posición horizontal\n4. Deja escurrir el exceso de agua\n\n# PASO 5: PRENSAR Y SECAR\n\n1. Voltea el marco sobre un fieltro o toalla\n2. Presiona con una esponja para absorber agua\n3. Levanta el marco con cuidado: la hoja debe quedar sobre el fieltro\n4. Cubre con otra toalla y prensa con un libro pesado\n5. Deja secar 24-48 horas\n\n# DECORACIÓN\n\nAgrega pétalos de flores, semillas de lavanda o hilos de lana a la pulpa antes de formar la hoja. El resultado es un papel único, texturizado y vivo.`,
    tipo: "instructivo",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=800&q=80",
    categoria: "Artesanía",
    palabrasClave: ["papel", "reciclaje", "artesanal", "DIY"],
    paginas: 3,
    lecturaMin: 8,
    autorId: 1,
  },
  {
    titulo: "Instructivo: Desarrollo de personajes para escritores",
    descripcion: "Método práctico de 5 capas para construir personajes memorables que sostengan cualquier narrativa.",
    contenido: `# CAPA 1: EL EXTERIOR\n\nResponde concretamente:\n- Edad, oficio, apariencia física, forma de vestir\n- ¿Qué lleva en los bolsillos ahora mismo?\n- ¿Cómo huele?\n\nNo escribas una ficha médica. Escoge tres detalles que revelen contradicción: un boxeador con uñas pintadas, una jueza que colecciona muñecas de porcelana.\n\n# CAPA 2: EL HABITAT\n\n• ¿Dónde vive y cómo lo ha ordenado?\n• ¿Qué hay en su refrigerador?\n• ¿Qué tiene en la mesita de noche?\n• ¿A qué le teme que le roben?\n\nEl espacio habla cuando el personaje no quiere hacerlo.\n\n# CAPA 3: EL PASADO TRAUMÁTICO\n\nTodo personaje interesante tiene una herida. No necesariamente dramática: puede ser un cumpleaños olvidado, una palabra dicho en un coche estacionado, una puerta que nunca se abrió.\n\nPregunta: ¿qué cree este personaje que perdió para siempre?\n\n# CAPA 4: EL DESEO SECRETO\n\nNo el deseo declarado. El otro. El que da vergüenza nombrar.\n\nEjemplos:\n- El político que quiere ser padre\n- La cantante que quiere silencio\n- El cirujano que quiere que alguien le cuide\n\n# CAPA 5: LA VOZ\n\nEscribe una página en primera persona. No importa si tu historia es en tercera. Que el personaje te hable directamente. Qué dice, qué omite, qué repite sin darse cuenta.\n\n# EJERCICIO FINAL\n\nToma un personaje plano de tu borrador. Aplícale las 5 capas en 20 minutos. Luego reescribe la primera escena donde aparece. Verás la diferencia inmediatamente.`,
    tipo: "instructivo",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    categoria: "Escritura",
    palabrasClave: ["escritura", "personajes", "narrativa", "técnica"],
    paginas: 4,
    lecturaMin: 9,
    autorId: 1,
  },

  // ═══════════════════════════════════════════════════════════
  // MICROTEXTOS EDITORIALES ALALA (6) — contenido oficial de la plataforma
  // Estos son los textos que aparecen como fallback en el frontend.
  // Al seedearlos, quedan en la BD con tracking real de vistas y reseñas.
  // ═══════════════════════════════════════════════════════════
  {
    titulo: "La hora de la acuarela",
    descripcion: "Un texto íntimo sobre dejarse llevar por el pigmento y el silencio del papel mojado.",
    contenido: `# El primer encuentro\n\nHabía algo en el silencio de esa mañana que invitaba a probar. La caja de acuarelas llegó sin ceremonias: un regalo olvidado, apilado entre libros y papeles viejos. No recordaba quién la había dejado ahí, pero los colores, vivos todavía, parecían esperar desde hacía años.\n\nLlené un vaso de agua. Abrí el papel grueso que guardaba para bocetos que nunca hacía. Y sin saber muy bien por qué, mojé el pincel en azul cobalto.\n\n## Dejar que el agua decida\n\nNadie me había dicho que la acuarela se parece más a una conversación que a un monólogo. Que el papel absorbe, rechaza, crea bordes inesperados. Que el error no existe: solo existe lo que el agua quiere hacer.\n\nDibujé una forma indefinida. Luego otra. El pigmento se extendió por su cuenta, creando una montaña donde yo quería un cielo. En lugar de corregir, observé. La montaña me pareció más honesta que lo que había planeado.\n\n## La hora exacta\n\nDicen que para pintar bien hace falta técnica. Pero esa mañana descubrí que hace falta algo más urgente: permitírselo. Dar una hora —solo una— donde nadie pida nada, donde el teléfono esté en otra habitación, donde lo único que importe sea el trazo siguiente.\n\nLa acuarela no pide perfección. Pide presencia. Y cuando el pincel toca el papel por tercera vez, ya no estás pintando. Estás respirando con las manos.`,
    tipo: "microtexto",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    categoria: "Pintura",
    palabrasClave: ["acuarela", "pintura", "presencia", "arte"],
    paginas: 2,
    lecturaMin: 3,
    autorId: 1,
  },
  {
    titulo: "El primer acorde",
    descripcion: "Una historia mínima sobre el miedo y la emoción de tocar algo propio por primera vez.",
    contenido: `# El sonido del miedo\n\nMi dedo índice tardó treinta segundos en apretar la cuerda. Otros quince en encontrar el traste correcto. Y cuando finalmente sonó —un fa mayor, desafinado, demasiado fuerte— el silencio que siguió fue más profundo que la nota misma.\n\n## Lo que no enseñan\n\nNadie cuenta que antes del primer acorde hay una puerta invisible. Que del otro lado no hay técnica ni teoría: solo la sospecha de que tal vez, quizás, puedas hacer algo que suene a ti.\n\nLa guitarra me miraba desde el rincón desde hacía meses. La había comprado en un arranque, convencida de que la música estaba en mis manos esperando permiso. Pero el permiso no llega solo. Hay que pedirlo en voz alta, aunque la voz tiemble.\n\n## El acorde que cambia todo\n\nCuando logré que las seis cuerdas sonaran al mismo tiempo —aunque fuera por un segundo, aunque la cejilla doliera, aunque la afinación fuera dudosa— sentí algo extraño. No era felicidad. Era reconocimiento. Como si una parte mía que no sabía que existía hubiera respondido "ahí estás".`,
    tipo: "microtexto",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    categoria: "Música",
    palabrasClave: ["guitarra", "música", "aprendizaje", "miedo"],
    paginas: 1,
    lecturaMin: 2,
    autorId: 1,
  },
  {
    titulo: "Barro bajo las uñas",
    descripcion: "Reflexión sobre la cerámica como práctica de atención plena y contacto con lo esencial.",
    contenido: `# Las manos en la tierra\n\nLa primera vez que hundí las manos en la arcilla no pensé en vasijas ni en técnicas. Pensé en frío. En la humedad que sube por las muñecas. En lo extrañamente reconfortante que es sentir algo que no tiene prisa por ser otra cosa.\n\n## El oficio del presente\n\nEl torno gira, sí. Pero el verdadero movimiento ocurre cuando dejas de forcejar. Cuando las manos —sucias, cansadas, imprecisas— dejan de obedecer la mente y empiezan a escuchar el barro. La arcilla tiene memoria. Si la aprietas con miedo, se agrieta. Si la tocas con prisa, se deforma. Solo cuando respiras al mismo ritmo que ella, algo comienza a tomar forma.\n\n## Lo que queda\n\nHoras después, cuando lavo las manos y el agua del lavabo se vuelve gris, sigo sintiendo el tacto. No es nostalgia: es constancia. La cerámica enseña que las cosas sólidas nacen del contacto prolongado. Que la belleza no se impone. Que bajo las uñas, como bajo la paciencia, siempre queda un poco de tierra que no se va.`,
    tipo: "microtexto",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
    categoria: "Cerámica",
    palabrasClave: ["cerámica", "arcilla", "atención plena", "artesanía"],
    paginas: 2,
    lecturaMin: 4,
    autorId: 1,
  },
  {
    titulo: "La danza que nadie ve",
    descripcion: "Una mirada íntima al movimiento cotidiano como forma de expresión que nadie ha coreografiado.",
    contenido: `# La coreografía invisible\n\nHay una danza que ocurre cada mañana mientras espera que hierva el agua. Otra, más lenta, cuando recoges la ropa de la cama con gestos que solo tú reconoces. Nadie las filma. No tienen nombre. Pero están ahí, entre el cuerpo y el día, como una conversación que no necesita traducción.\n\n## El cuerpo que decide\n\nNo hace falta un escenario. El cuerpo ya sabe. Sabe cómo girar para alcanzar el estante más alto. Cómo inclinarse hacia adelante cuando la tristeza pesa. Cómo estirarse en la madrugada como si cada miembro despertara a su propio ritmo.\n\n## La danza verdadera\n\nLa bailarina profesional busca la perfección del gesto. Pero la danza que nadie ve busca otra cosa: alivio, expresión, compañía propia. Es la que haces mientras escuchas música con auriculares en la cocina. La que inventas caminando bajo la lluvia. La que ocurre cuando nadie mira y, precisamente por eso, es la más tuya.`,
    tipo: "microtexto",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80",
    categoria: "Danza",
    palabrasClave: ["danza", "movimiento", "cuerpo", "cotidiano"],
    paginas: 2,
    lecturaMin: 3,
    autorId: 1,
  },
  {
    titulo: "Tejer es recordar",
    descripcion: "Un microtexto sobre la memoria cosida en el tejido y el tiempo que se transforma en textura.",
    contenido: `# El hilo que conecta\n\nMi abuela no decía "tejo". Decía "passo el tempo", como si el tiempo fuera algo que se pudiera atravesar con aguja y lana. Y tal vez tenía razón. Cada punto que daba era un minuto que no se perdía: se convertía en textura, en calor, en algo que alguien más usaría después.\n\n## La memoria en los nudos\n\nTejer no es solo crear tela. Es dejar que el cuerpo repita un gesto hasta que la mente se suelte. Es contar sin números, porque cada vuelta es una unidad de atención. Es sostener algo que aún no existe pero que ya se siente necesario.\n\n## Tejer hoy\n\nAhora entiendo por qué los tejedores parecen estar en otra parte. No están ausentes: están en el tiempo correcto. El que no corre. El que se mide en vueltas, no en notificaciones. Cuando tomo las agujas y empiezo, no estoy haciendo una bufanda. Estoy recordando que existo, punto por punto, sin prisa.`,
    tipo: "microtexto",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
    categoria: "Artesanía",
    palabrasClave: ["tejido", "memoria", "tiempo", "artesanía"],
    paginas: 2,
    lecturaMin: 3,
    autorId: 1,
  },
  {
    titulo: "Organiza tu espacio de creación",
    descripcion: "Paso a paso para armar un rincón de trabajo en casa que sea funcional, bonito y tuyo.",
    contenido: `# Tu rincón existe ya\n\nNo necesitas un taller completo. Necesitas un metro cuadrado que te reconozca. Un lugar donde dejar un proyecto a medio hacer sin que nadie lo mueva. Un espacio que diga, sin palabras: "aquí se permite crear".\n\n## Paso uno: observar antes de mover\n\nAntes de comprar cajas o reorganizar, pasa un día mirando. ¿Dónde cae la luz natural? ¿Qué esquina está siempre vacía? ¿Dónde te detienes sin razón? Ese punto, aunque parezca imposible, es el candidato ideal. La luz importa más que los metros.\n\n## Paso dos: tres zonas claras\n\nDivide tu espacio en tres funciones, aunque se toquen. Una zona de trabajo: la mesa, el caballete, la máquina. Una zona de materiales: estante, cajón, cesto. Una zona de pausa: una silla, una tetera, una vista. La creación no es solo producción. También es descanso.\n\n## Paso tres: la vertical es tu aliada\n\nCuando falta superficie, sube. Estantes flotantes, tableros de corcho en la pared, ganchos para herramientas. Lo que cuelga no ocupa mesa. Y lo que se ve, se usa.\n\n## Paso cuatro: dejar huella\n\nPon algo que no sea útil pero sea tuyo. Una foto, una piedra, una frase escrita a mano. El espacio de creación no es una oficina: es un refugio. Y los refugios se reconocen porque huelen a persona.`,
    tipo: "instructivo",
    precio: null,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80",
    categoria: "Talleres",
    palabrasClave: ["espacio", "creatividad", "organización", "hogar"],
    paginas: 4,
    lecturaMin: 5,
    autorId: 1,
  },

  // ═══════════════════════════════════════════════════════════
  // MINI-CURSOS ESCRITOS (4)
  // ═══════════════════════════════════════════════════════════
  {
    titulo: "Mini-curso: Jardinería en balcones urbanos",
    descripcion: "Curso escrito de 4 módulos para cultivar hierbas, hortalizas y flores en espacios reducidos de ciudad.",
    contenido: `# MÓDULO 1: EL BALCÓN COMO ECOSISTEMA\n\nAntes de comprar una sola semilla, observa tu espacio durante una semana completa.\n\n**Luz**: ¿Cuántas horas de sol directo recibe? (Anota: mañana, mediodía, tarde). Si tiene menos de 4 horas, olvida los tomates. Piensa en lechugas, espinacas y hierbas de sombra.\n\n**Viento**: Los balcones altos son túneles de viento. Las plantas se deshidratan rápido. Necesitarás barreras naturales: un seto de romero funciona mejor que una lona.\n\n**Peso**: Una maceta grande de tierra húmeda pesa mucho. Verifica la capacidad estructural de tu balcón. Mejor muchas macetas pequeñas que una gigante.\n\n# MÓDULO 2: EL SUELO Y EL RIEGO\n\n**Sustrato**: Nunca uses tierra de patio. Compra sustrato para macetas (turba + perlita + vermiculita). Enriquece con compost casero cada 3 meses.\n\n**Riego**: La regla del dedo. Introduce el dedo hasta el segundo nudillo. Si está seco, riega. Si está húmedo, espera. El exceso de agua mata más que la sequía.\n\n**Autorriego casero**: Una botella de vino enterrada boca abajo con un pequeño agujero en el tapo libera agua lentamente. Ideal para vacaciones de fin de semana.\n\n# MÓDULO 3: QUÉ PLANTAR Y CUÁNDO\n\n**Primavera**: Tomates cherry, albahaca, perejil, zinnias, girasoles enanos.\n**Verano**: Pimientos, berenjenas, flores aromáticas (lavanda, salvia).\n**Otoño**: Lechugas, espinacas, rábanos, caléndulas.\n**Invierno**: Ajo, cebollín, acelgas, pensamientos.\n\n**Hierbas indispensables**: Albahaca, romero, tomillo, orégano, cilantro. Ocupan poco, crecen rápido, transforman cualquier comida.\n\n# MÓDULO 4: PLAGAS Y SOLUCIONES NATURALES\n\n**Pulgones**: Mezcla jabón de castilla con agua (1:10). Rocía al atardecer.\n**Cochinilla algodonosa**: Alcohol isopropílico al 70% con un hisopo. Toca cada bicho. Es terapéutico.\n**Mosca blanca**: Coloca trampas amarillas pegajosas cerca de las plantas.\n\n# PROYECTO FINAL\n\nDiseña tu balcón en papel. Ubica cada maceta según sus necesidades de luz y agua. Presupuesta materiales para un mes. Planta tres especies distintas. Documenta con fotos semanales durante un mes. Al final, tendrás un diario visual de tu primer ecosistema urbano.`,
    tipo: "minicurso",
    precio: 8900,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    categoria: "Bienestar",
    palabrasClave: ["jardinería", "urbano", "plantas", "hogar"],
    paginas: 18,
    lecturaMin: 40,
    autorId: 1,
  },
  {
    titulo: "Mini-curso: Introducción a la acuarela",
    descripcion: "Curso escrito de 5 módulos para dominar la acuarela desde cero: materiales, técnicas, color y proyectos finales.",
    contenido: `# MÓDULO 1: LOS MATERIALES QUE IMPORTAN\n\n**Papeles**: Evita papel de dibujo común. Usa papel de acuarela de 300g/m². Las texturas:\n- Fina (hot pressed): detalle, ilustración\n- Gruesa (cold pressed): general, paisajes\n- Rugosa: texturas dramáticas, cielos\n\n**Pinturas**: Empieza con 6 colores:\nAmarillo limón, amarillo ocre, rojo carmín, azul ultramar, azul cerúleo, marrón siena tostada. Con esos mezclas todo.\n\n**Pinceles**: Redondo n° 6 y n° 12 son suficientes para empezar. Un pincel plano de 1" para fondos.\n\n# MÓDULO 2: CONTROL DEL AGUA\n\nLa acuarela no es pintura, es gestión del agua.\n\n**Técnica húmedo sobre húmedo**: Papel mojado, pintura líquida. Los colores se funden solos. Ideal para cielos, nieblas, fondos.\n\n**Técnica húmedo sobre seco**: Papel seco, pintura líquida. Bordes definidos. Ideal para detalles, ramas, texturas.\n\n**Técnica seco sobre seco**: Pincel casi seco sobre papel seco. Textura granulada. Ideal para piedras, corteza, vello.\n\n# MÓDULO 3: TEORÍA DEL COLOR PARA ACUARELISTAS\n\nNo necesitas teoría completa. Solo esto:\n- Colores cálidos avanzan, fríos retroceden\n- Deja siempre un toque de color complementario en las sombras (naranja en sombras azules, azul en sombras cálidas)\n- El blanco no existe en acuarela. El blanco es el papel. Resérvalo desde el principio.\n\n# MÓDULO 4: SECRETOS DE LOS MAESTROS\n\n1. **Lavar el pincel entre colores**: no solo en el agua, sino en la palma de tu mano.\n2. **La segunda capa**: espera que la primera esté TOTAlmente seca. Si no, obtendrás lodo.\n3. **Levantar color**: un pincel limpio y seco puede absorber pigmento húmedo para crear luces.\n4. **Sal**: espolvorea sal gruesa sobre pintura muy húmeda. Espera. Frota. Efecto nieve/arena mágico.\n\n# MÓDULO 5: PROYECTOS\n\n**Semana 1**: Cielo con una sola nube\n**Semana 2**: Una manzana con sombra azul\n**Semana 3**: Un paisaje de tres colores\n**Semana 4**: Tu propia versión de una acuarela que amas\n\nLa acuarela enseña a soltar el control. Y eso, en una sociedad obsesionada con el control, es una habilidad revolucionaria.`,
    tipo: "minicurso",
    precio: 12900,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    categoria: "Artes visuales",
    palabrasClave: ["acuarela", "pintura", "arte", "técnica"],
    paginas: 22,
    lecturaMin: 50,
    autorId: 1,
  },
  {
    titulo: "Mini-curso: Canto básico para no cantantes",
    descripcion: "Curso escrito de 4 módulos para descubrir tu voz, mejorar tu afinación y cantar con confianza sin conocimientos previos.",
    contenido: `# MÓDULO 1: DESEMITIR EL CANTO\n\n"No sé cantar" es la frase más repetida y menos cierta del mundo. Cantar no es un don, es una habilidad motora. Como caminar. Como escribir con la mano izquierda. Se aprende.\n\nLo que la gente llama "no saber cantar" suele ser:\n- Miedo al juicio de otros\n- Falta de afinación (corregible con ejercicios)\n- Tensión muscular innecesaria\n- Nunca haber escuchado su propia voz grabada\n\n# MÓDULO 2: TU INSTRUMENTO\n\nLa voz es aire + cuerdas vocales + resonadores. Nada más.\n\n**Respiración diafragmática**:\n1. Acuéstate boca arriba, una mano en el pecho, otra en el abdomen\n2. Inhala por la nariz. La mano del abdomen debe subir. La del pecho, no moverse.\n3. Exhala pronunciando una "sss" sostenida. Intenta llegar a 30 segundos.\n\n**Cuerdas vocales**: No fuerces. El canto cómodo suena mejor que el canto forzado. Si te duele la garganta, estás haciendo algo mal.\n\n**Resonadores**: La voz resuena en la boca, la nariz, el pecho, la cabeza. Prueba: canta "mmm" y siente la vibración en los labios. Eso es resonancia.\n\n# MÓDULO 3: AFINACIÓN Y ESCUCHA\n\n**Ejercicio de sirena**: Desliza tu voz desde el tono más grave que puedas hasta el más agudo, como una sirena de ambulancia. Sin saltos. Suave. Repite 5 veces.\n\n**Ejercicio de intervalos**: Toca una nota en el piano o una app. Cántala. Toca la siguiente. Cántala. Si fallas, no importa. Vuelve a intentar.\n\n**Grabarte**: Es incómodo. Hazlo igual. Escucha sin juzgar. Nota: ¿dónde te empujas? ¿dónde te contienes?\n\n# MÓDULO 4: CANTAR CON OTROS\n\nEl canto en grupo es la forma más rápida de mejorar. No porque los demás te enseñen, sino porque dejas de escucharte a ti mismo y empiezas a escuchar la música.\n\nBusca un coro comunitario, un grupo de canto folclórico, un taller municipal. No importa el género. Importa que cantes.\n\n# PROYECTO FINAL\n\nAprende una canción de memoria. Grábate cantándola una vez por semana durante un mes. Al final, compara la primera grabación con la última. La diferencia será tu evidencia de que "no saber cantar" era solo "aún no haber practicado".`,
    tipo: "minicurso",
    precio: 9900,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800&q=80",
    categoria: "Música",
    palabrasClave: ["canto", "voz", "música", "aprendizaje"],
    paginas: 16,
    lecturaMin: 35,
    autorId: 1,
  },
  {
    titulo: "Mini-curso: Mindfulness creativo",
    descripcion: "Curso escrito de 4 módulos que une prácticas de atención plena con procesos creativos para superar bloqueos y profundizar en tu obra.",
    contenido: `# MÓDULO 1: LA ATENCIÓN COMO MATERIA PRIMA\n\nTodo arte empieza con la atención. No con la técnica, ni con la idea, ni con la inspiración. Empieza con alguien que decidió prestar atención a algo que otros ignoran.\n\n**Ejercicio: Ver como por primera vez**\n\nToma un objeto cotidiano (una taza, una llave, una hoja). Obsérvalo durante 5 minutos sin intentar describirlo mentalmente. Solo mira. Nota colores, sombras, texturas, imperfecciones. Al cabo de 5 minutos, escribe tres oraciones sobre lo que viste. No uses adjetivos genéricos.\n\n# MÓDULO 2: RESPIRAR ANTES DE CREAR\n\nEl bloqueo creativo no es falta de ideas. Es exceso de ruido mental.\n\n**Protocolo de 3 minutos antes de crear**:\n1. Siéntate erguido, pies en el suelo\n2. Cierra los ojos. Inhala 4 segundos, retén 4, exhala 6\n3. Durante la exhalación, suelta los hombros y la mandíbula\n4. Abre los ojos. No revises el celular. Ve directo a tu herramienta de trabajo\n\n# MÓDULO 3: EL JUICIO SUSPENDIDO\n\nDurante la creación, eris dos personas: la que crea y la que juzga. La que juzga debe salir de la habitación durante el primer borrador.\n\n**Regla del borrador feo**: tu primer intento debe ser deliberadamente imperfecto. Rápido, sin correcciones, sin borrar. El objetivo no es hacer algo bueno. Es hacer algo existente.\n\n**Ejercicio: Escritura automática**\n\nPon un temporizador de 10 minutos. Escribe sin parar. Si no sabes qué escribir, escribe "no sé qué escribir" hasta que aparezca otra cosa. No corrijas ortografía. No leas lo que escribiste. Al terminar, cierra el cuaderno. Léelo al día siguiente.\n\n# MÓDULO 4: LA OBRA COMO PRÁCTICA, NO COMO PRODUCTO\n\nEl mindfulness creativo no busca producir más. Busca que el acto de crear sea, en sí mismo, el objetivo.\n\nPregúntate cada vez que terminas una sesión:\n- ¿Estuve presente mientras creaba?\n- ¿Me permití equivocarme?\n- ¿Disfruté algún momento, aunque sea breve?\n\nSi la respuesta a alguna es sí, la sesión fue exitosa. Independiente del resultado.\n\n# PROYECTO FINAL: RETO DE 21 DÍAS\n\nDurante 21 días, dedica 15 minutos diarios a una práctica creativa con atención plena. Puede ser dibujar, escribir, fotografiar, cocinar, bailar. Documenta cada día con una sola oración sobre cómo te sentiste. Al final, lee tus 21 oraciones. Esa es tu obra más importante.`,
    tipo: "minicurso",
    precio: 7900,
    publicado: true,
    portadaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    categoria: "Bienestar",
    palabrasClave: ["mindfulness", "creatividad", "meditación", "bienestar"],
    paginas: 14,
    lecturaMin: 30,
    autorId: 1,
  },
];

async function main() {
  console.log("🌱 Seed de MicroContenidos iniciado...");

  const user = await prisma.user.findUnique({ where: { id: 1 } });
  if (!user) {
    console.warn("⚠️ No existe usuario con id=1. Ajusta autorId en este script o crea un usuario primero.");
  }

  // Titulos ya existentes para evitar duplicados
  const existentes = await prisma.microContenido.findMany({ select: { titulo: true } });
  const titulosExistentes = new Set(existentes.map(e => e.titulo));

  let creados = 0;
  let saltados = 0;
  for (const data of EJEMPLOS) {
    if (titulosExistentes.has(data.titulo)) {
      console.log(`  ⏭  Ya existe: "${data.titulo}"`);
      saltados++;
      continue;
    }
    try {
      await prisma.microContenido.create({ data });
      creados++;
      console.log(`  ✅ ${data.titulo} (${data.tipo})`);
    } catch (err) {
      console.error(`  ❌ Error creando "${data.titulo}":`, err.message);
    }
  }

  console.log(`\n✅ ${creados} creados, ${saltados} omitidos (ya existían).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
