import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/prisma';
import { CitaRepository } from './cita.repository';
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
import type { Prisma } from '../../../generated/prisma/client';
import { notificacionesService } from '../notificaciones';

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
    const citaCreada = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
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
        // PASO 7: Generar tokens y confirmación
        // ═══════════════════════════════════════════════════════
        const tokenCancelacion = uuidv4(); // UUID v4 no predecible
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
            tokenCancelacion,
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
  private formatearRespuestaCita(cita: any): CitaCreadaDTO {
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
      servicios: cita.citaServicios.map((cs: any) => ({
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
  private generarInstrucciones(cita: any): string {
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
    const datosNotificacion = {
      destinatario: cita.cliente.email,
      nombreDestinatario: cita.cliente.nombre,
      numeroConfirmacion: cita.numeroConfirmacion,
      nombreTrabajadora: cita.trabajadora.nombre,
      fecha: cita.fechaInicio,
      fechaFormateada: '', // Se completa en el servicio
      hora: '', // Se completa en el servicio
      servicios: cita.servicios.map(s => ({
        nombre: s.nombre,
        duracion: s.duracion,
        precio: s.precio,
      })),
      duracionTotal: cita.duracionTotal,
      precioTotal: cita.precioTotal,
      tokenCancelacion: cita.tokenCancelacion,
      linkCancelacion: '', // Se completa en el servicio
    };

    // Enviar notificación (async sin await para no bloquear)
    const resultado = await notificacionesService.enviarCitaCreada(datosNotificacion);

    if (resultado.exito) {
      console.log(`✅ Notificación de cita creada enviada a ${cita.cliente.email}`);
    } else {
      console.error(`❌ Error al enviar notificación: ${resultado.error}`);
    }
  }
}