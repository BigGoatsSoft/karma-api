-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BotPersonality" AS ENUM ('neutral', 'encouraging', 'strict');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "country" TEXT NOT NULL DEFAULT '',
    "botPersonality" "BotPersonality" NOT NULL DEFAULT 'neutral',
    "karmaDailyGoal" INTEGER NOT NULL DEFAULT 0,
    "karma" INTEGER NOT NULL DEFAULT 0,
    "isNotificationReminder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KarmaEntry" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "karma" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KarmaEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "KarmaEntry_userId_idx" ON "KarmaEntry"("userId");

-- AddForeignKey
ALTER TABLE "KarmaEntry" ADD CONSTRAINT "KarmaEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
