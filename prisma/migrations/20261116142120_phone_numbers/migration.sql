-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "extraPhones" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "phone" SET DEFAULT '+7 (991) 959-89-85';
