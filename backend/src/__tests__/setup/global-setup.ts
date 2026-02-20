import prisma from '../../../src/config/prisma'; // ajusta la ruta según tu proyecto

export default async function globalSetup() {
  // Conecta al cliente si no está conectado
  await prisma.$connect();

  // Limpia la base de datos (TRUNCATE en orden correcto para evitar FK)
  await prisma.$executeRaw`TRUNCATE TABLE "CitaServicio" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Cita" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Trabajadora" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Servicio" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Cliente" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "DiaBloqueado" RESTART IDENTITY CASCADE`;

  console.log('✅ Global setup finished: DB reset');
}
