/*
  Warnings:

  - A unique constraint covering the columns `[numeroConfirmacion]` on the table `Cita` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telefono]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `duracionTotal` to the `Cita` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroConfirmacion` to the `Cita` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precioTotal` to the `Cita` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precioUnitario` to the `CitaServicio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio` to the `Servicio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cita" ADD COLUMN     "duracionTotal" INTEGER NOT NULL,
ADD COLUMN     "numeroConfirmacion" TEXT NOT NULL,
ADD COLUMN     "precioTotal" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "CitaServicio" ADD COLUMN     "precioUnitario" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "precio" DECIMAL(10,2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cita_numeroConfirmacion_key" ON "Cita"("numeroConfirmacion");

-- CreateIndex
CREATE INDEX "Cita_numeroConfirmacion_idx" ON "Cita"("numeroConfirmacion");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_telefono_key" ON "Cliente"("telefono");
