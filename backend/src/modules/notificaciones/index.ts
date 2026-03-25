/**
 * ================================================
 * MÓDULO DE NOTIFICACIONES - INDEX
 * ================================================
 * 
 * Punto de entrada centralizado del módulo de notificaciones
 */

// Exportar servicio principal (singleton)
export { notificacionesService } from './notificaciones.service';
export { TipoNotificacion } from './notificaciones.types';

// Exportar tipos (para uso en otros módulos)
export type {
  NotificacionBase,
  ServicioNotificacion,
  InputCitaCreada,
  InputCitaConfirmada,
  InputCitaCancelada,
  ResultadoEnvio,
} from './notificaciones.types';

// Exportar utilidades (por si se necesitan en otros módulos)
export {
  formatearFechaCompleta,
  extraerHora,
  formatearPrecio,
  formatearDuracion,
  generarListaServicios,
  generarLinkCancelacion,
  escaparHTML,
} from './notificaciones.utils';
