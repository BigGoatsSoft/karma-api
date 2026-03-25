-- AlterTable
ALTER TABLE "User" ADD COLUMN "hashedSub" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_hashedSub_key" ON "User"("hashedSub");
