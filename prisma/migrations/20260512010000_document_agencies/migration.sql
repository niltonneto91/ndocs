-- CreateTable
CREATE TABLE "DocumentAgency" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAgency_pkey" PRIMARY KEY ("id")
);

-- Migrate existing one-to-one agency links into the join table.
INSERT INTO "DocumentAgency" ("id", "documentId", "agencyId", "createdAt")
SELECT concat('docagency_', md5(random()::text || clock_timestamp()::text)), "id", "agencyId", CURRENT_TIMESTAMP
FROM "Document"
WHERE "agencyId" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentAgency_documentId_agencyId_key" ON "DocumentAgency"("documentId", "agencyId");
CREATE INDEX "DocumentAgency_agencyId_idx" ON "DocumentAgency"("agencyId");

-- AddForeignKey
ALTER TABLE "DocumentAgency" ADD CONSTRAINT "DocumentAgency_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentAgency" ADD CONSTRAINT "DocumentAgency_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "RegulatoryAgency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old single agency relation.
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_agencyId_fkey";
ALTER TABLE "Document" DROP COLUMN IF EXISTS "agencyId";
