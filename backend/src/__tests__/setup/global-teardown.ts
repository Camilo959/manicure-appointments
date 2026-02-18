const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async () => {
	await prisma.$disconnect();
};