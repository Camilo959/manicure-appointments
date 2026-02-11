import { startOfDay, endOfDay, addMinutes, isAfter, isBefore, areIntervalsOverlapping } from 'date-fns';
import { PrismaClient } from '../../../generated/prisma/client';
import {
  ConsultarDisponibilidadInput,
  DisponibilidadResponse,
  SlotDisponible,
  HORARIO_CONFIG,
  ESTADOS_OCUPADOS,
} from '../../types/disponibilidad.types';

export class DisponibilidadService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Consulta horarios disponibles para una trabajadora en una fecha específica
   */
  async consultarDisponibilidad(
    input: ConsultarDisponibilidadInput
  ): Promise<DisponibilidadResponse> {
    const { fecha, trabajadoraId, serviciosIds } = input;

    // 1. Validar fecha no esté en el pasado
    const fechaConsulta = new Date(fecha);
    const hoy = startOfDay(new Date());
    
    if (isBefore(fechaConsulta, hoy)) {
      throw new Error('No se puede consultar disponibilidad en fechas pasadas');
    }

    // 2. Validar trabajadora existe y está activa
    const trabajadora = await this.prisma.trabajadora.findUnique({
      where: { id: trabajadoraId },
    });

    if (!trabajadora) {
      throw new Error('Trabajadora no encontrada');
    }

    if (!trabajadora.activa) {
      throw new Error('Trabajadora no está activa');
    }

    // 3. Verificar si el día está bloqueado
    const diaBloqueado = await this.prisma.diaBloqueado.findUnique({
      where: { fecha: fechaConsulta },
    });

    if (diaBloqueado) {
      return {
        fecha,
        trabajadoraId,
        duracionTotalMinutos: 0,
        slotsDisponibles: [],
      };
    }

    // 4. Obtener servicios y calcular duración total
    const servicios = await this.prisma.servicio.findMany({
      where: {
        id: { in: serviciosIds },
        activo: true,
      },
    });

    if (servicios.length !== serviciosIds.length) {
      throw new Error('Uno o más servicios no están disponibles');
    }

    const duracionTotalMinutos = servicios.reduce(
      (total, servicio) => total + servicio.duracionMinutos,
      0
    );

    // 5. Definir ventana de búsqueda
    const { inicioVentana, finVentana } = this.calcularVentanaBusqueda(fechaConsulta, duracionTotalMinutos);

    // 6. Obtener citas ocupadas del día
    const citasOcupadas = await this.obtenerCitasOcupadas(trabajadoraId, fechaConsulta);

    // 7. Generar slots disponibles
    const slotsDisponibles = this.generarSlotsDisponibles(
      inicioVentana,
      finVentana,
      duracionTotalMinutos,
      citasOcupadas
    );

    return {
      fecha,
      trabajadoraId,
      duracionTotalMinutos,
      slotsDisponibles,
    };
  }

  /**
   * Calcula la ventana de búsqueda ajustada
   */
  private calcularVentanaBusqueda(fecha: Date, duracionMinutos: number): {
    inicioVentana: Date;
    finVentana: Date;
  } {
    const esHoy = startOfDay(fecha).getTime() === startOfDay(new Date()).getTime();
    const ahora = new Date();

    // Inicio del día laboral
    let inicioVentana = new Date(fecha);
    inicioVentana.setHours(HORARIO_CONFIG.INICIO_LABORAL, 0, 0, 0);

    // Si es hoy y ya pasó el inicio laboral, usar hora actual redondeada
    if (esHoy && isAfter(ahora, inicioVentana)) {
      const minutosActuales = ahora.getMinutes();
      const minutosRedondeados = Math.ceil(minutosActuales / HORARIO_CONFIG.SLOT_INTERVALO_MINUTOS) * HORARIO_CONFIG.SLOT_INTERVALO_MINUTOS;
      
      inicioVentana = new Date(ahora);
      inicioVentana.setMinutes(minutosRedondeados, 0, 0);
    }

    // Fin del día laboral, ajustado para que quepa la cita completa
    let finVentana = new Date(fecha);
    finVentana.setHours(HORARIO_CONFIG.FIN_LABORAL, 0, 0, 0);
    finVentana = addMinutes(finVentana, -duracionMinutos);

    return { inicioVentana, finVentana };
  }

  /**
   * Obtiene citas que ocupan horarios (estados activos)
   */
  private async obtenerCitasOcupadas(
    trabajadoraId: string,
    fecha: Date
  ): Promise<Array<{ fechaInicio: Date; fechaFin: Date }>> {
    const inicioDia = startOfDay(fecha);
    const finDia = endOfDay(fecha);

    const citas = await this.prisma.cita.findMany({
      where: {
        trabajadoraId,
        estado: { in: ESTADOS_OCUPADOS },
        fechaInicio: {
          gte: inicioDia,
          lte: finDia,
        },
      },
      select: {
        fechaInicio: true,
        fechaFin: true,
      },
      orderBy: {
        fechaInicio: 'asc',
      },
    });

    return citas;
  }

  /**
   * Genera slots disponibles verificando solapamientos
   */
  private generarSlotsDisponibles(
    inicio: Date,
    fin: Date,
    duracionMinutos: number,
    citasOcupadas: Array<{ fechaInicio: Date; fechaFin: Date }>
  ): SlotDisponible[] {
    const slots: SlotDisponible[] = [];
    let currentSlot = new Date(inicio);

    while (isBefore(currentSlot, fin) || currentSlot.getTime() === fin.getTime()) {
      const slotInicio = new Date(currentSlot);
      const slotFin = addMinutes(slotInicio, duracionMinutos);

      // Verificar que el slot no se solape con ninguna cita ocupada
      const tieneSolapamiento = citasOcupadas.some((cita) =>
        areIntervalsOverlapping(
          { start: slotInicio, end: slotFin },
          { start: cita.fechaInicio, end: cita.fechaFin },
          { inclusive: false } // No considerar solapamiento si solo se tocan en los bordes
        )
      );

      if (!tieneSolapamiento) {
        slots.push({
          inicio: slotInicio,
          fin: slotFin,
        });
      }

      // Avanzar al siguiente slot
      currentSlot = addMinutes(currentSlot, HORARIO_CONFIG.SLOT_INTERVALO_MINUTOS);
    }

    return slots;
  }
}