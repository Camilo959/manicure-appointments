import type { Servicio } from '../../../generated/prisma/client';
import { parse, format, addMinutes, isAfter, isBefore, startOfDay } from 'date-fns';

/**
 * Calcula la duración total de los servicios
 */
export function calcularDuracionTotal(servicios: Servicio[]): number {
  return servicios.reduce((total, servicio) => total + servicio.duracionMinutos, 0);
}

/**
 * Calcula el precio total de los servicios
 */
export function calcularPrecioTotal(servicios: Servicio[]): number {
  return servicios.reduce((total, servicio) => total + Number(servicio.precio), 0);
}

/**
 * Combina fecha y hora en un Date object
 * @param fecha - YYYY-MM-DD
 * @param hora - HH:mm
 */
export function combinarFechaHora(fecha: string, hora: string): Date {
  const fechaHoraStr = `${fecha} ${hora}`;
  return parse(fechaHoraStr, 'yyyy-MM-dd HH:mm', new Date());
}

/**
 * Valida que la fecha no esté en el pasado
 */
export function esFechaFutura(fechaInicio: Date): boolean {
  return isAfter(fechaInicio, new Date());
}

/**
 * Calcula la fecha fin sumando minutos a la fecha inicio
 */
export function calcularFechaFin(fechaInicio: Date, duracionMinutos: number): Date {
  return addMinutes(fechaInicio, duracionMinutos);
}

/**
 * Verifica si dos rangos de tiempo se solapan
 */
export function hayHorarioSolapado(
  inicio1: Date,
  fin1: Date,
  inicio2: Date,
  fin2: Date
): boolean {
  return isBefore(inicio1, fin2) && isAfter(fin1, inicio2);
}

/**
 * Formatea fecha para visualización
 */
export function formatearFecha(fecha: Date): string {
  return format(fecha, 'dd/MM/yyyy HH:mm');
}

/**
 * Genera un número de confirmación legible
 * Formato: YYYYMMDD-XXXX (fecha + 4 dígitos aleatorios)
 */
export function generarNumeroConfirmacion(): string {
  const fecha = format(new Date(), 'yyyyMMdd');
  const random = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
  return `${fecha}-${random}`;
}

/**
 * Extrae solo la fecha (sin hora) de un Date
 */
export function obtenerSoloFecha(fecha: Date): Date {
  return startOfDay(fecha);
}