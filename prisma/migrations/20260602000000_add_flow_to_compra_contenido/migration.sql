-- AlterTable: add Flow payment fields to CompraContenido
ALTER TABLE "CompraContenido" ADD COLUMN IF NOT EXISTS "flowToken" TEXT;
ALTER TABLE "CompraContenido" ADD COLUMN IF NOT EXISTS "flowOrder" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CompraContenido_flowToken_key" ON "CompraContenido"("flowToken");
