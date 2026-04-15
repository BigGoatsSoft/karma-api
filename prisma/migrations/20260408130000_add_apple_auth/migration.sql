-- AlterTable
ALTER TABLE "User" ADD COLUMN "hashedAppleSub" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_hashedAppleSub_key" ON "User"("hashedAppleSub");
