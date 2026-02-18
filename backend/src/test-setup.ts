const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

beforeAll(async () => {
	await prisma.$connect();
});

beforeEach(async () => {
	await prisma.$executeRaw`TRUNCATE TABLE "Citas" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Trabajadoras" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Notificaciones" RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
	await prisma.$disconnect();
});