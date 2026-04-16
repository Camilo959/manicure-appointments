import { startOfDay, endOfDay, addMinutes, isAfter, isBefore, areIntervalsOverlapping } from 'date-fns';
import { PrismaClient } from '../../../generated/prisma/client';
import {
  ConsultarDisponibilidadInput,
  DisponibilidadResponse,
  SlotDisponible,
  ESTADOS_OCUPADOS,
} from '../../types/disponibilidad.types';
import {
  DuracionInvalidaError,
  FechaEnPasadoError,
  FechaFueraDeRangoError,
  ServicioNoDisponibleError,
  ServiciosNoEncontradosError,
  TrabajadoraNoDisponibleError,
} from './cita.errors';
import {
  CONFIGURACION_HORARIA_FALLBACK,
  normalizarHoraHHmm,
  type ConfiguracionHorariaAgenda,
} from './cita.types';
import { validarFechaMaxima } from './disponibilidad.validation';

export class DisponibilidadService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Consulta horarios disponibles para una trabajadora en una fecha específica
   */
  async consultarDisponibilidad(
    input: ConsultarDisponibilidadInput
  ): Promise<DisponibilidadResponse> {
    const { fecha, trabajadoraId, serviciosIds } = input;
    const configHoraria = await this.obtenerConfiguracionHorariaActiva();

    // 1. Validar fecha no esté en el pasado
    const fechaConsulta = new Date(fecha);
    const hoy = startOfDay(new Date());
    
    if (isBefore(fechaConsulta, hoy)) {
      throw new FechaEnPasadoError();
    }

    if (!validarFechaMaxima(fechaConsulta, configHoraria.maxDiasAnticipacion)) {
      throw new FechaFueraDeRangoError(configHoraria.maxDiasAnticipacion);
    }

    // 2. Validar trabajadora existe y está activa
    const trabajadora = await this.prisma.trabajadora.findUnique({
      where: { id: trabajadoraId },
    });

    if (!trabajadora) {
      throw new TrabajadoraNoDisponibleError('seleccionada');
    }

    if (!trabajadora.activa) {
      throw new TrabajadoraNoDisponibleError(trabajadora.nombre);
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
      const serviciosExistentes = await this.prisma.servicio.findMany({
        where: {
          id: { in: serviciosIds },
        },
        select: {
          id: true,
          nombre: true,
          activo: true,
        },
      });

      const encontrados = serviciosExistentes.map((servicio) => servicio.id);
      const faltantes = serviciosIds.filter((id) => !encontrados.includes(id));

      if (faltantes.length > 0) {
        throw new ServiciosNoEncontradosError(faltantes);
      }

      const servicioInactivo = serviciosExistentes.find((servicio) => !servicio.activo);
      if (servicioInactivo) {
        throw new ServicioNoDisponibleError(servicioInactivo.nombre);
      }

      throw new ServiciosNoEncontradosError(serviciosIds);
    }

    const duracionTotalMinutos = servicios.reduce(
      (total, servicio) => total + servicio.duracionMinutos,
      0
    );

    if (duracionTotalMinutos > configHoraria.duracionMaximaCitaMinutos) {
      throw new DuracionInvalidaError();
    }

    // 5. Definir ventana de búsqueda
    const { inicioVentana, finVentana } = this.calcularVentanaBusqueda(
      fechaConsulta,
      duracionTotalMinutos,
      configHoraria
    );

    // 6. Obtener citas ocupadas del día
    const citasOcupadas = await this.obtenerCitasOcupadas(trabajadoraId, fechaConsulta);

    // 7. Generar slots disponibles
    const slotsDisponibles = this.generarSlotsDisponibles(
      inicioVentana,
      finVentana,
      duracionTotalMinutos,
      citasOcupadas,
      configHoraria.intervaloSlotsMinutos
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
  private calcularVentanaBusqueda(
    fecha: Date,
    duracionMinutos: number,
    configHoraria: ConfiguracionHorariaAgenda
  ): {
    inicioVentana: Date;
    finVentana: Date;
  } {
    const esHoy = startOfDay(fecha).getTime() === startOfDay(new Date()).getTime();
    const ahora = new Date();
    const aperturaEnMinutos = this.convertirHoraAMinutos(configHoraria.horaApertura);
    const cierreEnMinutos = this.convertirHoraAMinutos(configHoraria.horaCierre);

    // Inicio del día laboral
    let inicioVentana = new Date(fecha);
    inicioVentana.setHours(
      Math.floor(aperturaEnMinutos / 60),
      aperturaEnMinutos % 60,
      0,
      0
    );

    // Si es hoy y ya pasó el inicio laboral, usar hora actual redondeada
    if (esHoy && isAfter(ahora, inicioVentana)) {
      const minutosActuales = ahora.getMinutes();
      const minutosRedondeados = Math.ceil(
        minutosActuales / configHoraria.intervaloSlotsMinutos
      ) * configHoraria.intervaloSlotsMinutos;
      
      inicioVentana = new Date(ahora);
      inicioVentana.setMinutes(minutosRedondeados, 0, 0);
    }

    // Fin del día laboral, ajustado para que quepa la cita completa
    let finVentana = new Date(fecha);
    finVentana.setHours(
      Math.floor(cierreEnMinutos / 60),
      cierreEnMinutos % 60,
      0,
      0
    );
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
    citasOcupadas: Array<{ fechaInicio: Date; fechaFin: Date }>,
    intervaloSlotsMinutos: number
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
      currentSlot = addMinutes(currentSlot, intervaloSlotsMinutos);
    }

    return slots;
  }

  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  private async obtenerConfiguracionHorariaActiva(): Promise<ConfiguracionHorariaAgenda> {
    const nodeEnv = process.env.NODE_ENV;
    const entornoPermiteFallback = !nodeEnv || ['development', 'test'].includes(nodeEnv);

    try {
      const rows = await this.prisma.$queryRaw<Array<{
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