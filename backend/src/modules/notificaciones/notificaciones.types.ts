/**
 * ================================================
 * TIPOS Y ENUMS DEL MÓDULO DE NOTIFICACIONES
 * ================================================
 * 
 * Definiciones centralizadas para el sistema de
 * notificaciones por email
 */

/**
 * Tipos de notificaciones soportadas
 */
export enum TipoNotificacion {
  CITA_CREADA = 'CITA_CREADA',
  CITA_CONFIRMADA = 'CITA_CONFIRMADA',
  CITA_CANCELADA = 'CITA_CANCELADA',
}

/**
 * Datos comunes de todas las notificaciones
 */
export interface NotificacionBase {
  destinatario: string; // Email del destinatario
  nombreDestinatario: string; // Nombre del cliente
}

/**
 * Datos de un servicio para las notificaciones
 */
export interface ServicioNotificacion {
  nombre: string;
  duracion: number;
  precio: number;
}

/**
 * Datos para notificación de cita creada
 */
export interface NotificacionCitaCreada extends NotificacionBase {
  numeroConfirmacion: string;
  nombreTrabajadora: string;
  fecha: Date;
  fechaFormateada: string; // "Lunes, 15 de febrero de 2026"
  hora: string; // "14:30"
  servicios: ServicioNotificacion[];
  duracionTotal: number;
  precioTotal: number;
  tokenCancelacion: string;
  linkCancelacion: string; // URL para cancelar
}

/**
 * Datos para notificación de cita confirmada
 */
export interface NotificacionCitaConfirmada extends NotificacionBase {
  numeroConfirmacion: string;
  nombreTrabajadora: string;
  fecha: Date;
  fechaFormateada: string;
  hora: string;
  servicios: ServicioNotificacion[];
  duracionTotal: number;
  precioTotal: number;
  tokenCancelacion: string;
  linkCancelacion: string;
}

/**
 * Datos para notificación de cita cancelada
 */
export interface NotificacionCitaCancelada extends NotificacionBase {
  numeroConfirmacion: string;
  nombreTrabajadora: string;
  fecha: Date;
  fechaFormateada: string;
  hora: string;
  servicios: ServicioNotificacion[];
  motivo?: string; // Motivo de cancelación (opcional)
}

/**
 * Resultado del envío de una notificación
 */
export interface ResultadoEnvio {
  exito: boolean;
  idMensaje?: string; // ID de Resend si fue exitoso
  error?: string; // Mensaje de error si falló
  timestamp: Date;
}

/**
 * Configuración de email
 */
export interface ConfiguracionEmail {
  remitente: string; // Email del remitente (Ej: "Manicure Spa <noreply@spa.com>")
  asunto: string;
  html: string;
}
