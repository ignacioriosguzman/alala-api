-- CreateTable: MicroContenido y tablas relacionadas

CREATE TABLE "MicroContenido" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "contenido" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "autorId" INTEGER NOT NULL,
    "precio" INTEGER,
    "comisionPct" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "ventas" INTEGER NOT NULL DEFAULT 0,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "portadaUrl" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'General',
    "palabrasClave" TEXT[],
    "paginas" INTEGER,
    "lecturaMin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MicroContenido_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompraMicroContenido" (
    "id" SERIAL NOT NULL,
    "microContenidoId" INTEGER NOT NULL,
    "userId" INTEGER,
    "emailInvitado" TEXT,
    "monto" INTEGER NOT NULL,
    "comisionPlataforma" INTEGER NOT NULL,
    "pagoCreador" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'completada',
    "downloadUrl" TEXT,
    "flowToken" TEXT,
    "flowOrder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompraMicroContenido_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResenaMicroContenido" (
    "id" SERIAL NOT NULL,
    "microContenidoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResenaMicroContenido_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FavoriteMicroContenido" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "microContenidoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteMicroContenido_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProgresoMicroContenido" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "emailInvitado" TEXT,
    "microContenidoId" INTEGER NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leidoCompleto" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgresoMicroContenido_pkey" PRIMARY KEY ("id")
);

-- Índices MicroContenido
CREATE INDEX "MicroContenido_tipo_idx" ON "MicroContenido"("tipo");
CREATE INDEX "MicroContenido_categoria_idx" ON "MicroContenido"("categoria");
CREATE INDEX "MicroContenido_autorId_idx" ON "MicroContenido"("autorId");
CREATE INDEX "MicroContenido_publicado_idx" ON "MicroContenido"("publicado");

-- Índices CompraMicroContenido
CREATE INDEX "CompraMicroContenido_flowToken_idx" ON "CompraMicroContenido"("flowToken");
CREATE UNIQUE INDEX "CompraMicroContenido_userId_microContenidoId_key" ON "CompraMicroContenido"("userId", "microContenidoId");
CREATE UNIQUE INDEX "CompraMicroContenido_emailInvitado_microContenidoId_key" ON "CompraMicroContenido"("emailInvitado", "microContenidoId");

-- Índices ResenaMicroContenido
CREATE UNIQUE INDEX "ResenaMicroContenido_userId_microContenidoId_key" ON "ResenaMicroContenido"("userId", "microContenidoId");
CREATE INDEX "ResenaMicroContenido_microContenidoId_idx" ON "ResenaMicroContenido"("microContenidoId");

-- Índices FavoriteMicroContenido
CREATE UNIQUE INDEX "FavoriteMicroContenido_userId_microContenidoId_key" ON "FavoriteMicroContenido"("userId", "microContenidoId");
CREATE INDEX "FavoriteMicroContenido_userId_idx" ON "FavoriteMicroContenido"("userId");

-- Índices ProgresoMicroContenido
CREATE UNIQUE INDEX "ProgresoMicroContenido_userId_microContenidoId_key" ON "ProgresoMicroContenido"("userId", "microContenidoId");
CREATE UNIQUE INDEX "ProgresoMicroContenido_emailInvitado_microContenidoId_key" ON "ProgresoMicroContenido"("emailInvitado", "microContenidoId");

-- Foreign Keys
ALTER TABLE "MicroContenido" ADD CONSTRAINT "MicroContenido_autorId_fkey"
    FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CompraMicroContenido" ADD CONSTRAINT "CompraMicroContenido_microContenidoId_fkey"
    FOREIGN KEY ("microContenidoId") REFERENCES "MicroContenido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompraMicroContenido" ADD CONSTRAINT "CompraMicroContenido_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ResenaMicroContenido" ADD CONSTRAINT "ResenaMicroContenido_microContenidoId_fkey"
    FOREIGN KEY ("microContenidoId") REFERENCES "MicroContenido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ResenaMicroContenido" ADD CONSTRAINT "ResenaMicroContenido_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FavoriteMicroContenido" ADD CONSTRAINT "FavoriteMicroContenido_microContenidoId_fkey"
    FOREIGN KEY ("microContenidoId") REFERENCES "MicroContenido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FavoriteMicroContenido" ADD CONSTRAINT "FavoriteMicroContenido_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProgresoMicroContenido" ADD CONSTRAINT "ProgresoMicroContenido_microContenidoId_fkey"
    FOREIGN KEY ("microContenidoId") REFERENCES "MicroContenido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProgresoMicroContenido" ADD CONSTRAINT "ProgresoMicroContenido_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
