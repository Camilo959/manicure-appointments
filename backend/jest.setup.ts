import { PrismaClient } from './generated/prisma/client';
import { app } from './src/server'; // Adjust the import based on your app structure
import request from 'supertest';
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL_TEST}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.cita.deleteMany({});
  await prisma.trabajadora.deleteMany({});
  // Add other cleanup as necessary
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { request, app };
