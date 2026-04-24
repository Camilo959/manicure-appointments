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

  const CONFIG_HORARIA_ID = '00000000-0000-0000-0000-000000000001';
  const horaAperturaInicial = '08:00:00';
  const horaCierreInicial = '19:00:00';

  try {
    // =====================================================
    // 1. CREAR USUARIOS (ADMIN Y TRABAJADORAS)
    // =====================================================

    console.log('👤 Creando usuarios...');

    // Usuario Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@manicura.com' },
      update: {
        nombre: 'Administrador',
        password: adminPassword,
        rol: 'ADMIN',
        activo: true,
      },
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
      update: {
        nombre: 'María García',
        password: trabajadora1Password,
        rol: 'TRABAJADORA',
        activo: true,
      },
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
      update: {
        nombre: 'Lucía Rodríguez',
        password: trabajadora2Password,
        rol: 'TRABAJADORA',
        activo: true,
      },
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
      { nombre: 'Manicure Básico', duracionMinutos: 45, precio: 25000 },
      { nombre: 'Manicure con Gel', duracionMinutos: 60, precio: 35000 },
      { nombre: 'Pedicure Básico', duracionMinutos: 60, precio: 30000 },
      { nombre: 'Pedicure con Gel', duracionMinutos: 75, precio: 40000 },
      { nombre: 'Uñas Acrílicas', duracionMinutos: 90, precio: 50000 },
      { nombre: 'Diseño de Uñas', duracionMinutos: 30, precio: 15000 },
      { nombre: 'Retiro de Gel', duracionMinutos: 30, precio: 10000 },
    ];

    for (const servicio of servicios) {
      const existingServicio = await prisma.servicio.findFirst({
        where: { nombre: servicio.nombre },
      });

      if (!existingServicio) {
        await prisma.servicio.create({
          data: {
            nombre: servicio.nombre,
            duracionMinutos: servicio.duracionMinutos,
            precio: servicio.precio,
            activo: true,
          },
        });

        console.log(`  ✅ Servicio creado: ${servicio.nombre}`);
      } else {
        console.log(`  ↩️ Servicio ya existe: ${servicio.nombre}`);
      }
    }

    console.log('');

    // =====================================================
    // 4. CREAR CLIENTES DE EJEMPLO
    // =====================================================

    console.log('👥 Creando clientes de ejemplo...');

    const clientes = [
      {
        nombre: 'Ana Martínez',
        telefono: '+573001234567',
        email: 'ana@example.com',
        crearCuenta: true,
        password: 'Cliente123',
      },
      {
        nombre: 'Carla López',
        telefono: '+573012345678',
        email: null,
        crearCuenta: false,
        password: 'Cliente123',
      },
      {
        nombre: 'Diana Torres',
        telefono: '+573023456789',
        email: 'diana@example.com',
        crearCuenta: true,
        password: 'Cliente123',
      },
    ];

    for (const cliente of clientes) {
      let userClienteId: string | null = null;

      if (cliente.crearCuenta && cliente.email) {
        const clientePasswordHash = await bcrypt.hash(cliente.password, 10);

        const userCliente = await prisma.user.upsert({
          where: { email: cliente.email },
          update: {
            nombre: cliente.nombre,
            password: clientePasswordHash,
            rol: 'CLIENTE',
            activo: true,
          },
          create: {
            nombre: cliente.nombre,
            email: cliente.email,
            password: clientePasswordHash,
            rol: 'CLIENTE',
            activo: true,
          },
        });

        userClienteId = userCliente.id;
      }

      await prisma.cliente.upsert({
        where: { telefono: cliente.telefono },
        update: {
          nombre: cliente.nombre,
          email: cliente.email,
          userId: userClienteId,
        },
        create: {
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          email: cliente.email,
          userId: userClienteId,
        },
      });

      if (userClienteId) {
        console.log(`  ✅ Cliente creado/actualizado con cuenta: ${cliente.nombre} (${cliente.email})`);
      } else {
        console.log(`  ✅ Cliente creado/actualizado sin cuenta: ${cliente.nombre}`);
      }
    }

    console.log('');

    // =====================================================
    // 5. CREAR DÍAS BLOQUEADOS DE EJEMPLO
    // =====================================================

    console.log('🚫 Creando días bloqueados...');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const bloqueado1 = new Date(hoy);
    bloqueado1.setDate(hoy.getDate() + 7);

    const bloqueado2 = new Date(hoy);
    bloqueado2.setDate(hoy.getDate() + 20);

    const diasBloqueados = [
      { fecha: bloqueado1, motivo: 'Día de descanso programado' },
      { fecha: bloqueado2, motivo: 'Mantenimiento del local' },
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
    // 6. ASEGURAR CONFIGURACIÓN HORARIA GLOBAL ACTIVA
    // =====================================================

    console.log('🕒 Configurando horario global...');

    await prisma.$executeRaw`
      UPDATE "ConfiguracionHoraria"
      SET "activa" = false,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" <> CAST(${CONFIG_HORARIA_ID} AS uuid)
        AND "activa" = true
    `;

    await prisma.$executeRaw`
      INSERT INTO "ConfiguracionHoraria" (
        "id",
        "horaApertura",
        "horaCierre",
        "duracionMaximaCitaMinutos",
        "intervaloSlotsMinutos",
        "maxDiasAnticipacion",
        "zonaHoraria",
        "activa",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        CAST(${CONFIG_HORARIA_ID} AS uuid),
        CAST(${horaAperturaInicial} AS time),
        CAST(${horaCierreInicial} AS time),
        180,
        15,
        90,
        'America/Bogota',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT ("id") DO UPDATE
      SET
        "horaApertura" = EXCLUDED."horaApertura",
        "horaCierre" = EXCLUDED."horaCierre",
        "duracionMaximaCitaMinutos" = EXCLUDED."duracionMaximaCitaMinutos",
        "intervaloSlotsMinutos" = EXCLUDED."intervaloSlotsMinutos",
        "maxDiasAnticipacion" = EXCLUDED."maxDiasAnticipacion",
        "zonaHoraria" = EXCLUDED."zonaHoraria",
        "activa" = true,
        "updatedAt" = CURRENT_TIMESTAMP
    `;

    console.log('  ✅ Configuración horaria activa: 08:00 - 19:00');

    console.log('');

    // =====================================================
    // RESUMEN
    // =====================================================

    console.log('📊 Resumen del seed:');
    console.log('  👤 Usuarios:', await prisma.user.count());
    console.log('  👤 Usuarios CLIENTE:', await prisma.user.count({ where: { rol: 'CLIENTE' } }));
    console.log('  💅 Trabajadoras:', await prisma.trabajadora.count());
    console.log('  💼 Servicios:', await prisma.servicio.count());
    console.log('  👥 Clientes:', await prisma.cliente.count());
    console.log('  🚫 Días bloqueados:', await prisma.diaBloqueado.count());
    const configuracionesHorarias = await prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT COUNT(*)::bigint AS total FROM "ConfiguracionHoraria"
    `;
    console.log('  🕒 Configuraciones horarias:', Number(configuracionesHorarias[0]?.total ?? 0));

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
    console.log('  Cliente 1:');
    console.log('    Email: ana@example.com');
    console.log('    Password: Cliente123');
    console.log('');
    console.log('  Cliente 2:');
    console.log('    Sin cuenta (solo registro Cliente por teléfono)');
    console.log('    Teléfono: +573012345678');
    console.log('');
    console.log('  Cliente 3:');
    console.log('    Email: diana@example.com');
    console.log('    Password: Cliente123');
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