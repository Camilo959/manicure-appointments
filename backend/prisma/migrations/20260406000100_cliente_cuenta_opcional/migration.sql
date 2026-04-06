/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.

*/

-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'CLIENTE';

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN "userId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_userId_key" ON "Cliente"("userId");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
