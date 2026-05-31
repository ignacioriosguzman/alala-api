-- AlterTable: add expiresAt to RefreshToken for cleanup support
ALTER TABLE "RefreshToken" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Backfill: set existing tokens to expire 7 days from now
UPDATE "RefreshToken" SET "expiresAt" = NOW() + INTERVAL '7 days' WHERE "expiresAt" IS NULL;

-- Index for efficient cleanup queries
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
