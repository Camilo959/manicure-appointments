const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
	await prisma.$executeRaw`TRUNCATE TABLE "Citas" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Trabajadoras" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Servicios" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Notificaciones" RESTART IDENTITY CASCADE`;
}

module.exports = {
	resetDatabase,
	prisma,
};