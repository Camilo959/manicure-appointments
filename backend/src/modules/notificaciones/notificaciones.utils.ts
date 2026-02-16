/**
 * ================================================
 * UTILIDADES DE FORMATEO PARA NOTIFICACIONES
 * ================================================
 * 
 * Funciones helper para formatear fechas, precios,
 * y otros datos en las notificaciones
 */

import type { ServicioNotificacion } from './notificaciones.types';

/**
 * Días de la semana en español
 */
const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

/**
 * Meses en español
 */
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/**
 * Formatea una fecha a formato legible en español
 * 
 * @example
 * formatearFechaCompleta(new Date('2026-02-15'))
 * // => "Domingo, 15 de febrero de 2026"
 */
export function formatearFechaCompleta(fecha: Date): string {
  const diaSemana = DIAS_SEMANA[fecha.getDay()];
  const dia = fecha.getDate();
  const mes = MESES[fecha.getMonth()];
  const año = fecha.getFullYear();

  return `${diaSemana}, ${dia} de ${mes} de ${año}`;
}

/**
 * Extrae la hora de una fecha en formato HH:mm
 * 
 * @example
 * extraerHora(new Date('2026-02-15T14:30:00'))
 * // => "14:30"
 */
export function extraerHora(fecha: Date): string {
  const horas = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
}

/**
 * Formatea un precio a formato de moneda chilena
 * 
 * @example
 * formatearPrecio(25000)
 * // => "$25.000"
 */
export function formatearPrecio(precio: number): string {
  return `$${precio.toLocaleString('es-CL')}`;
}

/**
 * Formatea duración en minutos a texto legible
 * 
 * @example
 * formatearDuracion(90)
 * // => "1 hora 30 minutos"
 * 
 * formatearDuracion(45)
 * // => "45 minutos"
 */
export function formatearDuracion(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} minuto${minutos !== 1 ? 's' : ''}`;
  }

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  if (minutosRestantes === 0) {
    return `${horas} hora${horas !== 1 ? 's' : ''}`;
  }

  return `${horas} hora${horas !== 1 ? 's' : ''} ${minutosRestantes} minuto${
    minutosRestantes !== 1 ? 's' : ''
  }`;
}

/**
 * Genera lista HTML de servicios
 * 
 * @example
 * generarListaServicios([{ nombre: 'Manicure', duracion: 30, precio: 15000 }])
 * // => "<li>Manicure (30 minutos) - $15.000</li>"
 */
export function generarListaServicios(servicios: ServicioNotificacion[]): string {
  return servicios
    .map(
      (servicio) =>
        `<li>
          <strong>${servicio.nombre}</strong> 
          <span style="color: #666;">(${servicio.duracion} min)</span> - 
          <strong>${formatearPrecio(servicio.precio)}</strong>
        </li>`
    )
    .join('');
}

/**
 * Genera el link de cancelación para una cita
 * 
 * @param tokenCancelacion - Token único de cancelación
 * @param baseUrl - URL base de la aplicación (Ej: https://spa.com)
 * @returns URL completa para cancelar
 * 
 * @example
 * generarLinkCancelacion("abc-123", "https://spa.com")
 * // => "https://spa.com/cancelar?token=abc-123"
 */
export function generarLinkCancelacion(
  tokenCancelacion: string,
  baseUrl: string = process.env.FRONTEND_URL || 'http://localhost:3001'
): string {
  return `${baseUrl}/cancelar?token=${tokenCancelacion}`;
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * (Por si el usuario ingresa caracteres especiales en su nombre)
 */
export function escaparHTML(texto: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return texto.replace(/[&<>"']/g, (char) => map[char]);
}
