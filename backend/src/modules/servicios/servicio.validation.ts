import { z } from 'zod';

/**
 * Schema para crear un servicio
 */
export const crearServicioSchema = z.object({
  body: z.object({
    nombre: z
      .string({ message: 'El nombre es obligatorio' })
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede superar 100 caracteres')
      .trim(),
    duracionMinutos: z
      .number({ message: 'La duración es obligatoria' })
      .int('La duración debe ser un número entero')
      .positive('La duración debe ser mayor a 0')
      .max(480, 'La duración no puede superar 480 minutos (8 horas)'),
    precio: z
      .number({ message: 'El precio es obligatorio' })
      .positive('El precio debe ser mayor a 0'),
  }),
});

/**
 * Schema para actualizar un servicio
 */
export const actualizarServicioSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de servicio inválido'),
  }),
  body: z.object({
    nombre: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede superar 100 caracteres')
      .trim()
      .optional(),
    duracionMinutos: z
      .number()
      .int('La duración debe ser un número entero')
      .positive('La duración debe ser mayor a 0')
      .max(480, 'La duración no puede superar 480 minutos (8 horas)')
      .optional(),
    precio: z
      .number()
      .positive('El precio debe ser mayor a 0')
      .optional(),
  }),
});

/**
 * Schema para cambiar estado de servicio
 */
export const cambiarEstadoServicioSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de servicio inválido'),
  }),
  body: z.object({
    activo: z.boolean({ message: 'El estado activo es obligatorio' }),
  }),
});

/**
 * Schema para obtener servicio por ID
 */
export const obtenerServicioPorIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de servicio inválido'),
  }),
});

export type CrearServicioInput = z.infer<typeof crearServicioSchema>['body'];
export type ActualizarServicioInput = z.infer<typeof actualizarServicioSchema>['body'];
export type CambiarEstadoServicioInput = z.infer<typeof cambiarEstadoServicioSchema>['body'];