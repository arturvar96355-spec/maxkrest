-- Отзывы с модерацией. Ранее добавленные администратором и включённые (visible) становятся опубликованными.
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Review"
ADD COLUMN     "consentAt" TIMESTAMP(3),
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "reply" TEXT,
ADD COLUMN     "serviceKey" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'site',
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "Review" SET "status" = 'APPROVED', "publishedAt" = CURRENT_TIMESTAMP, "source" = 'admin' WHERE "visible" = true;
UPDATE "Review" SET "source" = 'admin' WHERE "visible" = false;

ALTER TABLE "Review" DROP COLUMN "visible";

CREATE INDEX "Review_status_createdAt_idx" ON "Review"("status", "createdAt");
