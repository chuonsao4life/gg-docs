CREATE TYPE "PermissionRole" AS ENUM ('owner', 'editor', 'viewer', 'commenter');
ALTER TABLE "Permission" ALTER COLUMN "role" TYPE "PermissionRole" USING "role"::"PermissionRole";

ALTER TABLE "Document" ADD COLUMN "snapshot" BYTEA;
ALTER TABLE "Document" ADD COLUMN "snapshotVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Document" ADD COLUMN "folderId" TEXT;
ALTER TABLE "Document" ADD COLUMN "isStarred" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Document_folderId_idx" ON "Document"("folderId");
CREATE INDEX "Document_isStarred_idx" ON "Document"("isStarred");
