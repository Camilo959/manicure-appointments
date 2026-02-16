/**
 * ================================================
 * EJEMPLOS DE INTEGRACIÓN CON NOTIFICACIONES
 * ================================================
 * 
 * Este archivo muestra cómo integrar el servicio de
 * notificaciones en los endpoints de citas.
 * 
 * Los métodos aquí son EJEMPLOS y deben adaptarse
 * según las necesidades específicas del negocio.
 */

import { notificacionesService } from '../notificaciones';
import type { CitaCreadaDTO } from './cita.types';
import prisma from '../../config/prisma';
import { EstadoCita } from '../../../generated/prisma/client';

/**
 * ═══════════════════════════════════════════════════════
 * EJEMPLO 1: CONFIRMAR CITA
 * ═══════════════════════════════════════════════════════
 * 
 * Este método cambia el estado de una cita a CONFIRMADA
 * y envía una notificación al cliente.
 */
export async function confirmarCita(citaId: string): Promise<void> {
  // 1. Actualizar el estado en la base de datos
  const citaConfirmada = await prisma.cita.update({
    where: { id: citaId },
    data: { estado: EstadoCita.CONFIRMADA },
    include: {
      cliente: true,
      trabajadora: true,
      citaServicios: {
        include: {
          servicio: true,
        },
      },
    },
  });

  // 2. Verificar que el cliente tenga email
  if (!citaConfirmada.cliente.email) {
    console.log('ℹ️  Cliente sin email. No se puede enviar notificación.');
    return;
  }

  // 3. Preparar datos para la notificación
  const datosNotificacion = {
    destinatario: citaConfirmada.cliente.email,
    nombreDestinatario: citaConfirmada.cliente.nombre,
    numeroConfirmacion: citaConfirmada.numeroConfirmacion,
    nombreTrabajadora: citaConfirmada.trabajadora.nombre,
    fecha: citaConfirmada.fechaInicio,
    fechaFormateada: '', // Se completa en el servicio
    hora: '', // Se completa en el servicio
    servicios: citaConfirmada.citaServicios.map((cs) => ({
      nombre: cs.servicio.nombre,
      duracion: cs.servicio.duracionMinutos,
      precio: Number(cs.servicio.precio),
    })),
    duracionTotal: citaConfirmada.duracionTotal,
    precioTotal: Number(citaConfirmada.precioTotal),
    tokenCancelacion: citaConfirmada.tokenCancelacion,
    linkCancelacion: '', // Se completa en el servicio
  };

  // 4. Enviar notificación (no bloquea el flujo)
  notificacionesService.enviarCitaConfirmada(datosNotificacion).catch((error) => {
    console.error('Error al enviar notificación de cita confirmada:', error);
  });

  console.log(`✅ Cita ${citaId} confirmada y notificación enviada`);
}

/**
 * ═══════════════════════════════════════════════════════
 * EJEMPLO 2: CANCELAR CITA
 * ═══════════════════════════════════════════════════════
 * 
 * Este método cancela una cita y envía una notificación
 * al cliente con el motivo opcional.
 */
export async function cancelarCita(
  citaId: string,
  motivo?: string
): Promise<void> {
  // 1. Actualizar el estado en la base de datos
  const citaCancelada = await prisma.cita.update({
    where: { id: citaId },
    data: { estado: EstadoCita.CANCELADA },
    include: {
      cliente: true,
      trabajadora: true,
      citaServicios: {
        include: {
          servicio: true,
        },
      },
    },
  });

  // 2. Verificar que el cliente tenga email
  if (!citaCancelada.cliente.email) {
    console.log('ℹ️  Cliente sin email. No se puede enviar notificación.');
    return;
  }

  // 3. Preparar datos para la notificación
  const datosNotificacion = {
    destinatario: citaCancelada.cliente.email,
    nombreDestinatario: citaCancelada.cliente.nombre,
    numeroConfirmacion: citaCancelada.numeroConfirmacion,
    nombreTrabajadora: citaCancelada.trabajadora.nombre,
    fecha: citaCancelada.fechaInicio,
    fechaFormateada: '', // Se completa en el servicio
    hora: '', // Se completa en el servicio
    servicios: citaCancelada.citaServicios.map((cs) => ({
      nombre: cs.servicio.nombre,
      duracion: cs.servicio.duracionMinutos,
      precio: Number(cs.servicio.precio),
    })),
    motivo, // Motivo opcional de cancelación
  };

  // 4. Enviar notificación (no bloquea el flujo)
  notificacionesService.enviarCitaCancelada(datosNotificacion).catch((error) => {
    console.error('Error al enviar notificación de cita cancelada:', error);
  });

  console.log(`✅ Cita ${citaId} cancelada y notificación enviada`);
}

/**
 * ═══════════════════════════════════════════════════════
 * EJEMPLO 3: CANCELAR CITA POR TOKEN (CLIENTE)
 * ═══════════════════════════════════════════════════════
 * 
 * Este método permite al cliente cancelar su propia cita
 * usando el token de cancelación.
 */
export async function cancelarCitaPorToken(
  tokenCancelacion: string
): Promise<{ exito: boolean; mensaje: string }> {
  // 1. Buscar la cita por token
  const cita = await prisma.cita.findFirst({
    where: {
      tokenCancelacion,
      estado: {
        in: [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA],
      },
    },
    include: {
      cliente: true,
      trabajadora: true,
      citaServicios: {
        include: {
          servicio: true,
        },
      },
    },
  });

  if (!cita) {
    return {
      exito: false,
      mensaje: 'Cita no encontrada o ya cancelada',
    };
  }

  // 2. Verificar que la cita no esté en el pasado
  if (cita.fechaInicio < new Date()) {
    return {
      exito: false,
      mensaje: 'No se puede cancelar una cita pasada',
    };
  }

  // 3. Verificar ventana de cancelación (24 horas)
  const horasAntes = (cita.fechaInicio.getTime() - new Date().getTime()) / (1000 * 60 * 60);
  if (horasAntes < 24) {
    return {
      exito: false,
      mensaje: 'La cita debe cancelarse con al menos 24 horas de anticipación',
    };
  }

  // 4. Cancelar la cita
  await prisma.cita.update({
    where: { id: cita.id },
    data: { estado: EstadoCita.CANCELADA },
  });

  // 5. Enviar notificación si el cliente tiene email
  if (cita.cliente.email) {
    const datosNotificacion = {
      destinatario: cita.cliente.email,
      nombreDestinatario: cita.cliente.nombre,
      numeroConfirmacion: cita.numeroConfirmacion,
      nombreTrabajadora: cita.trabajadora.nombre,
      fecha: cita.fechaInicio,
      fechaFormateada: '',
      hora: '',
      servicios: cita.citaServicios.map((cs) => ({
        nombre: cs.servicio.nombre,
        duracion: cs.servicio.duracionMinutos,
        precio: Number(cs.servicio.precio),
      })),
      motivo: 'Cancelación solicitada por el cliente',
    };

    notificacionesService.enviarCitaCancelada(datosNotificacion).catch((error) => {
      console.error('Error al enviar notificación de cancelación:', error);
    });
  }

  return {
    exito: true,
    mensaje: 'Cita cancelada exitosamente',
  };
}

/**
 * ═══════════════════════════════════════════════════════
 * NOTAS DE IMPLEMENTACIÓN
 * ═══════════════════════════════════════════════════════
 * 
 * 1. MANEJO DE ERRORES:
 *    - Las notificaciones NUNCA deben romper el flujo principal
 *    - Usar .catch() en las promesas de notificaciones
 *    - Loggear fallos pero continuar la operación
 * 
 * 2. PERFORMANCE:
 *    - Las notificaciones se envían de forma asíncrona
 *    - No usar await en las notificaciones (fire-and-forget)
 *    - Considerar colas (Bull, BullMQ) para mayor volumen
 * 
 * 3. TESTING:
 *    - Mockear el servicio de notificaciones en tests
 *    - Verificar que las notificaciones no bloqueen
 *    - Probar escenarios sin email del cliente
 * 
 * 4. PRODUCCIÓN:
 *    - Configurar un dominio verificado en Resend
 *    - Cambiar el remitente en el servicio
 *    - Implementar retry logic con colas
 *    - Agregar métricas de envíos exitosos/fallidos
 *    - Considerar rate limiting de Resend
 */
