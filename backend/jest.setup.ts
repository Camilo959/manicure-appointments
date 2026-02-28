const { PrismaClient } = require('@prisma/client');
import { app } from './src/app'; // Adjust the import based on your app structure
import request from 'supertest';
import { PrismaPg } from '@prisma/adapter-pg'
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL_TEST}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

console.log("DATABASE_URL_TEST:", process.env.DATABASE_URL_TEST);
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
