import prisma from '../../../src/config/prisma'; // ajusta la ruta según tu proyecto

export default async function globalSetup() {
  // Conecta al cliente si no está conectado
  await prisma.$connect();

  // Limpia la base de datos (TRUNCATE en orden correcto para evitar FK)
  await prisma.$executeRaw`TRUNCATE TABLE "ConfiguracionHoraria" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "CitaServicio" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Cita" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Trabajadora" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Servicio" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Cliente" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "DiaBloqueado" RESTART IDENTITY CASCADE`;

  await prisma.$executeRaw`
    INSERT INTO "ConfiguracionHoraria" (
      "id",
      "horaApertura",
      "horaCierre",
      "duracionMaximaCitaMinutos",
      "intervaloSlotsMinutos",
      "maxDiasAnticipacion",
      "zonaHoraria",
      "activa",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      '08:00:00'::time,
      '19:00:00'::time,
      180,
      15,
      90,
      'America/Bogota',
      true,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
  `;

  console.log('✅ Global setup finished: DB reset');
}
