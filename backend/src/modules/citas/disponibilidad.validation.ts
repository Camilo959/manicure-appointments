import { z } from 'zod';

/**
 * Validación para días de la semana (opcional: cerrar domingos)
 */
export const validarDiaSemana = (fecha: Date): boolean => {
  const diaSemana = fecha.getDay();
  return diaSemana !== 0; // 0 = Domingo
};

/**
 * Validación de fecha máxima (ej: no más de 3 meses adelante)
 */
export const validarFechaMaxima = (fecha: Date): boolean => {
  const hoy = new Date();
  const maxFecha = new Date();
  maxFecha.setMonth(hoy.getMonth() + 3);
  
  return fecha <= maxFecha;
};