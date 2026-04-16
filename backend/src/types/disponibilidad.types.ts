import { z } from 'zod';
import { EstadoCita } from '../../generated/prisma/enums';

/**
 * Estados de cita que bloquean horarios
 */
export const ESTADOS_OCUPADOS: EstadoCita[] = ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'];

/**
 * Schema de validación para consultar disponibilidad
 */
export const consultarDisponibilidadSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD'),
  trabajadoraId: z.string().uuid('ID de trabajadora inválido'),
  serviciosIds: z.array(z.string().uuid()).min(1, 'Debe seleccionar al menos un servicio'),
});

export type ConsultarDisponibilidadInput = z.infer<typeof consultarDisponibilidadSchema>;

/**
 * Slot de tiempo disponible
 */
export interface SlotDisponible {
  inicio: Date;
  fin: Date;
}

/**
 * Respuesta de disponibilidad
 */
export interface DisponibilidadResponse {
  fecha: string;
  trabajadoraId: string;
  duracionTotalMinutos: number;
  slotsDisponibles: SlotDisponible[];
}