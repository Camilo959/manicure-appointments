const { PrismaClient } = require('../../../generated/prisma/client');

module.exports = async () => {
	const prisma = new PrismaClient();
	await prisma.$connect();
	await prisma.$executeRaw`TRUNCATE TABLE "Trabajadoras", "Citas", "Notificaciones", "Servicios", "Auth" CASCADE`;
	await prisma.$disconnect();
};