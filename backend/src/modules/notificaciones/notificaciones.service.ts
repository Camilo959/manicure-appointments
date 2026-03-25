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

import config from '../../config/env';
import { TipoNotificacion } from './notificaciones.types';
import type {
  NotificacionBase,
  InputCitaCreada,
  InputCitaConfirmada,
  InputCitaCancelada,
  ResultadoEnvio,
  ConfiguracionEmail,
  EmailProvider,
} from './notificaciones.types';
import { ResendEmailProvider } from './resend.provider';
import { generarEmailCitaCreada } from './templates/cita-creada.template';
import { generarEmailCitaConfirmada } from './templates/cita-confirmada.template';
import { generarEmailCitaCancelada } from './templates/cita-cancelada.template';
import {
  formatearFechaCompleta,
  extraerHora,
  generarLinkCancelacion,
} from './notificaciones.utils';

type CitaCreadaEnriquecida = InputCitaCreada & {
  fechaFormateada: string;
  hora: string;
  linkCancelacion: string;
};

type CitaConfirmadaEnriquecida = InputCitaConfirmada & {
  fechaFormateada: string;
  hora: string;
  linkCancelacion: string;
};

type CitaCanceladaEnriquecida = InputCitaCancelada & {
  fechaFormateada: string;
  hora: string;
};

/**
 * Servicio de Notificaciones
 * 
 * Patrón Singleton para reutilizar la instancia de Resend
 */
export class NotificacionesService {
  private emailProvider: EmailProvider | null = null;
  private habilitado: boolean = false;
  private readonly remitentePorDefecto: string = 'Manicure Spa <onboarding@resend.dev>'; // Cambiar en producción

  constructor(emailProvider?: EmailProvider) {
    this.inicializar(emailProvider);
  }

  /**
   * Inicializa el cliente de Resend
   * Si no hay API key, el servicio queda deshabilitado pero no falla
   */
  private inicializar(emailProvider?: EmailProvider): void {
    if (emailProvider) {
      this.emailProvider = emailProvider;
      this.habilitado = true;
      console.log('✅ Servicio de notificaciones inicializado correctamente');
      return;
    }

    const apiKey = config.resend.apiKey;

    if (!apiKey || apiKey.trim() === '') {
      console.warn('⚠️  RESEND_API_KEY no configurada. Notificaciones deshabilitadas.');
      this.habilitado = false;
      return;
    }

    try {
      this.emailProvider = new ResendEmailProvider(apiKey);
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
  async enviarCitaCreada(datos: InputCitaCreada): Promise<ResultadoEnvio> {
    return await this.procesarNotificacion<InputCitaCreada, CitaCreadaEnriquecida>(
      datos,
      (input) => ({
        ...input,
        fechaFormateada: formatearFechaCompleta(input.fecha),
        hora: extraerHora(input.fecha),
        linkCancelacion: generarLinkCancelacion(input.tokenCancelacion),
      }),
      (datosEnriquecidos) => {
        const emailConfig: ConfiguracionEmail = {
          remitente: this.remitentePorDefecto,
          asunto: `✅ Cita Agendada - Confirmación ${datosEnriquecidos.numeroConfirmacion}`,
          html: generarEmailCitaCreada(datosEnriquecidos),
        };
        return emailConfig;
      },
      TipoNotificacion.CITA_CREADA
    );
  }

  /**
   * ═══════════════════════════════════════════════════════
   * ENVÍO DE NOTIFICACIÓN: CITA CONFIRMADA
   * ═══════════════════════════════════════════════════════
   */
  async enviarCitaConfirmada(datos: InputCitaConfirmada): Promise<ResultadoEnvio> {
    return await this.procesarNotificacion<InputCitaConfirmada, CitaConfirmadaEnriquecida>(
      datos,
      (input) => ({
        ...input,
        fechaFormateada: formatearFechaCompleta(input.fecha),
        hora: extraerHora(input.fecha),
        linkCancelacion: generarLinkCancelacion(input.tokenCancelacion),
      }),
      (datosEnriquecidos) => {
        const emailConfig: ConfiguracionEmail = {
          remitente: this.remitentePorDefecto,
          asunto: `✔️ Cita Confirmada - ${datosEnriquecidos.numeroConfirmacion}`,
          html: generarEmailCitaConfirmada(datosEnriquecidos),
        };
        return emailConfig;
      },
      TipoNotificacion.CITA_CONFIRMADA
    );
  }

  /**
   * ═══════════════════════════════════════════════════════
   * ENVÍO DE NOTIFICACIÓN: CITA CANCELADA
   * ═══════════════════════════════════════════════════════
   */
  async enviarCitaCancelada(datos: InputCitaCancelada): Promise<ResultadoEnvio> {
    return await this.procesarNotificacion<InputCitaCancelada, CitaCanceladaEnriquecida>(
      datos,
      (input) => ({
        ...input,
        fechaFormateada: formatearFechaCompleta(input.fecha),
        hora: extraerHora(input.fecha),
      }),
      (datosEnriquecidos) => {
        const emailConfig: ConfiguracionEmail = {
          remitente: this.remitentePorDefecto,
          asunto: `❌ Cita Cancelada - ${datosEnriquecidos.numeroConfirmacion}`,
          html: generarEmailCitaCancelada(datosEnriquecidos),
        };
        return emailConfig;
      },
      TipoNotificacion.CITA_CANCELADA
    );
  }

  private async procesarNotificacion<TInput extends NotificacionBase, TEnriquecido>(
    datos: TInput,
    enriquecerDatos: (input: TInput) => TEnriquecido,
    construirEmailConfig: (datosEnriquecidos: TEnriquecido) => ConfiguracionEmail,
    tipo: TipoNotificacion
  ): Promise<ResultadoEnvio> {
    if (!datos.destinatario || !this.esEmailValido(datos.destinatario)) {
      return this.crearResultadoFallido('Email del destinatario no válido');
    }

    const datosEnriquecidos = enriquecerDatos(datos);
    const emailConfig = construirEmailConfig(datosEnriquecidos);
    return await this.enviarEmail(datos.destinatario, emailConfig, tipo);
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
    emailConfig: ConfiguracionEmail,
    tipo: TipoNotificacion
  ): Promise<ResultadoEnvio> {
    // Si el servicio está deshabilitado, solo logear
    if (!this.habilitado || !this.emailProvider) {
      console.log(`📧 [SIMULADO] Email ${tipo} a ${destinatario}`);
      console.log(`   Asunto: ${emailConfig.asunto}`);
      return {
        exito: false,
        error: 'Servicio de notificaciones deshabilitado',
        timestamp: new Date(),
      };
    }

    try {
      // Enviar email usando Resend
      const resultado = await this.emailProvider.send({
        from: emailConfig.remitente,
        to: destinatario,
        subject: emailConfig.asunto,
        html: emailConfig.html,
      });

      // Log exitoso
      console.log(`✅ Email ${tipo} enviado a ${destinatario}`);
      console.log(`   ID: ${resultado.id}`);

      return {
        exito: true,
        idMensaje: resultado.id,
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
