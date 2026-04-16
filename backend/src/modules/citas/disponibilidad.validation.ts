/**
 * Validación de fecha máxima según configuración (días de anticipación)
 */
export const validarFechaMaxima = (fecha: Date, maxDiasAnticipacion: number): boolean => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const maxFecha = new Date();
  maxFecha.setHours(0, 0, 0, 0);
  maxFecha.setDate(hoy.getDate() + maxDiasAnticipacion);
  
  return fecha <= maxFecha;
};