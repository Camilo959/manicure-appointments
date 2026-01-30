/**
 * Cliente de Prisma centralizado
 * 
 * Este archivo exporta una única instancia del cliente de Prisma
 * para ser reutilizada en toda la aplicación.
 * 
 * Incluye:
 * - Singleton pattern para evitar múltiples instancias
 * - Logging en desarrollo
 * - Manejo de desconexión limpia
 */

import { PrismaClient } from '../generated/prisma/client';

// Extensión del tipo global para el singleton
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Instancia única de Prisma Client
 * En desarrollo, usa el global para evitar múltiples instancias con hot reload
 */
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// En desarrollo, guardar en global para reutilizar en hot reload
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

/**
 * Conectar a la base de datos
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Desconectar de la base de datos
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting database:', error);
    throw error;
  }
}

/**
 * Verificar el estado de la conexión
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

export default prisma;