import prisma from '../../config/prisma';

export async function resetDatabase() {
  // TRUNCATE las tablas en el orden correcto para no violar FK
  await prisma.$executeRaw`TRUNCATE TABLE "CitaServicio" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Citas" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Trabajadoras" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Servicios" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Cliente" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "DiaBloqueado" RESTART IDENTITY CASCADE`;
}