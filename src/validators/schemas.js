import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════

const str = z.string();
const int = z.number().int();
const positiveInt = int.min(1, "Debe ser un entero positivo");
const idParam = str.transform((val) => {
  const n = Number(val);
  if (!Number.isInteger(n) || n <= 0) throw new Error("ID inválido");
  return n;
});

// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════

export const registerSchema = z.object({
  nombre: str.min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  email: str.email("Email inválido").max(255, "Máximo 255 caracteres"),
  password: str.min(8, "Mínimo 8 caracteres").max(100, "Máximo 100 caracteres"),
});

export const loginSchema = z.object({
  email: str.email("Email inválido"),
  password: str.min(1, "Contraseña requerida"),
});

export const forgotPasswordSchema = z.object({
  email: str.email("Email inválido"),
});

export const reenviarSchema = z.object({
  email: str.email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  id: z.union([str, int]).transform((v) => Number(v)),
  token: str.min(1, "Token requerido"),
  password: str.min(8, "La contraseña debe tener al menos 8 caracteres").max(100),
});

// ═══════════════════════════════════════════════════════════
// CURSOS
// ═══════════════════════════════════════════════════════════

export const cursoSchema = z.object({
  titulo: str.min(3, "Mínimo 3 caracteres").max(200, "Máximo 200 caracteres"),
  descripcion: str.max(5000, "Máximo 5000 caracteres").optional(),
  precio: z.number().min(0, "El precio no puede ser negativo").max(99999999, "Precio excesivo"),
  comisionPct: z.number().min(0).max(100, "La comisión debe estar entre 0 y 100").optional(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
});

// ═══════════════════════════════════════════════════════════
// CONTENIDO DIGITAL
// ═══════════════════════════════════════════════════════════

export const contenidoSchema = z.object({
  titulo: str.min(1, "Título requerido").max(200, "Máximo 200 caracteres"),
  descripcion: str.max(5000, "Máximo 5000 caracteres").optional(),
  tipo: str.min(1, "Tipo requerido").max(50),
  categoria: str.min(1, "Categoría requerida").max(100),
  subcategoria: str.max(100).optional().nullable(),
  precio: z.number().int().min(0, "El precio no puede ser negativo").max(99999999, "Precio excesivo"),
  precioOferta: z.number().int().min(0).max(99999999).optional().nullable(),
  portadaUrl: str.url("URL de portada inválida").max(500).optional().nullable(),
  pdfUrl: str.url("URL de PDF inválida").max(500).optional().nullable(),
  previewUrls: z.array(str.url().max(500)).max(10).optional(),
  paginas: int.min(1).max(99999).optional().nullable(),
  tamanoMb: z.number().min(0).max(9999).optional().nullable(),
  idioma: str.max(10).default("es"),
  nivel: str.max(50).optional().nullable(),
  comisionPct: z.number().min(0).max(100).optional(),
  indice: str.max(10000).optional().nullable(),
  palabrasClave: z.array(str.max(50)).max(20).optional(),
});

export const contenidoStatusSchema = z.object({
  status: z.enum(["borrador", "activo", "pausado"], {
    errorMap: () => ({ message: "Status inválido. Usa: borrador, activo o pausado" }),
  }),
});

// ═══════════════════════════════════════════════════════════
// MICROCONTENIDOS
// ═══════════════════════════════════════════════════════════

export const microcontenidoSchema = z.object({
  titulo: str.min(1, "Título requerido").max(200, "Máximo 200 caracteres"),
  descripcion: str.max(5000, "Máximo 5000 caracteres").optional().nullable(),
  contenido: str.max(50000, "Máximo 50000 caracteres").optional().nullable(),
  tipo: str.max(50).optional(),
  precio: z.number().int().min(0).max(99999999).optional().nullable(),
  comisionPct: z.number().min(0).max(100).optional(),
  publicado: z.boolean().optional(),
  portadaUrl: str.url().max(500).optional().nullable(),
  categoria: str.max(100).optional(),
  palabrasClave: z.array(str.max(50)).max(20).optional(),
  paginas: int.min(1).max(99999).optional().nullable(),
  lecturaMin: int.min(1).max(99999).optional().nullable(),
});

export const microcontenidoPublicadoSchema = z.object({
  publicado: z.boolean({ required_error: "Campo 'publicado' requerido" }),
});

export const progresoSchema = z.object({
  emailInvitado: str.email().optional().nullable(),
  porcentaje: z.number().min(0).max(100).optional(),
  leidoCompleto: z.boolean().optional(),
});

export const compraInvitadoSchema = z.object({
  email: str.email("Email inválido").max(255),
  nombre: str.max(200).optional(),
});

// ═══════════════════════════════════════════════════════════
// MINI-EBOOKS
// ═══════════════════════════════════════════════════════════

export const miniebookSchema = z.object({
  titulo: str.min(1, "Título requerido").max(200),
  descripcion: str.max(5000).optional(),
  descripcionLarga: str.max(20000).optional().nullable(),
  manuscritoTexto: str.max(100000).optional().nullable(),
  manuscritoHtml: str.max(200000).optional().nullable(),
  portadaUrl: str.url("URL de portada inválida").max(500),
  template: z.enum(["minimalista", "cinematografica", "poetica", "motivacional"], {
    errorMap: () => ({ message: "Template inválido" }),
  }),
  categoria: str.max(100).optional(),
  precio: z.number().int().min(0).max(99999999),
  precioOferta: z.number().int().min(0).max(99999999).optional().nullable(),
  comisionPct: z.number().min(0).max(100).optional(),
  idioma: str.max(10).default("es"),
  palabrasClave: z.array(str.max(50)).max(20).optional(),
  paginas: int.min(1).max(99999).optional().nullable(),
  palabras: int.min(1).max(9999999).optional().nullable(),
  tamanoMb: z.number().min(0).max(9999).optional().nullable(),
  indice: str.max(10000).optional().nullable(),
});

export const miniebookStatusSchema = z.object({
  status: z.enum(["borrador", "activo", "pausado"], {
    errorMap: () => ({ message: "Status inválido. Usa: borrador, activo o pausado" }),
  }),
});

export const resenaSchema = z.object({
  rating: z.number().int().min(1, "Mínimo 1").max(5, "Máximo 5"),
  comentario: str.min(1, "Comentario requerido").max(5000, "Máximo 5000 caracteres"),
});

// ═══════════════════════════════════════════════════════════
// MENSAJES
// ═══════════════════════════════════════════════════════════

export const mensajeSchema = z.object({
  cursoId: z.union([str, int]).transform((v) => Number(v)),
  destinatarioId: z.union([str, int]).transform((v) => Number(v)),
  texto: str.min(1, "Texto requerido").max(5000, "Máximo 5000 caracteres"),
});

// ═══════════════════════════════════════════════════════════
// CUPONES
// ═══════════════════════════════════════════════════════════

export const cuponSchema = z.object({
  codigo: str.min(1, "Código requerido").max(50, "Máximo 50 caracteres"),
  contenidoId: z.union([str, int, z.null()]).transform((v) => (v === null ? null : Number(v))).optional().nullable(),
  descuentoPct: z.number().int().min(1, "Mínimo 1%").max(100, "Máximo 100%"),
  usosMaximos: int.min(1).max(999999).default(100),
  fechaExpiracion: str.datetime({ offset: true }).optional().nullable(),
});

export const validarCuponQuerySchema = z.object({
  codigo: str.min(1, "Código requerido"),
  contenidoId: str.or(int).transform((v) => Number(v)).optional(),
});

// ═══════════════════════════════════════════════════════════
// RETIROS
// ═══════════════════════════════════════════════════════════

export const solicitudRetiroSchema = z.object({
  monto: z.number().int().min(1000, "Monto mínimo $1.000").max(10000000, "Monto máximo $10.000.000"),
  metodo: str.max(50).optional(),
  cuenta: str.max(200).optional(),
});

export const procesarRetiroSchema = z.object({
  estado: z.enum(["pendiente", "procesado", "rechazado"], {
    errorMap: () => ({ message: "Estado inválido" }),
  }),
  respuesta: str.max(1000).optional().nullable(),
});

// ═══════════════════════════════════════════════════════════
// REVIEWS (cursos)
// ═══════════════════════════════════════════════════════════

export const reviewSchema = z.object({
  cursoId: z.union([str, int]).transform((v) => Number(v)),
  rating: z.number().int().min(1).max(5),
  comentario: str.max(5000).optional(),
});

// ═══════════════════════════════════════════════════════════
// ARTICLE COMMENTS
// ═══════════════════════════════════════════════════════════

export const articleCommentSchema = z.object({
  contenido: str.min(5, "Mínimo 5 caracteres").max(2000, "Máximo 2000 caracteres"),
});
