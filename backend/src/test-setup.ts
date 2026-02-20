const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient();

beforeAll(async () => {
	await prisma.$connect();
});

beforeEach(async () => {
	await prisma.$executeRaw`TRUNCATE TABLE "Cita" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Trabajadora" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Notificacion" RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
	await prisma.$disconnect();
});