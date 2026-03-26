/**
 * Validación de fecha máxima (ej: no más de 3 meses adelante)
 */
export const validarFechaMaxima = (fecha: Date): boolean => {
  const hoy = new Date();
  const maxFecha = new Date();
  maxFecha.setMonth(hoy.getMonth() + 3);
  
  return fecha <= maxFecha;
};