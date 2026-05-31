-- CreateTable
CREATE TABLE "MiniEbook" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "descripcionLarga" TEXT,
    "manuscritoTexto" TEXT,
    "manuscritoHtml" TEXT,
    "portadaUrl" TEXT NOT NULL,
    "epubUrl" TEXT,
    "pdfUrl" TEXT,
    "tamanoMb" DOUBLE PRECISION,
    "paginas" INTEGER,
    "palabras" INTEGER,
    "template" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'General',
    "palabrasClave" TEXT[],
    "idioma" TEXT NOT NULL DEFAULT 'es',
    "precio" INTEGER NOT NULL,
    "precioOferta" INTEGER,
    "comisionPct" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "ventas" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'borrador',
    "autorId" INTEGER NOT NULL,
    "indice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MiniEbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompraMiniEbook" (
    "id" SERIAL NOT NULL,
    "miniEbookId" INTEGER NOT NULL,
    "userId" INTEGER,
    "emailInvitado" TEXT,
    "monto" INTEGER NOT NULL,
    "comisionPlataforma" INTEGER NOT NULL,
    "pagoCreador" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'completada',
    "downloadUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompraMiniEbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResenaMiniEbook" (
    "id" SERIAL NOT NULL,
    "miniEbookId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResenaMiniEbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteMiniEbook" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "miniEbookId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteMiniEbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgresoMiniEbook" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "emailInvitado" TEXT,
    "miniEbookId" INTEGER NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leidoCompleto" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgresoMiniEbook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MiniEbook_status_idx" ON "MiniEbook"("status");

-- CreateIndex
CREATE INDEX "MiniEbook_categoria_idx" ON "MiniEbook"("categoria");

-- CreateIndex
CREATE INDEX "MiniEbook_autorId_idx" ON "MiniEbook"("autorId");

-- CreateIndex
CREATE INDEX "MiniEbook_template_idx" ON "MiniEbook"("template");

-- CreateIndex
CREATE UNIQUE INDEX "CompraMiniEbook_userId_miniEbookId_key" ON "CompraMiniEbook"("userId", "miniEbookId");

-- CreateIndex
CREATE UNIQUE INDEX "CompraMiniEbook_emailInvitado_miniEbookId_key" ON "CompraMiniEbook"("emailInvitado", "miniEbookId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteMiniEbook_userId_miniEbookId_key" ON "FavoriteMiniEbook"("userId", "miniEbookId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgresoMiniEbook_userId_miniEbookId_key" ON "ProgresoMiniEbook"("userId", "miniEbookId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgresoMiniEbook_emailInvitado_miniEbookId_key" ON "ProgresoMiniEbook"("emailInvitado", "miniEbookId");

-- AddForeignKey
ALTER TABLE "MiniEbook" ADD CONSTRAINT "MiniEbook_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompraMiniEbook" ADD CONSTRAINT "CompraMiniEbook_miniEbookId_fkey" FOREIGN KEY ("miniEbookId") REFERENCES "MiniEbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResenaMiniEbook" ADD CONSTRAINT "ResenaMiniEbook_miniEbookId_fkey" FOREIGN KEY ("miniEbookId") REFERENCES "MiniEbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteMiniEbook" ADD CONSTRAINT "FavoriteMiniEbook_miniEbookId_fkey" FOREIGN KEY ("miniEbookId") REFERENCES "MiniEbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgresoMiniEbook" ADD CONSTRAINT "ProgresoMiniEbook_miniEbookId_fkey" FOREIGN KEY ("miniEbookId") REFERENCES "MiniEbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
