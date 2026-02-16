/**
 * ================================================
 * SERVICIO DE NOTIFICACIONES
 * ================================================
 * 
 * Servicio centralizado para el envío de notificaciones
 * por email usando Resend.
 * 
 * RESPONSABILIDADES:
 * - Enviar emails de forma asíncrona
 * - Manejar errores sin romper el flujo principal
 * - Logging de envíos exitosos y fallidos
 * - Validación de datos antes de enviar
 * 
 * IMPORTANTE:
 * - Los errores NO deben propagarse al flujo principal
 * - Siempre debe devolver un ResultadoEnvio
 * - Logging obligatorio para auditoría
 */

import { Resend } from 'resend';
import config from '../../config/env';
import type {
  NotificacionCitaCreada,
  NotificacionCitaConfirmada,
  NotificacionCitaCancelada,
  ResultadoEnvio,
  ConfiguracionEmail,
} from './notificaciones.types';
import { generarEmailCitaCreada } from './templates/cita-creada.template';
import { generarEmailCitaConfirmada } from './templates/cita-confirmada.template';
import { generarEmailCitaCancelada } from './templates/cita-cancelada.template';
import {
  formatearFechaCompleta,
  extraerHora,
  generarLinkCancelacion,
} from './notificaciones.utils';

/**
 * Servicio de Notificaciones
 * 
 * Patrón Singleton para reutilizar la instancia de Resend
 */
export class NotificacionesService {
  private resend: Resend | null = null;
  private habilitado: boolean = false;
  private readonly remitentePorDefecto: string = 'Manicure Spa <onboarding@resend.dev>'; // Cambiar en producción

  constructor() {
    this.inicializar();
  }

  /**
   * Inicializa el cliente de Resend
   * Si no hay API key, el servicio queda deshabilitado pero no falla
   */
  private inicializar(): void {
    const apiKey = config.resend.apiKey;

    if (!apiKey || apiKey.trim() === '') {
      console.warn('⚠️  RESEND_API_KEY no configurada. Notificaciones deshabilitadas.');
      this.habilitado = false;
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.habilitado = true;
      console.log('✅ Servicio de notificaciones inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar Resend:', error);
      this.habilitado = false;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════
   * ENVÍO DE NOTIFICACIÓN: CITA CREADA
   * ═══════════════════════════════════════════════════════
   */
  async enviarCitaCreada(datos: NotificacionCitaCreada): Promise<ResultadoEnvio> {
    // Validar que el cliente tenga email
    if (!datos.destinatario || !this.esEmailValido(datos.destinatario)) {
      return this.crearResultadoFallido('Email del destinatario no válido');
    }

    // Enriquecer datos con información formateada
    const datosEnriquecidos: NotificacionCitaCreada = {
      ...datos,
      fechaFormateada: formatearFechaCompleta(datos.fecha),
      hora: extraerHora(datos.fecha),
      linkCancelacion: generarLinkCancelacion(datos.tokenCancelacion),
    };

    // Generar configuración del email
    const config: ConfiguracionEmail = {
      remitente: this.remitentePorDefecto,
      asunto: `✅ Cita Agendada - Confirmación ${datos.numeroConfirmacion}`,
      html: generarEmailCitaCreada(datosEnriquecidos),
    };

    // Enviar
    return await this.enviarEmail(datos.destinatario, config, 'CITA_CREADA');
  }

  /**
   * ═══════════════════════════════════════════════════════
   * ENVÍO DE NOTIFICACIÓN: CITA CONFIRMADA
   * ═══════════════════════════════════════════════════════
   */
  async enviarCitaConfirmada(datos: NotificacionCitaConfirmada): Promise<ResultadoEnvio> {
    // Validar que el cliente tenga email
    if (!datos.destinatario || !this.esEmailValido(datos.destinatario)) {
      return this.crearResultadoFallido('Email del destinatario no válido');
    }

    // Enriquecer datos
    const datosEnriquecidos: NotificacionCitaConfirmada = {
      ...datos,
      fechaFormateada: formatearFechaCompleta(datos.fecha),
      hora: extraerHora(datos.fecha),
      linkCancelacion: generarLinkCancelacion(datos.tokenCancelacion),
    };

    // Generar configuración del email
    const config: ConfiguracionEmail = {
      remitente: this.remitentePorDefecto,
      asunto: `✔️ Cita Confirmada - ${datos.numeroConfirmacion}`,
      html: generarEmailCitaConfirmada(datosEnriquecidos),
    };

    // Enviar
    return await this.enviarEmail(datos.destinatario, config, 'CITA_CONFIRMADA');
  }

  /**
   * ═══════════════════════════════════════════════════════
   * ENVÍO DE NOTIFICACIÓN: CITA CANCELADA
   * ═══════════════════════════════════════════════════════
   */
  async enviarCitaCancelada(datos: NotificacionCitaCancelada): Promise<ResultadoEnvio> {
    // Validar que el cliente tenga email
    if (!datos.destinatario || !this.esEmailValido(datos.destinatario)) {
      return this.crearResultadoFallido('Email del destinatario no válido');
    }

    // Enriquecer datos
    const datosEnriquecidos: NotificacionCitaCancelada = {
      ...datos,
      fechaFormateada: formatearFechaCompleta(datos.fecha),
      hora: extraerHora(datos.fecha),
    };

    // Generar configuración del email
    const config: ConfiguracionEmail = {
      remitente: this.remitentePorDefecto,
      asunto: `❌ Cita Cancelada - ${datos.numeroConfirmacion}`,
      html: generarEmailCitaCancelada(datosEnriquecidos),
    };

    // Enviar
    return await this.enviarEmail(datos.destinatario, config, 'CITA_CANCELADA');
  }

  /**
   * ═══════════════════════════════════════════════════════
   * MÉTODO INTERNO: ENVIAR EMAIL
   * ═══════════════════════════════════════════════════════
   * 
   * Maneja el envío real a través de Resend.
   * Este método NUNCA debe lanzar errores al exterior.
   */
  private async enviarEmail(
    destinatario: string,
    config: ConfiguracionEmail,
    tipo: string
  ): Promise<ResultadoEnvio> {
    // Si el servicio está deshabilitado, solo logear
    if (!this.habilitado || !this.resend) {
      console.log(`📧 [SIMULADO] Email ${tipo} a ${destinatario}`);
      console.log(`   Asunto: ${config.asunto}`);
      return {
        exito: false,
        error: 'Servicio de notificaciones deshabilitado',
        timestamp: new Date(),
      };
    }

    try {
      // Enviar email usando Resend
      const resultado = await this.resend.emails.send({
        from: config.remitente,
        to: destinatario,
        subject: config.asunto,
        html: config.html,
      });

      // Log exitoso
      console.log(`✅ Email ${tipo} enviado a ${destinatario}`);
      console.log(`   ID: ${resultado.data?.id}`);

      return {
        exito: true,
        idMensaje: resultado.data?.id,
        timestamp: new Date(),
      };

    } catch (error: any) {
      // Log de error (pero NO propagar el error)
      console.error(`❌ Error al enviar email ${tipo} a ${destinatario}:`, error.message);

      return {
        exito: false,
        error: error.message || 'Error desconocido al enviar email',
        timestamp: new Date(),
      };
    }
  }

  /**
   * ═══════════════════════════════════════════════════════
   * UTILIDADES PRIVADAS
   * ═══════════════════════════════════════════════════════
   */

  /**
   * Valida formato de email (regex básico)
   */
  private esEmailValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Crea un resultado fallido estándar
   */
  private crearResultadoFallido(error: string): ResultadoEnvio {
    console.warn(`⚠️  ${error}`);
    return {
      exito: false,
      error,
      timestamp: new Date(),
    };
  }

  /**
   * Verifica si el servicio está habilitado
   */
  public estaHabilitado(): boolean {
    return this.habilitado;
  }
}

/**
 * ═══════════════════════════════════════════════════════
 * INSTANCIA SINGLETON
 * ═══════════════════════════════════════════════════════
 * 
 * Exportamos una única instancia para reutilizar la
 * conexión de Resend en toda la aplicación
 */
export const notificacionesService = new NotificacionesService();
