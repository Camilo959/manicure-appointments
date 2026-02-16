/**
 * ================================================
 * SCRIPT DE PRUEBA: NOTIFICACIONES
 * ================================================
 * 
 * Este script permite probar el servicio de notificaciones
 * de forma independiente, sin necesidad de crear citas reales.
 * 
 * IMPORTANTE: Este archivo es SOLO para testing/desarrollo.
 * NO incluir en producción.
 */

import { notificacionesService } from './index';
import type {
  NotificacionCitaCreada,
  NotificacionCitaConfirmada,
  NotificacionCitaCancelada,
} from './notificaciones.types';

/**
 * ═══════════════════════════════════════════════════════
 * CONFIGURACIÓN DE PRUEBAS
 * ═══════════════════════════════════════════════════════
 */

// 🔧 CAMBIAR ESTE EMAIL POR TU EMAIL REAL
const EMAIL_PRUEBA = 'tu-email@gmail.com'; // 👈 CAMBIAR AQUÍ

/**
 * ═══════════════════════════════════════════════════════
 * PRUEBA 1: EMAIL DE CITA CREADA
 * ═══════════════════════════════════════════════════════
 */
async function probarCitaCreada() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 PRUEBA: Email de Cita Creada');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const datos: NotificacionCitaCreada = {
    destinatario: EMAIL_PRUEBA,
    nombreDestinatario: 'María López',
    numeroConfirmacion: 'TEST-001',
    nombreTrabajadora: 'Ana García',
    fecha: new Date('2026-02-20T14:30:00'),
    fechaFormateada: '', // Se completa automáticamente
    hora: '', // Se completa automáticamente
    servicios: [
      {
        nombre: 'Manicure Clásica',
        duracion: 30,
        precio: 15000,
      },
      {
        nombre: 'Pedicure Spa',
        duracion: 45,
        precio: 20000,
      },
    ],
    duracionTotal: 75,
    precioTotal: 35000,
    tokenCancelacion: 'test-token-abc-123',
    linkCancelacion: '', // Se completa automáticamente
  };

  try {
    const resultado = await notificacionesService.enviarCitaCreada(datos);

    if (resultado.exito) {
      console.log('✅ Email enviado exitosamente');
      console.log(`   ID del mensaje: ${resultado.idMensaje}`);
      console.log(`   Timestamp: ${resultado.timestamp}`);
      console.log(`\n📬 Revisa tu bandeja de entrada: ${EMAIL_PRUEBA}`);
    } else {
      console.error('❌ Error al enviar email');
      console.error(`   Motivo: ${resultado.error}`);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

/**
 * ═══════════════════════════════════════════════════════
 * PRUEBA 2: EMAIL DE CITA CONFIRMADA
 * ═══════════════════════════════════════════════════════
 */
async function probarCitaConfirmada() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 PRUEBA: Email de Cita Confirmada');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const datos: NotificacionCitaConfirmada = {
    destinatario: EMAIL_PRUEBA,
    nombreDestinatario: 'María López',
    numeroConfirmacion: 'TEST-002',
    nombreTrabajadora: 'Carla Sánchez',
    fecha: new Date('2026-02-25T16:00:00'),
    fechaFormateada: '',
    hora: '',
    servicios: [
      {
        nombre: 'Uñas Acrílicas',
        duracion: 90,
        precio: 35000,
      },
    ],
    duracionTotal: 90,
    precioTotal: 35000,
    tokenCancelacion: 'test-token-def-456',
    linkCancelacion: '',
  };

  try {
    const resultado = await notificacionesService.enviarCitaConfirmada(datos);

    if (resultado.exito) {
      console.log('✅ Email enviado exitosamente');
      console.log(`   ID del mensaje: ${resultado.idMensaje}`);
      console.log(`   Timestamp: ${resultado.timestamp}`);
      console.log(`\n📬 Revisa tu bandeja de entrada: ${EMAIL_PRUEBA}`);
    } else {
      console.error('❌ Error al enviar email');
      console.error(`   Motivo: ${resultado.error}`);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

/**
 * ═══════════════════════════════════════════════════════
 * PRUEBA 3: EMAIL DE CITA CANCELADA
 * ═══════════════════════════════════════════════════════
 */
async function probarCitaCancelada() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 PRUEBA: Email de Cita Cancelada');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const datos: NotificacionCitaCancelada = {
    destinatario: EMAIL_PRUEBA,
    nombreDestinatario: 'María López',
    numeroConfirmacion: 'TEST-003',
    nombreTrabajadora: 'Daniela Rojas',
    fecha: new Date('2026-03-01T10:00:00'),
    fechaFormateada: '',
    hora: '',
    servicios: [
      {
        nombre: 'Manicure + Diseño',
        duracion: 60,
        precio: 25000,
      },
    ],
    motivo: 'Cancelación solicitada por el cliente debido a un imprevisto personal.',
  };

  try {
    const resultado = await notificacionesService.enviarCitaCancelada(datos);

    if (resultado.exito) {
      console.log('✅ Email enviado exitosamente');
      console.log(`   ID del mensaje: ${resultado.idMensaje}`);
      console.log(`   Timestamp: ${resultado.timestamp}`);
      console.log(`\n📬 Revisa tu bandeja de entrada: ${EMAIL_PRUEBA}`);
    } else {
      console.error('❌ Error al enviar email');
      console.error(`   Motivo: ${resultado.error}`);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

/**
 * ═══════════════════════════════════════════════════════
 * PRUEBA 4: VERIFICAR ESTADO DEL SERVICIO
 * ═══════════════════════════════════════════════════════
 */
function verificarServicio() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 VERIFICACIÓN DEL SERVICIO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const habilitado = notificacionesService.estaHabilitado();

  if (habilitado) {
    console.log('✅ Servicio de notificaciones: HABILITADO');
    console.log('   Resend configurado correctamente');
  } else {
    console.log('⚠️  Servicio de notificaciones: DESHABILITADO');
    console.log('   Posibles causas:');
    console.log('   - RESEND_API_KEY no configurada en .env');
    console.log('   - API key inválida');
    console.log('   - Error al inicializar Resend');
    console.log('\n   Solución:');
    console.log('   1. Verificar archivo .env');
    console.log('   2. Agregar: RESEND_API_KEY=re_xxxxx');
    console.log('   3. Reiniciar el servidor');
  }
}

/**
 * ═══════════════════════════════════════════════════════
 * EJECUCIÓN DE PRUEBAS
 * ═══════════════════════════════════════════════════════
 */
async function ejecutarPruebas() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   SCRIPT DE PRUEBA: NOTIFICACIONES         ║');
  console.log('╚════════════════════════════════════════════╝');

  // Verificar servicio primero
  verificarServicio();

  // Si no está habilitado, no continuar
  if (!notificacionesService.estaHabilitado()) {
    console.log('\n⛔ Las pruebas no se ejecutarán hasta que el servicio esté habilitado.');
    return;
  }

  // Ejecutar pruebas
  await probarCitaCreada();
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2s

  await probarCitaConfirmada();
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2s

  await probarCitaCancelada();

  // Resumen final
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ PRUEBAS COMPLETADAS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📬 Revisa tu bandeja de entrada: ${EMAIL_PRUEBA}`);
  console.log('📊 Si no ves los emails:');
  console.log('   1. Revisar carpeta de spam/promociones');
  console.log('   2. Verificar logs del servidor');
  console.log('   3. Ir a: https://resend.com/emails (ver estado)');
  console.log('\n💡 TIP: Puedes ejecutar pruebas individuales:');
  console.log('   - probarCitaCreada()');
  console.log('   - probarCitaConfirmada()');
  console.log('   - probarCitaCancelada()');
  console.log('');
}

/**
 * ═══════════════════════════════════════════════════════
 * PUNTO DE ENTRADA
 * ═══════════════════════════════════════════════════════
 */

// Solo ejecutar si se corre directamente este archivo
if (require.main === module) {
  ejecutarPruebas()
    .then(() => {
      console.log('🏁 Script finalizado\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

/**
 * ═══════════════════════════════════════════════════════
 * INSTRUCCIONES DE USO
 * ═══════════════════════════════════════════════════════
 * 
 * 1. CAMBIAR el EMAIL_PRUEBA por tu email real (línea 19)
 * 
 * 2. VERIFICAR que .env tiene RESEND_API_KEY configurada
 * 
 * 3. EJECUTAR el script:
 *    npm run test:notificaciones
 *    
 *    O con tsx:
 *    npx tsx src/modules/notificaciones/test-notificaciones.ts
 * 
 * 4. REVISAR tu bandeja de entrada
 * 
 * 5. Si no llegan los emails:
 *    - Revisar carpeta de spam
 *    - Verificar logs de la consola
 *    - Ir a https://resend.com/emails
 * 
 * ═══════════════════════════════════════════════════════
 */

// Exportar para poder usar funciones individuales
export {
  probarCitaCreada,
  probarCitaConfirmada,
  probarCitaCancelada,
  verificarServicio,
};
