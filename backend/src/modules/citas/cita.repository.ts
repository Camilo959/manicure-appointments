import prisma from '../../config/prisma';
import type { Prisma } from '../../../generated/prisma/client';
import type { ClienteData, DatosCitaCalculados } from './cita.types';

export class CitaRepository {
  /**
   * Buscar o crear cliente por teléfono (upsert)
   */
  async buscarOCrearCliente(data: ClienteData, tx: Prisma.TransactionClient) {
    return await tx.cliente.upsert({
      where: { telefono: data.telefono },
      update: {
        nombre: data.nombre,
        email: data.email || undefined,
      },
      create: {
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email || undefined,
      },
    });
  }

  /**
   * Buscar trabajadora activa por ID
   */
  async buscarTrabajadoraActiva(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;

    return await client.trabajadora.findFirst({
      where: {
        id,
        activa: true,
        user: {
          activo: true,
        },
      },
      select: {
        id: true,
        nombre: true,
        activa: true,
      },
    });
  }

  /**
   * Buscar servicios activos por IDs
   */
  async buscarServiciosActivos(ids: string[], tx?: Prisma.TransactionClient) {
    const client = tx || prisma;

    return await client.servicio.findMany({
      where: {
        id: { in: ids },
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        duracionMinutos: true,
        precio: true,
        activo: true,
      },
    });
  }

  /**
   * Verificar si existe día bloqueado
   */
  async verificarDiaBloqueado(fecha: Date, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx || prisma;

    const count = await client.diaBloqueado.count({
      where: {
        fecha: {
          gte: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()),
          lt: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1),
        },
      },
    });

    return count > 0;
  }

  /**
   * Buscar citas que se solapen con el horario propuesto
   * CRÍTICO: Usar FOR UPDATE para bloquear filas y evitar race conditions
   */
  async buscarCitasSolapadas(
    trabajadoraId: string,
    fechaInicio: Date,
    fechaFin: Date,
    tx: Prisma.TransactionClient
  ) {
    // Usar query raw para agregar FOR UPDATE (lock pesimista)
    return await tx.$queryRaw<Array<{ id: string; fechaInicio: Date; fechaFin: Date }>>`
      SELECT id, "fechaInicio", "fechaFin"
      FROM "Cita"
      WHERE "trabajadoraId" = ${trabajadoraId}
        AND estado IN ('PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA')
        AND "fechaInicio" < ${fechaFin}
        AND "fechaFin" > ${fechaInicio}
      FOR UPDATE
    `;
  }

  /**
   * Crear cita con servicios en transacción
   */
  async crearCitaConServicios(
    datos: {
      clienteId: string;
      trabajadoraId: string;
      fechaInicio: Date;
      fechaFin: Date;
      duracionTotal: number;
      precioTotal: number;
      tokenCancelacion: string;
      numeroConfirmacion: string;
      serviciosIds: string[];
    },
    tx: Prisma.TransactionClient
  ) {
    // 1. Crear la cita
    const cita = await tx.cita.create({
      data: {
        clienteId: datos.clienteId,
        trabajadoraId: datos.trabajadoraId,
        fechaInicio: datos.fechaInicio,
        fechaFin: datos.fechaFin,
        duracionTotal: datos.duracionTotal,
        precioTotal: datos.precioTotal,
        estado: 'PENDIENTE',
        tokenCancelacion: datos.tokenCancelacion,
        numeroConfirmacion: datos.numeroConfirmacion,
      },
      include: {
        cliente: true,
        trabajadora: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    // 2. Buscar servicios para obtener precios
    const servicios = await tx.servicio.findMany({
      where: { id: { in: datos.serviciosIds } },
      select: { id: true, precio: true },
    });

    // Crear un mapa de servicioId -> precio
    const precioMap = new Map(servicios.map(s => [s.id, s.precio]));

    // 3. Crear relaciones CitaServicio
    await tx.citaServicio.createMany({
      data: datos.serviciosIds.map((servicioId) => ({
        citaId: cita.id,
        servicioId: servicioId,
        precioUnitario: precioMap.get(servicioId) || 0,
      })),
    });

    // 4. Retornar cita con servicios
    return await tx.cita.findUnique({
      where: { id: cita.id },
      include: {
        cliente: true,
        trabajadora: {
          select: {
            id: true,
            nombre: true,
          },
        },
        citaServicios: {
          include: {
            servicio: {
              select: {
                id: true,
                nombre: true,
                duracionMinutos: true,
                precio: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Obtener configuración de horarios (para validaciones)
   */
  async obtenerConfiguracionHorarios() {
    // Asumo que tienes una tabla de configuración
    // Si no, puedes mover estos valores a variables de entorno
    return {
      horaApertura: '09:00',
      horaCierre: '19:00',
      duracionMaximaCita: 180, // 3 horas
    };
  }
}