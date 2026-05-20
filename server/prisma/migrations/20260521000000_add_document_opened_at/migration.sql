ALTER TABLE "Document" ADD COLUMN "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Document_openedAt_idx" ON "Document"("openedAt");
