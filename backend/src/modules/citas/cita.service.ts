import { CitaRepository, type CitaConRelaciones } from './cita.repository';
import type { AgendarCitaPublicaInput, CitaCreadaDTO } from './cita.types';
import {
  TrabajadoraNoDisponibleError,
  ServicioNoDisponibleError,
  FechaEnPasadoError,
  HorarioNoDisponibleError,
  DiaBloqueadoError,
  SolapamientoCitaError,
  ServiciosNoEncontradosError,
  DuracionInvalidaError,
  CitaNoEncontradaError,
  CitaEstadoInvalidoError,
} from './cita.errors';
import {
  combinarFechaHora,
  esFechaFutura,
  calcularDuracionTotal,
  calcularPrecioTotal,
  calcularFechaFin,
  generarNumeroConfirmacion,
  formatearFecha,
} from './cita.utils';
import { EstadoCita } from '../../../generated/prisma/client';
import {
  notificacionesService,
  type InputCitaCancelada,
  type InputCitaConfirmada,
  type InputCitaCreada,
} from '../notificaciones';

export class CitaService {
  constructor(private repository: CitaRepository) {}

  /**
   * ⭐ FLUJO PRINCIPAL: Agendar cita pública
   * 
   * Este método maneja TODO dentro de una transacción serializable
   * para garantizar consistencia y evitar race conditions
   */
  async agendarCitaPublica(data: AgendarCitaPublicaInput): Promise<CitaCreadaDTO> {
    // Transacción con nivel de aislamiento SERIALIZABLE
    // Esto previene anomalías de lectura fantasma y write skew
    const citaCreada = await this.repository.ejecutarEnTransaccion(
      async (tx) => {
        // ═══════════════════════════════════════════════════════
        // PASO 1: Validar trabajadora
        // ═══════════════════════════════════════════════════════
        const trabajadora = await this.repository.buscarTrabajadoraActiva(
          data.trabajadoraId,
          tx
        );

        if (!trabajadora) {
          throw new TrabajadoraNoDisponibleError('La trabajadora seleccionada');
        }

        // ═══════════════════════════════════════════════════════
        // PASO 2: Validar servicios
        // ═══════════════════════════════════════════════════════
        const servicios = await this.repository.buscarServiciosActivos(
          data.serviciosIds,
          tx
        );

        // Verificar que todos los servicios existan
        if (servicios.length !== data.serviciosIds.length) {
          const encontrados = servicios.map((s) => s.id);
          const faltantes = data.serviciosIds.filter((id: string) => !encontrados.includes(id));
          throw new ServiciosNoEncontradosError(faltantes);
        }

        // Verificar que todos estén activos
        const servicioInactivo = servicios.find((s) => !s.activo);
        if (servicioInactivo) {
          throw new ServicioNoDisponibleError(servicioInactivo.nombre);
        }

        // ═══════════════════════════════════════════════════════
        // PASO 3: Calcular fechas y duraciones
        // ═══════════════════════════════════════════════════════
        const fechaInicio = combinarFechaHora(data.fecha, data.horaInicio);
        const duracionTotal = calcularDuracionTotal(servicios);
        const precioTotal = calcularPrecioTotal(servicios);
        const fechaFin = calcularFechaFin(fechaInicio, duracionTotal);

        // ═══════════════════════════════════════════════════════
        // PASO 4: Validaciones temporales
        // ═══════════════════════════════════════════════════════

        // 4.1: No permitir citas en el pasado
        if (!esFechaFutura(fechaInicio)) {
          throw new FechaEnPasadoError();
        }

        // 4.2: Verificar día bloqueado
        const esDiaBloqueado = await this.repository.verificarDiaBloqueado(
          fechaInicio,
          tx
        );

        if (esDiaBloqueado) {
          throw new DiaBloqueadoError(data.fecha);
        }

        // 4.3: Validar horario laboral
        const config = await this.repository.obtenerConfiguracionHorarios();
        this.validarHorarioLaboral(fechaInicio, fechaFin, config);

        // 4.4: Validar duración máxima
        if (duracionTotal > config.duracionMaximaCita) {
          throw new DuracionInvalidaError();
        }

        // ═══════════════════════════════════════════════════════
        // PASO 5: CRÍTICO - Verificar solapamiento con lock
        // ═══════════════════════════════════════════════════════
        // Esto bloquea las filas con FOR UPDATE para prevenir
        // que otra transacción concurrente cree una cita solapada
        const citasSolapadas = await this.repository.buscarCitasSolapadas(
          data.trabajadoraId,
          fechaInicio,
          fechaFin,
          tx
        );

        if (citasSolapadas.length > 0) {
          // Si hay solapamiento, abortar la transacción
          throw new SolapamientoCitaError();
        }

        // ═══════════════════════════════════════════════════════
        // PASO 6: Crear o actualizar cliente
        // ═══════════════════════════════════════════════════════
        const cliente = await this.repository.buscarOCrearCliente(
          {
            nombre: data.nombreCliente,
            telefono: data.telefono,
            email: data.email,
          },
          tx
        );

        // ═══════════════════════════════════════════════════════
        // PASO 7: Generar número de confirmación
        // ═══════════════════════════════════════════════════════
        const numeroConfirmacion = generarNumeroConfirmacion();

        // ═══════════════════════════════════════════════════════
        // PASO 8: Crear cita y relaciones
        // ═══════════════════════════════════════════════════════
        const citaCreada = await this.repository.crearCitaConServicios(
          {
            clienteId: cliente.id,
            trabajadoraId: data.trabajadoraId,
            fechaInicio,
            fechaFin,
            duracionTotal,
            precioTotal,
            numeroConfirmacion,
            serviciosIds: data.serviciosIds,
          },
          tx
        );

        // ═══════════════════════════════════════════════════════
        // PASO 9: Formatear respuesta
        // ═══════════════════════════════════════════════════════
        return this.formatearRespuestaCita(citaCreada!);
      },
      {
        isolationLevel: 'Serializable', // 🔒 Máximo nivel de aislamiento
        timeout: 10000, // 10 segundos timeout
      }
    );

    // ═══════════════════════════════════════════════════════
    // PASO 10: Enviar notificación por email
    // ═══════════════════════════════════════════════════════
    // IMPORTANTE: Esto se ejecuta FUERA de la transacción
    // para no bloquearla. Si falla el email, la cita ya está creada.
    this.enviarNotificacionCitaCreada(citaCreada).catch((error) => {
      // Log del error pero no propagar
      console.error('Error al enviar notificación de cita creada:', error);
    });

    return citaCreada;
  }

  async confirmarCita(citaId: string): Promise<CitaCreadaDTO> {
    const citaConfirmada = await this.repository.ejecutarEnTransaccion(async (tx) => {
      const cita = await this.repository.buscarCitaPorIdConRelaciones(citaId, tx);

      if (!cita) {
        throw new CitaNoEncontradaError();
      }

      if (cita.estado !== EstadoCita.PENDIENTE) {
        throw new CitaEstadoInvalidoError(cita.estado, 'confirmar');
      }

      return this.repository.actualizarEstadoCita(cita.id, EstadoCita.CONFIRMADA, tx);
    });

    this.enviarNotificacionCitaConfirmada(citaConfirmada).catch((error) => {
      console.error('Error al enviar notificación de cita confirmada:', error);
    });

    return this.formatearRespuestaCita(citaConfirmada);
  }

  async cancelarCita(citaId: string, motivo?: string): Promise<void> {
    const citaCancelada = await this.repository.ejecutarEnTransaccion(async (tx) => {
      const cita = await this.repository.buscarCitaPorIdConRelaciones(citaId, tx);

      if (!cita) {
        throw new CitaNoEncontradaError();
      }

      const estadosCancelables: EstadoCita[] = [
        EstadoCita.PENDIENTE,
        EstadoCita.CONFIRMADA,
        EstadoCita.REPROGRAMADA,
      ];

      if (!estadosCancelables.includes(cita.estado)) {
        throw new CitaEstadoInvalidoError(cita.estado, 'cancelar');
      }

      return this.repository.actualizarEstadoCita(cita.id, EstadoCita.CANCELADA, tx);
    });

    this.enviarNotificacionCitaCancelada(citaCancelada, motivo).catch((error) => {
      console.error('Error al enviar notificación de cita cancelada:', error);
    });
  }

  async cancelarCitaPorToken(tokenCancelacion: string): Promise<void> {
    const citaCancelada = await this.repository.ejecutarEnTransaccion(async (tx) => {
      const cita = await this.repository.buscarCitaPorToken(tokenCancelacion, tx);

      if (!cita) {
        throw new CitaNoEncontradaError();
      }

      const estadosCancelables: EstadoCita[] = [
        EstadoCita.PENDIENTE,
        EstadoCita.CONFIRMADA,
      ];

      if (!estadosCancelables.includes(cita.estado)) {
        throw new CitaEstadoInvalidoError(cita.estado, 'cancelar');
      }

      const ahora = new Date();
      if (cita.fechaInicio < ahora) {
        throw new CitaEstadoInvalidoError(
          cita.estado,
          'cancelar',
          'No se puede cancelar una cita pasada'
        );
      }

      const horasAntes = (cita.fechaInicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);
      if (horasAntes < 24) {
        throw new CitaEstadoInvalidoError(
          cita.estado,
          'cancelar',
          'La cita debe cancelarse con al menos 24 horas de anticipación'
        );
      }

      return this.repository.actualizarEstadoCita(cita.id, EstadoCita.CANCELADA, tx);
    });

    this.enviarNotificacionCitaCancelada(
      citaCancelada,
      'Cancelación solicitada por el cliente'
    ).catch((error) => {
      console.error('Error al enviar notificación de cancelación:', error);
    });
  }

  /**
   * Valida que la cita esté dentro del horario laboral
   */
  private validarHorarioLaboral(
    fechaInicio: Date,
    fechaFin: Date,
    config: { horaApertura: string; horaCierre: string }
  ): void {
    const horaInicio = fechaInicio.getHours() * 60 + fechaInicio.getMinutes();
    const horaFin = fechaFin.getHours() * 60 + fechaFin.getMinutes();

    const [aperturaH, aperturaM] = config.horaApertura.split(':').map(Number);
    const [cierreH, cierreM] = config.horaCierre.split(':').map(Number);

    const apertura = aperturaH * 60 + aperturaM;
    const cierre = cierreH * 60 + cierreM;

    if (horaInicio < apertura || horaFin > cierre) {
      throw new HorarioNoDisponibleError(
        `El horario laboral es de ${config.horaApertura} a ${config.horaCierre}`
      );
    }
  }

  /**
   * Formatea la respuesta de la cita creada
   */
  private formatearRespuestaCita(cita: CitaConRelaciones): CitaCreadaDTO {
    return {
      id: cita.id,
      numeroConfirmacion: cita.numeroConfirmacion,
      cliente: {
        nombre: cita.cliente.nombre,
        telefono: cita.cliente.telefono,
        email: cita.cliente.email || undefined,
      },
      trabajadora: {
        id: cita.trabajadora.id,
        nombre: cita.trabajadora.nombre,
      },
      servicios: cita.citaServicios.map((cs) => ({
        id: cs.servicio.id,
        nombre: cs.servicio.nombre,
        duracion: cs.servicio.duracionMinutos,
        precio: Number(cs.servicio.precio),
      })),
      fechaInicio: cita.fechaInicio,
      fechaFin: cita.fechaFin,
      duracionTotal: cita.duracionTotal,
      precioTotal: Number(cita.precioTotal),
      estado: cita.estado,
      tokenCancelacion: cita.tokenCancelacion,
      instrucciones: this.generarInstrucciones(cita),
    };
  }

  /**
   * Genera instrucciones para el cliente
   */
  private generarInstrucciones(cita: CitaConRelaciones): string {
    const fecha = formatearFecha(cita.fechaInicio);
    
    return `
      ✅ Tu cita ha sido agendada exitosamente.
      
      📋 Número de confirmación: ${cita.numeroConfirmacion}
      📅 Fecha: ${fecha}
      👤 Trabajadora: ${cita.trabajadora.nombre}
      ⏱️  Duración: ${cita.duracionTotal} minutos
      💰 Total: $${cita.precioTotal}
      
      ⚠️ Para cancelar, usa tu token de cancelación.
      ⚠️ Cancela con al menos 24 horas de anticipación.
    `.trim();
  }

  /**
   * ═══════════════════════════════════════════════════════
   * ENVÍO DE NOTIFICACIÓN: CITA CREADA
   * ═══════════════════════════════════════════════════════
   * 
   * Envía email de confirmación al cliente cuando se crea una cita.
   * Este método es asíncrono pero no bloquea el flujo principal.
   */
  private async enviarNotificacionCitaCreada(cita: CitaCreadaDTO): Promise<void> {
    // Si el cliente no tiene email, no podemos notificar
    if (!cita.cliente.email) {
      console.log(`ℹ️  Cliente ${cita.cliente.nombre} no tiene email. Notificación omitida.`);
      return;
    }

    // Preparar datos para la notificación
    const datosNotificacion: InputCitaCreada = {
      destinatario: cita.cliente.email,
      nombreDestinatario: cita.cliente.nombre,
      numeroConfirmacion: cita.numeroConfirmacion,
      nombreTrabajadora: cita.trabajadora.nombre,
      fecha: cita.fechaInicio,
      servicios: cita.servicios.map(s => ({
        nombre: s.nombre,
        duracion: s.duracion,
        precio: s.precio,
      })),
      duracionTotal: cita.duracionTotal,
      precioTotal: cita.precioTotal,
      tokenCancelacion: cita.tokenCancelacion,
    };

    // Enviar notificación (async sin await para no bloquear)
    const resultado = await notificacionesService.enviarCitaCreada(datosNotificacion);

    if (resultado.exito) {
      console.log(`✅ Notificación de cita creada enviada a ${cita.cliente.email}`);
    } else {
      console.error(`❌ Error al enviar notificación: ${resultado.error}`);
    }
  }

  private async enviarNotificacionCitaConfirmada(cita: CitaConRelaciones): Promise<void> {
    if (!cita.cliente.email) {
      console.log(`ℹ️  Cliente ${cita.cliente.nombre} no tiene email. Notificación omitida.`);
      return;
    }

    const datosNotificacion: InputCitaConfirmada = {
      destinatario: cita.cliente.email,
      nombreDestinatario: cita.cliente.nombre,
      numeroConfirmacion: cita.numeroConfirmacion,
      nombreTrabajadora: cita.trabajadora.nombre,
      fecha: cita.fechaInicio,
      servicios: cita.citaServicios.map((cs) => ({
        nombre: cs.servicio.nombre,
        duracion: cs.servicio.duracionMinutos,
        precio: Number(cs.servicio.precio),
      })),
      duracionTotal: cita.duracionTotal,
      precioTotal: Number(cita.precioTotal),
      tokenCancelacion: cita.tokenCancelacion,
    };

    const resultado = await notificacionesService.enviarCitaConfirmada(datosNotificacion);

    if (resultado.exito) {
      console.log(`✅ Notificación de cita confirmada enviada a ${cita.cliente.email}`);
    } else {
      console.error(`❌ Error al enviar notificación: ${resultado.error}`);
    }
  }

  private async enviarNotificacionCitaCancelada(
    cita: CitaConRelaciones,
    motivo?: string
  ): Promise<void> {
    if (!cita.cliente.email) {
      console.log(`ℹ️  Cliente ${cita.cliente.nombre} no tiene email. Notificación omitida.`);
      return;
    }

    const datosNotificacion: InputCitaCancelada = {
      destinatario: cita.cliente.email,
      nombreDestinatario: cita.cliente.nombre,
      numeroConfirmacion: cita.numeroConfirmacion,
      nombreTrabajadora: cita.trabajadora.nombre,
      fecha: cita.fechaInicio,
      servicios: cita.citaServicios.map((cs) => ({
        nombre: cs.servicio.nombre,
        duracion: cs.servicio.duracionMinutos,
        precio: Number(cs.servicio.precio),
      })),
      motivo,
    };

    const resultado = await notificacionesService.enviarCitaCancelada(datosNotificacion);

    if (resultado.exito) {
      console.log(`✅ Notificación de cita cancelada enviada a ${cita.cliente.email}`);
    } else {
      console.error(`❌ Error al enviar notificación: ${resultado.error}`);
    }
  }
}