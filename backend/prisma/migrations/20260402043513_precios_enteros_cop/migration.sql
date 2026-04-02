/*
  Warnings:

  - You are about to alter the column `precioTotal` on the `Cita` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `precioUnitario` on the `CitaServicio` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `precio` on the `Servicio` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Cita" ALTER COLUMN "precioTotal" TYPE INTEGER USING ROUND("precioTotal");

-- AlterTable
ALTER TABLE "CitaServicio" ALTER COLUMN "precioUnitario" TYPE INTEGER USING ROUND("precioUnitario");

-- AlterTable
ALTER TABLE "Servicio" ALTER COLUMN "precio" TYPE INTEGER USING ROUND("precio");