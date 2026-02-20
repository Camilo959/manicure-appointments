import prisma from '../../config/prisma';

export async function resetDatabase() {
  // TRUNCATE las tablas en el orden correcto para no violar FK
  await prisma.$executeRaw`TRUNCATE TABLE "CitaServicio" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Cita" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Trabajadora" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Servicio" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Cliente" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "DiaBloqueado" RESTART IDENTITY CASCADE`;
}