/**
 * Script de seed para base de datos
 * 
 * Crea usuarios y datos iniciales para desarrollo y testing
 * 
 * Ejecutar con: npm run prisma:seed
 */

import bcrypt from 'bcryptjs';
import "dotenv/config";
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })


/**
 * Función principal de seed
 */
async function main() {
  console.log('🌱 Iniciando seed de base de datos...\n');
  
  try {
    // =====================================================
    // 1. CREAR USUARIOS (ADMIN Y TRABAJADORAS)
    // =====================================================
    
    console.log('👤 Creando usuarios...');
    
    // Usuario Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@manicura.com' },
      update: {},
      create: {
        nombre: 'Administrador',
        email: 'admin@manicura.com',
        password: adminPassword,
        rol: 'ADMIN',
        activo: true,
      },
    });
    console.log('  ✅ Admin creado:', admin.email);
    
    // Usuario Trabajadora 1
    const trabajadora1Password = await bcrypt.hash('trabajadora123', 10);
    const userTrabajadora1 = await prisma.user.upsert({
      where: { email: 'maria@manicura.com' },
      update: {},
      create: {
        nombre: 'María García',
        email: 'maria@manicura.com',
        password: trabajadora1Password,
        rol: 'TRABAJADORA',
        activo: true,
      },
    });
    console.log('  ✅ Trabajadora 1 creada:', userTrabajadora1.email);
    
    // Usuario Trabajadora 2
    const trabajadora2Password = await bcrypt.hash('trabajadora123', 10);
    const userTrabajadora2 = await prisma.user.upsert({
      where: { email: 'lucia@manicura.com' },
      update: {},
      create: {
        nombre: 'Lucía Rodríguez',
        email: 'lucia@manicura.com',
        password: trabajadora2Password,
        rol: 'TRABAJADORA',
        activo: true,
      },
    });
    console.log('  ✅ Trabajadora 2 creada:', userTrabajadora2.email);
    
    console.log('');
    
    // =====================================================
    // 2. CREAR PERFILES DE TRABAJADORAS
    // =====================================================
    
    console.log('💅 Creando perfiles de trabajadoras...');
    
    const trabajadora1 = await prisma.trabajadora.upsert({
      where: { userId: userTrabajadora1.id },
      update: {},
      create: {
        nombre: 'María García',
        userId: userTrabajadora1.id,
        activa: true,
      },
    });
    console.log('  ✅ Perfil de María creado');
    
    const trabajadora2 = await prisma.trabajadora.upsert({
      where: { userId: userTrabajadora2.id },
      update: {},
      create: {
        nombre: 'Lucía Rodríguez',
        userId: userTrabajadora2.id,
        activa: true,
      },
    });
    console.log('  ✅ Perfil de Lucía creado');
    
    console.log('');
    
    // =====================================================
    // 3. CREAR SERVICIOS
    // =====================================================
    
    console.log('💼 Creando servicios...');
    
    const servicios = [
      { nombre: 'Manicure Básico', duracionMinutos: 45 },
      { nombre: 'Manicure con Gel', duracionMinutos: 60 },
      { nombre: 'Pedicure Básico', duracionMinutos: 60 },
      { nombre: 'Pedicure con Gel', duracionMinutos: 75 },
      { nombre: 'Uñas Acrílicas', duracionMinutos: 90 },
      { nombre: 'Diseño de Uñas', duracionMinutos: 30 },
      { nombre: 'Retiro de Gel', duracionMinutos: 30 },
    ];
    
    for (const servicio of servicios) {
      await prisma.servicio.upsert({
        where: { nombre: servicio.nombre },
        update: {},
        create: {
          nombre: servicio.nombre,
          duracionMinutos: servicio.duracionMinutos,
          activo: true,
        },
      });
      console.log(`  ✅ Servicio creado: ${servicio.nombre}`);
    }
    
    console.log('');
    
    // =====================================================
    // 4. CREAR CLIENTES DE EJEMPLO
    // =====================================================
    
    console.log('👥 Creando clientes de ejemplo...');
    
    const clientes = [
      { nombre: 'Ana Martínez', telefono: '+57 300 123 4567', email: 'ana@example.com' },
      { nombre: 'Carla López', telefono: '+57 301 234 5678', email: null },
      { nombre: 'Diana Torres', telefono: '+57 302 345 6789', email: 'diana@example.com' },
    ];
    
    for (const cliente of clientes) {
      await prisma.cliente.create({
        data: cliente,
      });
      console.log(`  ✅ Cliente creado: ${cliente.nombre}`);
    }
    
    console.log('');
    
    // =====================================================
    // 5. CREAR DÍAS BLOQUEADOS DE EJEMPLO
    // =====================================================
    
    console.log('🚫 Creando días bloqueados...');
    
    const diasBloqueados = [
      { fecha: new Date('2026-02-14'), motivo: 'Día de San Valentín - Cerrado' },
      { fecha: new Date('2026-03-15'), motivo: 'Mantenimiento del local' },
    ];
    
    for (const dia of diasBloqueados) {
      await prisma.diaBloqueado.upsert({
        where: { fecha: dia.fecha },
        update: {},
        create: dia,
      });
      console.log(`  ✅ Día bloqueado: ${dia.fecha.toLocaleDateString()}`);
    }
    
    console.log('');
    
    // =====================================================
    // RESUMEN
    // =====================================================
    
    console.log('📊 Resumen del seed:');
    console.log('  👤 Usuarios:', await prisma.user.count());
    console.log('  💅 Trabajadoras:', await prisma.trabajadora.count());
    console.log('  💼 Servicios:', await prisma.servicio.count());
    console.log('  👥 Clientes:', await prisma.cliente.count());
    console.log('  🚫 Días bloqueados:', await prisma.diaBloqueado.count());
    
    console.log('\n🎉 Seed completado exitosamente!\n');
    
    console.log('📝 Credenciales de acceso:');
    console.log('  Admin:');
    console.log('    Email: admin@manicura.com');
    console.log('    Password: admin123');
    console.log('');
    console.log('  Trabajadora 1:');
    console.log('    Email: maria@manicura.com');
    console.log('    Password: trabajadora123');
    console.log('');
    console.log('  Trabajadora 2:');
    console.log('    Email: lucia@manicura.com');
    console.log('    Password: trabajadora123');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

// Ejecutar seed
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });