import prisma from '../../../src/config/prisma'; // ajusta ruta

export default async function globalTeardown() {
  await prisma.$disconnect();
}