/**
 * Script de prueba de conexión a la base de datos
 * 
 * Ejecutar con: npm run test:db
 * o: ts-node src/test-db.ts
 */

import prisma from './config/prisma';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // 1. Probar conexión básica
    console.log('1️⃣ Testing basic connection...');
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    // 2. Verificar con query raw
    console.log('2️⃣ Testing raw query...');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('✅ Current database time:', result);
    console.log('');

    // 3. Contar registros en las tablas
    console.log('3️⃣ Counting records in tables...');
    
    const userCount = await prisma.user.count();
    console.log(`   Users: ${userCount}`);
    
    const trabajadoraCount = await prisma.trabajadora.count();
    console.log(`   Trabajadoras: ${trabajadoraCount}`);
    
    const clienteCount = await prisma.cliente.count();
    console.log(`   Clientes: ${clienteCount}`);
    
    const servicioCount = await prisma.servicio.count();
    console.log(`   Servicios: ${servicioCount}`);
    
    const citaCount = await prisma.cita.count();
    console.log(`   Citas: ${citaCount}`);
    
    const diaBloqueadoCount = await prisma.diaBloqueado.count();
    console.log(`   Días bloqueados: ${diaBloqueadoCount}`);
    console.log('');

    // 4. Crear un servicio de prueba (opcional - comentado)
    /*
    console.log('4️⃣ Creating test service...');
    const testService = await prisma.servicio.create({
      data: {
        nombre: 'Manicure Básico',
        duracionMinutos: 60,
        activo: true,
      },
    });
    console.log('✅ Test service created:', testService);
    console.log('');
    */

    console.log('🎉 All tests passed!\n');

  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Ejecutar pruebas
testDatabaseConnection();