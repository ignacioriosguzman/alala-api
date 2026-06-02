-- AlterTable: añadir campo activo a User
ALTER TABLE "User" ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable: PagoCreador
CREATE TABLE "PagoCreador" (
    "id"          SERIAL NOT NULL,
    "creatorId"   INTEGER NOT NULL,
    "monto"       INTEGER NOT NULL,
    "descripcion" TEXT,
    "periodo"     TEXT,
    "referencia"  TEXT,
    "adminId"     INTEGER,
    "pagadoEn"    TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PagoCreador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PagoCreador_creatorId_idx" ON "PagoCreador"("creatorId");
CREATE INDEX "PagoCreador_createdAt_idx" ON "PagoCreador"("createdAt");
CREATE INDEX "User_activo_idx" ON "User"("activo");

-- AddForeignKey
ALTER TABLE "PagoCreador" ADD CONSTRAINT "PagoCreador_creatorId_fkey"
  FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
