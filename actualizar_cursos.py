#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import requests
import json
import time

BASE_URL = "https://alala-api-production.up.railway.app/api/v1/cursos"
HEADERS = {
    "Authorization": "Bearer alala123",
    "Content-Type": "application/json"
}

# Contenido completo para los 20 cursos
cursos_data = {
    1: {
        "titulo": "Taller de Cerámica Creativa",
        "descripcion_larga": "Este taller te invita a descubrir el arte milenario de la cerámica desde una perspectiva contemporánea y creativa. A lo largo de las sesiones, aprenderás a conectar con la arcilla como material vivo, explorando sus texturas, posibilidades y el lenguaje silencioso que emerge entre tus manos y el barro.\n\nEl curso está diseñado para que desarrolles tu propio estilo artístico mientras dominas las técnicas esenciales del modelado, el torno y la decoración de piezas únicas. Cada clase es una experiencia terapéutica que combina concentración, creatividad y expresión personal, permitiéndote desconectar del ritmo acelerado de la vida cotidiana.\n\nAl finalizar el programa, habrás creado una colección de obras funcionales y decorativas —tazas, cuencos, floreros y esculturas— que podrás llevar a tu hogar o regalar. Además, contarás con las bases técnicas y artísticas para continuar explorando este fascinante oficio de manera autónoma.",
        "objetivos": "Comprender las propiedades físicas de la arcilla y su comportamiento en cada etapa del proceso cerámico.",
        "contenido_programa": "Módulo 1 – Introducción a la cerámica y tipos de arcilla. Módulo 2 – Técnicas de modelado manual: pellizco, placas y coil. Módulo 3 – Iniciación al torno alfarero. Módulo 4 – Decoración con engobes y óxidos. Módulo 5 – Técnicas de esmaltado y colores. Módulo 6 – Primer y segundo horneado. Módulo 7 – Creación de pieza final libre. Módulo 8 – Cierre, exposición y evaluación.",
        "requisitos": "No se requiere experiencia previa. Apto para mayores de 15 años. Se recomienda usar ropa cómoda que pueda mancharse.",
        "nivel": "básico",
        "duracion": "8 semanas (16 sesiones de 2 horas cada una)",
        "materiales": "Arcilla, herramientas de modelado, esmaltes y óxidos. Uso del torno y horno incluido en el taller.",
        "beneficios": "Desarrollo de creatividad y concentración. Reducción del estrés a través del trabajo manual. Aprendizaje de un oficio artesanal con valor patrimonial. Creación de piezas únicas y personalizadas. Experiencia terapéutica y meditativa.",
        "instructor_bio": "María Paz Rojas es ceramista chilena con más de 15 años de trayectoria. Formada en la Escuela de Arte de Valparaíso, se especializó en técnicas ancestrales andinas durante sus años de residencia en el altiplano peruano. Su obra ha sido expuesta en galerías de Santiago, Buenos Aires y Lima. Como docente, destaca por su metodología accesible y su capacidad para acompañar a cada alumno en su propio proceso creativo.",
        "modulos": "Módulo 1: Introducción a la cerámica. Módulo 2: Modelado manual. Módulo 3: Torno alfarero. Módulo 4: Decoración. Módulo 5: Esmaltado. Módulo 6: Horneado. Módulo 7: Pieza final. Módulo 8: Cierre y exposición."
    },
    2: {
        "titulo": "Pintura al Óleo para Principiantes",
        "descripcion_larga": "Adéntrate en el apasionante mundo de la pintura al óleo, una de las técnicas más versátiles y duraderas en la historia del arte. Este curso está pensado para quienes siempre soñaron con crear sus propias obras pero nunca supieron por dónde empezar. Desde el primer día, trabajarás con materiales de calidad y recibirás una guía personalizada que te permitirá avanzar con confianza.\n\nAprenderás los fundamentos técnicos de la pintura al óleo: preparación de lienzos, teoría del color, mezcla de pigmentos, técnicas de pincelada y creación de texturas. Cada sesión incluye ejercicios prácticos que te ayudarán a comprender la luz, la sombra, la perspectiva y la composición artística de forma intuitiva y divertida.\n\nEl taller culmina con la realización de tu primera obra completa sobre lienzo, bajo la supervisión del instructor. Al terminar, tendrás no solo una pintura terminada para exhibir, sino también las herramientas conceptuales y técnicas para seguir pintando de manera independiente.",
        "objetivos": "Comprender la teoría del color y su aplicación práctica en la pintura al óleo.",
        "contenido_programa": "Unidad 1 – Materiales y preparación del lienzo. Unidad 2 – Teoría del color: primarios, secundarios y terciarios. Unidad 3 – Técnicas de mezcla y degradados. Unidad 4 – Pinceladas: plana, impasto y veladura. Unidad 5 – Luz, sombra y volumen. Unidad 6 – Composición y punto de interés. Unidad 7 – Boceto y desarrollo de obra personal. Unidad 8 – Acabados, barniz y presentación.",
        "requisitos": "No se requiere experiencia previa en pintura. Traer ropa que pueda mancharse o un guardapolvo.",
        "nivel": "básico",
        "duracion": "8 semanas (16 sesiones de 2 horas)",
        "materiales": "Óleos, pinceles, lienzos, paleta, solvente y mediums. Uso del caballete incluido.",
        "beneficios": "Desarrollo de la sensibilidad artística y observación visual. Aprendizaje de una técnica clásica con aplicación contemporánea. Reducción del estrés mediante la expresión creativa. Creación de una obra terminada para tu hogar. Fomento de la paciencia y la disciplina artística.",
        "instructor_bio": "Andrés Delgado es pintor chileno con una sólida trayectoria en el arte nacional. Egresado de la Universidad de Chile, ha realizado más de 20 exposiciones individuales y ha sido seleccionado para el Salón Nacional de Artes Visuales en múltiples ocasiones. Su obra forma parte de colecciones privadas y del Museo Nacional de Bellas Artes. Como docente, combina rigor técnico con una pedagogía amigable que invita a descubrir el arte sin miedo.",
        "modulos": "Unidad 1: Materiales y lienzo. Unidad 2: Teoría del color. Unidad 3: Mezcla y degradados. Unidad 4: Pinceladas. Unidad 5: Luz y sombra. Unidad 6: Composición. Unidad 7: Obra personal. Unidad 8: Acabados."
    },
    3: {
        "titulo": "Acuarela Botánica",
        "descripcion_larga": "La acuarela botánica es una de las disciplinas artísticas más delicadas y gratificantes, que combina la precisión científica con la sensibilidad artística. En este curso aprenderás a ilustrar flores, hojas y plantas nativas chilenas utilizando técnicas tradicionales de acuarela que resaltan la transparencia, la luminosidad y los matices naturales de cada especie.\n\nA través de ejercicios progresivos, dominarás el control del agua, los lavados, los degradados y los detalles finos que caracterizan a la ilustración botánica de calidad. Cada sesión incluye el estudio de una especie diferente, desde el copihue hasta la calceolaria, permitiéndote construir un herbario artístico único y personal.\n\nEste taller es ideal para amantes de la naturaleza, ilustradores que buscan especializarse, y cualquier persona que desee conectar con la flora chilena a través del arte. Al finalizar, tendrás un portafolio de ilustraciones listas para enmarcar, publicar o utilizar en proyectos creativos.",
        "objetivos": "Dominar las técnicas fundamentales de la acuarela: lavados, degradados, mojado sobre mojado y detalles secos.",
        "contenido_programa": "Módulo 1 – Fundamentos de la acuarela: papel, pinceles y pigmentos. Módulo 2 – Técnicas de lavado y control del agua. Módulo 3 – Degradados y transparencias. Módulo 4 – Hojas y estructuras vegetales. Módulo 5 – Flores: capas y detalles. Módulo 6 – Plantas nativas chilenas I. Módulo 7 – Plantas nativas chilenas II. Módulo 8 – Composición de lámina botánica final.",
        "requisitos": "Conocimientos básicos de dibujo recomendados pero no obligatorios. Tener un set básico de acuarelas para clase en vivo.",
        "nivel": "intermedio",
        "duracion": "8 semanas (16 sesiones de 1.5 horas)",
        "materiales": "Acuarelas profesionales, papeles de algodón de 300gsm, pinceles redondos y planos, lápiz HB, goma de borrar y tabla de soporte.",
        "beneficios": "Conexión profunda con la flora nativa chilena. Desarrollo de precisión y paciencia artística. Creación de un portafolio botánico profesional. Aprendizaje de una técnica versátil para múltiples aplicaciones. Momentos de calma y meditación a través del arte.",
        "instructor_bio": "Camila Herrera es ilustradora botánica chilena con una destacada trayectoria editorial. Autora de tres libros sobre flora chilena —entre ellos 'Flores del Bosque Valdiviano'—, su trabajo ha sido publicado en revistas científicas y colecciones de arte internacional. Ha impartido talleres en el Jardín Botánico Nacional y en la Fundación Mar Adentro. Su enseñanza destaca por la precisión técnica y el profundo respeto por la naturaleza.",
        "modulos": "Módulo 1: Fundamentos. Módulo 2: Lavado y agua. Módulo 3: Degradados. Módulo 4: Hojas. Módulo 5: Flores. Módulo 6: Nativas I. Módulo 7: Nativas II. Módulo 8: Lámina final."
    },
    4: {
        "titulo": "Yoga Vinyasa Flow",
        "descripcion_larga": "El Yoga Vinyasa Flow es una práctica dinámica que conecta el movimiento con la respiración, creando una experiencia fluida que fortalece el cuerpo, calma la mente y eleva el espíritu. En este curso aprenderás secuencias creativas que te permitirán desarrollar flexibilidad, fuerza muscular, equilibrio y coordinación de manera integral y segura.\n\nCada clase está diseñada como un viaje meditativo en movimiento. Comenzamos con una centering practice, avanzamos hacia saludos al sol variados, exploramos posturas de pie, torsiones, inversiones suaves y culminamos con una relajación profunda guiada. La música y la respiración ujjayi acompañan cada transición, creando un ambiente relajado pero energizante.\n\nEste taller es apto para todos los niveles, ya que cada postura se adapta a las posibilidades de cada practicante. Ya sea que busques reducir el estrés, mejorar tu condición física o iniciar un camino de autoconocimiento, el Vinyasa Flow te ofrecerá herramientas para llevar la práctica a tu vida diaria.",
        "objetivos": "Desarrollar fuerza, flexibilidad y equilibrio a través de secuencias dinámicas de yoga.",
        "contenido_programa": "Módulo 1 – Fundamentos del Vinyasa: respiración ujjayi y bandhas. Módulo 2 – Saludos al Sol A y B. Módulo 3 – Posturas de pie y alineación. Módulo 4 – Torsiones y detox. Módulo 5 – Apertura de cadera y flexiones. Módulo 6 – Equilibrios y core. Módulo 7 – Inversiones y posturas de descanso. Módulo 8 – Secuencia completa y relajación profunda.",
        "requisitos": "No se requiere experiencia previa. Traer mat de yoga, ropa cómoda y una botella de agua. Informar al instructor sobre lesiones o condiciones médicas.",
        "nivel": "todos los niveles",
        "duracion": "8 semanas (16 sesiones de 1.5 horas)",
        "materiales": "Mat de yoga antideslizante, toalla, botella de agua y ropa cómoda que permita el movimiento.",
        "beneficios": "Mejora de la condición física general. Reducción significativa del estrés y la ansiedad. Mayor consciencia corporal y respiratoria. Desarrollo de disciplina y constancia. Creación de una comunidad de práctica y bienestar.",
        "instructor_bio": "Sofía Martínez es instructora de yoga certificada por Yoga Alliance (RYT-500) con formación en India (Rishikesh) y Tailandia. Especializada en Vinyasa Flow y Yoga Terapéutico, ha enseñado en estudios de Chile, Perú y Colombia durante los últimos 10 años. Su enfoque integra la filosofía del yoga con una práctica accesible y divertida, respetando siempre los límites de cada cuerpo.",
        "modulos": "Módulo 1: Fundamentos y respiración. Módulo 2: Saludos al Sol. Módulo 3: Posturas de pie. Módulo 4: Torsiones. Módulo 5: Cadera y flexiones. Módulo 6: Equilibrios. Módulo 7: Inversiones. Módulo 8: Secuencia completa."
    },
    5: {
        "titulo": "Meditación y Mindfulness",
        "descripcion_larga": "En un mundo cada vez más acelerado, la meditación y el mindfulness se han convertido en herramientas esenciales para recuperar el bienestar mental y emocional. Este curso te introduce en el arte de la atención plena a través de técnicas probadas científicamente que reducen el estrés, mejoran la concentración y cultivan la calma interior.\n\nA lo largo del programa, explorarás diferentes tradiciones meditativas —desde la atención al breathwork hasta la meditación guiada, el body scan y las prácticas de visualización creativa—. Cada técnica se explica con claridad y se practica en clase, permitiéndote experimentar directamente sus efectos y encontrar el estilo que más resuena contigo.\n\nAdemás de las sesiones prácticas, el curso incluye elementos teóricos sobre el funcionamiento del cerebro bajo el estrés, la neurociencia de la meditación y estrategias para integrar el mindfulness en actividades cotidianas como comer, caminar, trabajar y relacionarse.",
        "objetivos": "Comprender los principios científicos del mindfulness y sus efectos en el cerebro y el sistema nervioso.",
        "contenido_programa": "Unidad 1 – Introducción al mindfulness y mitos comunes. Unidad 2 – Atención a la respiración: anapanasati. Unidad 3 – Body scan y conciencia corporal. Unidad 4 – Meditación guiada y visualización. Unidad 5 – Mindfulness en movimiento: caminata consciente. Unidad 6 – Gestión emocional mediante el awareness. Unidad 7 – Práctica de loving-kindness (metta). Unidad 8 – Integración del mindfulness a la vida diaria.",
        "requisitos": "No se requiere experiencia previa. Apto para mayores de 18 años. Traer un cojín o manta para sentarse cómodamente.",
        "nivel": "básico",
        "duracion": "6 semanas (12 sesiones de 1.5 horas)",
        "materiales": "Cojín o manta de meditación, diario de práctica, audios guía proporcionados por el instructor.",
        "beneficios": "Reducción medible del estrés y la ansiedad. Mejora del sueño y la regulación emocional. Aumento de la concentración y claridad mental. Desarrollo de mayor empatía y compasión. Herramientas prácticas aplicables inmediatamente en la vida cotidiana.",
        "instructor_bio": "Dr. Felipe Araya es psicólogo clínico con especialización en mindfulness y terapias de tercera generación. Certificado en el programa MBSR (Mindfulness-Based Stress Reduction) de la Universidad de Massachusetts, ha trabajado en programas de bienestar corporativo y clínicos durante más de 12 años. Es autor del libro 'Respirar en la Ciudad' y conferencista internacional en neurociencia y contemplación.",
        "modulos": "Unidad 1: Introducción. Unidad 2: Respiración. Unidad 3: Body scan. Unidad 4: Visualización. Unidad 5: Movimiento. Unidad 6: Emociones. Unidad 7: Metta. Unidad 8: Integración."
    },
    6: {
        "titulo": "Tango Argentino Intensivo",
        "descripcion_larga": "El tango es mucho más que un baile: es un idioma universal de conexión, pasión y creatividad. Este intensivo te introduce en los fundamentos del tango argentino de salón, una de las variantes más elegantes y sociales de esta disciplina. En solo 8 semanas, pasarás de tus primeros pasos a sentirte cómodo en la pista de baile.\n\nEl curso abarca desde la postura y el abrazo —elementos esenciales del tango— hasta la musicalidad, la marca, la recepción y las primeras figuras de improvisación. No necesitas experiencia previa ni pareja fija; durante las clases se rota constantemente para que aprendas a bailar con diferentes compañeros y estilos.\n\nAdemás de la técnica, exploraremos la historia del tango, sus orígenes en Buenos Aires y Montevideo, y su evolución hasta convertirse en Patrimonio Cultural Inmaterial de la Humanidad. Cada clase es una experiencia social donde el respeto, la escucha y la diversión son protagonistas.",
        "objetivos": "Adquirir una postura tanguera correcta y un abrazo cómodo y conectado.",
        "contenido_programa": "Módulo 1 – Orígenes del tango y postura base. Módulo 2 – El abrazo y la conexión con el compañero. Módulo 3 – Caminata básica, adornos y pausas. Módulo 4 – Giros y ochos. Módulo 5 – Cruces y paradas. Módulo 6 – Musicalidad: compás, fraseo y orquestas. Módulo 7 – Primeras secuencias de improvisación. Módulo 8 – Práctica social y cierre milonguero.",
        "requisitos": "No se requiere experiencia previa ni pareja fija. Traer zapatos cómodos con suela deslizante (no zapatillas deportivas).",
        "nivel": "básico",
        "duracion": "8 semanas (16 sesiones de 1.5 horas)",
        "materiales": "Zapatos cómodos de baile, botella de agua y ropa que permita libertad de movimiento.",
        "beneficios": "Desarrollo de coordinación, equilibrio y consciencia corporal. Mejora de la comunicación no verbal y la escucha. Experiencia social única y enriquecedora. Conexión con una tradición cultural patrimonial. Incremento de la confianza y autoestima personal.",
        "instructor_bio": "Luciana Fernández es bailarina profesional de tango argentino formada en la Academia Nacional del Tango de Buenos Aires. Ganadora del Campeonato Nacional de Tango Salón 2022, ha representado a Chile en festivales internacionales de Argentina, Turquía y Japón. Como docente, destaca por su calidez, paciencia y capacidad para transmitir la esencia del abrazo tanguero a principiantes.",
        "modulos": "Módulo 1: Orígenes y postura. Módulo 2: El abrazo. Módulo 3: Caminata. Módulo 4: Giros. Módulo 5: Cruces. Módulo 6: Musicalidad. Módulo 7: Improvisación. Módulo 8: Práctica social."
    },
    7: {
        "titulo": "Salsa y Bachata en Pareja",
        "descripcion_larga": "Si buscas una actividad que combine ejercicio, diversión y conexión social, este curso de salsa cubana y bachata dominicana es para ti. Diseñado para parejas y personas que quieran bailar en pareja, el taller te lleva desde los pasos básicos hasta combinaciones intermedias que te harán brillar en cualquier pista latina.\n\nLa salsa cubana se caracteriza por su energía contagiosa, su juego de caderas y su estructura en círculo (rueda de casino), mientras que la bachata dominicana enamora con sus movimientos fluidos, sensuales y románticos. Aprenderás a dominar ambos estilos, alternando entre la alegría de la salsa y la pasión de la bachata en cada sesión.\n\nLas clases están pensadas para que te diviertas desde el minuto cero. Con música en vivo en algunas sesiones especiales y prácticas sociales incluidas, este curso no solo te enseña a bailar: te introduce en una comunidad vibrante donde la amistad y la celebración son parte fundamental.",
        "objetivos": "Dominar los pasos básicos y figuras intermedias de salsa cubana y bachata dominicana.",
        "contenido_programa": "Unidad 1 – Ritmos latinos: diferencias entre salsa y bachata. Unidad 2 – Pasos básicos de salsa cubana. Unidad 3 – Giros, dile que no y exhibe. Unidad 4 – Rueda de casino y figuras grupales. Unidad 5 – Pasos básicos y giros de bachata. Unidad 6 – Bachata sensual: ondas y body rolls. Unidad 7 – Combinaciones y transiciones. Unidad 8 – Práctica social con música en vivo.",
        "requisitos": "No se requiere experiencia previa. No es obligatorio traer pareja fija. Zapatos cómodos de suela lisa recomendados.",
        "nivel": "todos los niveles",
        "duracion": "8 semanas (16 sesiones de 1.5 horas)",
        "materiales": "Zapatos cómodos de baile, ropa fresca y botella de agua.",
        "beneficios": "Excelente ejercicio cardiovascular y tonificación. Mejora de la coordinación y el ritmo. Experiencia social y expansión de círculo de amistades. Aprendizaje de dos de los bailes latinos más populares del mundo. Incremento de la confianza en situaciones sociales.",
        "instructor_bio": "Carlos y Daniela Méndez son una pareja de baile campeona latinoamericana de salsa social. Con más de 15 años de trayectoria, han competido y enseñado en Colombia, República Dominicana, Estados Unidos y Europa. Su metodología se basa en la diversión y el respeto, logrando que cualquier persona —sin importar edad o condición física— disfrute del baile desde la primera clase.",
        "modulos": "Unidad 1: Ritmos latinos. Unidad 2: Salsa básica. Unidad 3: Giros y figuras. Unidad 4: Rueda de casino. Unidad 5: Bachata básica. Unidad 6: Bachata sensual. Unidad 7: Combinaciones. Unidad 8: Práctica social."
    },
    8: {
        "titulo": "Guitarra Acústica desde Cero",
        "descripcion_larga": "Aprender a tocar guitarra es uno de los regalos más gratificantes que puedes darte a ti mismo. Este curso está diseñado para personas sin ninguna experiencia musical previa, llevándote paso a paso desde los acordes más simples hasta poder tocar canciones completas con fluidez y confianza.\n\nEl programa combina teoría musical práctica con ejercicios de técnica que desarrollan la destreza de ambas manos. Aprenderás rasgueos, arpegios, cambios de acordes, ritmos básicos y lectura de tablatura, todo aplicado a canciones populares que conoces y te gustan. Cada clase incluye práctica guiada para que nunca te sientas perdido.\n\nEn solo 8 semanas, serás capaz de acompañarte a ti mismo cantando, tocar en reuniones sociales y tendrás las bases sólidas para continuar tu aprendizaje hacia estilos más avanzados como fingerstyle, blues o rock acústico. La música comienza aquí.",
        "objetivos": "Aprender los acordes mayores y menores más utilizados en la música popular.",
        "contenido_programa": "Módulo 1 – Conociendo la guitarra: partes, afinación y postura. Módulo 2 – Acordes mayores y primeras canciones. Módulo 3 – Rasgueos básicos y ritmos. Módulo 4 – Cambios de acordes limpios y velocidad. Módulo 5 – Acordes menores y canciones con cejilla. Módulo 6 – Arpegios y punteo. Módulo 7 – Ritmos avanzados: vals, balada y funk. Módulo 8 – Repertorio final y performance grupal.",
        "requisitos": "No se requiere experiencia musical previa. Contar con una guitarra acústica o clásica.",
        "nivel": "básico",
        "duracion": "8 semanas (16 sesiones de 1.5 horas)",
        "materiales": "Guitarra acústica o clásica, púa (opcional), cuaderno de notas y afinador (app móvil válida).",
        "beneficios": "Desarrollo de coordinación mano-ojo y auditiva. Estimulación cognitiva y memoria. Reducción del estrés mediante la práctica musical. Capacidad de tocar canciones completas en 8 semanas. Puerta de entrada al mundo de la música.",
        "instructor_bio": "Jorge Rivas es músico sesionista, compositor y docente con más de 20 años de experiencia. Ha grabado para artistas de rock, pop y folclore chileno, y ha sido guitarrista principal en bandas destacadas de la escena nacional. Como docente en la Escuela Moderna de Música, ha formado a cientos de guitarristas, destacando por su paciencia infinita y su capacidad para hacer la música accesible a todos.",
        "modulos": "Módulo 1: La guitarra. Módulo 2: Acordes mayores. Módulo 3: Rasgueos. Módulo 4: Cambios limpios. Módulo 5: Acordes menores. Módulo 6: Arpegios. Módulo 7: Ritmos avanzados. Módulo 8: Repertorio final."
    },
    9: {
        "titulo": "Piano Contemporáneo",
        "descripcion_larga": "El piano es el instrumento más completo para entender la música, y este curso te permite explorarlo desde una perspectiva moderna y versátil. En lugar de limitarte a repertorio clásico tradicional, aprenderás a tocar jazz, pop, bossa nova y música latinoamericana contemporánea, desarrollando una técnica sólida con aplicaciones actuales.\n\nEl programa abarca armonía moderna, progresiones de acordes, voicings, improvisación y lectura a primera vista de partituras y acordes. Cada unidad incluye piezas prácticas que puedes tocar desde la primera semana, construyendo tu confianza y tu oído musical progresivamente.\n\nSi ya tienes bases de piano y quieres salir del repertorio clásico rígido, este curso te abre las puertas a un mundo de creatividad donde podrás acompañar cantantes, componer tus propias canciones e improvisar con libertad en cualquier género.",
        "objetivos": "Aplicar armonía moderna a géneros como jazz, pop, bossa nova y música latina.",
        "contenido_programa": "Unidad 1 – Revisión técnica y lectura de acordes. Unidad 2 – Armonía moderna: II-V-I y extensiones. Unidad 3 – Voicings de jazz y mano izquierda. Unidad 4 – Ritmos de bossa nova y latin jazz. Unidad 5 – Acompañamiento de pop y baladas. Unidad 6 – Introducción a la improvisación. Unidad 7 – Lectura a primera vista y trucos. Unidad 8 – Repertorio final y ensamble.",
        "requisitos": "Conocimientos básicos de piano (escalas mayores, lectura simple). Contar con un piano o teclado con teclas contrapesadas.",
        "nivel": "intermedio",
        "duracion": "10 semanas (20 sesiones de 1.5 horas)",
        "materiales": "Piano o teclado con 88 teclas contrapesadas, partituras proporcionadas, cuaderno de teoría.",
        "beneficios": "Ampliación del repertorio hacia géneros modernos. Desarrollo de la improvisación y creatividad. Mejora de la lectura musical funcional. Capacidad de acompañar y tocar en grupo. Fundamentos para la composición propia.",
        "instructor_bio": "Valentina Soto es pianista de jazz y música latina egresada del Conservatorio de Amsterdam (NL). Ha tocado en festivales de jazz de Europa y América Latina, y ha acompañado a vocalistas de renombre internacional. Como docente, combina la rigurosidad europea con la pasión latina, creando un ambiente de aprendizaje exigente pero acogedor.",
        "modulos": "Unidad 1: Revisión técnica. Unidad 2: Armonía moderna. Unidad 3: Voicings. Unidad 4: Bossa nova. Unidad 5: Pop y baladas. Unidad 6: Improvisación. Unidad 7: Lectura. Unidad 8: Repertorio final."
    },
    10: {
        "titulo": "Fotografía de Retrato Natural",
        "descripcion_larga": "La fotografía de retrato con luz natural es una de las disciplinas más demandadas en la industria creativa actual. Este curso te enseña a capturar la esencia de las personas utilizando únicamente la luz del sol, reflejadores y ambientes naturales, logrando resultados profesionales sin necesidad de equipo de iluminación costoso.\n\nAprenderás a leer la luz natural en diferentes horarios y condiciones climáticas, a dirigir modelos de manera empática y efectiva, y a componer retratos que cuentan historias. También cubriremos edición en Lightroom: revelado de archivos RAW, corrección de color, retrato digital y exportación optimizada para redes o impresión.\n\nEl taller incluye sesiones prácticas al aire libre en locaciones seleccionadas de la ciudad, donde aplicarás todo lo aprendido con modelos reales. Al finalizar, tendrás un portafolio sólido de retratos naturales y las habilidades para ofrecer sesiones profesionales.",
        "objetivos": "Dominar el uso de la luz natural en diferentes condiciones para retratos de impacto.",
        "contenido_programa": "Módulo 1 – Fundamentos de la luz natural: dureza, dirección y horarios. Módulo 2 – Equipo y configuraciones de cámara para retrato. Módulo 3 – Composición y encuadre en retrato. Módulo 4 – Dirección de modelos: poses y expresión. Módulo 5 – Uso de reflectores y difusores. Módulo 6 – Sesión práctica en exteriores I. Módulo 7 – Revelado y edición en Lightroom. Módulo 8 – Sesión práctica en exteriores II y portafolio.",
        "requisitos": "Conocimientos básicos de fotografía (modo manual recomendado). Contar con cámara DSLR/mirrorless o smartphone avanzado con control manual.",
        "nivel": "intermedio",
        "duracion": "8 semanas (12 sesiones de 3 horas)",
        "materiales": "Cámara con control manual, tarjeta de memoria, laptop con Lightroom instalado, reflector plegable (opcional).",
        "beneficios": "Desarrollo de un portafolio profesional de retrato. Aprendizaje de una técnica de bajo costo y alto impacto. Mejora de la comunicación visual y empática. Habilidades de edición profesional. Posibilidad de iniciar un negocio de retratos.",
        "instructor_bio": "Diego Fuentes es fotógrafo de retrato publicitario con más de 15 años de carrera. Su trabajo ha aparecido en revistas Vogue, Paula, COSAS y campañas para marcas internacionales. Especializado en retrato natural y editorial, ha enseñado fotografía en la Universidad del Pacífico y en talleres privados. Su enfoque docente privilegia la intuición visual y la conexión humana por sobre la técnica fría.",
        "modulos": "Módulo 1: Luz natural. Módulo 2: Equipo y cámara. Módulo 3: Composición. Módulo 4: Dirección de modelos. Módulo 5: Reflectores. Módulo 6: Práctica I. Módulo 7: Lightroom. Módulo 8: Práctica II."
    },
    11: {
        "titulo": "Escritura Creativa y Narrativa",
        "descripcion_larga": "Todos tenemos historias por contar, pero no siempre sabemos cómo empezar. Este taller de escritura creativa te proporciona las herramientas narrativas, técnicas de construcción de personajes y estrategias de diálogo que necesitas para transformar tus ideas en textos que enganchen desde la primera línea.\n\nEl curso combina teoría literaria con ejercicios prácticos intensivos. Cada sesión incluye lecturas de autores contemporáneos, análisis de estructuras narrativas y tiempo dedicado a escribir con feedback grupal constructivo. Aprenderás a crear conflictos creíbles, climaxes memorables y finales que resuenen con el lector.\n\nYa sea que aspire a publicar una novela, escribir cuentos, desarrollar guiones o simplemente explorar la escritura como terapia creativa, este taller te ofrece un espacio seguro y estimulante para encontrar tu voz literaria y perfeccionarla.",
        "objetivos": "Desarrollar una voz literaria propia y reconocible en la escritura narrativa.",
        "contenido_programa": "Unidad 1 – Los géneros narrativos y tu voz. Unidad 2 – Personajes: biografías, deseos y conflictos. Unidad 3 – Estructura narrativa: inicio, nudo y desenlace. Unidad 4 – El diálogo: ritmo, subtexto y autenticidad. Unidad 5 – Punto de vista y narrador. Unidad 6 – Ambientación y mundo ficticio. Unidad 7 – Reescritura y edición creativa. Unidad 8 – Publicación, mercado y cierre de taller.",
        "requisitos": "No se requiere experiencia previa. Solo disposición para leer, escribir y compartir en grupo.",
        "nivel": "todos los niveles",
        "duracion": "8 semanas (16 sesiones de 2 horas)",
        "materiales": "Cuaderno de escritura o laptop, lecturas proporcionadas por el instructor, diccionario de sinónimos.",
        "beneficios": "Desarrollo de la expresión escrita y creatividad. Herramientas para superar el bloqueo del escritor. Feedback constructivo de un grupo de pares. Conocimiento de técnicas narrativas probadas. Material literario propio para seguir desarrollando.",
        "instructor_bio": "Antonia Gutiérrez es escritora chilena ganadora del Premio Alfaguara de Novela 2020 por su obra 'La casa de las dos lunas'. Licenciada en Literatura de la Universidad de Chile, ha publicado cinco novelas y tres libros de cuentos traducidos a seis idiomas. Como docente, ha dirigido talleres en la Escuela de Escritores de Madrid, la FIL Guadalajara y universidades de Latinoamérica.",
        "modulos": "Unidad 1: Géneros y voz. Unidad 2: Personajes. Unidad 3: Estructura. Unidad 4: Diálogo. Unidad 5: Punto de vista. Unidad 6: Ambientación. Unidad 7: Reescritura. Unidad 8: Publicación."
    },
    12: {
        "titulo": "Macramé y Decoración Boho",
        "descripcion_larga": "El macramé es una técnica textil milenaria que ha vuelto con fuerza en la decoración contemporánea, especialmente en el estilo bohemio. En este curso aprenderás a crear piezas decorativas únicas utilizando únicamente tus manos y hilos de algodón, sin agujas ni máquinas de coser.\n\nDesde colgantes para plantas y tapices murales hasta adornos para puertas y piezas de mesa, cada proyecto te permitirá explorar diferentes nudos decorativos y combinaciones que dan vida a texturas orgánicas y armónicas. El enfoque es 100% práctico: en cada clase terminarás una pieza que podrás llevar a tu hogar.\n\nAdemás de la técnica, exploraremos tendencias de decoración boho, paletas de colores naturales y cómo integrar el macramé en diferentes espacios del hogar. Es una experiencia creativa relajante que muchos alumnos describen como 'terapia manual'.",
        "objetivos": "Aprender los nudos fundamentales del macramé: cote, plano, festón, espiral y Josephina.",
        "contenido_programa": "Módulo 1 – Historia del macramé y materiales. Módulo 2 – Nudos básicos y práctica. Módulo 3 – Colgante para plantas. Módulo 4 – Tapiz mural con flecos. Módulo 5 – Adorno para puerta o ventana. Módulo 6 – Portavelas o camino de mesa. Módulo 7 – Técnica de combinación de nudos avanzada. Módulo 8 – Proyecto libre y cierre.",
        "requisitos": "No se requiere experiencia previa. Aptos para mayores de 12 años.",
        "nivel": "básico",
        "duracion": "6 semanas (12 sesiones de 2 horas)",
        "materiales": "Hilos de algodón macramé de 3-5mm, tijeras afiladas, cinta métrica y varillas de madera o aros metálicos incluidos.",
        "beneficios": "Desarrollo de motricidad fina y concentración. Decoración personalizada del hogar. Aprendizaje de un oficio artesanal sostenible. Reducción del estrés mediante trabajo manual. Posibilidad de emprender vendiendo piezas artesanales.",
        "instructor_bio": "Paula Díaz es artesana textil y creadora de la marca BohoChile, con más de 50,000 seguidores en redes sociales. Autodidacta en técnicas de fibra vegetal, ha transformado el macramé en su forma de vida, vendiendo piezas en Chile, Argentina y México. Como docente, destaca por su energía contagiosa y su capacidad para hacer que cualquier persona cree piezas hermosas desde la primera clase.",
        "modulos": "Módulo 1: Historia y materiales. Módulo 2: Nudos básicos. Módulo 3: Colgante plantas. Módulo 4: Tapiz mural. Módulo 5: Adorno puerta. Módulo 6: Portavelas. Módulo 7: Nudos avanzados. Módulo 8: Proyecto libre."
    },
    13: {
        "titulo": "Jardinería Urbana Sustentable",
        "descripcion_larga": "Vivir en la ciudad ya no es excusa para no tener un huerto. Este curso te enseña a convertir tu balcón, terraza o incluso tu cocina en un espacio productivo donde cultivar hierbas aromáticas, vegetales frescos y plantas ornamentales, utilizando principios de permacultura y agricultura urbana sustentable.\n\nAprenderás sobre sustratos orgánicos, compostaje casero, riego eficiente, control natural de plagas y selección de especies según la orientación solar y el clima de tu zona. Cada sesión incluye demostraciones prácticas y la creación de tu propio huerto paso a paso, desde la siembra hasta la cosecha.\n\nAdemás de lo práctico, el curso profundiza en el impacto ambiental positivo de la jardinería urbana: reducción de huella de carbono, promoción de biodiversidad y reconexión con los ciclos naturales. Es una invitación a cultivar no solo plantas, sino también conciencia ecológica.",
        "objetivos": "Diseñar y construir un huerto urbano funcional en espacios reducidos.",
        "contenido_programa": "Unidad 1 – Principios de la agricultura urbana y permacultura. Unidad 2 – Sustratos, compostaje y fertilización orgánica. Unidad 3 – Selección de especies según espacio y luz. Unidad 4 – Siembra, trasplante y poda. Unidad 5 – Riego eficiente y drenaje. Unidad 6 – Control natural de plagas y enfermedades. Unidad 7 – Cultivo de hierbas, vegetales y aromáticas. Unidad 8 – Cosecha, conservación y planificación de ciclos.",
        "requisitos": "No se requiere experiencia previa. Tener acceso a un balcón, terraza o ventana con luz natural.",
        "nivel": "básico",
        "duracion": "8 semanas (16 sesiones de 2 horas)",
        "materiales": "Macetas, tierra orgánica, semillas, herramientas básicas (pala, regadera). Algunos materiales incluidos, otros a adquirir según proyecto.",
        "beneficios": "Producción de alimentos frescos y orgánicos en casa. Reducción de residuos mediante compostaje. Mejora del aire y bienestar en el hogar. Reconexión con la naturaleza en entorno urbano. Contribución directa a la sostenibilidad ambiental.",
        "instructor_bio": "Rodrigo Bravo es agrónomo de la Universidad de Chile y activista ambiental. Fundador de Huertos Urbanos Chile, ha diseñado más de 200 huertos en departamentos, colegios y empresas de Santiago y regiones. Especialista en permacultura urbana, ha sido asesor de municipalidades en políticas de agricultura local y conferencista en foros de sostenibilidad.",
        "modulos": "Unidad 1: Agricultura urbana. Unidad 2: Compostaje. Unidad 3: Especies y luz. Unidad 4: Siembra y poda. Unidad 5: Riego. Unidad 6: Plagas naturales. Unidad 7: Hierbas y vegetales. Unidad 8: Cosecha y ciclos."
    },
    14: {
        "titulo": "Cocina Peruana Auténtica",
        "descripcion_larga": "La gastronomía peruana es una de las más premiadas del mundo, y este curso te lleva directo a su corazón. Aprenderás a preparar los platos más emblemáticos del Perú con técnicas tradicionales transmitidas de generación en generación, utilizando ingredientes auténticos y descubriendo los secretos que hacen única a esta cocina.\n\nDesde el ceviche perfecto —con su punto exacto de limón y ají— hasta el lomo saltado, el ají de gallina y la causa limeña, cada clase es una inmersión en los sabores, colores y historias de una cultura milenaria. También exploraremos el mundo de los ajíes peruanos, el chifa (cocina fusión peruano-china) y postres tradicionales como el suspiro a la limeña.\n\nEl taller es 100% práctico: cada alumno cocina sus propias porciones desde cero, con guía paso a paso del chef. Al final de cada sesión, disfrutamos juntos de la degustación de lo preparado, convirtiendo cada clase en una celebración gastronómica.",
        "objetivos": "Dominar las técnicas base de la cocina peruana: marinado, salteado, aderezos y emplatado tradicional.",
        "contenido_programa": "Módulo 1 – Introducción a la gastronomía peruana y ajíes. Módulo 2 – Ceviche clásico y variantes regionales. Módulo 3 – Causa limeña y rellenos. Módulo 4 – Ají de gallina: preparación tradicional. Módulo 5 – Lomo saltado y técnicas de wok. Módulo 6 – Chifa peruano: arroz chaufa y tallarín saltado. Módulo 7 – Postres: suspiro a la limeña y mazamorra. Módulo 8 – Menú completo peruano y degustación final.",
        "requisitos": "No se requiere experiencia previa en cocina. Aptos para mayores de 16 años. Se recomienda traer un delantal.",
        "nivel": "intermedio",
        "duracion": "8 semanas (16 sesiones de 3 horas)",
        "materiales": "Ingredientes frescos proporcionados por el taller. Uso de delantal, cuchillos, ollas y utensilios del espacio.",
        "beneficios": "Aprendizaje de una de las cocinas más premiadas del mundo. Técnicas aplicables a otros estilos gastronómicos. Experiencia social y degustación en cada clase. Desarrollo del paladar y conocimiento de ingredientes. Recetario completo para replicar en casa.",
        "instructor_bio": "Chef Rosa Quispe es chef peruana nacida en Lima, con más de 18 años de trayectoria. Su restaurante 'Inti Raymi' en Santiago fue reconocido con el distintivo Bib Gourmand de la Guía Michelin. Formada en Le Cordon Bleu Lima y en el Instituto de Gastronomía Mariano Moreno, ha sido embajadora gastronómica de Perú en ferias internacionales. Su pasión por la enseñanza hace que cada clase sea una celebración de la cultura peruana.",
        "modulos": "Módulo 1: Introducción y ajíes. Módulo 2: Ceviche. Módulo 3: Causa. Módulo 4: Ají de gallina. Módulo 5: Lomo saltado. Módulo 6: Chifa. Módulo 7: Postres. Módulo 8: Menú completo."
    },
    15: {
        "titulo": "Pastelería Francesa Clásica",
        "descripcion_larga": "La pastelería francesa representa el pináculo de la repostería mundial, donde la precisión, la técnica y la estética se combinan para crear obras comestibles de arte. Este curso avanzado te introduce en los secretos de la repostería de precisión, desde la masa madre hasta los acabados profesionales que distinguen a las grandes maisons parisinas.\n\nDominarás recetas emblemáticas como los macarons con su característica cáscara crujiente y interior suave, los éclairs rellenos de crema pastelera perfecta, la tarte tatin con su caramelo invertido y los croissants con sus capas de mantequilla laminada. Cada técnica se descompone paso a paso para que comprendas la química detrás de cada resultado.\n\nEste curso exige dedicación y atención al detalle, pero la recompensa es inmensa: al finalizar, serás capaz de crear postres que impresionen tanto por su sabor como por su presentación, con el know-how de un pastelero formado en la tradición francesa.",
        "objetivos": "Dominar las técnicas de pastelería de precisión: temperaturas exactas, texturas y montajes.",
        "contenido_programa": "Unidad 1 – Fundamentos de la pastelería francesa: ingredientes, equipos y técnicas base. Unidad 2 – Masa choux y éclairs. Unidad 3 – Macarons: merengue italiano y macaronage. Unidad 4 – Cremas: pastelera, muselina y chantilly. Unidad 5 – Laminado de mantequilla: croissants y pain au chocolat. Unidad 6 – Tarte tatin y tartas de fruta. Unidad 7 – Glaseados, fondants y decoración. Unidad 8 – Examen práctico: creación de pieza libre.",
        "requisitos": "Conocimientos intermedios de repostería (masas básicas, horno, batidor). Disponibilidad para practicar en casa entre clases.",
        "nivel": "avanzado",
        "duracion": "10 semanas (20 sesiones de 3 horas)",
        "materiales": "Ingredientes premium proporcionados en taller. Uso de batidora planetaria, horno profesional, termómetro y moldes.",
        "beneficios": "Dominio de técnicas de pastelería de nivel profesional. Capacidad de replicar recetas de alta dificultad. Desarrollo de precisión y disciplina culinaria. Recetario completo de la tradición francesa. Posibilidad de emprender un negocio de repostería fina.",
        "instructor_bio": "Chef Jean-Pierre Morin es pastelero francés formado en Le Cordon Bleu París. Con experiencia en pastelerías de renombre como Ladurée y Pierre Hermé, llegó a Chile hace 10 años para dirigir la repostería de uno de los hoteles cinco estrellas de Santiago. Como docente, es exigente y meticuloso, pero también generoso compartiendo los trucos que solo se aprenden en las cocinas de las grandes maisons francesas.",
        "modulos": "Unidad 1: Fundamentos. Unidad 2: Éclairs. Unidad 3: Macarons. Unidad 4: Cremas. Unidad 5: Laminado. Unidad 6: Tartas. Unidad 7: Decoración. Unidad 8: Pieza libre."
    },
    16: {
        "titulo": "Tejido a Dos Agujas",
        "descripcion_larga": "El tejido a dos agujas es un oficio ancestral que ha acompañado a las culturas del mundo durante siglos, creando prendas que abrigan no solo el cuerpo sino también el alma. Este curso te introduce en esta técnica milenaria de forma accesible y progresiva, desde los puntos más simples hasta la creación de prendas completas y personalizadas.\n\nAprenderás a leer patrones internacionales, calcular medidas, realizar aumentos y disminuciones, y dominar texturas como el punto bobo, el jersey y las trenzas. Cada proyecto está diseñado para que termines con una pieza usable: bufandas, gorros, mitones y suéteres básicos que podrás personalizar con tus colores favoritos.\n\nMás allá de la técnica, el tejido es una práctica meditativa que muchos estudios han vinculado con la reducción del estrés y la mejora de la concentración. Es un espacio de calma creativa donde cada puntada cuenta una historia.",
        "objetivos": "Aprender los puntos básicos: derecho, revés, aumentos, disminuciones y remates.",
        "contenido_programa": "Módulo 1 – Historia del tejido y elección de materiales. Módulo 2 – Montaje de puntos y punto derecho/revés. Módulo 3 – Bufanda básica en punto bobo. Módulo 4 – Gorro en punto elástico. Módulo 5 – Lectura de patrones y cálculo de medidas. Módulo 6 – Mitones con aumentos y disminuciones. Módulo 7 – Suéter básico: mangas y cuello. Módulo 8 – Acabados, bloqueo y cuidado de prendas.",
        "requisitos": "No se requiere experiencia previa. Aptos para mayores de 12 años.",
        "nivel": "básico",
        "duracion": "10 semanas (20 sesiones de 2 horas)",
        "materiales": "Agujas de tejer de 4.5mm y 5mm, lana merino o acrílica de grosor medio, marcadores de puntos, tijeras y cinta métrica.",
        "beneficios": "Desarrollo de motricidad fina y coordinación. Creación de prendas únicas y personalizadas. Reducción del estrés y mejora del bienestar. Conexión con tradiciones culturales patrimoniales. Habilidad útil para toda la vida.",
        "instructor_bio": "Elena Castro es tejedora tradicional chilota, nacida y criada en el archipiélago de Chiloé. Heredera de técnicas transmitidas por su abuela y bisabuela, ha dedicado los últimos 25 años a preservar y enseñar el tejido tradicional chilote, reconocido como Patrimonio Cultural Inmaterial. Su enseñanza combina paciencia, calidez y un profundo respeto por la tradición textil.",
        "modulos": "Módulo 1: Historia y materiales. Módulo 2: Puntos básicos. Módulo 3: Bufanda. Módulo 4: Gorro. Módulo 5: Patrones. Módulo 6: Mitones. Módulo 7: Suéter. Módulo 8: Acabados."
    },
    17: {
        "titulo": "Ilustración Digital con Procreate",
        "descripcion_larga": "Procreate se ha convertido en la herramienta favorita de ilustradores, diseñadores y artistas digitales de todo el mundo gracias a su potencia, intuitividad y portabilidad. Este curso te lleva desde los primeros trazos digitales hasta la creación de ilustraciones profesionales listas para publicación, redes sociales o impresión.\n\nAprenderás a dominar la interfaz de Procreate, crear pinceles personalizados, utilizar capas avanzadas con modos de fusión, aplicar teoría del color digital y exportar tus obras en los formatos correctos según el medio de destino. Cada sesión incluye ejercicios prácticos basados en proyectos reales del mundo profesional.\n\nAl finalizar, tendrás un portafolio de ilustraciones digitales variadas —retratos, paisajes, lettering y personajes— y las habilidades para ofrecer tus servicios como ilustrador freelance o potenciar tu presencia creativa en redes.",
        "objetivos": "Dominar la interfaz completa de Procreate y sus herramientas avanzadas.",
        "contenido_programa": "Unidad 1 – Configuración del lienzo, pinceles y gestos. Unidad 2 – Capas, máscaras y modos de fusión. Unidad 3 – Teoría del color digital y paletas. Unidad 4 – Pinceles personalizados y estampados. Unidad 5 – Ilustración de retrato digital. Unidad 6 – Paisajes y ambientes. Unidad 7 – Lettering y tipografía ilustrada. Unidad 8 – Exportación, mockups y publicación profesional.",
        "requisitos": "Tener un iPad compatible con Apple Pencil. Tener la app Procreate instalada. Conocimientos básicos de dibujo recomendados.",
        "nivel": "intermedio",
        "duracion": "8 semanas (16 sesiones de 2 horas)",
        "materiales": "iPad con Apple Pencil, app Procreate instalada, acceso a internet para descargar recursos.",
        "beneficios": "Desarrollo de un portafolio digital profesional. Aprendizaje de la app líder en ilustración móvil. Posibilidad de trabajar como ilustrador freelance. Técnicas aplicables a branding, redes sociales y editorial. Flujo de trabajo digital completo.",
        "instructor_bio": "Nicolás Figueroa es ilustrador digital chileno con clientes internacionales como Disney, Netflix LATAM y Spotify. Especializado en concept art y visual development, ha trabajado en series animadas y campañas publicitarias de alcance global. Su enfoque docente se centra en el proceso creativo real del mundo profesional, enseñando no solo técnica sino también cómo comunicar ideas visualmente.",
        "modulos": "Unidad 1: Interfaz y gestos. Unidad 2: Capas avanzadas. Unidad 3: Color digital. Unidad 4: Pinceles. Unidad 5: Retrato digital. Unidad 6: Paisajes. Unidad 7: Lettering. Unidad 8: Exportación profesional."
    },
    18: {
        "titulo": "Canto Lírico y Técnica Vocal",
        "descripcion_larga": "La voz humana es el instrumento más expresivo y versátil que existe. Este curso de canto lírico te introduce en la técnica vocal clásica italiana —la base de todo buen canto— aplicada no solo al repertorio de ópera, sino también a la música latinoamericana, el bolero, la canción artística y otros géneros que demandan proyección y control.\n\nA través de ejercicios de respiración diafragmática, afinación, resonancia, articulación y expresión escénica, desarrollarás una voz sólida, saludable y con personalidad. Cada clase incluye trabajo técnico individualizado y la interpretación de piezas del repertorio universal y latinoamericano, acompañadas al piano.\n\nEl taller es ideal para quienes desean iniciar una carrera vocal, preparar audiciones, o simplemente descubrir el potencial de su voz en un ambiente profesional y acogedor. La música clásica nunca fue tan accesible.",
        "objetivos": "Desarrollar una técnica vocal saludable basada en la respiración diafragmática y la resonancia.",
        "contenido_programa": "Módulo 1 – Anatomía vocal y postura de canto. Módulo 2 – Respiración diafragmática y apoyo. Módulo 3 – Afinación, escala y entrenamiento auditivo. Módulo 4 – Resonancia: máscara, pecho y cabeza. Módulo 5 – Articulación, dicción y legato. Módulo 6 – Repertorio de ópera y lied. Módulo 7 – Música latinoamericana y bolero. Módulo 8 – Interpretación escénica y presentación final.",
        "requisitos": "No se requiere experiencia previa en canto clásico. Traer una carpeta con partituras o letras. Vestimenta cómoda que permita respiración libre.",
        "nivel": "intermedio",
        "duracion": "10 semanas (20 sesiones de 1.5 horas)",
        "materiales": "Partituras proporcionadas, acompañamiento al piano incluido. Carpeta para partituras y botella de agua tibia.",
        "beneficios": "Desarrollo de una técnica vocal saludable y sostenible. Ampliación del repertorio musical. Mejora de la proyección y confianza escénica. Conocimiento del funcionamiento anatómico de la voz. Experiencia de interpretación con acompañamiento profesional.",
        "instructor_bio": "María José Correa es soprano chilena, solista estable del Teatro Municipal de Santiago. Egresada del Conservatorio de Música de la Universidad de Chile, ha interpretado roles principales en óperas de Verdi, Puccini y Mozart. Ha actuado en teatros de Alemania, España y Argentina, y ha recibido premios en concursos internacionales de canto. Como docente, combina exigencia técnica con una pasión contagiosa por transmitir el arte del canto.",
        "modulos": "Módulo 1: Anatomía vocal. Módulo 2: Respiración. Módulo 3: Afinación. Módulo 4: Resonancia. Módulo 5: Articulación. Módulo 6: Ópera y lied. Módulo 7: Latinoamericano. Módulo 8: Escena final."
    },
    19: {
        "titulo": "Mindfulness para la Vida Cotidiana",
        "descripcion_larga": "El mindfulness no es solo sentarse a meditar: es una forma de vivir. Este curso práctico te enseña a integrar la atención plena en cada aspecto de tu vida cotidiana —desde tu trabajo y relaciones hasta el simple acto de comer o caminar— transformando experiencias ordinarias en momentos de presencia y significado.\n\nBasado en el programa MBSR (Mindfulness-Based Stress Reduction) desarrollado por el Dr. Jon Kabat-Zinn en la Universidad de Massachusetts, el taller combina meditación formal con ejercicios informales que puedes practicar en cualquier momento del día. Cada sesión incluye teoría, práctica guiada y espacio para compartir experiencias.\n\nLos beneficios de esta práctica están respaldados por décadas de investigación científica: reducción del estrés crónico, mejora del sueño, regulación emocional, aumento de la resiliencia y una mayor satisfacción general con la vida. Es una inversión en tu bienestar que perdura mucho más allá de las 8 semanas del curso.",
        "objetivos": "Integrar prácticas de mindfulness en actividades diarias como comer, caminar, trabajar y relacionarse.",
        "contenido_programa": "Unidad 1 – Fundamentos del mindfulness y ciencia del cerebro. Unidad 2 – Meditación de atención a la respiración. Unidad 3 – Body scan y consciencia corporal profunda. Unidad 4 – Mindfulness en movimiento: yoga suave y caminata. Unidad 5 – Atención plena en la alimentación. Unidad 6 – Gestión del estrés laboral. Unidad 7 – Comunicación consciente y relaciones. Unidad 8 – Creación de una práctica sostenible a largo plazo.",
        "requisitos": "No se requiere experiencia previa. Apto para adultos de cualquier edad. Traer cojín o manta.",
        "nivel": "todos los niveles",
        "duracion": "8 semanas (16 sesiones de 1.5 horas)",
        "materiales": "Cojín o manta, diario de práctica, audios de meditación guiada proporcionados.",
        "beneficios": "Reducción del estrés y la ansiedad demostrada científicamente. Mejora de la calidad del sueño. Mayor claridad mental y toma de decisiones. Mejora de relaciones interpersonales. Herramientas de autocuidado para toda la vida.",
        "instructor_bio": "Dra. Ana María Lagos es psicóloga clínica con doctorado en Neurociencias Cognitivas de la Universidad de Barcelona. Certificada como instructora MBSR por el Center for Mindfulness de la Universidad de Massachusetts, ha implementado programas de bienestar en empresas Fortune 500 y en el sistema público de salud chileno. Es autora de múltiples papers sobre mindfulness y cerebro, y una comunicadora apasionada por hacer la ciencia accesible.",
        "modulos": "Unidad 1: Fundamentos. Unidad 2: Respiración. Unidad 3: Body scan. Unidad 4: Movimiento. Unidad 5: Alimentación. Unidad 6: Estrés laboral. Unidad 7: Relaciones. Unidad 8: Práctica sostenible."
    },
    20: {
        "titulo": "Encuadernación Artesanal",
        "descripcion_larga": "Crear un libro con tus propias manos es una de las experiencias más gratificantes para cualquier amante del arte, la escritura o el papel. Este curso te enseña técnicas tradicionales de encuadernación artesanal que te permitirán fabricar diarios, álbumes de fotos, libros de artista y cuadernos únicos con acabados profesionales.\n\nExplorarás métodos ancestrales como la encuadernación japonesa (watoji), con sus hilos expuestos y patrones decorativos, y el cosido copta, una técnica milenaria que permite que el libro se abra completamente plano. También aprenderás a crear tapas decorativas, aplicar papeles especiales y realizar acabados que elevan cada pieza al nivel de obra de arte.\n\nCada proyecto está diseñado para que aprendas una técnica diferente, construyendo un repertorio versátil que podrás aplicar a regalos personalizados, proyectos editoriales independientes o incluso para iniciar un emprendimiento artesanal de encuadernación.",
        "objetivos": "Aprender las técnicas de encuadernación japonesa (watoji) y cosido copta.",
        "contenido_programa": "Módulo 1 – Historia del libro artesanal y materiales. Módulo 2 – Plegado de signatures y corte de papel. Módulo 3 – Encuadernación japonesa: nudo simple y tortuga. Módulo 4 – Encuadernación copta: estructura y costura. Módulo 5 – Creación de tapas duras y decoradas. Módulo 6 – Aplicación de papeles especiales y marbling. Módulo 7 – Álbum de fotos con ventanas y bolsillos. Módulo 8 – Proyecto final: libro de artista integral.",
        "requisitos": "No se requiere experiencia previa. Aptos para mayores de 14 años. Traer una regla y tijeras personales.",
        "nivel": "básico",
        "duracion": "6 semanas (12 sesiones de 3 horas)",
        "materiales": "Papeles de algodón, cartulinas, hilo de lino, aguja de encuadernar, cutter, regla metálica, pegamento libre de ácido. Materiales incluidos.",
        "beneficios": "Aprendizaje de oficios artesanales con valor patrimonial. Creación de objetos únicos y personalizados. Desarrollo de paciencia y precisión manual. Posibilidad de emprender en encuadernación artesanal. Reconexión con el objeto libro en era digital.",
        "instructor_bio": "Patricia Molina es artista del libro con más de 20 años de experiencia en encuadernación artesanal. Su obra ha sido expuesta en la Feria del Libro de Frankfurt, la Bienal de Arte de La Habana y galerías de arte objeto de Latinoamérica y Europa. Formada en el Centro de Arte de la Imprenta en Barcelona, ha publicado dos manuales sobre encuadernación y dicta talleres en museos y universidades de Chile y el extranjero.",
        "modulos": "Módulo 1: Historia y materiales. Módulo 2: Plegado. Módulo 3: Watoji. Módulo 4: Copta. Módulo 5: Tapas duras. Módulo 6: Papeles especiales. Módulo 7: Álbum. Módulo 8: Libro de artista."
    }
}


def actualizar_curso(curso_id, data):
    url = f"{BASE_URL}/{curso_id}"
    # Solo enviamos los campos nuevos + descripcion para restaurar la original
    payload = {
        "descripcion_larga": data["descripcion_larga"],
        "objetivos": data["objetivos"],
        "contenido_programa": data["contenido_programa"],
        "requisitos": data["requisitos"],
        "nivel": data["nivel"],
        "duracion": data["duracion"],
        "materiales": data["materiales"],
        "beneficios": data["beneficios"],
        "instructor_bio": data["instructor_bio"],
        "modulos": data["modulos"],
    }
    
    resp = requests.patch(url, headers=HEADERS, json=payload)
    return resp


def main():
    print("=" * 60)
    print("ACTUALIZANDO 20 CURSOS EN ALALÁ API")
    print("=" * 60)
    
    for curso_id in sorted(cursos_data.keys()):
        data = cursos_data[curso_id]
        print(f"\n[{curso_id}/20] Actualizando: {data['titulo']}...", end=" ")
        
        try:
            resp = actualizar_curso(curso_id, data)
            if resp.status_code == 200:
                result = resp.json()
                if result.get("status") == "ok":
                    print("✅ OK")
                else:
                    print(f"⚠️ Respuesta inesperada: {result}")
            else:
                print(f"❌ Error HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"❌ Excepción: {e}")
        
        time.sleep(0.5)  # Pequeña pausa entre requests
    
    print("\n" + "=" * 60)
    print("PROCESO COMPLETADO")
    print("=" * 60)


if __name__ == "__main__":
    main()
