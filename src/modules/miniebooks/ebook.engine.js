/**
 * ═══════════════════════════════════════════════════════════
 * MOTOR DE GENERACIÓN DE EBOOKS — Mini-Ebooks ALALÁ
 * ═══════════════════════════════════════════════════════════
 *
 * Responsabilidades:
 * 1. Parsear manuscritos (.txt, .docx, texto plano)
 * 2. Limpiar y detectar estructura (títulos, capítulos)
 * 3. Aplicar plantillas visuales (4 estilos)
 * 4. Generar EPUB 3 válido
 * 5. Generar PDF vía Puppeteer
 */

import JSZip from 'jszip';
import puppeteer from 'puppeteer';
import mammoth from 'mammoth';

// ── Singleton de Browser para Puppeteer ───────────────────────────
let browserInstance = null;

const getBrowser = async () => {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browserInstance;
};

// ── Plantillas CSS ────────────────────────────────────────────────

const TEMPLATES = {
  minimalista: {
    name: 'Minimalista',
    fonts: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');`,
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
    fontSize: '11pt',
    lineHeight: '1.7',
    color: '#1a1a1a',
    bg: '#ffffff',
    accent: '#D4705A',
    h1Size: '2.2rem',
    h2Size: '1.6rem',
    h3Size: '1.25rem',
    marginTop: '25mm',
    marginBottom: '25mm',
    marginInner: '20mm',
    marginOuter: '20mm',
    quoteStyle: `
      border-left: 3px solid #D4705A;
      padding-left: 1.2rem;
      margin: 1.5rem 0;
      color: #444;
      font-style: italic;
    `,
  },
  cinematografica: {
    name: 'Cinematográfica',
    fonts: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');`,
    fontFamily: `'Inter', sans-serif`,
    h1Font: `'Playfair Display', serif`,
    fontSize: '11.5pt',
    lineHeight: '1.65',
    color: '#1a1a1a',
    bg: '#fafafa',
    accent: '#1a1a1a',
    h1Size: '2.8rem',
    h2Size: '1.8rem',
    h3Size: '1.3rem',
    marginTop: '20mm',
    marginBottom: '20mm',
    marginInner: '22mm',
    marginOuter: '18mm',
    quoteStyle: `
      background: #f0f0f0;
      padding: 1.5rem;
      margin: 2rem 0;
      font-family: 'Playfair Display', serif;
      font-size: 1.15rem;
      font-style: italic;
      text-align: center;
    `,
  },
  poetica: {
    name: 'Poética',
    fonts: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400&display=swap');`,
    fontFamily: `'Cormorant Garamond', Georgia, serif`,
    fontSize: '13pt',
    lineHeight: '1.9',
    color: '#2c2c2c',
    bg: '#ffffff',
    accent: '#8B6F5C',
    h1Size: '2.4rem',
    h2Size: '1.7rem',
    h3Size: '1.35rem',
    marginTop: '28mm',
    marginBottom: '28mm',
    marginInner: '24mm',
    marginOuter: '24mm',
    quoteStyle: `
      text-align: center;
      font-style: italic;
      margin: 2rem 3rem;
      color: #555;
      font-size: 1.1rem;
    `,
  },
  motivacional: {
    name: 'Motivacional',
    fonts: `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@300;400;600&display=swap');`,
    fontFamily: `'Open Sans', sans-serif`,
    h1Font: `'Montserrat', sans-serif`,
    fontSize: '11pt',
    lineHeight: '1.75',
    color: '#1f2937',
    bg: '#ffffff',
    accent: '#D4705A',
    h1Size: '2.2rem',
    h2Size: '1.5rem',
    h3Size: '1.2rem',
    marginTop: '22mm',
    marginBottom: '22mm',
    marginInner: '20mm',
    marginOuter: '20mm',
    quoteStyle: `
      background: linear-gradient(135deg, #F8EAE5 0%, #fff 100%);
      border-left: 4px solid #D4705A;
      padding: 1.2rem 1.5rem;
      margin: 1.5rem 0;
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
      border-radius: 0 8px 8px 0;
    `,
  },
};

const VALID_TEMPLATES = Object.keys(TEMPLATES);

// ── Parseo de manuscrito ──────────────────────────────────────────

/**
 * Extrae texto plano de un archivo .docx (Buffer)
 */
export const parseDocx = async (buffer) => {
  const result = await mammoth.convertToHtml({ buffer });
  return result.value;
};

/**
 * Limpia HTML de estilos inline y elementos no deseados
 */
const limpiarHtml = (html) => {
  if (!html) return '';
  let clean = html;
  // Eliminar estilos inline
  clean = clean.replace(/\s*style="[^"]*"/gi, '');
  // Eliminar clases inline
  clean = clean.replace(/\s*class="[^"]*"/gi, '');
  // Normalizar tags vacíos
  clean = clean.replace(/<p>\s*<\/p>/gi, '');
  clean = clean.replace(/<div>\s*<\/div>/gi, '');
  return clean.trim();
};

/**
 * Convierte texto plano a HTML limpio, detectando títulos automáticamente
 */
export const textoAHtml = (texto) => {
  if (!texto) return '';
  const lineas = texto.split(/\r?\n/);
  let html = '';
  let parrafoActual = '';

  const flushParrafo = () => {
    if (parrafoActual.trim()) {
      html += `<p>${escaparHtml(parrafoActual.trim())}</p>\n`;
      parrafoActual = '';
    }
  };

  for (const raw of lineas) {
    const linea = raw.trimEnd();
    const trimmed = linea.trim();

    if (!trimmed) {
      flushParrafo();
      continue;
    }

    // Detectar Markdown headings
    if (trimmed.startsWith('# ')) {
      flushParrafo();
      html += `<h1>${escaparHtml(trimmed.slice(2))}</h1>\n`;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushParrafo();
      html += `<h2>${escaparHtml(trimmed.slice(3))}</h2>\n`;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushParrafo();
      html += `<h3>${escaparHtml(trimmed.slice(4))}</h3>\n`;
      continue;
    }

    // Detectar títulos por patrón: línea corta, mayúsculas, sin puntuación final
    const esPosibleTitulo =
      trimmed.length >= 5 &&
      trimmed.length <= 80 &&
      /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ\s\d\-–—:]{4,}$/.test(trimmed) &&
      !/[.!?;,]$/.test(trimmed) &&
      !trimmed.includes('  ');

    if (esPosibleTitulo && parrafoActual.trim().length > 0) {
      flushParrafo();
      html += `<h2>${escaparHtml(trimmed)}</h2>\n`;
      continue;
    }

    // Acumular párrafo
    if (parrafoActual) parrafoActual += ' ';
    parrafoActual += trimmed;
  }

  flushParrafo();
  return html;
};

const escaparHtml = (texto) => {
  if (!texto) return '';
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Genera índice automático desde el HTML
 */
export const generarIndice = (html) => {
  const indice = [];
  const regex = /<h([123])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const nivel = parseInt(match[1]);
    const titulo = match[2].replace(/<[^>]+>/g, '').trim();
    indice.push({ titulo, nivel, id: `cap-${indice.length + 1}` });
  }
  return indice;
};

/**
 * Añade IDs a los headings del HTML para navegación interna
 */
const agregarIdsAHeadings = (html) => {
  let counter = 1;
  return html.replace(/<h([123])([^>]*)>/gi, (match, nivel, attrs) => {
    if (attrs.includes('id=')) return match;
    return `<h${nivel}${attrs} id="cap-${counter++}">`;
  });
};

// ── Construcción del HTML maquetado ──────────────────────────────

const construirCssTemplate = (tpl) => `
${tpl.fonts}

@page {
  size: A5;
  margin: ${tpl.marginTop} ${tpl.marginOuter} ${tpl.marginBottom} ${tpl.marginInner};
  @bottom-center {
    content: counter(page);
    font-family: ${tpl.fontFamily};
    font-size: 9pt;
    color: #999;
  }
}

@page :first {
  @bottom-center { content: none; }
}

* { box-sizing: border-box; }

body {
  font-family: ${tpl.fontFamily};
  font-size: ${tpl.fontSize};
  line-height: ${tpl.lineHeight};
  color: ${tpl.color};
  background: ${tpl.bg};
  margin: 0;
  padding: 0;
}

/* Portada */
.cover-page {
  page-break-after: always;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
}
.cover-page img {
  max-width: 70%;
  max-height: 55vh;
  object-fit: contain;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.cover-page .title {
  font-family: ${tpl.h1Font || tpl.fontFamily};
  font-size: ${tpl.h1Size};
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${tpl.color};
  letter-spacing: -0.02em;
}
.cover-page .author {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

/* Índice */
.toc-page {
  page-break-after: always;
  padding: 1rem 0;
}
.toc-page h2 {
  font-family: ${tpl.h1Font || tpl.fontFamily};
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: ${tpl.color};
}
.toc-page ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.toc-page li {
  margin: 0.6rem 0;
  font-size: 1rem;
}
.toc-page li.level-2 {
  padding-left: 1.5rem;
  font-size: 0.95rem;
}
.toc-page li.level-3 {
  padding-left: 3rem;
  font-size: 0.9rem;
  color: #555;
}
.toc-page a {
  color: ${tpl.color};
  text-decoration: none;
}
.toc-page a:hover {
  color: ${tpl.accent};
}

/* Contenido */
.content-body {
  padding: 0.5rem 0;
}
.content-body h1 {
  font-family: ${tpl.h1Font || tpl.fontFamily};
  font-size: ${tpl.h1Size};
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: ${tpl.color};
  line-height: 1.2;
  page-break-after: avoid;
}
.content-body h2 {
  font-family: ${tpl.h1Font || tpl.fontFamily};
  font-size: ${tpl.h2Size};
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 0.8rem;
  color: ${tpl.color};
  page-break-after: avoid;
}
.content-body h3 {
  font-family: ${tpl.h1Font || tpl.fontFamily};
  font-size: ${tpl.h3Size};
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.6rem;
  color: ${tpl.color};
  page-break-after: avoid;
}
.content-body p {
  margin: 0 0 1rem 0;
  text-align: justify;
  hyphens: auto;
}
.content-body blockquote {
  ${tpl.quoteStyle}
}
.content-body blockquote p {
  margin: 0;
  text-align: left;
}
.content-body img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5rem auto;
}
.content-body hr {
  border: none;
  border-top: 1px solid #ddd;
  margin: 2rem 0;
}
.content-body ul, .content-body ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}
.content-body li {
  margin: 0.3rem 0;
}
`;

const construirHtmlCompleto = (htmlContent, templateKey, metadata) => {
  const tpl = TEMPLATES[templateKey] || TEMPLATES.minimalista;
  const css = construirCssTemplate(tpl);
  const indice = generarIndice(htmlContent);
  const htmlConIds = agregarIdsAHeadings(htmlContent);

  let tocHtml = '';
  if (indice.length > 0) {
    tocHtml = `
    <div class="toc-page">
      <h2>Índice</h2>
      <ul>
        ${indice.map(item => `
          <li class="level-${item.nivel}">
            <a href="#${item.id}">${escaparHtml(item.titulo)}</a>
          </li>
        `).join('')}
      </ul>
    </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="${metadata.idioma || 'es'}">
<head>
  <meta charset="UTF-8">
  <title>${escaparHtml(metadata.titulo)}</title>
  <style>
    ${css}
  </style>
</head>
<body>
  <div class="cover-page">
    ${metadata.portadaUrl ? `<img src="${metadata.portadaUrl}" alt="Portada">` : ''}
    <div class="title">${escaparHtml(metadata.titulo)}</div>
    ${metadata.autor ? `<div class="author">${escaparHtml(metadata.autor)}</div>` : ''}
  </div>
  ${tocHtml}
  <div class="content-body">
    ${htmlConIds}
  </div>
</body>
</html>`;
};

// ── Generación de EPUB ────────────────────────────────────────────

export const generarEPUB = async (htmlContent, templateKey, metadata) => {
  const tpl = TEMPLATES[templateKey] || TEMPLATES.minimalista;
  const indice = generarIndice(htmlContent);
  const htmlConIds = agregarIdsAHeadings(htmlContent);

  const uuid = `urn:uuid:${crypto.randomUUID()}`;
  const fecha = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const titleEsc = escaparHtml(metadata.titulo);
  const authorEsc = escaparHtml(metadata.autor || 'Autor');

  const cssContent = construirCssTemplate(tpl)
    .replace(/@page\s*{[^}]+}/g, '')
    .replace(/@page\s*:first\s*{[^}]+}/g, '');

  // Simplificar CSS para EPUB (no soporta @page complejo)
  const epubCss = cssContent + `
    body { margin: 0; padding: 1rem; }
    .cover-page { min-height: auto; padding: 3rem 1rem; }
  `;

  const zip = new JSZip();

  // mimetype (sin compresión)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // META-INF/container.xml
  zip.folder('META-INF').file('container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  const oebps = zip.folder('OEBPS');

  // content.opf
  const spineItems = ['<itemref idref="cover"/>', '<itemref idref="toc"/>', '<itemref idref="content"/>'];
  const manifestItems = [
    '<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>',
    '<item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>',
    '<item id="style" href="style.css" media-type="text/css"/>',
  ];

  oebps.file('content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${titleEsc}</dc:title>
    <dc:creator>${authorEsc}</dc:creator>
    <dc:language>${metadata.idioma || 'es'}</dc:language>
    <dc:identifier id="bookid">${uuid}</dc:identifier>
    <meta property="dcterms:modified">${fecha}</meta>
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    ${spineItems.join('\n    ')}
  </spine>
</package>`);

  // cover.xhtml
  oebps.file('cover.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${metadata.idioma || 'es'}">
<head>
  <title>${titleEsc}</title>
  <link rel="stylesheet" href="style.css" type="text/css"/>
</head>
<body>
  <div class="cover-page">
    ${metadata.portadaUrl ? `<img src="${metadata.portadaUrl}" alt="Portada"/>` : ''}
    <div class="title">${titleEsc}</div>
    ${metadata.autor ? `<div class="author">${authorEsc}</div>` : ''}
  </div>
</body>
</html>`);

  // toc.xhtml (nav document)
  const tocItems = indice.map(item =>
    `<li><a href="content.xhtml#${item.id}">${escaparHtml(item.titulo)}</a></li>`
  ).join('\n    ');

  oebps.file('toc.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${metadata.idioma || 'es'}">
<head>
  <title>Índice — ${titleEsc}</title>
  <link rel="stylesheet" href="style.css" type="text/css"/>
</head>
<body>
  <nav epub:type="toc" class="toc-page">
    <h2>Índice</h2>
    <ol>
      ${tocItems}
    </ol>
  </nav>
</body>
</html>`);

  // content.xhtml
  oebps.file('content.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${metadata.idioma || 'es'}">
<head>
  <title>${titleEsc}</title>
  <link rel="stylesheet" href="style.css" type="text/css"/>
</head>
<body>
  <div class="content-body">
    ${htmlConIds}
  </div>
</body>
</html>`);

  // style.css
  oebps.file('style.css', epubCss);

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  return buffer;
};

// ── Generación de PDF ─────────────────────────────────────────────

export const generarPDF = async (htmlContent, templateKey, metadata) => {
  const htmlCompleto = construirHtmlCompleto(htmlContent, templateKey, metadata);
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(htmlCompleto, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: 'A5',
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 30000,
    });

    return pdfBuffer;
  } finally {
    await page.close();
  }
};

// ── Pipeline principal ────────────────────────────────────────────

/**
 * Procesa un manuscrito completo: parsea, limpia, maqueta, genera EPUB y PDF.
 *
 * @param {Object} input
 * @param {string} input.texto - Texto plano o HTML del manuscrito
 * @param {Buffer} [input.docxBuffer] - Buffer de archivo .docx
 * @param {string} input.template - Clave de plantilla
 * @param {Object} metadata - { titulo, autor, portadaUrl, idioma }
 * @returns {Promise<{html: string, indice: Array, epubBuffer: Buffer, pdfBuffer: Buffer}>}
 */
export const procesarManuscrito = async (input, metadata) => {
  const { texto, docxBuffer, template = 'minimalista' } = input;

  if (!VALID_TEMPLATES.includes(template)) {
    throw new Error(`Plantilla inválida. Usa: ${VALID_TEMPLATES.join(', ')}`);
  }

  let htmlRaw = '';

  if (docxBuffer) {
    htmlRaw = await parseDocx(docxBuffer);
    htmlRaw = limpiarHtml(htmlRaw);
  } else if (texto) {
    htmlRaw = textoAHtml(texto);
  } else {
    throw new Error('Debes proporcionar texto o un archivo .docx');
  }

  const indice = generarIndice(htmlRaw);
  const palabras = (texto || '').split(/\s+/).filter(Boolean).length ||
                   htmlRaw.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;

  const [epubBuffer, pdfBuffer] = await Promise.all([
    generarEPUB(htmlRaw, template, metadata),
    generarPDF(htmlRaw, template, metadata),
  ]);

  return {
    html: htmlRaw,
    indice,
    palabras,
    epubBuffer,
    pdfBuffer,
    epubSizeMb: parseFloat((epubBuffer.length / (1024 * 1024)).toFixed(2)),
    pdfSizeMb: parseFloat((pdfBuffer.length / (1024 * 1024)).toFixed(2)),
  };
};

/**
 * Cierra el browser de Puppeteer (útil para tests o graceful shutdown)
 */
export const cerrarBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};

export { VALID_TEMPLATES, TEMPLATES };
