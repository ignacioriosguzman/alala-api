# Módulo Mini-Ebooks ALALÁ

## Descripción

Sistema completo de creación, maquetación y venta de mini-ebooks digitales. Los autores pueden subir manuscritos, elegir plantillas visuales y generar automáticamente archivos EPUB y PDF listos para distribuir.

## Estructura

```
modules/miniebooks/
├── ebook.engine.js           # Motor de generación EPUB/PDF
├── miniebooks.service.js     # Lógica de negocio + Prisma
├── miniebooks.controller.js  # Handlers HTTP
├── miniebooks.routes.js      # Definición de endpoints
└── README.md                 # Esta documentación
```

## Dependencias

- `puppeteer` — Generación de PDF desde HTML/CSS
- `jszip` — Construcción de archivos EPUB
- `mammoth` — Parseo de archivos .docx
- `sharp` — (listo para futura optimización de imágenes)

## Plantillas disponibles

| Plantilla | Descripción | Fuentes |
|-----------|-------------|---------|
| `minimalista` | Limpia, márgenes amplios, tipografía Inter | Inter |
| `cinematografica` | Dramática, títulos grandes, estilo editorial | Playfair Display + Inter |
| `poetica` | Espaciado amplio, versos centrados, Garamond | Cormorant Garamond |
| `motivacional` | Bloques de color, citas destacadas, energética | Montserrat + Open Sans |

## Endpoints API

### CRUD
- `POST /api/v1/miniebooks` — Crear ebook (requiere INSTRUCTOR/ADMIN)
- `GET /api/v1/miniebooks` — Listar catálogo público
- `GET /api/v1/miniebooks/:id` — Obtener detalle
- `GET /api/v1/miniebooks/mis-ebooks` — Listar ebooks del autor autenticado
- `PATCH /api/v1/miniebooks/:id` — Editar metadatos
- `PATCH /api/v1/miniebooks/:id/status` — Cambiar estado (borrador/activo/pausado)
- `DELETE /api/v1/miniebooks/:id` — Eliminar

### Generación
- `POST /api/v1/miniebooks/:id/generar` — Generar EPUB y PDF, subir a Drive

### Compras
- `POST /api/v1/miniebooks/:id/comprar` — Comprar (usuario autenticado)
- `POST /api/v1/miniebooks/:id/comprar-invitado` — Comprar sin registro
- `GET /api/v1/miniebooks/mis-compras` — Mis compras
- `GET /api/v1/miniebooks/:id/compra/check` — Verificar si compré

### Interacciones
- `POST /api/v1/miniebooks/:id/favorito` — Toggle favorito
- `POST /api/v1/miniebooks/:id/progreso` — Guardar progreso de lectura
- `POST /api/v1/miniebooks/:id/resenas` — Crear reseña
- `GET /api/v1/miniebooks/:id/resenas` — Listar reseñas

### Stats
- `GET /api/v1/miniebooks/estadisticas/mis-stats` — Estadísticas del autor

## Flujo de uso

1. **Crear**: El autor envía título, descripción, texto y plantilla → se crea en estado `borrador`
2. **Generar**: Se llama `POST /:id/generar` → el motor procesa el texto, genera EPUB y PDF, los sube a Google Drive y guarda las URLs
3. **Publicar**: Se cambia status a `activo` → aparece en el catálogo
4. **Comprar**: El lector compra → se crea `CompraMiniEbook` y puede descargar los archivos

## Cómo agregar una nueva plantilla

1. Editar `ebook.engine.js` → objeto `TEMPLATES`
2. Definir: fuentes, tamaños, márgenes, colores, estilo de citas
3. El CSS se genera automáticamente para PDF y EPUB
4. Agregar la plantilla al frontend en `crear-ebook.html`

## Troubleshooting

### Puppeteer no inicia
- Verificar que Chrome/Chromium esté instalado en el servidor
- En Railway/Render: usar `puppeteer` con args `--no-sandbox --disable-setuid-sandbox`

### EPUB no se abre en lector
- Verificar que el archivo tenga la estructura correcta (mimetype, META-INF/container.xml, OEBPS/content.opf)
- El mimetype DEBE ser el primer archivo del ZIP sin compresión

### Texto .docx no se parsea
- `mammoth` solo soporta .docx (no .doc de Word 97-2003)
- Si falla, el sistema cae de gracia al texto plano
