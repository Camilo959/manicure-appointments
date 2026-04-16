import prisma from '../../config/prisma';
import type { Prisma } from '../../../generated/prisma/client';
import {
  CONFIGURACION_HORARIA_FALLBACK,
  normalizarHoraHHmm,
  type ClienteData,
  type ConfiguracionHorariaAgenda,
} from './cita.types';

const citaConRelacionesInclude = {
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
} as const;

export type CitaConRelaciones = Prisma.CitaGetPayload<{
  include: typeof citaConRelacionesInclude;
}>;

export class CitaRepository {
  async ejecutarEnTransaccion<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    opciones?: { isolationLevel?: 'Serializable' | 'RepeatableRead'; timeout?: number }
  ): Promise<T> {
    if (!opciones) {
      return prisma.$transaction(fn);
    }

    return prisma.$transaction(fn, {
      ...opciones,
      isolationLevel: opciones.isolationLevel as Prisma.TransactionIsolationLevel | undefined,
    });
  }

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

    const bloqueado = await client.diaBloqueado.findUnique({
      where: {
        fecha: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()),
      },
    });

    return bloqueado !== null;
  }

  async buscarCitaPorIdConRelaciones(
    citaId: string,
    tx?: Prisma.TransactionClient
  ): Promise<CitaConRelaciones | null> {
    const client = tx || prisma;

    return await client.cita.findUnique({
      where: { id: citaId },
      include: citaConRelacionesInclude,
    });
  }

  async buscarCitaPorToken(
    tokenCancelacion: string,
    tx?: Prisma.TransactionClient
  ): Promise<CitaConRelaciones | null> {
    const client = tx || prisma;

    return await client.cita.findUnique({
      where: { tokenCancelacion },
      include: citaConRelacionesInclude,
    });
  }

  async actualizarEstadoCita(
    citaId: string,
    estado: Prisma.CitaUpdateInput['estado'],
    tx?: Prisma.TransactionClient
  ): Promise<CitaConRelaciones> {
    const client = tx || prisma;

    return await client.cita.update({
      where: { id: citaId },
      data: { estado },
      include: citaConRelacionesInclude,
    });
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
      include: citaConRelacionesInclude,
    });
  }

  /**
   * Obtener configuración de horarios (para validaciones)
   */
  async obtenerConfiguracionHorarios(
    tx?: Prisma.TransactionClient
  ): Promise<ConfiguracionHorariaAgenda> {
    const client = tx || prisma;
    const nodeEnv = process.env.NODE_ENV;
    const entornoPermiteFallback = !nodeEnv || ['development', 'test'].includes(nodeEnv);

    try {
      const rows = await client.$queryRaw<Array<{
        horaApertura: unknown;
        horaCierre: unknown;
        duracionMaximaCitaMinutos: number;
        intervaloSlotsMinutos: number;
        maxDiasAnticipacion: number;
        zonaHoraria: string;
      }>>`
        SELECT
          "horaApertura",
          "horaCierre",
          "duracionMaximaCitaMinutos",
          "intervaloSlotsMinutos",
          "maxDiasAnticipacion",
          "zonaHoraria"
        FROM "ConfiguracionHoraria"
        WHERE "activa" = true
        ORDER BY "updatedAt" DESC
        LIMIT 1
      `;

      if (rows.length === 0) {
        if (entornoPermiteFallback) {
          return CONFIGURACION_HORARIA_FALLBACK;
        }

        throw new Error('No existe una configuración horaria activa en base de datos');
      }

      const row = rows[0];

      return {
        horaApertura: normalizarHoraHHmm(row.horaApertura),
        horaCierre: normalizarHoraHHmm(row.horaCierre),
        duracionMaximaCitaMinutos: row.duracionMaximaCitaMinutos,
        intervaloSlotsMinutos: row.intervaloSlotsMinutos,
        maxDiasAnticipacion: row.maxDiasAnticipacion,
        zonaHoraria: row.zonaHoraria,
      };
    } catch (error) {
      if (entornoPermiteFallback) {
        return CONFIGURACION_HORARIA_FALLBACK;
      }

      throw error;
    }
  }
}